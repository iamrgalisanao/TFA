import sys
import traceback

try:
    import fitz # PyMuPDF
    doc = fitz.open('e:\\2026\\TFA\\docs\\PITX. COO. IT. TOR - TERMINAL FEE COLLECTION SYSTEM. 2026 02 24.pdf')
    text = ""
    for page in doc:
        text += page.get_text()
    
    with open('e:\\2026\\TFA\\pdf_content.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Extract with PyMuPDF success")
except Exception as e:
    print(f"PyMuPDF failed: {e}")
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader('e:\\2026\\TFA\\docs\\PITX. COO. IT. TOR - TERMINAL FEE COLLECTION SYSTEM. 2026 02 24.pdf')
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        with open('e:\\2026\\TFA\\pdf_content.txt', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Extract with PyPDF2 success")
    except Exception as e2:
        print(f"PyPDF2 failed: {e2}")

