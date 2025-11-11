// Profile Module
app.profile = {
    // Load profile
    async loadProfile() {
        try {
            if (!app.userData) {
                const result = await api.users.getProfile();
                if (result.success) {
                    app.userData = result.user;
                }
            }

            this.displayProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            app.showNotification('プロフィールの読み込みに失敗しました', 'error');
        }
    },

    // Display profile
    displayProfile() {
        const user = app.userData;

        if (!user) return;

        // Basic info
        document.getElementById('profile-name').textContent = user.displayName;
        document.getElementById('profile-age-gender').textContent =
            `${user.age}歳 · ${this.getGenderLabel(user.gender)}`;

        // Bio
        document.getElementById('profile-bio').textContent = user.bio;

        // Interests
        const interestsContainer = document.getElementById('profile-interests');
        interestsContainer.innerHTML = '';

        if (user.interests && user.interests.length > 0) {
            user.interests.forEach(interest => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = interest;
                interestsContainer.appendChild(tag);
            });
        }

        // AI Analysis
        this.displayAIAnalysis();
    },

    // Display AI analysis
    async displayAIAnalysis() {
        const container = document.getElementById('profile-ai-analysis');

        if (!app.ai.conversationId) {
            container.innerHTML = '<p class="text-muted">AI仲人との会話を開始してください</p>';
            return;
        }

        try {
            // Get AI conversation data
            const doc = await config.db.collection('ai_conversations')
                .doc(app.ai.conversationId)
                .get();

            if (doc.exists) {
                const data = doc.data();
                const extractedData = data.extractedData;

                if (extractedData && extractedData.completeness > 0) {
                    let html = `
                        <div style="margin-bottom: 1rem;">
                            <strong>プロフィール完成度: ${extractedData.completeness}%</strong>
                            <div style="background: #e0e0e0; height: 8px; border-radius: 4px; margin-top: 0.5rem;">
                                <div style="background: linear-gradient(135deg, #FF6B9D, #C44569); width: ${extractedData.completeness}%; height: 100%; border-radius: 4px;"></div>
                            </div>
                        </div>
                    `;

                    if (extractedData.values) {
                        html += '<div style="margin-top: 1rem;"><strong>価値観:</strong><br>';
                        for (const [key, value] of Object.entries(extractedData.values)) {
                            const label = this.getValueLabel(key);
                            html += `<span class="tag" style="margin: 0.25rem;">${label}: ${value}/10</span>`;
                        }
                        html += '</div>';
                    }

                    if (extractedData.interests && extractedData.interests.length > 0) {
                        html += '<div style="margin-top: 1rem;"><strong>AI分析された興味:</strong><br>';
                        extractedData.interests.forEach(interest => {
                            html += `<span class="tag" style="margin: 0.25rem;">${interest}</span>`;
                        });
                        html += '</div>';
                    }

                    if (extractedData.idealPartner) {
                        html += `<div style="margin-top: 1rem;"><strong>理想のパートナー:</strong><br>
                                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${extractedData.idealPartner}</p>
                            </div>`;
                    }

                    container.innerHTML = html;
                } else {
                    container.innerHTML = '<p class="text-muted">AI仲人との会話を続けて、プロフィールを完成させましょう</p>';
                }
            }
        } catch (error) {
            console.error('Error displaying AI analysis:', error);
            container.innerHTML = '<p class="text-muted">AI分析データの読み込みに失敗しました</p>';
        }
    },

    // Edit profile (placeholder)
    editProfile() {
        app.showNotification('プロフィール編集機能は開発中です', 'info');
        // TODO: Implement profile editing modal
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

    // Helper: Get value label
    getValueLabel(key) {
        const labels = {
            family: '家族',
            career: 'キャリア',
            adventure: '冒険',
            stability: '安定'
        };
        return labels[key] || key;
    }
};
