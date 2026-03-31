from collections import defaultdict

from app.models.models import Batch, SimilarityEdge, Submission


def build_report_payload(batch: Batch, submissions: list[Submission], edges: list[SimilarityEdge]):
    leaderboard = sorted(
        [
            {
                "studentName": item.student_name,
                "originalityScore": item.originality_score,
                "keywords": item.keywords,
            }
            for item in submissions
        ],
        key=lambda row: row["originalityScore"],
        reverse=True,
    )

    network = [
        {
            "source": edge.source_submission.student_name,
            "target": edge.target_submission.student_name,
            "weight": edge.similarity_percentage,
        }
        for edge in edges
    ]

    per_student = defaultdict(list)
    for edge in edges:
        per_student[edge.source_submission.student_name].append(edge.similarity_percentage)
        per_student[edge.target_submission.student_name].append(edge.similarity_percentage)

    heatmap = [
        {
            "student": submission.student_name,
            "maxSimilarity": max(per_student.get(submission.student_name, [0])),
            "averageSimilarity": (
                sum(per_student.get(submission.student_name, [0]))
                / max(1, len(per_student.get(submission.student_name, [])))
            ),
        }
        for submission in submissions
    ]

    return {
        "batch": {
            "id": batch.id,
            "name": batch.name,
            "subject": batch.subject,
            "section": batch.section,
            "year": batch.year,
        },
        "totals": {
            "submissions": len(submissions),
            "comparisons": len(edges),
            "highRiskPairs": len([edge for edge in edges if edge.similarity_percentage >= 70]),
        },
        "leaderboard": leaderboard,
        "network": network,
        "heatmap": heatmap,
        "edges": [
            {
                "id": edge.id,
                "sourceSubmissionId": edge.source_submission_id,
                "targetSubmissionId": edge.target_submission_id,
                "similarityPercentage": edge.similarity_percentage,
                "explanation": edge.explanation,
                "matchedSegments": edge.matched_segments,
            }
            for edge in edges
        ],
    }

