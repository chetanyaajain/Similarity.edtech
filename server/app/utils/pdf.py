from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def generate_report_pdf(path: Path, title: str, sections: list[str]) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    y = height - 48
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(40, y, title)
    y -= 28
    pdf.setFont("Helvetica", 10)

    for section in sections:
        for line in _wrap(section, 95):
            if y < 50:
                pdf.showPage()
                y = height - 48
                pdf.setFont("Helvetica", 10)
            pdf.drawString(40, y, line)
            y -= 16
        y -= 8

    pdf.save()
    return str(path)


def _wrap(text: str, width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join(current + [word])
        if len(candidate) <= width:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines

