import app.engines.hybrid_similarity as hybrid_similarity


def test_preprocess_removes_common_words():
    hybrid_similarity.SentenceTransformer = None
    hybrid_similarity.KeyBERT = None
    engine = hybrid_similarity.HybridSimilarityEngine()
    result = engine.preprocess("This is a sample of the assignment text.")
    assert "the" not in result
