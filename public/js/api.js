// API Helper Module
window.api = {
    // Get auth token
    async getAuthToken() {
        const user = config.auth.currentUser;
        if (!user) {
            throw new Error('No authenticated user');
        }
        return await user.getIdToken();
    },

    // Generic API call
    async call(endpoint, options = {}) {
        try {
            const token = await this.getAuthToken();

            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...(options.headers || {})
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        async register(userData) {
            const response = await fetch(`${config.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;
        },

        async verifyToken(token) {
            const response = await fetch(`${config.API_BASE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            return await response.json();
        }
    },

    // User endpoints
    users: {
        async getProfile() {
            return await api.call('/users/me');
        },

        async updateProfile(updates) {
            return await api.call('/users/me', {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        },

        async updateLocation(latitude, longitude) {
            return await api.call('/users/update-location', {
                method: 'POST',
                body: JSON.stringify({ latitude, longitude })
            });
        }
    },

    // AI endpoints
    ai: {
        async startMatchmakerConversation() {
            return await api.call('/ai/matchmaker/start', {
                method: 'POST'
            });
        },

        async continueMatchmakerConversation(conversationId, message) {
            return await api.call('/ai/matchmaker/continue', {
                method: 'POST',
                body: JSON.stringify({ conversationId, message })
            });
        },

        async generateEmbedding() {
            return await api.call('/ai/matchmaker/generate-embedding', {
                method: 'POST'
            });
        },

        async getMessageAdvice(receivedMessage, conversationHistory = []) {
            return await api.call('/ai/coach/message-advice', {
                method: 'POST',
                body: JSON.stringify({ receivedMessage, conversationHistory })
            });
        },

        async generateDatePlan(matchedUserId) {
            return await api.call('/ai/coach/date-plan', {
                method: 'POST',
                body: JSON.stringify({ matchedUserId })
            });
        },

        async generateConversationStarters(matchedUserId) {
            return await api.call('/ai/coach/conversation-starters', {
                method: 'POST',
                body: JSON.stringify({ matchedUserId })
            });
        }
    },

    // Matching endpoints
    matching: {
        async findMatches(options = {}) {
            const params = new URLSearchParams(options);
            return await api.call(`/matching/find?${params}`);
        },

        async calculateScore(targetUserId) {
            return await api.call('/matching/calculate-score', {
                method: 'POST',
                body: JSON.stringify({ targetUserId })
            });
        },

        async createMatch(targetUserId) {
            return await api.call('/matching/create', {
                method: 'POST',
                body: JSON.stringify({ targetUserId })
            });
        },

        async respondToMatch(matchId, action) {
            return await api.call('/matching/respond', {
                method: 'POST',
                body: JSON.stringify({ matchId, action })
            });
        },

        async getMyMatches(status = 'all') {
            return await api.call(`/matching/my-matches?status=${status}`);
        }
    }
};
