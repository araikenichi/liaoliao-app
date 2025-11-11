const { MatchingService } = require('../services/matchingService');

describe('MatchingService', () => {
    let matchingService;

    beforeEach(() => {
        matchingService = new MatchingService();
    });

    describe('calculateValuesAlignment', () => {
        test('should return 1.0 for identical values', () => {
            const valuesA = { family: 8, career: 7, adventure: 9, stability: 6 };
            const valuesB = { family: 8, career: 7, adventure: 9, stability: 6 };

            const result = matchingService.calculateValuesAlignment(valuesA, valuesB);

            expect(result).toBe(1.0);
        });

        test('should return lower score for different values', () => {
            const valuesA = { family: 10, career: 10, adventure: 10, stability: 10 };
            const valuesB = { family: 0, career: 0, adventure: 0, stability: 0 };

            const result = matchingService.calculateValuesAlignment(valuesA, valuesB);

            expect(result).toBe(0);
        });

        test('should handle partial data', () => {
            const valuesA = { family: 8, career: 7 };
            const valuesB = { family: 8, career: 7, adventure: 9 };

            const result = matchingService.calculateValuesAlignment(valuesA, valuesB);

            expect(result).toBe(1.0);
        });

        test('should return 0.5 for missing data', () => {
            const result = matchingService.calculateValuesAlignment(null, null);

            expect(result).toBe(0.5);
        });
    });

    describe('calculateDistance', () => {
        test('should calculate distance correctly', () => {
            // Tokyo to Yokohama (approximately 30km)
            const lat1 = 35.6762;
            const lon1 = 139.6503;
            const lat2 = 35.4437;
            const lon2 = 139.6380;

            const distance = matchingService.calculateDistance(lat1, lon1, lat2, lon2);

            expect(distance).toBeGreaterThan(25);
            expect(distance).toBeLessThan(35);
        });

        test('should return 0 for same location', () => {
            const distance = matchingService.calculateDistance(35.6762, 139.6503, 35.6762, 139.6503);

            expect(distance).toBe(0);
        });
    });

    describe('calculateLocationScore', () => {
        test('should return 1.0 for close proximity (< 10km)', () => {
            const locationA = { latitude: 35.6762, longitude: 139.6503 };
            const locationB = { latitude: 35.6800, longitude: 139.6550 };

            const score = matchingService.calculateLocationScore(locationA, locationB);

            expect(score).toBe(1.0);
        });

        test('should return lower score for far distance', () => {
            const locationA = { latitude: 35.6762, longitude: 139.6503 }; // Tokyo
            const locationB = { latitude: 34.6937, longitude: 135.5023 }; // Osaka

            const score = matchingService.calculateLocationScore(locationA, locationB);

            expect(score).toBeLessThan(0.5);
        });

        test('should return 0.5 for missing location', () => {
            const score = matchingService.calculateLocationScore(null, null);

            expect(score).toBe(0.5);
        });
    });

    describe('calculateComplementarity', () => {
        test('should favor moderate differences in complementary traits', () => {
            const personalityA = {
                extraversion: 8,
                conscientiousness: 7,
                emotionalStability: 8,
                agreeableness: 9,
                openness: 8
            };

            const personalityB = {
                extraversion: 5, // 3 point difference (complementary)
                conscientiousness: 4, // 3 point difference (complementary)
                emotionalStability: 5, // 3 point difference (complementary)
                agreeableness: 9, // 0 point difference (similar)
                openness: 8 // 0 point difference (similar)
            };

            const score = matchingService.calculateComplementarity(personalityA, personalityB);

            expect(score).toBeGreaterThan(0.7);
            expect(score).toBeLessThanOrEqual(1.0);
        });
    });
});
