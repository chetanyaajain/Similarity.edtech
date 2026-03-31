import math
import re
from collections import Counter

import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from keybert import KeyBERT
except Exception:  # pragma: no cover
    KeyBERT = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None


class HybridSimilarityEngine:
    def __init__(self) -> None:
        self.stop_words = set(ENGLISH_STOP_WORDS)
        self.embedding_model = None
        if SentenceTransformer:
            try:
                self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self.embedding_model = None
        self.keyword_model = KeyBERT(model=self.embedding_model) if KeyBERT and self.embedding_model else None

    def preprocess(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        tokens = [token for token in text.split() if token not in self.stop_words]
        return " ".join(tokens)

    def split_segments(self, text: str) -> list[str]:
        segments = [segment.strip() for segment in re.split(r"(?<=[.!?])\s+", text) if segment.strip()]
        return segments[:80]

    def summarize(self, text: str) -> str:
        sentences = self.split_segments(text)
        if not sentences:
            return ""
        word_counts = Counter(self.preprocess(text).split())
        ranked = sorted(
            sentences,
            key=lambda sentence: sum(word_counts.get(word, 0) for word in sentence.lower().split()),
            reverse=True,
        )
        return " ".join(ranked[: min(3, len(ranked))])

    def extract_keywords(self, text: str) -> list[str]:
        if self.keyword_model:
            keywords = self.keyword_model.extract_keywords(text, top_n=5, stop_words="english")
            return [word for word, _ in keywords]
        tokens = [token for token in self.preprocess(text).split() if len(token) > 4]
        return [word for word, _ in Counter(tokens).most_common(5)]

    def semantic_similarity_matrix(self, documents: list[str]) -> np.ndarray:
        if not self.embedding_model:
            return cosine_similarity(TfidfVectorizer().fit_transform(documents))
        embeddings = self.embedding_model.encode(documents)
        return cosine_similarity(embeddings)

    def match_segments(self, source_text: str, target_text: str) -> list[dict]:
        source_segments = self.split_segments(source_text)
        target_segments = self.split_segments(target_text)
        if not source_segments or not target_segments:
            return []

        vectorizer = TfidfVectorizer().fit(source_segments + target_segments)
        source_vectors = vectorizer.transform(source_segments)
        target_vectors = vectorizer.transform(target_segments)
        scores = cosine_similarity(source_vectors, target_vectors)

        matches = []
        for source_index, row in enumerate(scores):
            target_index = int(np.argmax(row))
            score = float(row[target_index])
            if score >= 0.18:
                matches.append(
                    {
                        "sourceText": source_segments[source_index],
                        "targetText": target_segments[target_index],
                        "score": round(score * 100, 2),
                        "type": "semantic" if score < 0.55 else "direct",
                    }
                )
        return matches[:12]

    def analyze(self, documents: list[dict]) -> dict:
        if len(documents) < 2:
            insights = {
                str(doc["id"]): {
                    "summary": self.summarize(doc["text"]),
                    "keywords": self.extract_keywords(doc["text"]),
                    "originalityScore": 100.0,
                }
                for doc in documents
            }
            return {"documentInsights": insights, "edges": []}

        processed = [self.preprocess(doc["text"]) for doc in documents]
        tfidf = TfidfVectorizer(ngram_range=(1, 2))
        tfidf_matrix = tfidf.fit_transform(processed)
        tfidf_scores = cosine_similarity(tfidf_matrix)
        semantic_scores = self.semantic_similarity_matrix(processed)

        edges = []
        max_similarity_by_doc = {doc["id"]: 0.0 for doc in documents}
        for i in range(len(documents)):
            for j in range(i + 1, len(documents)):
                tfidf_score = float(tfidf_scores[i][j])
                semantic_score = float(semantic_scores[i][j])
                combined = min(1.0, (tfidf_score * 0.45) + (semantic_score * 0.55))
                similarity_percentage = round(combined * 100, 2)
                matched_segments = self.match_segments(documents[i]["text"], documents[j]["text"])
                explanation = self.build_explanation(tfidf_score, semantic_score, matched_segments)
                edges.append(
                    {
                        "sourceId": documents[i]["id"],
                        "targetId": documents[j]["id"],
                        "tfidfScore": round(tfidf_score * 100, 2),
                        "semanticScore": round(semantic_score * 100, 2),
                        "similarityPercentage": similarity_percentage,
                        "matchedSegments": matched_segments,
                        "explanation": explanation,
                    }
                )
                max_similarity_by_doc[documents[i]["id"]] = max(
                    max_similarity_by_doc[documents[i]["id"]], similarity_percentage
                )
                max_similarity_by_doc[documents[j]["id"]] = max(
                    max_similarity_by_doc[documents[j]["id"]], similarity_percentage
                )

        insights = {
            str(doc["id"]): {
                "summary": self.summarize(doc["text"]),
                "keywords": self.extract_keywords(doc["text"]),
                "originalityScore": round(max(0.0, 100 - max_similarity_by_doc[doc["id"]]), 2),
            }
            for doc in documents
        }
        return {"documentInsights": insights, "edges": edges}

    def build_explanation(self, tfidf_score: float, semantic_score: float, matches: list[dict]) -> str:
        if semantic_score > tfidf_score + 0.15:
            mode = "strong paraphrasing signals"
        elif tfidf_score >= semantic_score:
            mode = "direct lexical overlap"
        else:
            mode = "mixed lexical and semantic overlap"
        match_note = "multiple aligned segments" if matches else "limited sentence-level overlap"
        return (
            f"The pair shows {mode}, with {round(tfidf_score * 100, 1)}% keyword overlap "
            f"and {round(semantic_score * 100, 1)}% semantic closeness, indicating {match_note}."
        )
