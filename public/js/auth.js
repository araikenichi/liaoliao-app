// Authentication Module
window.app = window.app || {};

app.auth = {
    currentUser: null,

    // Initialize auth state listener
    init() {
        config.auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.handleAuthSuccess();
            } else {
                this.currentUser = null;
                this.showAuthScreen();
            }
        });
    },

    // Show login form
    showLogin() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    },

    // Show register form
    showRegister() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    },

    // Login
    async login() {
        try {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                app.showNotification('メールアドレスとパスワードを入力してください', 'error');
                return;
            }

            app.showLoading(true);

            await config.auth.signInWithEmailAndPassword(email, password);

            app.showNotification('ログインしました', 'success');
        } catch (error) {
            console.error('Login error:', error);
            app.showNotification('ログインに失敗しました: ' + error.message, 'error');
        } finally {
            app.showLoading(false);
        }
    },

    // Register
    async register() {
        try {
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const displayName = document.getElementById('register-name').value.trim();
            const age = parseInt(document.getElementById('register-age').value);
            const gender = document.getElementById('register-gender').value;
            const bio = document.getElementById('register-bio').value.trim();
            const interestsStr = document.getElementById('register-interests').value.trim();

            // Validation
            if (!email || !password || !displayName || !age || !gender || !bio || !interestsStr) {
                app.showNotification('すべてのフィールドを入力してください', 'error');
                return;
            }

            if (password.length < 8) {
                app.showNotification('パスワードは8文字以上である必要があります', 'error');
                return;
            }

            if (age < 18) {
                app.showNotification('18歳以上である必要があります', 'error');
                return;
            }

            const interests = interestsStr.split(',').map(i => i.trim()).filter(i => i);

            if (interests.length === 0) {
                app.showNotification('少なくとも1つの趣味を入力してください', 'error');
                return;
            }

            app.showLoading(true);

            // Register via API
            await api.auth.register({
                email,
                password,
                displayName,
                age,
                gender,
                bio,
                interests
            });

            // Sign in with Firebase
            await config.auth.signInWithEmailAndPassword(email, password);

            app.showNotification('登録が完了しました！', 'success');
        } catch (error) {
            console.error('Registration error:', error);
            app.showNotification('登録に失敗しました: ' + error.message, 'error');
        } finally {
            app.showLoading(false);
        }
    },

    // Logout
    async logout() {
        try {
            await config.auth.signOut();
            app.showNotification('ログアウトしました', 'success');
            this.showAuthScreen();
        } catch (error) {
            console.error('Logout error:', error);
            app.showNotification('ログアウトに失敗しました', 'error');
        }
    },

    // Handle auth success
    async handleAuthSuccess() {
        try {
            // Load user profile
            const profileResult = await api.users.getProfile();

            if (profileResult.success) {
                app.userData = profileResult.user;
                this.showMainScreen();

                // Initialize other modules
                await app.profile.loadProfile();
                await app.ai.initConversation();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            app.showNotification('ユーザー情報の読み込みに失敗しました', 'error');
        }
    },

    // Show auth screen
    showAuthScreen() {
        document.getElementById('auth-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
    },

    // Show main screen
    showMainScreen() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
    }
};
