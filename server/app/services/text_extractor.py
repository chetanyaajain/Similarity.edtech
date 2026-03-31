import subprocess
import tempfile
from pathlib import Path

from docx import Document
from pypdf import PdfReader


def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")
    if suffix == ".docx":
        doc = Document(path)
        return "\n".join(paragraph.text for paragraph in doc.paragraphs)
    if suffix == ".pdf":
        return extract_pdf_text(path)
    raise ValueError(f"Unsupported file type: {suffix}")


def extract_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    extracted = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    if len(extracted) >= 40:
        return extracted

    # Fallback for scanned PDFs: render a preview image with macOS tooling,
    # then OCR it with tesseract if available.
    ocr_text = extract_pdf_text_with_ocr(path)
    return ocr_text.strip() if ocr_text.strip() else extracted


def extract_pdf_text_with_ocr(path: Path) -> str:
    if not Path("/usr/bin/sips").exists():
        return ""
    if not Path("/opt/homebrew/bin/tesseract").exists():
        return ""

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        rendered_image = temp_path / "rendered.png"
        subprocess.run(
            ["/usr/bin/sips", "-s", "format", "png", str(path), "--out", str(rendered_image)],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        if not rendered_image.exists():
            return ""

        result = subprocess.run(
            [
                "/opt/homebrew/bin/tesseract",
                str(rendered_image),
                "stdout",
                "--psm",
                "6",
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        return clean_ocr_text(result.stdout or "")


def clean_ocr_text(text: str) -> str:
    cleaned_lines: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        # Drop lines that are mostly punctuation/noise.
        alnum_chars = sum(char.isalnum() for char in line)
        if alnum_chars < max(3, len(line) // 5):
            continue
        line = (
            line.replace("|", "I")
            .replace("ﬁ", "fi")
            .replace("ﬂ", "fl")
            .replace("—", "-")
        )
        cleaned_lines.append(" ".join(line.split()))

    normalized = " ".join(cleaned_lines)
    normalized = normalized.replace(" .", ".").replace(" ,", ",")
    normalized = normalized.replace(" :", ":").replace(" ;", ";")
    return normalized.strip()
