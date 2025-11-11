const { cosineSimilarity } = require('../config/openai');

describe('OpenAI Utilities', () => {
    describe('cosineSimilarity', () => {
        test('should return 1.0 for identical vectors', () => {
            const vec = [1, 2, 3, 4, 5];
            const result = cosineSimilarity(vec, vec);

            expect(result).toBeCloseTo(1.0, 5);
        });

        test('should return 0.0 for orthogonal vectors', () => {
            const vecA = [1, 0, 0];
            const vecB = [0, 1, 0];

            const result = cosineSimilarity(vecA, vecB);

            expect(result).toBeCloseTo(0.0, 5);
        });

        test('should return -1.0 for opposite vectors', () => {
            const vecA = [1, 2, 3];
            const vecB = [-1, -2, -3];

            const result = cosineSimilarity(vecA, vecB);

            expect(result).toBeCloseTo(-1.0, 5);
        });

        test('should handle normalized vectors correctly', () => {
            const vecA = [0.6, 0.8];
            const vecB = [0.8, 0.6];

            const result = cosineSimilarity(vecA, vecB);

            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(1);
        });

        test('should return 0 for zero vectors', () => {
            const vecA = [0, 0, 0];
            const vecB = [1, 2, 3];

            const result = cosineSimilarity(vecA, vecB);

            expect(result).toBe(0);
        });

        test('should throw error for different length vectors', () => {
            const vecA = [1, 2, 3];
            const vecB = [1, 2];

            expect(() => cosineSimilarity(vecA, vecB)).toThrow('Vectors must have the same length');
        });
    });
});
