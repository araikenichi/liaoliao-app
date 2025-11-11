// Main App Module
app = window.app || {};

// App state
app.userData = null;
app.currentTab = 'ai-chat';

// Initialize app
app.init = async function() {
    // Hide loading screen after a moment
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }, 1000);

    // Initialize authentication
    app.auth.init();

    // Setup tab navigation
    this.setupTabNavigation();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
};

// Setup tab navigation
app.setupTabNavigation = function() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            this.switchTab(tab);
        });
    });
};

// Switch tab
app.switchTab = function(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(`${tabName}-tab`).classList.add('active');

    this.currentTab = tabName;

    // Load tab-specific content
    if (tabName === 'matches') {
        app.matching.findMatches();
    } else if (tabName === 'profile') {
        app.profile.displayAIAnalysis();
    }
};

// Setup keyboard shortcuts
app.setupKeyboardShortcuts = function() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + 1-4 for tab navigation
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const tabs = ['ai-chat', 'matches', 'messages', 'profile'];
            const index = parseInt(e.key) - 1;
            this.switchTab(tabs[index]);
        }
    });
};

// Show loading
app.showLoading = function(show = true) {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = show ? 'flex' : 'none';
};

// Show notification
app.showNotification = function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${this.getNotificationColor(type)};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;

    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
};

// Get notification color
app.getNotificationColor = function(type) {
    const colors = {
        success: 'linear-gradient(135deg, #2ECC71, #27AE60)',
        error: 'linear-gradient(135deg, #E74C3C, #C0392B)',
        warning: 'linear-gradient(135deg, #F39C12, #E67E22)',
        info: 'linear-gradient(135deg, #3498DB, #2980B9)'
    };
    return colors[type] || colors.info;
};

// Request location permission
app.requestLocationPermission = async function() {
    if ('geolocation' in navigator) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;

            // Update location on server
            await api.users.updateLocation(latitude, longitude);

            app.showNotification('位置情報が更新されました', 'success');
        } catch (error) {
            console.error('Location error:', error);
            app.showNotification('位置情報の取得に失敗しました', 'warning');
        }
    }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
