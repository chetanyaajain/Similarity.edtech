export const dashboardData = {
  cards: {
    totalBatches: 12,
    totalSubmissions: 426,
    averageOriginality: 82.4,
    flaggedPairs: 17
  },
  leaderboard: [
    { studentName: "Aarav Sharma", originalityScore: 98.2 },
    { studentName: "Mia Johnson", originalityScore: 95.9 },
    { studentName: "Noah Patel", originalityScore: 94.1 }
  ]
};

export const networkData = [
  { source: "Aarav", target: "Mia", weight: 18 },
  { source: "Aarav", target: "Noah", weight: 72 },
  { source: "Mia", target: "Noah", weight: 29 }
];

export const heatmapData = [
  { student: "Aarav", maxSimilarity: 72, averageSimilarity: 45 },
  { student: "Mia", maxSimilarity: 29, averageSimilarity: 18 },
  { student: "Noah", maxSimilarity: 72, averageSimilarity: 50 }
];

export const comparisonData = {
  leftStudent: "Aarav Sharma",
  rightStudent: "Noah Patel",
  similarity: 72.4,
  explanation:
    "Semantic overlap is notably higher than direct lexical overlap, suggesting paraphrased borrowing around the core argument.",
  matches: [
    {
      sourceText:
        "Artificial intelligence in education can personalize feedback and reveal learning gaps earlier.",
      targetText:
        "AI can improve education by personalizing support and identifying gaps in understanding.",
      score: 84
    },
    {
      sourceText:
        "Ethical adoption requires transparency, teacher oversight, and careful handling of student data.",
      targetText:
        "Responsible use depends on transparency, educator oversight, and privacy safeguards.",
      score: 79
    }
  ]
};

