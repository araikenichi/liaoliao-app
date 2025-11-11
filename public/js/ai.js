// AI Matchmaker Module
app.ai = {
    conversationId: null,
    isInitialized: false,

    // Initialize conversation
    async initConversation() {
        try {
            // Check if conversation already exists in localStorage
            const savedConversationId = localStorage.getItem('ai_conversation_id');

            if (savedConversationId) {
                this.conversationId = savedConversationId;
                await this.loadConversationHistory();
            } else {
                await this.startNewConversation();
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing conversation:', error);
            app.showNotification('AI会話の初期化に失敗しました', 'error');
        }
    },

    // Start new conversation
    async startNewConversation() {
        try {
            app.showLoading(true);

            const result = await api.ai.startMatchmakerConversation();

            if (result.success) {
                this.conversationId = result.conversationId;
                localStorage.setItem('ai_conversation_id', this.conversationId);

                // Display initial message
                this.displayMessage(result.message, 'ai');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            app.showNotification('新しい会話の開始に失敗しました', 'error');
        } finally {
            app.showLoading(false);
        }
    },

    // Load conversation history
    async loadConversationHistory() {
        try {
            // Get conversation from Firestore
            const doc = await config.db.collection('ai_conversations')
                .doc(this.conversationId)
                .get();

            if (doc.exists) {
                const data = doc.data();
                const messages = data.messages || [];

                // Display messages (skip system prompt)
                for (const msg of messages) {
                    if (msg.role === 'system') continue;

                    this.displayMessage(
                        msg.content,
                        msg.role === 'user' ? 'user' : 'ai',
                        false // Don't animate
                    );
                }
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    },

    // Send message
    async sendMessage() {
        try {
            const input = document.getElementById('ai-message-input');
            const message = input.value.trim();

            if (!message) return;

            if (!this.isInitialized) {
                app.showNotification('会話の初期化中です。しばらくお待ちください', 'warning');
                return;
            }

            // Display user message
            this.displayMessage(message, 'user');

            // Clear input
            input.value = '';

            // Show typing indicator
            this.showTypingIndicator();

            // Send to API
            const result = await api.ai.continueMatchmakerConversation(
                this.conversationId,
                message
            );

            // Remove typing indicator
            this.hideTypingIndicator();

            if (result.success) {
                // Display AI response
                this.displayMessage(result.message, 'ai');

                // Check if profile is complete enough to generate embedding
                // This would be done on the backend, but we can trigger it here
                this.checkProfileCompleteness();
            } else {
                app.showNotification('メッセージの送信に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            app.showNotification('メッセージの送信中にエラーが発生しました', 'error');
        }
    },

    // Display message
    displayMessage(content, sender, animate = true) {
        const messagesContainer = document.getElementById('ai-messages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        if (!animate) messageDiv.style.animation = 'none';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'ai' ?
            '<i class="fas fa-robot"></i>' :
            '<i class="fas fa-user"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Show typing indicator
    showTypingIndicator() {
        const messagesContainer = document.getElementById('ai-messages');

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message ai';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <i class="fas fa-ellipsis-h fa-fade"></i> 入力中...
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },

    // Check profile completeness
    async checkProfileCompleteness() {
        try {
            // Get conversation data
            const doc = await config.db.collection('ai_conversations')
                .doc(this.conversationId)
                .get();

            if (doc.exists) {
                const data = doc.data();
                const extractedData = data.extractedData;

                if (extractedData && extractedData.completeness >= 70) {
                    // Profile is complete enough, generate embedding
                    if (!app.userData.embeddingGeneratedAt) {
                        await this.generateEmbedding();
                    }
                }
            }
        } catch (error) {
            console.error('Error checking profile completeness:', error);
        }
    },

    // Generate embedding
    async generateEmbedding() {
        try {
            const result = await api.ai.generateEmbedding();

            if (result.success) {
                app.showNotification('プロフィール分析が完了しました！マッチングを開始できます', 'success');

                // Update user data
                app.userData.embeddingGeneratedAt = new Date();
            }
        } catch (error) {
            console.error('Error generating embedding:', error);
        }
    },

    // Reset conversation
    async resetConversation() {
        if (confirm('会話をリセットしますか？これまでの会話履歴が削除されます。')) {
            localStorage.removeItem('ai_conversation_id');
            this.conversationId = null;
            this.isInitialized = false;

            // Clear messages
            document.getElementById('ai-messages').innerHTML = '';

            // Start new conversation
            await this.startNewConversation();
        }
    }
};
