def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50):
    """
    Splits string blocks into uniform chunks using a sliding window overlap
    to protect semantic sentences on text edges.
    """
    words = text.split()
    chunks = []
    
    if len(words) <= chunk_size:
        return [" ".join(words)]
        
    for i in range(0, len(words), chunk_size - chunk_overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        
        # Cease operations once the loop index bounds cross document length constraints
        if i + chunk_size >= len(words):
            break
            
    return chunks