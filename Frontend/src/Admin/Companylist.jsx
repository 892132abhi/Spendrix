import React, { useState } from 'react';

// Mock Data representing companies from a database
const MOCK_COMPANIES = [
  { id: 1, name: 'Acme Corporation', email: 'contact@acme.com', industry: 'Technology', status: 'Active', size: 250, location: 'New York, USA' },
  { id: 2, name: 'Stark Industries', email: 'info@stark.com', industry: 'Defense', status: 'Pending', size: 5000, location: 'Los Angeles, USA' },
  { id: 3, name: 'Wayne Enterprises', email: 'hq@wayne.com', industry: 'Finance', status: 'Active', size: 1200, location: 'Gotham, USA' },
  { id: 4, name: 'Oscorp Technologies', email: 'support@oscorp.com', industry: 'Biotech', status: 'Suspended', size: 80, location: 'Boston, USA' },
  { id: 5, name: 'Initech LLC', email: 'hello@initech.com', industry: 'Software', status: 'Active', size: 15, location: 'Austin, USA' },
  { id: 6, name: 'Tyrell Corporation', email: 'nexus@tyrell.com', industry: 'Robotics', status: 'Active', size: 850, location: 'San Francisco, USA' },
  { id: 7, name: 'Umbrella Corp', email: 'medical@umbrella.com', industry: 'Pharma', status: 'Suspended', size: 3400, location: 'Chicago, USA' },
];

export  function CompaniesListPage() {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  // --- FILTER & PAGINATION LOGIC ---
  const filteredCompanies = MOCK_COMPANIES.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || company.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination indices
  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);

  // --- UI BADGE STYLING ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': 
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Pending': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Suspended': 
        return 'bg-red-100 text-red-800 border border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans antialiased text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER CONTROLS --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of registered partner businesses, active industries, and operational statuses.
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap">
            + Add New Company
          </button>
        </div>

        {/* --- FILTERS & SEARCH BAR --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-full sm:w-96">
            <input
              type="text"
              placeholder="Search by name, email, or industry..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-gray-50/50 focus:bg-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 on new search
              }}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Status:</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[150px]"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter change
              }}
            >
              <option value="All">All Companies</option>
              <option value="Active">Active State</option>
              <option value="Pending">Pending Review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 w-1/3">Company Profile</th>
                  <th className="p-4">Industry Domain</th>
                  <th className="p-4">HQ Location</th>
                  <th className="p-4">Headcount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {currentCompanies.length > 0 ? (
                  currentCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-base">
                          {company.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5 tracking-tight">
                          {company.email}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{company.industry}</td>
                      <td className="p-4 text-gray-500">{company.location}</td>
                      <td className="p-4 text-gray-500 font-mono text-xs">
                        {company.size.toLocaleString()} employees
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusStyle(company.status)}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-3 whitespace-nowrap">
                        <button className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md">
                          View
                        </button>
                        <button className="text-gray-500 hover:text-gray-800 font-medium text-xs transition-colors border border-gray-200 hover:border-gray-300 px-2.5 py-1.5 rounded-md bg-white">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-gray-400 font-medium">
                      <div className="text-3xl mb-2">📂</div>
                      <div className="text-sm font-semibold text-gray-600">No Companies Found</div>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                        No registered system records match your current criteria parameters. Try adjusting search terms.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* --- PAGINATION CONTROLS FOOTER --- */}
          {totalItems > 0 && (
            <div className="p-4 px-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-gray-500 bg-gray-50 font-medium">
              <div>
                Showing rows <strong className="text-gray-700 font-semibold">{indexOfFirstItem + 1}</strong> to{' '}
                <strong className="text-gray-700 font-semibold">{Math.min(indexOfLastItem, totalItems)}</strong> of{' '}
                <strong className="text-gray-700 font-semibold">{totalItems}</strong> entries
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-2 border border-gray-300 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <button 
                  className="px-3 py-2 border border-gray-300 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompaniesListPage