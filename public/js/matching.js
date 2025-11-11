// Matching Module
app.matching = {
    currentMatches: [],

    // Find matches
    async findMatches() {
        try {
            // Check if user has embedding
            if (!app.userData.embeddingGeneratedAt) {
                app.showNotification(
                    'AI仲人との会話を進めて、プロフィールを完成させてください',
                    'warning'
                );
                app.switchTab('ai-chat');
                return;
            }

            app.showLoading(true);

            const result = await api.matching.findMatches({
                limit: 10,
                minScore: 50
            });

            if (result.success) {
                this.currentMatches = result.matches;
                this.displayMatches();

                if (result.total === 0) {
                    app.showNotification('現在マッチする相手が見つかりませんでした', 'info');
                } else {
                    app.showNotification(`${result.total}人の相手が見つかりました！`, 'success');
                }
            }
        } catch (error) {
            console.error('Error finding matches:', error);
            app.showNotification('マッチング検索中にエラーが発生しました', 'error');
        } finally {
            app.showLoading(false);
        }
    },

    // Display matches
    displayMatches() {
        const container = document.getElementById('matches-list');
        container.innerHTML = '';

        if (this.currentMatches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart-broken"></i>
                    <p>マッチする相手が見つかりませんでした</p>
                    <small>プロフィールを更新するか、検索条件を変更してみてください</small>
                </div>
            `;
            return;
        }

        this.currentMatches.forEach(match => {
            const card = this.createMatchCard(match);
            container.appendChild(card);
        });
    },

    // Create match card
    createMatchCard(match) {
        const card = document.createElement('div');
        card.className = 'match-card';

        const photoInitial = match.userData.displayName.charAt(0).toUpperCase();

        card.innerHTML = `
            <div class="match-photo">
                <i class="fas fa-user" style="font-size: 4rem;"></i>
            </div>
            <div class="match-info">
                <div class="match-header">
                    <h3 class="match-name">${this.escapeHtml(match.userData.displayName)}</h3>
                    <span class="match-score">${match.matchScore}%</span>
                </div>
                <p class="match-age-gender">
                    ${match.userData.age}歳 · ${this.getGenderLabel(match.userData.gender)}
                </p>
                <p class="match-bio">${this.escapeHtml(match.userData.bio)}</p>
                <div class="match-interests">
                    ${match.userData.interests.slice(0, 3).map(interest =>
                        `<span class="tag">${this.escapeHtml(interest)}</span>`
                    ).join('')}
                    ${match.userData.interests.length > 3 ? `<span class="tag">+${match.userData.interests.length - 3}</span>` : ''}
                </div>
                <div class="match-actions">
                    <button class="btn-match btn-decline" onclick="app.matching.skipMatch('${match.userId}')">
                        <i class="fas fa-times"></i> スキップ
                    </button>
                    <button class="btn-match btn-accept" onclick="app.matching.acceptMatch('${match.userId}')">
                        <i class="fas fa-heart"></i> いいね！
                    </button>
                </div>
            </div>
        `;

        return card;
    },

    // Accept match
    async acceptMatch(userId) {
        try {
            app.showLoading(true);

            const result = await api.matching.createMatch(userId);

            if (result.success) {
                app.showNotification('マッチングリクエストを送信しました！', 'success');

                // Remove from current matches
                this.currentMatches = this.currentMatches.filter(m => m.userId !== userId);
                this.displayMatches();
            }
        } catch (error) {
            console.error('Error accepting match:', error);
            app.showNotification('マッチングリクエストの送信に失敗しました', 'error');
        } finally {
            app.showLoading(false);
        }
    },

    // Skip match
    skipMatch(userId) {
        // Remove from current matches
        this.currentMatches = this.currentMatches.filter(m => m.userId !== userId);
        this.displayMatches();
    },

    // Get my matches
    async getMyMatches() {
        try {
            const result = await api.matching.getMyMatches('pending');

            if (result.success) {
                return result.matches;
            }

            return [];
        } catch (error) {
            console.error('Error getting matches:', error);
            return [];
        }
    },

    // Respond to match
    async respondToMatch(matchId, action) {
        try {
            app.showLoading(true);

            const result = await api.matching.respondToMatch(matchId, action);

            if (result.success) {
                if (action === 'accept') {
                    app.showNotification('マッチングが成立しました！', 'success');
                } else {
                    app.showNotification('マッチングを辞退しました', 'info');
                }

                // Refresh matches
                await this.findMatches();
            }
        } catch (error) {
            console.error('Error responding to match:', error);
            app.showNotification('応答の送信に失敗しました', 'error');
        } finally {
            app.showLoading(false);
        }
    },

    // Helper: Get gender label
    getGenderLabel(gender) {
        const labels = {
            male: '男性',
            female: '女性',
            other: 'その他'
        };
        return labels[gender] || gender;
    },

    // Helper: Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
