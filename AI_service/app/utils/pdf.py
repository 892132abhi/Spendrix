import pdfplumber

def extract_text(pdf_file):
    text = ""
    with pdfplumber.open(pdf_file)as file:
        for page in file.pages:
            text += page.extract_text() or ""
    return text