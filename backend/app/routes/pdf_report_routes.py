import os
from fastapi import APIRouter
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

from app.database.db import SessionLocal
from app.models.fluency_session   import FluencySession
from app.models.recall_session    import RecallSession
from app.models.detective_session import DetectiveSession
from app.models.vision_session    import VisionSession
from app.services.gemini_service  import generate_cognitive_report
from app.routes.report_routes     import generate_algorithm_report

router = APIRouter(prefix="/pdf-report", tags=["PDF Report"])


def _avg(lst):
    return round(sum(lst) / len(lst), 2) if lst else 0


@router.get("/{email}")
def generate_pdf(email: str):
    db = SessionLocal()
    try:
        fl = db.query(FluencySession).filter(FluencySession.user_email    == email).all()
        rc = db.query(RecallSession).filter(RecallSession.user_email       == email).all()
        dt = db.query(DetectiveSession).filter(DetectiveSession.user_email == email).all()
        vi = db.query(VisionSession).filter(VisionSession.user_email       == email).all()

        memory    = _avg([s.score   for s in rc])
        language  = _avg([s.score   for s in fl])
        reasoning = _avg([s.overall for s in dt])
        vision    = _avg([s.score   for s in vi])

        domain_avgs = [x for x in [memory, language, reasoning, vision] if x > 0]
        chi = round(sum(domain_avgs) / len(domain_avgs), 2) if domain_avgs else 0

        try:
            report = generate_cognitive_report(memory, language, reasoning, chi)
        except Exception:
            report = generate_algorithm_report(memory, language, reasoning, chi)

        # ── Build PDF ──────────────────────────────────────────
        pdf_path = f"/tmp/report_{email.replace('@','_').replace('.','_')}.pdf"
        doc      = SimpleDocTemplate(pdf_path, rightMargin=inch/2, leftMargin=inch/2,
                                     topMargin=inch/2, bottomMargin=inch/2)
        styles   = getSampleStyleSheet()

        title_style = ParagraphStyle("title", parent=styles["Title"],
                                     fontSize=18, spaceAfter=6)
        h1_style    = ParagraphStyle("h1", parent=styles["Heading1"],
                                     fontSize=13, spaceAfter=4)
        h2_style    = ParagraphStyle("h2", parent=styles["Heading2"],
                                     fontSize=11, spaceAfter=3)
        body_style  = ParagraphStyle("body", parent=styles["Normal"],
                                     fontSize=10, leading=14, spaceAfter=6)

        elements = [
            Paragraph("AI Cognitive Adventure", title_style),
            Paragraph("Cognitive Health Report", h1_style),
            Paragraph(f"Patient: {email}", body_style),
            Spacer(1, 14),

            Paragraph("Domain Scores", h2_style),
            Table(
                [
                    ["Domain",           "Score", "Sessions"],
                    ["Memory (Recall)",   f"{memory:.1f}",    str(len(rc))],
                    ["Language (Fluency)",f"{language:.1f}",  str(len(fl))],
                    ["Reasoning (Detective)", f"{reasoning:.1f}", str(len(dt))],
                    ["Vision (Temple)",  f"{vision:.1f}",    str(len(vi))],
                    ["Cognitive Health Index (CHI)", f"{chi:.1f}", "—"],
                ],
                colWidths=[3*inch, 1.2*inch, 1.2*inch],
                style=TableStyle([
                    ("BACKGROUND",  (0,0), (-1,0), colors.HexColor("#2c1810")),
                    ("TEXTCOLOR",   (0,0), (-1,0), colors.HexColor("#c9a227")),
                    ("FONTNAME",    (0,0), (-1,0), "Helvetica-Bold"),
                    ("FONTSIZE",    (0,0), (-1,-1), 10),
                    ("GRID",        (0,0), (-1,-1), 0.5, colors.HexColor("#c9a227")),
                    ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#f9f4ec")]),
                    ("BOTTOMPADDING",(0,0),(-1,-1), 6),
                    ("TOPPADDING",  (0,0), (-1,-1), 6),
                ])
            ),
            Spacer(1, 16),

            Paragraph("Memory Analysis",    h2_style), Paragraph(report["memory_analysis"],    body_style),
            Paragraph("Language Analysis",  h2_style), Paragraph(report["language_analysis"],  body_style),
            Paragraph("Reasoning Analysis", h2_style), Paragraph(report["reasoning_analysis"], body_style),
            Spacer(1, 8),
            Paragraph("Strengths",           h2_style), Paragraph(report["strengths"],           body_style),
            Paragraph("Areas to Improve",    h2_style), Paragraph(report["weaknesses"],          body_style),
            Paragraph("Suggested Exercises", h2_style), Paragraph(report["suggested_exercises"], body_style),
        ]

        doc.build(elements)
        return FileResponse(pdf_path, media_type="application/pdf",
                            filename="Cognitive_Report.pdf")
    finally:
        db.close()
