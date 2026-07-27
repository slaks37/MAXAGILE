import sys
import os
import json
import uuid
import re

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"error": "PyMuPDF (fitz) is not installed"}))
    sys.exit(1)

def extract_quiz_questions(text, step_num):
    clean_text = re.sub(r'\s+', ' ', text).strip()
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean_text) if len(s.strip()) > 25]
    
    questions = []
    for idx, sentence in enumerate(sentences[:3]):
        words = [w for w in sentence.split() if len(w) > 4]
        if not words:
            continue
        target_word = words[len(words) // 2]
        q_text = sentence.replace(target_word, "______")
        if len(q_text) > 120:
            q_text = q_text[:120] + "..."
            
        correct_id = f"opt-{uuid.uuid4().hex[:6]}"
        questions.append({
            "id": f"qq-{uuid.uuid4().hex[:6]}",
            "text": f"Berdasarkan materi Lesson {step_num}: \"{q_text}\"",
            "options": [
                {"id": correct_id, "text": target_word},
                {"id": f"opt-{uuid.uuid4().hex[:6]}", "text": f"{target_word} (Alternatif)"},
                {"id": f"opt-{uuid.uuid4().hex[:6]}", "text": "Konsep Dasar"},
                {"id": f"opt-{uuid.uuid4().hex[:6]}", "text": "Variabel Pendukung"}
            ],
            "correctOptionId": correct_id,
            "points": 10
        })
        
    if not questions:
        correct_id = f"opt-{uuid.uuid4().hex[:6]}"
        questions.append({
            "id": f"qq-{uuid.uuid4().hex[:6]}",
            "text": f"Apa poin pembelajaran utama pada Lesson {step_num}?",
            "options": [
                {"id": correct_id, "text": f"Memahami konsep utama pada Lesson {step_num}"},
                {"id": f"opt-{uuid.uuid4().hex[:6]}", "text": "Abaikan materi"},
                {"id": f"opt-{uuid.uuid4().hex[:6]}", "text": "Hanya membaca judul"}
            ],
            "correctOptionId": correct_id,
            "points": 10
        })
        
    return questions

def generate_example_case(text, topic_title):
    clean = text.strip()
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean) if len(s.strip()) > 30]
    excerpt = sentences[0] if sentences else "Konsep penting yang perlu diterapkan secara praktis."
    
    return (
        f"### 💡 Contoh Penerapan Praktis: {topic_title}\n\n"
        f"**Skenario Studi Kasus:**\n"
        f"Dalam implementasi nyata, penerapan materi ini dapat dilihat dari skenario berikut:\n\n"
        f"> *\"{excerpt}\"*\n\n"
        f"**Langkah Penerapan:**\n"
        f"1. **Identifikasi Masalah:** Analisis kondisi awal berdasarkan prinsip utama.\n"
        f"2. **Eksekusi Solusi:** Terapkan formula dan kaidah yang telah dipelajari.\n"
        f"3. **Evaluasi Hasil:** Pastikan kriteria keberhasilan terpenuhi dengan tepat.\n"
    )

def generate_review_summary(text, topic_title):
    clean = text.strip()
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean) if len(s.strip()) > 20]
    items = sentences[:3] if sentences else ["Pahami konsep utama.", "Terapkan contoh praktis.", "Evaluasi pemahaman."]
    
    return [
        {"id": f"chk-{uuid.uuid4().hex[:6]}", "text": f"Saya telah membaca materi Learn tentang {topic_title}"},
        {"id": f"chk-{uuid.uuid4().hex[:6]}", "text": f"Saya memahami contoh penerapan (Example) dalam skenario nyata"},
        {"id": f"chk-{uuid.uuid4().hex[:6]}", "text": f"Saya berhasil menyelesaikan Quiz evaluasi pemahaman"},
        {"id": f"chk-{uuid.uuid4().hex[:6]}", "text": f"Refleksi: {items[0] if items else 'Siap melanjutkan ke lesson berikutnya'}"}
    ]

def split_pdf(pdf_path, output_dir):
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)
        
    os.makedirs(output_dir, exist_ok=True)
    pdf_filename = os.path.basename(pdf_path)
    base_name = os.path.splitext(pdf_filename)[0].replace('_', ' ').replace('-', ' ').title()
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    # Determine module count (between 3 and 5 modules)
    if total_pages <= 3:
        module_count = total_pages
    elif total_pages <= 10:
        module_count = 3
    elif total_pages <= 20:
        module_count = 4
    else:
        module_count = 5

    pages_per_module = max(1, (total_pages + module_count - 1) // module_count)
    
    modules = []
    prefix = uuid.uuid4().hex[:8]
    
    for m in range(module_count):
        start_page = m * pages_per_module
        if start_page >= total_pages:
            break
        end_page = min(total_pages - 1, (m + 1) * pages_per_module - 1)
        
        # Create physical sub-PDF chunk using PyMuPDF
        sub_doc = fitz.open()
        sub_doc.insert_pdf(doc, from_page=start_page, to_page=end_page)
        
        sub_filename = f"{prefix}_modul_{m+1}_hal_{start_page+1}-{end_page+1}.pdf"
        sub_filepath = os.path.join(output_dir, sub_filename)
        sub_doc.save(sub_filepath)
        sub_doc.close()
        
        # Extract text from page range
        module_text = ""
        for p in range(start_page, end_page + 1):
            module_text += doc[p].get_text() + "\n"
            
        step_num = m + 1
        page_label = f"Halaman {start_page+1}" if start_page == end_page else f"Halaman {start_page+1}-{end_page+1}"
        
        lessons = [
            {
                "lesson_num": 1,
                "title": f"Lesson 1: Dasar & Konsep ({page_label})",
                "learn_content": module_text.strip() or f"Materi konsep dasar untuk {page_label}.",
                "example_content": generate_example_case(module_text, f"Dasar {page_label}"),
                "quiz_questions": extract_quiz_questions(module_text, step_num),
                "review_items": generate_review_summary(module_text, f"Dasar {page_label}")
            }
        ]
        
        modules.append({
            "step_num": step_num,
            "title": f"Module {step_num}: {page_label} — {base_name}",
            "summary": f"Modul pembelajaran {page_label.lower()} dari dokumen PDF {base_name}.",
            "start_page": start_page + 1,
            "end_page": end_page + 1,
            "page_label": page_label,
            "pdf_url": f"/uploads/{sub_filename}",
            "sub_filename": sub_filename,
            "file_size": os.path.getsize(sub_filepath),
            "lessons": lessons
        })
        
    doc.close()
    
    result = {
        "success": True,
        "pdf_filename": pdf_filename,
        "title": base_name,
        "total_pages": total_pages,
        "module_count": len(modules),
        "modules": modules
    }
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python split_pdf.py <pdf_path> <output_dir>"}))
        sys.exit(1)
        
    pdf_file = sys.argv[1]
    out_dir = sys.argv[2]
    split_pdf(pdf_file, out_dir)
