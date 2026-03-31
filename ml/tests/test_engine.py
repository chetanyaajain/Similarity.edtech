from app.engines.hybrid_similarity import HybridSimilarityEngine


def test_preprocess_removes_common_words():
    engine = HybridSimilarityEngine()
    result = engine.preprocess("This is a sample of the assignment text.")
    assert "the" not in result

