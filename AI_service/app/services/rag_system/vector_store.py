import math


def _normalize(vector):
    length = math.sqrt(sum(value * value for value in vector))
    if length == 0:
        return vector
    return [value / length for value in vector]


def _cosine_similarity(left, right):
    return sum(a * b for a, b in zip(left, right))


def create_transient_index(chunks, vectors):
    return {
        "chunks": chunks,
        "vectors": [_normalize(vector) for vector in vectors],
    }


def search_dynamic_index(index, query_vector, chunks=None, k=4):
    query_vector = _normalize(query_vector)

    scored = []
    for position, vector in enumerate(index["vectors"]):
        scored.append((_cosine_similarity(query_vector, vector), position))

    scored.sort(reverse=True)

    results = [
        index["chunks"][position]
        for _, position in scored[:k]
    ]

    return "\n".join(results)