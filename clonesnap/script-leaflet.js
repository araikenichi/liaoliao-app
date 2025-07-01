// 地图相关变量
let map;
let currentUserLocation = null;
let userMarkers = [];

// 应用状态管理
let currentUser = {
    id: 'me',
    name: '我',
    avatar: 'https://ui-avatars.com/api/?name=我&background=FFFC00&color=000',
    lat: 39.916527, // 默认天安门位置
    lng: 116.397128
};

let users = {
    user1: {
        id: 'user1',
        name: '小明',
        avatar: 'https://ui-avatars.com/api/?name=小明&background=FF6B6B&color=fff',
        lat: 39.918527, // 相对当前用户的偏移
        lng: 116.399128,
        distance: '200米',
        online: true,
        lastMessage: '你好，在附近看到你了 👋',
        time: '刚刚',
        unread: 2,
        bio: '喜欢摄影和旅行的90后，热爱生活每一天 📸',
        posts: 25,
        followers: 186,
        following: 94,
        isFollowing: false
    },
    user2: {
        id: 'user2',
        name: '小红',
        avatar: 'https://ui-avatars.com/api/?name=小红&background=4ECDC4&color=fff',
        lat: 39.914527,
        lng: 116.395128,
        distance: '350米',
        online: false,
        lastMessage: '今天天气真好呢',
        time: '5分钟前',
        unread: 0,
        bio: '美食博主 | 咖啡爱好者 | 分享生活中的小美好 ☕',
        posts: 42,
        followers: 312,
        following: 128,
        isFollowing: true
    },
    user3: {
        id: 'user3',
        name: '大伟',
        avatar: 'https://ui-avatars.com/api/?name=大伟&background=45B7D1&color=fff',
        lat: 39.920527,
        lng: 116.401128,
        distance: '520米',
        online: false,
        lastMessage: '有空一起吃饭吗？',
        time: '昨天',
        unread: 0,
        bio: '程序员 | 健身达人 | 喜欢交朋友 💪',
        posts: 18,
        followers: 92,
        following: 156,
        isFollowing: false
    }
};

let conversations = {
    user1: [
        { type: 'received', content: '你好！', time: '10:30' },
        { type: 'received', content: '在附近看到你了 👋', time: '10:31' },
        { type: 'sent', content: '你好！很高兴认识你', time: '10:32' }
    ],
    user2: [
        { type: 'received', content: '今天天气真好呢', time: '昨天 15:20' },
        { type: 'sent', content: '是的，很适合出门', time: '昨天 15:21' }
    ],
    user3: [
        { type: 'received', content: '有空一起吃饭吗？', time: '昨天 18:00' },
        { type: 'sent', content: '好的，什么时候？', time: '昨天 18:05' }
    ]
};

// 动态内容数据
let stories = [
    {
        id: 1,
        userId: 'user1',
        user: users.user1,
        content: '今天天气真好，去公园散步了！阳光明媚，心情也变得特别好 ☀️',
        images: ['https://picsum.photos/400/300?random=1'],
        location: '中央公园',
        time: '2小时前',
        likes: 15,
        comments: 3,
        shares: 2,
        liked: false,
        commentsList: [
            { user: users.user2, content: '看起来很棒呢！', time: '1小时前' },
            { user: users.user3, content: '我也想去', time: '30分钟前' }
        ]
    },
    {
        id: 2,
        userId: 'user2',
        user: users.user2,
        content: '今天尝试了新的咖啡店，味道超赞！推荐给大家 ☕',
        images: ['https://picsum.photos/400/300?random=2', 'https://picsum.photos/400/300?random=3'],
        location: '星巴克(三里屯店)',
        time: '4小时前',
        likes: 28,
        comments: 5,
        shares: 8,
        liked: true,
        commentsList: [
            { user: users.user1, content: '看起来很香！', time: '3小时前' },
            { user: users.user3, content: '在哪里？我也要去', time: '2小时前' }
        ]
    },
    {
        id: 3,
        userId: 'user3',
        user: users.user3,
        content: '周末和朋友们一起看电影，选择困难症又犯了 😅 大家有什么好推荐吗？',
        images: [],
        location: '万达影城',
        time: '6小时前',
        likes: 12,
        comments: 8,
        shares: 1,
        liked: false,
        commentsList: [
            { user: users.user1, content: '最近有很多好电影', time: '5小时前' },
            { user: users.user2, content: '推荐看喜剧片', time: '4小时前' }
        ]
    }
];

// 当前查看的动态ID（用于评论）
let currentStoryId = null;

// 发布动态相关变量
let selectedImages = [];
let selectedVideo = null;
let selectedLocation = null;
let locationMap = null;

// 页面历史记录
let lastPageBeforeChat = null;

// DOM元素
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');
const chatModal = document.getElementById('chatModal');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const notification = document.getElementById('notification');

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 设置当前时间
    updateTime();
    setInterval(updateTime, 60000); // 每分钟更新一次时间

    // 绑定导航事件
    bindNavigation();

    // 初始化Leaflet地图
    initLeafletMap();

    // 绑定消息输入事件
    bindMessageInput();

    console.log('CloneSnap 应用已初始化 (Leaflet版)');
});

// 初始化Leaflet地图
function initLeafletMap() {
    try {
        // 创建地图实例
        map = L.map('leafletMap', {
            zoomControl: false
        }).setView([currentUser.lat, currentUser.lng], 15);

        // 添加OpenStreetMap瓦片图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // 添加缩放控件到右下角
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        // 获取用户当前位置
        getCurrentLocation();

        // 添加用户标记
        addUserMarkers();

        console.log('Leaflet地图初始化成功');
        
    } catch (error) {
        console.error('地图初始化失败:', error);
        showNotification('地图初始化失败');
    }
}

// 获取当前位置
function getCurrentLocation() {
    if (!map) return;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // 定位成功
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // 更新当前用户位置
            currentUser.lat = lat;
            currentUser.lng = lng;
            currentUserLocation = [lat, lng];
            
            // 移动地图中心
            map.setView([lat, lng], 15);
            
            // 更新用户标记
            updateUserMarkers();
            
            // 重新计算距离
            updateUserDistances();
            
            showNotification('位置定位成功');
            
        }, function(error) {
            // 定位失败，使用默认位置
            console.log('定位失败，使用默认位置:', error);
            showNotification('定位失败，使用默认位置');
            
            currentUserLocation = [currentUser.lat, currentUser.lng];
            map.setView([currentUser.lat, currentUser.lng], 15);
            
            // 添加用户标记
            updateUserMarkers();
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        });
    } else {
        // 浏览器不支持地理定位
        showNotification('浏览器不支持定位功能');
        currentUserLocation = [currentUser.lat, currentUser.lng];
        updateUserMarkers();
    }
}

// 添加用户标记
function addUserMarkers() {
    if (!map) return;

    // 清除现有标记
    clearUserMarkers();

    // 添加当前用户标记
    addCurrentUserMarker();

    // 添加其他用户标记
    Object.values(users).forEach(user => {
        addUserMarker(user);
    });
}

// 添加当前用户标记
function addCurrentUserMarker() {
    // 创建自定义图标
    const currentUserIcon = L.divIcon({
        className: 'map-marker me',
        html: `
            <div class="pulse"></div>
            <div class="avatar">
                <img src="${currentUser.avatar}" alt="${currentUser.name}">
            </div>
            <div class="username">${currentUser.name}</div>
        `,
        iconSize: [50, 70],
        iconAnchor: [25, 60]
    });

    const marker = L.marker([currentUser.lat, currentUser.lng], {
        icon: currentUserIcon,
        zIndexOffset: 1000
    }).addTo(map);

    userMarkers.push({ marker, user: currentUser });
}

// 添加其他用户标记
function addUserMarker(user) {
    // 创建自定义图标
    const userIcon = L.divIcon({
        className: 'map-marker',
        html: `
            <div class="avatar">
                <img src="${user.avatar}" alt="${user.name}">
            </div>
            <div class="username">${user.name}</div>
        `,
        iconSize: [50, 70],
        iconAnchor: [25, 60]
    });

    const marker = L.marker([user.lat, user.lng], {
        icon: userIcon
    }).addTo(map);

    // 创建弹出窗口
    const popupContent = `
        <div class="map-info-window">
            <div class="user-info">
                <div class="avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="user-details">
                    <h4>${user.name}</h4>
                    <p>距离你 ${user.distance}</p>
                    <p>${user.online ? '在线' : '离线'}</p>
                </div>
            </div>
            <div class="actions">
                <button class="btn secondary" onclick="addFriend('${user.id}')">加好友</button>
                <button class="btn primary" onclick="startChat('${user.id}')">聊天</button>
            </div>
        </div>
    `;

    marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
    });

    // 添加点击事件
    marker.on('click', function() {
        // 弹窗会自动显示
    });

    userMarkers.push({ marker, user });
}

// 清除用户标记
function clearUserMarkers() {
    userMarkers.forEach(item => {
        map.removeLayer(item.marker);
    });
    userMarkers = [];
}

// 更新用户标记
function updateUserMarkers() {
    addUserMarkers();
}

// 刷新附近用户
function refreshNearbyUsers() {
    showNotification('正在刷新附近用户...');
    
    // 模拟刷新，随机调整用户位置
    Object.values(users).forEach(user => {
        // 在当前位置附近随机生成新位置（大约500米范围内）
        const offsetLat = (Math.random() - 0.5) * 0.008; // 约500米
        const offsetLng = (Math.random() - 0.5) * 0.008;
        
        user.lat = currentUser.lat + offsetLat;
        user.lng = currentUser.lng + offsetLng;
    });
    
    // 更新标记
    updateUserMarkers();
    
    // 重新计算距离
    updateUserDistances();
    
    setTimeout(() => {
        showNotification('附近用户已更新');
    }, 1000);
}

// 计算两点之间的距离
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径，单位千米
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 1000; // 转换为米
    
    if (distance < 1000) {
        return Math.round(distance) + '米';
    } else {
        return (distance / 1000).toFixed(1) + '公里';
    }
}

// 更新用户距离
function updateUserDistances() {
    Object.values(users).forEach(user => {
        user.distance = calculateDistance(
            currentUser.lat, currentUser.lng,
            user.lat, user.lng
        );
    });
    
    // 更新附近用户列表
    updateNearbyUsersList();
}

// 更新附近用户列表
function updateNearbyUsersList() {
    const userList = document.querySelector('.user-list');
    if (!userList) return;
    
    userList.innerHTML = '';
    
    // 按距离排序
    const sortedUsers = Object.values(users).sort((a, b) => {
        const distanceA = parseFloat(a.distance);
        const distanceB = parseFloat(b.distance);
        return distanceA - distanceB;
    });
    
    sortedUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.setAttribute('data-user', user.id);
        
        userItem.innerHTML = `
            <div class="avatar" onclick="openUserProfile('${user.id}')" style="cursor: pointer;">
                <img src="${user.avatar}" alt="${user.name}">
            </div>
            <div class="user-info">
                <h4 onclick="openUserProfile('${user.id}')" style="cursor: pointer;">${user.name}</h4>
                <p>距离你 ${user.distance}</p>
            </div>
            <div class="user-actions">
                <button class="add-friend-btn" onclick="addFriend('${user.id}')">
                    <i class="fas fa-user-plus"></i>
                </button>
                <button class="chat-btn" onclick="startChat('${user.id}')">
                    <i class="fas fa-comment"></i>
                </button>
            </div>
        `;
        
        userList.appendChild(userItem);
    });
}

// 更新时间显示
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeElement = document.querySelector('.time');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

// 绑定导航功能
function bindNavigation() {
    navItems.forEach(navItem => {
        navItem.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                switchPage(targetPage);
                
                // 更新导航状态
                navItems.forEach(item => item.classList.remove('active'));
                this.classList.add('active');

                // 特殊处理相机按钮
                if (targetPage === 'camera-page') {
                    vibrate();
                }
            }
        });
    });
}

// 页面切换
function switchPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });

    // 页面切换动画
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.style.transform = 'translateX(100%)';
        setTimeout(() => {
            activePage.style.transform = 'translateX(0)';
        }, 50);
    }
}

// 加好友功能
function addFriend(userId) {
    const user = users[userId];
    if (user) {
        showNotification(`已向 ${user.name} 发送好友请求`);
        
        // 模拟好友请求成功
        setTimeout(() => {
            showNotification(`${user.name} 已接受您的好友请求`);
            vibrate();
        }, 2000);
    }
}

// 开始聊天
function startChat(userId) {
    console.log('=== startChat 执行 ===');
    
    const user = users[userId];
    if (!user) {
        console.error('用户不存在:', userId);
        return;
    }
    
    // 记录当前页面
    const currentActivePage = document.querySelector('.page.active');
    if (currentActivePage) {
        lastPageBeforeChat = currentActivePage.id;
        console.log('记录聊天前页面:', lastPageBeforeChat);
    }
    
    // 直接打开聊天窗口，不切换页面
    console.log('直接打开聊天窗口');
    openChat(userId);
}

// 打开聊天窗口
function openChat(userId) {
    console.log('=== openChat 开始执行 ===');
    console.log('Opening chat for user ID:', userId);
    
    const user = users[userId];
    console.log('User found:', user);
    
    if (!user) {
        console.error('User not found:', userId);
        alert('错误：找不到用户 ' + userId);
        return;
    }
    
    // 检查必要的DOM元素
    const chatModal = document.getElementById('chatModal');
    const chatUserAvatar = document.getElementById('chatUserAvatar');
    const chatUserName = document.getElementById('chatUserName');
    const chatMessages = document.getElementById('chatMessages');
    
    console.log('DOM elements check:');
    console.log('chatModal:', chatModal);
    console.log('chatUserAvatar:', chatUserAvatar);
    console.log('chatUserName:', chatUserName);
    console.log('chatMessages:', chatMessages);
    
    if (!chatModal || !chatUserAvatar || !chatUserName || !chatMessages) {
        console.error('Missing required DOM elements');
        alert('错误：聊天界面元素缺失');
        return;
    }
    
    try {
        // 更新聊天头部信息
        console.log('Updating chat header info...');
        chatUserAvatar.src = user.avatar;
        chatUserName.textContent = user.name;
        
        // 添加点击事件打开用户个人主页
        const chatUserInfo = document.querySelector('.chat-user-info');
        if (chatUserInfo) {
            chatUserInfo.style.cursor = 'pointer';
            chatUserInfo.onclick = (e) => {
                e.stopPropagation();
                openUserProfile(userId);
            };
        }
        
        // 为头像和用户名单独添加点击事件
        chatUserAvatar.style.cursor = 'pointer';
        chatUserAvatar.onclick = (e) => {
            e.stopPropagation();
            openUserProfile(userId);
        };
        
        chatUserName.style.cursor = 'pointer';
        chatUserName.onclick = (e) => {
            e.stopPropagation();
            openUserProfile(userId);
        };
        
        // 加载聊天消息
        console.log('Loading chat messages...');
        loadChatMessages(userId);
        
        // 显示聊天窗口 - 多重确保
        console.log('Showing chat modal...');
        
        // 方法1：添加active类
        chatModal.classList.add('active');
        
        // 方法2：直接设置样式
        chatModal.style.display = 'flex';
        chatModal.style.visibility = 'visible';
        chatModal.style.opacity = '1';
        
        // 方法3：确保z-index正确
        chatModal.style.zIndex = '1000';
        
        console.log('Modal after display attempts:');
        console.log('Classes:', chatModal.classList.toString());
        console.log('Display:', chatModal.style.display);
        console.log('Visibility:', chatModal.style.visibility);
        console.log('Opacity:', chatModal.style.opacity);
        console.log('Z-index:', chatModal.style.zIndex);
        
        // 清零未读消息
        user.unread = 0;
        updateChatList();
        
        // 焦点到输入框
        const messageInput = document.getElementById('messageInput');
        setTimeout(() => {
            if (messageInput) {
                messageInput.focus();
                console.log('Input focused');
            }
        }, 500);
        
        console.log('=== openChat 执行成功 ===');
        return true;
        
    } catch (error) {
        console.error('Error in openChat:', error);
        alert('打开聊天失败: ' + error.message);
        return false;
    }
}

// 加载聊天消息
function loadChatMessages(userId) {
    chatMessages.innerHTML = '';
    const messages = conversations[userId] || [];
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        chatMessages.appendChild(messageElement);
    });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 创建消息元素
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    messageDiv.innerHTML = `
        <div>${message.content}</div>
        <small style="font-size: 11px; opacity: 0.7; margin-top: 4px;">${message.time}</small>
    `;
    return messageDiv;
}

// 关闭聊天窗口
function closeChatModal() {
    console.log('=== closeChatModal 执行 ===');
    console.log('返回到页面:', lastPageBeforeChat);
    
    try {
        // 首先关闭聊天modal
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.classList.remove('active');
            
            // 清除强制样式
            chatModal.style.display = '';
            chatModal.style.visibility = '';
            chatModal.style.opacity = '';
            chatModal.style.zIndex = '';
            
            console.log('聊天modal已关闭');
        } else {
            console.error('找不到chatModal元素');
        }
        
        // 返回到聊天打开前的页面
        if (lastPageBeforeChat) {
            console.log('切换到页面:', lastPageBeforeChat);
            
            // 确保页面存在
            const targetPage = document.getElementById(lastPageBeforeChat);
            if (targetPage) {
                switchPage(lastPageBeforeChat);
                
                // 更新导航栏状态
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach(item => item.classList.remove('active'));
                
                const targetNavItem = document.querySelector(`[data-page="${lastPageBeforeChat}"]`);
                if (targetNavItem) {
                    targetNavItem.classList.add('active');
                    console.log('导航栏已更新到:', lastPageBeforeChat);
                } else {
                    console.warn('找不到对应的导航项:', lastPageBeforeChat);
                }
                
                // 重置记录
                lastPageBeforeChat = null;
                console.log('成功返回到之前页面');
            } else {
                console.error('目标页面不存在:', lastPageBeforeChat);
                // 降级到默认行为
                goToDefaultPage();
            }
        } else {
            console.log('没有记录的前页面，返回到默认页面');
            goToDefaultPage();
        }
        
    } catch (error) {
        console.error('closeChatModal执行出错:', error);
        // 出错时的降级处理
        goToDefaultPage();
    }
}

// 默认页面处理
function goToDefaultPage() {
    console.log('执行默认返回逻辑');
    
    try {
        // 默认返回到聊天页面
        switchPage('chat-page');
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const chatNavItem = document.querySelector('[data-page="chat-page"]');
        if (chatNavItem) {
            chatNavItem.classList.add('active');
            console.log('已返回到聊天页面');
        }
    } catch (error) {
        console.error('默认返回逻辑也失败了:', error);
        // 最后的降级：强制刷新页面
        alert('返回功能出现问题，请刷新页面');
    }
}

// 绑定消息输入事件
function bindMessageInput() {
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 发送消息
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    
    const currentUserId = getCurrentChatUserId();
    if (!currentUserId) return;
    
    // 添加消息到对话
    const newMessage = {
        type: 'sent',
        content: message,
        time: getCurrentTime()
    };
    
    if (!conversations[currentUserId]) {
        conversations[currentUserId] = [];
    }
    conversations[currentUserId].push(newMessage);
    
    // 显示消息
    const messageElement = createMessageElement(newMessage);
    chatMessages.appendChild(messageElement);
    
    // 清空输入框
    messageInput.value = '';
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 更新聊天列表
    users[currentUserId].lastMessage = message;
    users[currentUserId].time = '刚刚';
    updateChatList();
    
    // 模拟对方回复
    setTimeout(() => {
        simulateReply(currentUserId);
    }, 1000 + Math.random() * 2000);
}

// 获取当前聊天用户ID
function getCurrentChatUserId() {
    const chatUserName = document.getElementById('chatUserName').textContent;
    for (let userId in users) {
        if (users[userId].name === chatUserName) {
            return userId;
        }
    }
    return null;
}

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 模拟对方回复
function simulateReply(userId) {
    const replies = [
        '哈哈，是的',
        '好的，我知道了',
        '谢谢你！',
        '听起来不错',
        '那我们约个时间吧',
        '好主意！',
        '我也这么想',
        '👍',
        '😊',
        '在哪里见面？'
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const replyMessage = {
        type: 'received',
        content: randomReply,
        time: getCurrentTime()
    };
    
    if (!conversations[userId]) {
        conversations[userId] = [];
    }
    conversations[userId].push(replyMessage);
    
    // 如果聊天窗口是当前用户，显示消息
    const currentUserId = getCurrentChatUserId();
    if (currentUserId === userId) {
        const messageElement = createMessageElement(replyMessage);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
        // 增加未读计数
        users[userId].unread = (users[userId].unread || 0) + 1;
    }
    
    // 更新聊天列表
    users[userId].lastMessage = randomReply;
    users[userId].time = '刚刚';
    updateChatList();
    
    // 显示通知
    if (currentUserId !== userId) {
        showNotification(`${users[userId].name}: ${randomReply}`);
        vibrate();
    }
}

// 更新聊天列表
function updateChatList() {
    const chatList = document.querySelector('.chat-list');
    if (!chatList) return;
    
    chatList.innerHTML = '';
    
    Object.values(users).forEach(user => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        
        chatItem.innerHTML = `
            <div class="avatar" data-user-id="${user.id}" style="cursor: pointer;">
                <img src="${user.avatar}" alt="${user.name}">
                ${user.online ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="chat-info">
                <h4 data-user-id="${user.id}" style="cursor: pointer;">${user.name}</h4>
                <p class="last-message">${user.lastMessage}</p>
            </div>
            <div class="chat-meta">
                <span class="time">${user.time}</span>
                ${user.unread > 0 ? `<div class="unread-badge">${user.unread}</div>` : ''}
            </div>
        `;
        
        // 为聊天项添加点击事件（打开聊天）
        chatItem.addEventListener('click', (e) => {
            // 检查是否点击的是头像或用户名
            if (e.target.closest('.avatar') || e.target.closest('h4')) {
                return; // 不执行openChat
            }
            openChat(user.id);
        });
        
        // 为头像添加点击事件（打开用户资料）
        const avatar = chatItem.querySelector('.avatar');
        if (avatar) {
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Avatar clicked for user:', user.id);
                openUserProfile(user.id);
            });
        }
        
        // 为用户名添加点击事件（打开用户资料）
        const userName = chatItem.querySelector('h4');
        if (userName) {
            userName.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Username clicked for user:', user.id);
                openUserProfile(user.id);
            });
        }
        
        chatList.appendChild(chatItem);
    });
}

// 显示通知
function showNotification(message) {
    const notificationText = document.getElementById('notificationText');
    if (notificationText) {
        notificationText.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// 震动反馈
function vibrate() {
    if ('vibrate' in navigator) {
        navigator.vibrate(100);
    }
}

// 模拟用户移动（在地图上）
function simulateUserMovement() {
    setInterval(() => {
        // 模拟其他用户在地图上的移动
        Object.values(users).forEach(user => {
            // 在当前位置附近小范围移动（约50米）
            const offsetLat = (Math.random() - 0.5) * 0.0008; // 约50米
            const offsetLng = (Math.random() - 0.5) * 0.0008;
            
            user.lat += offsetLat;
            user.lng += offsetLng;
        });
        
        // 更新地图标记
        if (map) {
            updateUserMarkers();
            updateUserDistances();
        }
    }, 10000); // 每10秒移动一次
}

// 相机功能相关变量
let cameraStream = null;
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let recordingStartTime = null;
let recordingTimer = null;
let currentCameraMode = 'photo'; // 'photo' 或 'video'
let currentFacingMode = 'user'; // 'user' (前置) 或 'environment' (后置)
let flashEnabled = false;
let capturedMedia = null; // 当前拍摄的媒体文件

// 初始化相机功能
function initCamera() {
    console.log('初始化相机功能...');
    
    // 绑定相机模式切换
    bindCameraModes();
    
    // 绑定拍摄按钮
    bindCaptureButton();
    
    // 当进入相机页面时自动请求权限
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const cameraPage = document.getElementById('camera-page');
                if (cameraPage && cameraPage.classList.contains('active')) {
                    requestCameraPermission();
                }
            }
        });
    });
    
    const cameraPage = document.getElementById('camera-page');
    if (cameraPage) {
        observer.observe(cameraPage, { attributes: true });
    }
}

// 绑定相机模式切换
function bindCameraModes() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有按钮的active类
            modeBtns.forEach(b => b.classList.remove('active'));
            // 添加当前按钮的active类
            btn.classList.add('active');
            // 切换模式
            currentCameraMode = btn.dataset.mode;
            console.log('切换到', currentCameraMode, '模式');
            
            // 更新拍摄按钮样式
            updateCaptureButtonStyle();
        });
    });
}

// 绑定拍摄按钮事件
function bindCaptureButton() {
    const captureBtn = document.getElementById('captureBtn');
    if (!captureBtn) return;

    let pressTimer;
    let isPressing = false;

    // 触摸设备事件
    captureBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isPressing = true;
        
        if (currentCameraMode === 'photo') {
            // 拍照模式，短按直接拍照
            pressTimer = setTimeout(() => {
                if (isPressing && currentCameraMode === 'photo') {
                    takePicture();
                }
            }, 100);
        } else {
            // 录像模式，长按开始录制
            pressTimer = setTimeout(() => {
                if (isPressing && currentCameraMode === 'video') {
                    startVideoRecording();
                }
            }, 200);
        }
    });

    captureBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        isPressing = false;
        clearTimeout(pressTimer);
        
        if (isRecording) {
            stopVideoRecording();
        }
    });

    // 鼠标事件（桌面设备）
    captureBtn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isPressing = true;
        
        if (currentCameraMode === 'photo') {
            pressTimer = setTimeout(() => {
                if (isPressing && currentCameraMode === 'photo') {
                    takePicture();
                }
            }, 100);
        } else {
            pressTimer = setTimeout(() => {
                if (isPressing && currentCameraMode === 'video') {
                    startVideoRecording();
                }
            }, 200);
        }
    });

    captureBtn.addEventListener('mouseup', function(e) {
        e.preventDefault();
        isPressing = false;
        clearTimeout(pressTimer);
        
        if (isRecording) {
            stopVideoRecording();
        }
    });

    // 点击事件作为备用
    captureBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentCameraMode === 'photo' && !isRecording) {
            takePicture();
        }
    });
}

// 更新拍摄按钮样式
function updateCaptureButtonStyle() {
    const captureInner = document.getElementById('captureInner');
    if (!captureInner) return;
    
    if (currentCameraMode === 'video') {
        captureInner.style.borderRadius = '8px';
        captureInner.style.width = '40px';
        captureInner.style.height = '40px';
        captureInner.style.backgroundColor = '#ff3333';
    } else {
        captureInner.style.borderRadius = '50%';
        captureInner.style.width = '60px';
        captureInner.style.height = '60px';
        captureInner.style.backgroundColor = '#fff';
    }
}

// 请求相机权限
async function requestCameraPermission() {
    console.log('请求相机权限...');
    const permissionDiv = document.getElementById('cameraPermission');
    const videoElement = document.getElementById('cameraVideo');
    
    try {
        // 检查是否支持MediaDevices API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('您的浏览器不支持相机功能');
        }

        // 请求相机权限
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: currentCameraMode === 'video' ? true : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('相机权限获取成功');
        
        // 保存stream
        cameraStream = stream;
        
        // 显示视频流
        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
        }
        
        // 隐藏权限请求界面
        if (permissionDiv) {
            permissionDiv.style.display = 'none';
        }
        
        showNotification('相机已启用');
        
    } catch (error) {
        console.error('相机权限获取失败:', error);
        
        let errorMessage = '无法访问相机';
        if (error.name === 'NotAllowedError') {
            errorMessage = '请允许相机权限以使用拍照功能';
        } else if (error.name === 'NotFoundError') {
            errorMessage = '未找到可用的相机设备';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = '您的浏览器不支持相机功能';
        }
        
        showNotification(errorMessage);
        
        if (permissionDiv) {
            permissionDiv.style.display = 'flex';
            const button = permissionDiv.querySelector('.enable-camera-btn');
            if (button) {
                button.textContent = '重试';
            }
        }
    }
}

// 拍照功能
async function takePicture() {
    console.log('拍照...');
    
    if (!cameraStream) {
        showNotification('请先启用相机');
        return;
    }

    const videoElement = document.getElementById('cameraVideo');
    const canvas = document.getElementById('photoCanvas');
    
    if (!videoElement || !canvas) {
        showNotification('相机初始化失败');
        return;
    }

    try {
        // 设置canvas尺寸
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // 绘制当前帧到canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        // 转换为blob
        canvas.toBlob((blob) => {
            if (blob) {
                console.log('照片拍摄成功，大小:', blob.size);
                capturedMedia = {
                    type: 'photo',
                    blob: blob,
                    url: URL.createObjectURL(blob)
                };
                
                // 显示拍照动画
                showCaptureAnimation();
                
                // 震动反馈
                vibrate();
                
                // 打开编辑界面
                setTimeout(() => {
                    openEditModal();
                }, 300);
            }
        }, 'image/jpeg', 0.9);
        
    } catch (error) {
        console.error('拍照失败:', error);
        showNotification('拍照失败，请重试');
    }
}

// 开始录制视频
async function startVideoRecording() {
    console.log('开始录制视频...');
    
    if (!cameraStream) {
        showNotification('请先启用相机');
        return;
    }

    if (isRecording) {
        return;
    }

    try {
        // 重新获取包含音频的stream
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStream = stream;
        
        // 更新video元素
        const videoElement = document.getElementById('cameraVideo');
        if (videoElement) {
            videoElement.srcObject = stream;
        }

        // 创建MediaRecorder
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9' // 或者使用 'video/mp4'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            console.log('视频录制完成，大小:', blob.size);
            
            capturedMedia = {
                type: 'video',
                blob: blob,
                url: URL.createObjectURL(blob)
            };
            
            // 打开编辑界面
            openEditModal();
        };

        // 开始录制
        mediaRecorder.start();
        isRecording = true;
        recordingStartTime = Date.now();
        
        // 显示录制指示器
        showRecordingIndicator();
        
        // 开始录制计时器
        startRecordingTimer();
        
        // 震动反馈
        vibrate();
        
        showNotification('录制开始');
        
    } catch (error) {
        console.error('录制失败:', error);
        showNotification('录制失败，请重试');
    }
}

// 停止录制视频
function stopVideoRecording() {
    console.log('停止录制视频...');
    
    if (!isRecording || !mediaRecorder) {
        return;
    }

    try {
        mediaRecorder.stop();
        isRecording = false;
        
        // 隐藏录制指示器
        hideRecordingIndicator();
        
        // 停止录制计时器
        stopRecordingTimer();
        
        // 震动反馈
        vibrate();
        
        showNotification('录制完成');
        
    } catch (error) {
        console.error('停止录制失败:', error);
        showNotification('停止录制失败');
    }
}

// 显示录制指示器
function showRecordingIndicator() {
    const indicator = document.getElementById('recordingIndicator');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

// 隐藏录制指示器
function hideRecordingIndicator() {
    const indicator = document.getElementById('recordingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// 开始录制计时器
function startRecordingTimer() {
    const timeDisplay = document.getElementById('recordingTime');
    if (!timeDisplay) return;
    
    recordingTimer = setInterval(() => {
        if (recordingStartTime) {
            const elapsed = Date.now() - recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// 停止录制计时器
function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    
    const timeDisplay = document.getElementById('recordingTime');
    if (timeDisplay) {
        timeDisplay.textContent = '00:00';
    }
}

// 显示拍摄动画
function showCaptureAnimation() {
    const videoElement = document.getElementById('cameraVideo');
    if (videoElement) {
        videoElement.style.filter = 'brightness(1.5)';
        setTimeout(() => {
            videoElement.style.filter = 'brightness(1)';
        }, 150);
    }
}

// 切换前后摄像头
async function switchCamera() {
    console.log('切换摄像头...');
    
    if (!cameraStream) {
        showNotification('请先启用相机');
        return;
    }

    try {
        // 停止当前stream
        cameraStream.getTracks().forEach(track => track.stop());
        
        // 切换facingMode
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        
        // 重新请求相机权限
        await requestCameraPermission();
        
        showNotification(currentFacingMode === 'user' ? '前置摄像头' : '后置摄像头');
        
    } catch (error) {
        console.error('切换摄像头失败:', error);
        showNotification('切换摄像头失败');
    }
}

// 切换闪光灯（模拟功能）
function toggleFlash() {
    flashEnabled = !flashEnabled;
    const flashIcon = document.getElementById('flashIcon');
    
    if (flashIcon) {
        flashIcon.className = flashEnabled ? 'fas fa-bolt' : 'fas fa-bolt-slash';
        flashIcon.style.color = flashEnabled ? '#FFFC00' : '#666';
    }
    
    showNotification(flashEnabled ? '闪光灯已开启' : '闪光灯已关闭');
}

// 打开编辑界面
function openEditModal() {
    console.log('打开编辑界面...', capturedMedia);
    
    if (!capturedMedia) {
        showNotification('没有可编辑的媒体');
        return;
    }

    const editModal = document.getElementById('editModal');
    const editPreviewImg = document.getElementById('editPreviewImg');
    const editPreviewVideo = document.getElementById('editPreviewVideo');
    
    if (!editModal) {
        showNotification('编辑界面加载失败');
        return;
    }

    // 显示预览
    if (capturedMedia.type === 'photo') {
        editPreviewImg.src = capturedMedia.url;
        editPreviewImg.style.display = 'block';
        editPreviewVideo.style.display = 'none';
    } else {
        editPreviewVideo.src = capturedMedia.url;
        editPreviewVideo.style.display = 'block';
        editPreviewImg.style.display = 'none';
    }
    
    // 显示编辑界面
    editModal.classList.add('active');
    editModal.style.display = 'flex';
    
    console.log('编辑界面已打开');
}

// 取消编辑
function cancelEdit() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.classList.remove('active');
        editModal.style.display = 'none';
    }
    
    // 清理媒体
    if (capturedMedia && capturedMedia.url) {
        URL.revokeObjectURL(capturedMedia.url);
    }
    capturedMedia = null;
}

// 进入发布界面
function proceedToPublish() {
    if (!capturedMedia) {
        showNotification('没有可发布的内容');
        return;
    }

    const editModal = document.getElementById('editModal');
    const publishModal = document.getElementById('publishModal');
    const publishPreviewImg = document.getElementById('publishPreviewImg');
    const publishPreviewVideo = document.getElementById('publishPreviewVideo');
    
    // 隐藏编辑界面
    if (editModal) {
        editModal.classList.remove('active');
        editModal.style.display = 'none';
    }
    
    // 显示发布界面
    if (publishModal) {
        // 设置预览
        if (capturedMedia.type === 'photo') {
            publishPreviewImg.src = capturedMedia.url;
            publishPreviewImg.style.display = 'block';
            publishPreviewVideo.style.display = 'none';
        } else {
            publishPreviewVideo.src = capturedMedia.url;
            publishPreviewVideo.style.display = 'block';
            publishPreviewImg.style.display = 'none';
        }
        
        publishModal.classList.add('active');
        publishModal.style.display = 'flex';
    }
}

// 返回编辑界面
function backToEdit() {
    const editModal = document.getElementById('editModal');
    const publishModal = document.getElementById('publishModal');
    
    // 隐藏发布界面
    if (publishModal) {
        publishModal.classList.remove('active');
        publishModal.style.display = 'none';
    }
    
    // 显示编辑界面
    if (editModal) {
        editModal.classList.add('active');
        editModal.style.display = 'flex';
    }
}

// 发布到故事页面
function publishToStories() {
    if (!capturedMedia) {
        showNotification('没有可发布的内容');
        return;
    }

    const caption = document.getElementById('publishCaption').value || '';
    const privacy = document.getElementById('privacySelect').value || 'public';
    
    // 创建新的动态
    const newStory = {
        id: Date.now(),
        userId: 'me',
        user: currentUser,
        content: caption,
        images: capturedMedia.type === 'photo' ? [capturedMedia.url] : [],
        video: capturedMedia.type === 'video' ? capturedMedia.url : null,
        location: selectedLocation ? selectedLocation.name : null,
        time: '刚刚',
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        commentsList: []
    };
    
    // 添加到动态列表
    stories.unshift(newStory);
    
    // 关闭发布界面
    const publishModal = document.getElementById('publishModal');
    if (publishModal) {
        publishModal.classList.remove('active');
        publishModal.style.display = 'none';
    }
    
    // 清空输入
    document.getElementById('publishCaption').value = '';
    
    // 切换到发现页面
    switchPage('stories-page');
    
    // 重新渲染动态流
    renderStoriesFeed();
    
    showNotification('发布成功！');
    
    // 清理媒体（延迟清理，让界面显示完整）
    setTimeout(() => {
        capturedMedia = null;
    }, 1000);
}

// 编辑工具函数
function addText() {
    const textOverlay = document.getElementById('textOverlay');
    const overlayText = document.getElementById('overlayText');
    
    if (textOverlay && overlayText) {
        textOverlay.style.display = 'flex';
        overlayText.focus();
    }
}

function addEmoji() {
    const overlayText = document.getElementById('overlayText');
    if (overlayText) {
        const emojis = ['😀', '😍', '🤔', '😂', '👍', '❤️', '🔥', '✨', '🎉', '💫'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        overlayText.value += randomEmoji;
    }
}

function adjustFilters() {
    showNotification('滤镜功能开发中...');
}

function cropMedia() {
    showNotification('裁剪功能开发中...');
}

function addLocation() {
    showNotification('位置功能开发中...');
}

function tagFriends() {
    showNotification('标记功能开发中...');
}

// 打开媒体库
function openMediaGallery() {
    showNotification('媒体库功能开发中...');
}

// 小红书风格动态功能

// 渲染动态内容流
function renderStoriesFeed() {
    const storiesFeed = document.getElementById('storiesFeed');
    if (!storiesFeed) return;
    
    storiesFeed.innerHTML = '';
    
    stories.forEach(story => {
        const storyCard = createStoryCard(story);
        storiesFeed.appendChild(storyCard);
    });
}

// 创建动态卡片
function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.setAttribute('data-story-id', story.id);
    
    // 处理图片显示
    let mediaHtml = '';
    if (story.images && story.images.length > 0) {
        if (story.images.length === 1) {
            mediaHtml = `
                <div class="story-media">
                    <img src="${story.images[0]}" alt="动态图片">
                </div>
            `;
        } else {
            mediaHtml = `
                <div class="story-media grid">
                    ${story.images.map(img => `<img src="${img}" alt="动态图片">`).join('')}
                </div>
            `;
        }
    }
    
    // 位置信息
    const locationHtml = story.location ? `
        <div class="story-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${story.location}</span>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div class="story-header">
            <div class="story-user">
                <div class="avatar" onclick="openUserProfile('${story.user.id}')" style="cursor: pointer;">
                    <img src="${story.user.avatar}" alt="${story.user.name}">
                </div>
                <div class="story-user-info">
                    <h4 onclick="openUserProfile('${story.user.id}')" style="cursor: pointer;">${story.user.name}</h4>
                    <p>${story.time}</p>
                </div>
            </div>
            <button class="story-add-friend" onclick="addFriend('${story.user.id}')">
                <i class="fas fa-user-plus"></i>
            </button>
        </div>
        
        <div class="story-content">
            <div class="story-text">${story.content}</div>
            ${locationHtml}
            ${mediaHtml}
        </div>
        
        <div class="story-actions">
            <div class="story-actions-left">
                <button class="action-btn ${story.liked ? 'liked' : ''}" onclick="toggleLike(${story.id})">
                    <i class="fas fa-heart"></i>
                    <span>${story.likes}</span>
                </button>
                <button class="action-btn" onclick="openComments(${story.id})">
                    <i class="fas fa-comment"></i>
                    <span>${story.comments}</span>
                </button>
                <button class="action-btn" onclick="shareStory(${story.id})">
                    <i class="fas fa-share"></i>
                    <span>${story.shares}</span>
                </button>
            </div>
            <div class="story-stats">
                <button class="action-btn" onclick="startChat('${story.user.id}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="action-btn story-more" onclick="showStoryOptions(${story.id})">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// 点赞功能
function toggleLike(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    if (story.liked) {
        story.liked = false;
        story.likes--;
        showNotification('取消点赞');
    } else {
        story.liked = true;
        story.likes++;
        showNotification('点赞成功 ❤️');
        vibrate();
    }
    
    // 更新界面
    renderStoriesFeed();
}

// 打开评论弹窗
function openComments(storyId) {
    currentStoryId = storyId;
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const commentsModal = document.getElementById('commentsModal');
    const commentsList = document.getElementById('commentsList');
    
    // 渲染评论列表
    commentsList.innerHTML = '';
    story.commentsList.forEach(comment => {
        const commentItem = createCommentItem(comment);
        commentsList.appendChild(commentItem);
    });
    
    commentsModal.classList.add('active');
}

// 创建评论项
function createCommentItem(comment) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    
    item.innerHTML = `
        <div class="avatar" onclick="openUserProfile('${comment.user.id}')" style="cursor: pointer;">
            <img src="${comment.user.avatar}" alt="${comment.user.name}">
        </div>
        <div class="comment-content">
            <div class="username" onclick="openUserProfile('${comment.user.id}')" style="cursor: pointer;">${comment.user.name}</div>
            <div class="text">${comment.content}</div>
            <div class="time">${comment.time}</div>
        </div>
    `;
    
    return item;
}

// 关闭评论弹窗
function closeCommentsModal() {
    const commentsModal = document.getElementById('commentsModal');
    commentsModal.classList.remove('active');
    currentStoryId = null;
}

// 提交评论
function submitComment() {
    if (!currentStoryId) return;
    
    const commentText = document.getElementById('commentText');
    const text = commentText.value.trim();
    
    if (!text) return;
    
    const story = stories.find(s => s.id === currentStoryId);
    if (!story) return;
    
    // 添加新评论
    const newComment = {
        user: currentUser,
        content: text,
        time: '刚刚'
    };
    
    story.commentsList.push(newComment);
    story.comments++;
    
    // 清空输入框
    commentText.value = '';
    
    // 重新渲染评论
    openComments(currentStoryId);
    
    // 更新动态流
    renderStoriesFeed();
    
    showNotification('评论发布成功');
}

// 分享功能
function shareStory(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    story.shares++;
    
    // 模拟分享选项
    const shareOptions = [
        '分享到微信',
        '分享到朋友圈',
        '复制链接',
        '保存图片'
    ];
    
    const option = shareOptions[Math.floor(Math.random() * shareOptions.length)];
    showNotification(`${option}成功`);
    
    renderStoriesFeed();
}

// 显示动态选项
function showStoryOptions(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const options = ['举报', '不感兴趣', '复制链接'];
    const choice = options[Math.floor(Math.random() * options.length)];
    showNotification(`已选择: ${choice}`);
}

// 发布功能
function openPublishModal() {
    const publishModal = document.getElementById('publishModal');
    publishModal.classList.add('active');
    
    // 清空之前的内容
    document.getElementById('publishText').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    document.getElementById('selectedLocation').style.display = 'none';
    
    // 重置选择的媒体和位置
    selectedImages = [];
    selectedVideo = null;
    selectedLocation = null;
}

function closePublishModal() {
    const publishModal = document.getElementById('publishModal');
    publishModal.classList.remove('active');
    
    // 清空选择
    selectedImages = [];
    selectedVideo = null;
    selectedLocation = null;
}

function submitPublish() {
    const publishText = document.getElementById('publishText').value.trim();
    
    if (!publishText && selectedImages.length === 0 && !selectedVideo) {
        showNotification('请输入内容或选择图片/视频');
        return;
    }
    
    // 准备图片数据
    let images = [];
    if (selectedVideo) {
        // 如果有视频，暂时用随机图片替代（实际应用中应该是视频缩略图）
        images = ['https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 1000)];
    } else if (selectedImages.length > 0) {
        // 使用上传的图片URL（在实际应用中，这些应该是上传到服务器后的URL）
        images = selectedImages.map(img => img.url);
    }
    
    // 创建新动态
    const newStory = {
        id: stories.length + 1,
        user: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
        },
        content: publishText || (selectedVideo ? '分享了一个视频' : '分享了图片'),
        images: images,
        location: selectedLocation ? selectedLocation.name : '',
        time: '刚刚',
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        commentsList: []
    };
    
    // 添加到动态列表开头
    stories.unshift(newStory);
    
    // 重新渲染
    renderStoriesFeed();
    
    // 关闭弹窗
    closePublishModal();
    
    showNotification('发布成功！');
    vibrate();
}

// 快速发布
function quickPublish(type) {
    if (type === 'photo') {
        showNotification('相机功能开发中...');
        // 这里可以调用相机API
    } else if (type === 'video') {
        showNotification('视频功能开发中...');
        // 这里可以调用视频录制API
    }
}

// 选择媒体
function selectMedia(type) {
    if (type === 'image') {
        const imageInput = document.getElementById('imageInput');
        imageInput.click();
    } else if (type === 'video') {
        const videoInput = document.getElementById('videoInput');
        videoInput.click();
    }
}

// 处理图片上传
function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            if (selectedImages.length < 9) { // 最多9张图片
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedImages.push({
                        file: file,
                        url: e.target.result,
                        type: 'image'
                    });
                    updateMediaPreview();
                };
                reader.readAsDataURL(file);
            } else {
                showNotification('最多只能选择9张图片');
            }
        }
    });
    
    // 清空input
    event.target.value = '';
}

// 处理视频上传
function handleVideoUpload(event) {
    const file = event.target.files[0];
    
    if (file && file.type.startsWith('video/')) {
        if (file.size > 100 * 1024 * 1024) { // 100MB限制
            showNotification('视频文件大小不能超过100MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedVideo = {
                file: file,
                url: e.target.result,
                type: 'video'
            };
            selectedImages = []; // 选择视频时清空图片
            updateMediaPreview();
        };
        reader.readAsDataURL(file);
    }
    
    // 清空input
    event.target.value = '';
}

// 更新媒体预览
function updateMediaPreview() {
    const mediaPreview = document.getElementById('mediaPreview');
    mediaPreview.innerHTML = '';
    
    if (selectedVideo) {
        // 显示视频预览
        const videoItem = createMediaItem(selectedVideo, 0);
        mediaPreview.appendChild(videoItem);
    } else if (selectedImages.length > 0) {
        // 显示图片预览
        selectedImages.forEach((image, index) => {
            const imageItem = createMediaItem(image, index);
            mediaPreview.appendChild(imageItem);
        });
    }
}

// 创建媒体项元素
function createMediaItem(media, index) {
    const item = document.createElement('div');
    item.className = 'media-item';
    
    if (media.type === 'image') {
        item.innerHTML = `
            <img src="${media.url}" alt="预览图片">
            <button class="remove-media" onclick="removeMedia(${index}, 'image')">
                <i class="fas fa-times"></i>
            </button>
        `;
    } else if (media.type === 'video') {
        item.innerHTML = `
            <video src="${media.url}" controls></video>
            <div class="video-indicator">
                <i class="fas fa-play"></i>
                <span>视频</span>
            </div>
            <button class="remove-media" onclick="removeMedia(${index}, 'video')">
                <i class="fas fa-times"></i>
            </button>
        `;
    }
    
    return item;
}

// 移除媒体
function removeMedia(index, type) {
    if (type === 'image') {
        selectedImages.splice(index, 1);
    } else if (type === 'video') {
        selectedVideo = null;
    }
    updateMediaPreview();
}

// 选择位置
function selectLocation() {
    const locationModal = document.getElementById('locationModal');
    locationModal.classList.add('active');
    
    // 初始化位置地图
    setTimeout(() => {
        initLocationMap();
        loadLocationSuggestions();
    }, 100);
}

// 初始化位置选择地图
function initLocationMap() {
    const mapContainer = document.getElementById('locationMap');
    if (!mapContainer || locationMap) return;
    
    try {
        locationMap = L.map('locationMap').setView([currentUser.lat, currentUser.lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(locationMap);
        
        // 添加当前位置标记
        L.marker([currentUser.lat, currentUser.lng])
            .addTo(locationMap)
            .bindPopup('当前位置')
            .openPopup();
            
        // 点击地图选择位置
        locationMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // 清除之前的标记
            locationMap.eachLayer(layer => {
                if (layer instanceof L.Marker && layer.options.draggable) {
                    locationMap.removeLayer(layer);
                }
            });
            
            // 添加新标记
            L.marker([lat, lng], { draggable: true })
                .addTo(locationMap)
                .bindPopup('选中位置');
                
            // 获取地址信息
            reverseGeocode(lat, lng);
        });
        
    } catch (error) {
        console.error('地图初始化失败:', error);
    }
}

// 反向地理编码（获取地址）
function reverseGeocode(lat, lng) {
    // 这里可以使用实际的反向地理编码API
    // 暂时使用模拟数据
    const mockAddresses = [
        '北京市朝阳区三里屯',
        '北京市海淀区中关村',
        '北京市东城区王府井',
        '北京市西城区金融街',
        '北京市丰台区南站'
    ];
    
    const address = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    
    selectedLocation = {
        lat: lat,
        lng: lng,
        name: address,
        address: address
    };
    
    // 更新确定按钮状态
    const confirmBtn = document.querySelector('.confirm-location-btn');
    confirmBtn.disabled = false;
}

// 加载位置建议
function loadLocationSuggestions() {
    const suggestions = document.getElementById('locationSuggestions');
    
    // 获取当前位置地址
    const currentLocationAddress = document.getElementById('currentLocationAddress');
    currentLocationAddress.textContent = '北京市朝阳区'; // 模拟当前位置
    
    // 模拟附近位置
    const nearbyPlaces = [
        { name: '星巴克(三里屯店)', address: '北京市朝阳区三里屯路' },
        { name: '中央公园', address: '北京市朝阳区朝阳公园' },
        { name: '万达影城', address: '北京市朝阳区建外SOHO' },
        { name: '北京大学', address: '北京市海淀区颐和园路' },
        { name: '天安门广场', address: '北京市东城区天安门' }
    ];
    
    suggestions.innerHTML = '';
    nearbyPlaces.forEach(place => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.onclick = () => selectLocationItem(place);
        
        item.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <div class="location-details">
                <span class="location-name">${place.name}</span>
                <span class="location-address">${place.address}</span>
            </div>
        `;
        
        suggestions.appendChild(item);
    });
}

// 选择当前位置
function selectCurrentLocation() {
    selectedLocation = {
        lat: currentUser.lat,
        lng: currentUser.lng,
        name: '当前位置',
        address: '北京市朝阳区'
    };
    
    // 更新选中状态
    updateLocationSelection(document.querySelector('.location-current'));
    
    // 更新确定按钮状态
    const confirmBtn = document.querySelector('.confirm-location-btn');
    confirmBtn.disabled = false;
}

// 选择位置项
function selectLocationItem(place) {
    selectedLocation = {
        lat: currentUser.lat + (Math.random() - 0.5) * 0.01, // 模拟位置
        lng: currentUser.lng + (Math.random() - 0.5) * 0.01,
        name: place.name,
        address: place.address
    };
    
    // 更新选中状态
    const items = document.querySelectorAll('.location-item');
    items.forEach(item => item.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // 更新确定按钮状态
    const confirmBtn = document.querySelector('.confirm-location-btn');
    confirmBtn.disabled = false;
}

// 更新位置选择状态
function updateLocationSelection(selectedElement) {
    // 清除之前的选中状态
    document.querySelectorAll('.location-current, .location-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 添加选中状态
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
}

// 搜索位置
function searchLocation() {
    const searchText = document.getElementById('locationSearch').value.trim();
    if (!searchText) return;
    
    // 这里可以集成真实的地图搜索API
    showNotification(`搜索 "${searchText}" 功能开发中...`);
}

// 确认位置选择
function confirmLocation() {
    if (!selectedLocation) return;
    
    // 显示选中的位置
    const locationContainer = document.getElementById('selectedLocation');
    const locationText = document.getElementById('locationText');
    
    locationText.textContent = selectedLocation.name;
    locationContainer.style.display = 'block';
    
    // 关闭弹窗
    closeLocationModal();
    
    showNotification('位置选择成功');
}

// 关闭位置选择弹窗
function closeLocationModal() {
    const locationModal = document.getElementById('locationModal');
    locationModal.classList.remove('active');
    
    // 清理地图
    if (locationMap) {
        locationMap.remove();
        locationMap = null;
    }
    
    selectedLocation = null;
    
    // 重置确定按钮
    const confirmBtn = document.querySelector('.confirm-location-btn');
    confirmBtn.disabled = true;
}

// 移除位置
function removeLocation() {
    selectedLocation = null;
    const locationContainer = document.getElementById('selectedLocation');
    locationContainer.style.display = 'none';
}

// 发现功能
function initDiscover() {
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            showNotification(`正在打开: ${title}`);
        });
    });
}

// 设置功能
function openSettings() {
    showNotification('设置功能正在开发中...');
}

// 搜索功能
function openSearch() {
    showNotification('搜索功能正在开发中...');
}

// 工具函数：更新用户在线状态
function updateOnlineStatus() {
    setInterval(() => {
        Object.values(users).forEach(user => {
            // 随机更新在线状态
            if (Math.random() < 0.1) { // 10% 概率改变状态
                user.online = !user.online;
            }
        });
        updateChatList();
    }, 30000); // 每30秒检查一次
}

// 初始化所有功能
function initializeApp() {
    initCamera();
    initDiscover();
    updateOnlineStatus();
    simulateUserMovement(); // 启动用户移动模拟
    updateChatList();
    updateNearbyUsersList(); // 初始化用户列表
    renderStoriesFeed(); // 初始化动态内容流
    
    // 绑定其他事件
    const addStoryBtn = document.querySelector('.add-story-btn');
    if (addStoryBtn) {
        addStoryBtn.addEventListener('click', addStory);
    }
    
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    const searchBtns = document.querySelectorAll('.search-btn');
    searchBtns.forEach(btn => {
        btn.addEventListener('click', openSearch);
    });
    
    console.log('所有功能已初始化完成 (Leaflet版)');
}

// 应用启动时初始化
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeApp, 100);
});

// 导出函数供HTML调用
window.addFriend = addFriend;
window.startChat = startChat;
window.openChat = openChat;
window.closeChatModal = closeChatModal;
window.sendMessage = sendMessage;
window.getCurrentLocation = getCurrentLocation;
window.refreshNearbyUsers = refreshNearbyUsers;
window.toggleLike = toggleLike;
window.openComments = openComments;
window.closeCommentsModal = closeCommentsModal;
window.submitComment = submitComment;
window.shareStory = shareStory;
window.showStoryOptions = showStoryOptions;
window.openPublishModal = openPublishModal;
window.closePublishModal = closePublishModal;
window.submitPublish = submitPublish;
window.quickPublish = quickPublish;
window.selectMedia = selectMedia;
window.selectLocation = selectLocation;
window.handleImageUpload = handleImageUpload;
window.handleVideoUpload = handleVideoUpload;
window.removeMedia = removeMedia;
window.removeLocation = removeLocation;
window.selectCurrentLocation = selectCurrentLocation;
window.selectLocationItem = selectLocationItem;
window.searchLocation = searchLocation;
window.confirmLocation = confirmLocation;
window.closeLocationModal = closeLocationModal;

// 个人资料数据
let profileData = {
    name: '我',
    bio: '点击添加个人简介...',
    phone: '点击添加手机号码',
    email: '点击添加邮箱',
    avatar: 'https://ui-avatars.com/api/?name=我&background=FFFC00&color=000',
    stats: {
        posts: 0,
        followers: 0,
        following: 0
    },
    socialMedia: [],
    privacy: {
        privateAccount: false,
        findByPhone: true,
        showOnlineStatus: true
    }
};

// 保存和加载数据
function saveProfileData() {
    localStorage.setItem('profileData', JSON.stringify(profileData));
}

function loadProfileData() {
    const saved = localStorage.getItem('profileData');
    if (saved) {
        profileData = {...profileData, ...JSON.parse(saved)};
    }
    updateProfileDisplay();
}

// 更新个人资料显示
function updateProfileDisplay() {
    const profileNameEl = document.getElementById('profileName');
    const profileBioEl = document.getElementById('profileBio');
    const profilePhoneEl = document.getElementById('profilePhone');
    const profileEmailEl = document.getElementById('profileEmail');
    const profileAvatarEl = document.getElementById('profileAvatarImg');
    
    if (profileNameEl) profileNameEl.textContent = profileData.name;
    if (profileBioEl) profileBioEl.textContent = profileData.bio;
    if (profilePhoneEl) profilePhoneEl.textContent = profileData.phone;
    if (profileEmailEl) profileEmailEl.textContent = profileData.email;
    if (profileAvatarEl) profileAvatarEl.src = profileData.avatar;
    
    // 更新统计数据
    const postsCountEl = document.getElementById('postsCount');
    const followersCountEl = document.getElementById('followersCount');
    const followingCountEl = document.getElementById('followingCount');
    
    if (postsCountEl) postsCountEl.textContent = profileData.stats.posts;
    if (followersCountEl) followersCountEl.textContent = profileData.stats.followers;
    if (followingCountEl) followingCountEl.textContent = profileData.stats.following;
    
    // 更新隐私设置
    const privateAccountEl = document.getElementById('privateAccount');
    const findByPhoneEl = document.getElementById('findByPhone');
    const showOnlineStatusEl = document.getElementById('showOnlineStatus');
    
    if (privateAccountEl) privateAccountEl.checked = profileData.privacy.privateAccount;
    if (findByPhoneEl) findByPhoneEl.checked = profileData.privacy.findByPhone;
    if (showOnlineStatusEl) showOnlineStatusEl.checked = profileData.privacy.showOnlineStatus;
    
    // 更新社交媒体列表
    updateSocialMediaList();
}

// 更新社交媒体列表
function updateSocialMediaList() {
    const container = document.getElementById('socialLinks');
    if (!container) return;
    
    const addBtn = container.querySelector('.add-social-btn');
    
    // 清除现有的社交媒体项
    const existingItems = container.querySelectorAll('.social-item');
    existingItems.forEach(item => item.remove());
    
    // 添加社交媒体项
    profileData.socialMedia.forEach((social, index) => {
        const socialItem = document.createElement('div');
        socialItem.className = 'social-item';
        socialItem.innerHTML = `
            <div class="social-icon ${social.platform}">
                <i class="fab fa-${social.platform === 'wechat' ? 'weixin' : social.platform}"></i>
            </div>
            <div class="social-info">
                <div class="social-name">${social.name}</div>
                <div class="social-username">${social.username}</div>
            </div>
            <div class="remove-social" onclick="removeSocialMedia(${index})">
                <i class="fas fa-times"></i>
            </div>
        `;
        if (addBtn) {
            container.insertBefore(socialItem, addBtn);
        } else {
            container.appendChild(socialItem);
        }
    });
}

// 头像上传
function changeAvatar() {
    document.getElementById('avatarInput').click();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB限制
            showNotification('头像文件大小不能超过5MB！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            profileData.avatar = e.target.result;
            const avatarImg = document.getElementById('profileAvatarImg');
            if (avatarImg) avatarImg.src = profileData.avatar;
            saveProfileData();
            showNotification('头像上传成功！');
        };
        reader.readAsDataURL(file);
    }
}

// 编辑功能
let currentEditType = '';
let currentEditValue = '';

function editName() {
    openEditModal('姓名', 'input', profileData.name, 'name');
}

function editBio() {
    openEditModal('个人简介', 'textarea', profileData.bio === '点击添加个人简介...' ? '' : profileData.bio, 'bio');
}

function editPhone() {
    openEditModal('手机号码', 'input', profileData.phone === '点击添加手机号码' ? '' : profileData.phone, 'phone');
}

function editEmail() {
    openEditModal('邮箱地址', 'input', profileData.email === '点击添加邮箱' ? '' : profileData.email, 'email');
}

function openEditModal(title, type, value, editType) {
    currentEditType = editType;
    currentEditValue = value;
    
    const editModal = document.getElementById('editModal');
    const editTitle = document.getElementById('editTitle');
    const input = document.getElementById('editInput');
    const textarea = document.getElementById('editTextarea');
    
    if (!editModal || !editTitle || !input || !textarea) return;
    
    editTitle.textContent = `编辑${title}`;
    
    if (type === 'input') {
        input.style.display = 'block';
        textarea.style.display = 'none';
        input.value = value;
        setTimeout(() => input.focus(), 100);
    } else {
        input.style.display = 'none';
        textarea.style.display = 'block';
        textarea.value = value;
        setTimeout(() => textarea.focus(), 100);
    }
    
    editModal.classList.add('show');
}

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.classList.remove('show');
}

function saveEdit() {
    const input = document.getElementById('editInput');
    const textarea = document.getElementById('editTextarea');
    
    if (!input || !textarea) return;
    
    const value = input.style.display === 'block' ? input.value : textarea.value;
    
    if (value.trim()) {
        profileData[currentEditType] = value.trim();
        
        // 特殊处理显示默认文本
        if (currentEditType === 'bio' && !value.trim()) {
            profileData.bio = '点击添加个人简介...';
        } else if (currentEditType === 'phone' && !value.trim()) {
            profileData.phone = '点击添加手机号码';
        } else if (currentEditType === 'email' && !value.trim()) {
            profileData.email = '点击添加邮箱';
        }
        
        updateProfileDisplay();
        saveProfileData();
        showNotification('保存成功！');
    }
    
    closeEditModal();
}

// 社交媒体管理
function addSocialMedia() {
    const socialModal = document.getElementById('socialModal');
    if (socialModal) socialModal.classList.add('show');
}

function closeSocialModal() {
    const socialModal = document.getElementById('socialModal');
    if (socialModal) socialModal.classList.remove('show');
}

function addPlatform(platform) {
    const platformNames = {
        weibo: '微博',
        wechat: '微信',
        qq: 'QQ',
        instagram: 'Instagram',
        twitter: 'Twitter',
        facebook: 'Facebook'
    };
    
    const username = prompt(`请输入您的${platformNames[platform]}用户名:`);
    if (username && username.trim()) {
        profileData.socialMedia.push({
            platform: platform,
            name: platformNames[platform],
            username: username.trim()
        });
        
        updateSocialMediaList();
        saveProfileData();
        showNotification(`${platformNames[platform]}账号添加成功！`);
    }
    
    closeSocialModal();
}

function removeSocialMedia(index) {
    if (confirm('确定要删除这个社交媒体账号吗？')) {
        profileData.socialMedia.splice(index, 1);
        updateSocialMediaList();
        saveProfileData();
        showNotification('社交媒体账号删除成功！');
    }
}

// 隐私设置
function initPrivacySettings() {
    const checkboxes = ['privateAccount', 'findByPhone', 'showOnlineStatus'];
    
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                profileData.privacy[id] = this.checked;
                saveProfileData();
                
                const labels = {
                    privateAccount: '私密账户',
                    findByPhone: '通过手机号查找',
                    showOnlineStatus: '显示在线状态'
                };
                
                showNotification(`${labels[id]}设置已${this.checked ? '开启' : '关闭'}`);
            });
        }
    });
}

// 打开应用设置页面
function openAppSettings() {
    document.getElementById('settingsModal').classList.add('show');
}

// 关闭应用设置页面
function closeAppSettings() {
    document.getElementById('settingsModal').classList.remove('show');
}

// 打开隐私设置（跳转到个人资料页面的隐私设置部分）
function openPrivacySettings() {
    closeAppSettings();
    // 滚动到隐私设置部分
    setTimeout(() => {
        const privacySection = document.querySelector('.detail-section:last-child');
        if (privacySection) {
            privacySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 高亮效果
            privacySection.style.background = 'rgba(255, 252, 0, 0.1)';
            setTimeout(() => {
                privacySection.style.background = '';
            }, 2000);
        }
    }, 300);
}

// 确认退出登录
function confirmLogout() {
    const confirmed = confirm('确定要退出登录吗？');
    if (confirmed) {
        showNotification('正在退出登录...');
        // 模拟退出登录过程
        setTimeout(() => {
            showNotification('已退出登录');
            closeAppSettings();
        }, 1000);
    }
}

// 保留原功能的个人设置
function openProfileSettings() {
    // 滚动到隐私设置部分
    const privacySection = document.querySelector('.detail-section:last-child');
    if (privacySection) {
        privacySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 高亮效果
        privacySection.style.background = 'rgba(255, 252, 0, 0.1)';
        setTimeout(() => {
            privacySection.style.background = '';
        }, 2000);
    }
}

// 添加到window导出
window.changeAvatar = changeAvatar;
window.handleAvatarUpload = handleAvatarUpload;
window.editName = editName;
window.editBio = editBio;
window.editPhone = editPhone;
window.editEmail = editEmail;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.addSocialMedia = addSocialMedia;
window.closeSocialModal = closeSocialModal;
window.addPlatform = addPlatform;
window.removeSocialMedia = removeSocialMedia;
window.openProfileSettings = openProfileSettings;
window.openAppSettings = openAppSettings;
window.closeAppSettings = closeAppSettings;
window.openPrivacySettings = openPrivacySettings;
window.confirmLogout = confirmLogout;

// 初始化个人资料功能
function initProfilePage() {
    loadProfileData();
    initPrivacySettings();
}

// 修改原有的初始化函数
const originalInitializeApp = initializeApp;
function initializeApp() {
    originalInitializeApp();
    initProfilePage();
}

// 用户个人主页功能
let currentViewingUser = null;

// 打开用户个人主页
function openUserProfile(userId) {
    console.log('openUserProfile called with userId:', userId);
    
    // 强制显示弹窗作为测试
    const modal = document.getElementById('userProfileModal');
    console.log('Modal element found:', !!modal);
    
    if (modal) {
        // 直接显示弹窗进行测试
        modal.style.display = 'block';
        modal.classList.add('show');
        console.log('Modal forced to show for testing');
    }
    
    const user = users[userId];
    console.log('User found:', user);
    
    if (!user) {
        console.error('User not found for userId:', userId);
        // 即使没有用户数据，也显示弹窗进行测试
        if (modal) {
            modal.classList.add('show');
        }
        return;
    }
    
    currentViewingUser = user;
    
    // 更新用户信息
    const titleEl = document.getElementById('userProfileTitle');
    const avatarEl = document.getElementById('userProfileAvatar');
    const nameEl = document.getElementById('userProfileName');
    const bioEl = document.getElementById('userProfileBio');
    
    console.log('Elements found:', {
        titleEl: !!titleEl,
        avatarEl: !!avatarEl, 
        nameEl: !!nameEl,
        bioEl: !!bioEl
    });
    
    if (titleEl) titleEl.textContent = `${user.name}的资料`;
    if (avatarEl) avatarEl.src = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (bioEl) bioEl.textContent = user.bio || '这个用户很神秘，什么都没有留下...';
    
    // 计算距离
    const distance = calculateDistance(currentUser.lat, currentUser.lng, user.lat, user.lng);
    const distanceEl = document.getElementById('userDistance');
    if (distanceEl) distanceEl.textContent = `距离 ${distance.toFixed(0)}m`;
    
    // 在线状态
    const onlineStatusEl = document.getElementById('userOnlineStatus');
    if (onlineStatusEl) {
        if (user.online) {
            onlineStatusEl.textContent = '在线';
            onlineStatusEl.className = 'user-online';
        } else {
            onlineStatusEl.textContent = '离线';
            onlineStatusEl.className = 'user-online offline';
        }
    }
    
    // 更新统计数据
    const postsCountEl = document.getElementById('userPostsCount');
    const followersCountEl = document.getElementById('userFollowersCount');
    const followingCountEl = document.getElementById('userFollowingCount');
    
    if (postsCountEl) postsCountEl.textContent = user.posts || Math.floor(Math.random() * 50) + 5;
    if (followersCountEl) followersCountEl.textContent = user.followers || Math.floor(Math.random() * 200) + 50;
    if (followingCountEl) followingCountEl.textContent = user.following || Math.floor(Math.random() * 150) + 30;
    
    // 更新关注按钮状态
    updateFollowButton(userId);
    
    // 加载用户内容
    loadUserContent(userId);
    
    console.log('Modal classes after adding show:', modal.classList.toString());
}

// 关闭用户个人主页
function closeUserProfile() {
    document.getElementById('userProfileModal').classList.remove('show');
    currentViewingUser = null;
}

// 更新关注按钮状态
function updateFollowButton(userId) {
    const followBtn = document.getElementById('followBtn');
    const isFollowing = users[userId].isFollowing;
    
    if (isFollowing) {
        followBtn.classList.add('following');
        followBtn.innerHTML = '<i class="fas fa-user-check"></i><span>已关注</span>';
    } else {
        followBtn.classList.remove('following');
        followBtn.innerHTML = '<i class="fas fa-user-plus"></i><span>关注</span>';
    }
}

// 切换关注状态
function toggleFollow() {
    if (!currentViewingUser) return;
    
    const userId = currentViewingUser.id;
    const user = users[userId];
    
    user.isFollowing = !user.isFollowing;
    
    // 更新粉丝数
    const currentFollowers = parseInt(document.getElementById('userFollowersCount').textContent);
    const newFollowers = user.isFollowing ? currentFollowers + 1 : currentFollowers - 1;
    document.getElementById('userFollowersCount').textContent = newFollowers;
    
    // 更新按钮状态
    updateFollowButton(userId);
    
    // 显示通知
    const action = user.isFollowing ? '关注' : '取消关注';
    showNotification(`${action}${user.name}成功！`);
    
    // 震动反馈
    vibrate();
}

// 从个人主页发起聊天
function startChatFromProfile() {
    console.log('=== startChatFromProfile 开始执行 ===');
    
    if (!currentViewingUser) {
        console.error('No user is currently being viewed');
        alert('错误：没有正在查看的用户');
        return;
    }
    
    console.log('Starting chat with user:', currentViewingUser.name, currentViewingUser.id);
    
    // 记录当前页面（个人主页弹窗打开前的页面）
    const currentActivePage = document.querySelector('.page.active');
    if (currentActivePage) {
        lastPageBeforeChat = currentActivePage.id;
        console.log('记录聊天前页面:', lastPageBeforeChat);
    }
    
    // 为私信按钮添加成功状态反馈
    const messageBtn = document.querySelector('.message-btn');
    console.log('Message button found:', messageBtn);
    
    if (messageBtn) {
        messageBtn.classList.add('success');
        messageBtn.innerHTML = '<i class="fas fa-check"></i><span>打开聊天...</span>';
        
        // 1秒后恢复原始状态
        setTimeout(() => {
            messageBtn.classList.remove('success');
            messageBtn.innerHTML = '<i class="fas fa-comment"></i><span>私信</span>';
        }, 1000);
    }
    
    // 显示开始聊天的通知
    showNotification(`正在打开与${currentViewingUser.name}的聊天...`);
    console.log('Notification shown');
    
    // 震动反馈
    vibrate();
    
    // 关闭用户个人主页
    console.log('Closing user profile...');
    closeUserProfile();
    
    // 立即打开聊天窗口
    console.log('About to open chat with user:', currentViewingUser.id);
    
    // 检查chatModal元素
    const chatModal = document.getElementById('chatModal');
    console.log('ChatModal element:', chatModal);
    
    if (!chatModal) {
        console.error('ChatModal element not found!');
        alert('错误：找不到聊天窗口元素');
        return;
    }
    
    try {
        // 直接打开聊天窗口
        const success = openChat(currentViewingUser.id);
        console.log('openChat result:', success);
        
        if (success) {
            // 强制确保modal显示
            setTimeout(() => {
                if (!chatModal.classList.contains('active')) {
                    console.warn('Modal not active, forcing display');
                    chatModal.classList.add('active');
                }
                
                // 多重确保显示
                chatModal.style.display = 'flex';
                chatModal.style.visibility = 'visible';
                chatModal.style.opacity = '1';
                chatModal.style.zIndex = '2000';
                
                console.log('Modal final state:');
                console.log('Classes:', chatModal.classList.toString());
                console.log('Display:', chatModal.style.display);
                console.log('Visibility:', chatModal.style.visibility);
                console.log('Opacity:', chatModal.style.opacity);
                console.log('Z-index:', chatModal.style.zIndex);
                
                // 显示聊天成功开启的通知
                showNotification(`与${currentViewingUser.name}的聊天已开启 💬`);
                
            }, 100);
        }
        
    } catch (error) {
        console.error('Failed to open chat:', error);
        alert('打开聊天失败: ' + error.message);
    }
    
    console.log('=== startChatFromProfile 执行完成 ===');
}

// 分享用户资料
function shareUserProfile() {
    if (!currentViewingUser) return;
    
    showNotification(`分享${currentViewingUser.name}的资料`);
}

// 显示用户选项
function showUserOptions() {
    if (!currentViewingUser) return;
    
    const options = ['举报用户', '拉黑用户', '复制链接'];
    const choice = prompt(`选择操作:\n1. ${options[0]}\n2. ${options[1]}\n3. ${options[2]}\n\n请输入数字:`);
    
    if (choice && choice >= 1 && choice <= 3) {
        showNotification(`${options[choice - 1]}功能开发中...`);
    }
}

// 切换用户内容标签
function switchUserTab(tabName) {
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 切换内容面板
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // 重新加载内容
    if (currentViewingUser) {
        loadUserContent(currentViewingUser.id, tabName);
    }
}

// 加载用户内容
function loadUserContent(userId, tab = 'posts') {
    const user = users[userId];
    if (!user) return;
    
    if (tab === 'posts') {
        loadUserPosts(userId);
    } else if (tab === 'liked') {
        loadUserLikedPosts(userId);
    }
}

// 加载用户发布的内容
function loadUserPosts(userId) {
    const postsContainer = document.getElementById('userPosts');
    
    // 模拟用户发布的内容
    const userPosts = stories.filter(story => story.userId === userId);
    
    if (userPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-camera"></i>
                <h4>还没有发布任何内容</h4>
                <p>当用户发布动态时，会在这里显示</p>
            </div>
        `;
        return;
    }
    
    postsContainer.innerHTML = userPosts.map(post => `
        <div class="user-post-item" onclick="viewUserPost('${post.id}')">
            ${post.media && post.media.images && post.media.images.length > 0 
                ? `<img src="${post.media.images[0]}" alt="用户动态">`
                : post.media && post.media.video
                ? `<video src="${post.media.video}" muted></video>`
                : `<div style="background: linear-gradient(45deg, #FFFC00, #FFD700); display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold;">${post.text.substring(0, 20)}...</div>`
            }
            <div class="post-overlay">
                <div class="post-stats">
                    <span><i class="fas fa-heart"></i>${post.likes}</span>
                    <span><i class="fas fa-comment"></i>${post.comments.length}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 加载用户点赞的内容
function loadUserLikedPosts(userId) {
    const likedContainer = document.getElementById('userLiked');
    
    // 模拟用户点赞的内容（随机选择一些故事）
    const likedPosts = stories.filter(() => Math.random() > 0.7).slice(0, 9);
    
    if (likedPosts.length === 0) {
        likedContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h4>还没有点赞任何内容</h4>
                <p>用户点赞的内容会在这里显示</p>
            </div>
        `;
        return;
    }
    
    likedContainer.innerHTML = likedPosts.map(post => `
        <div class="user-post-item" onclick="viewUserPost('${post.id}')">
            ${post.media && post.media.images && post.media.images.length > 0 
                ? `<img src="${post.media.images[0]}" alt="点赞内容">`
                : post.media && post.media.video
                ? `<video src="${post.media.video}" muted></video>`
                : `<div style="background: linear-gradient(45deg, #e9ecef, #f8f9fa); display: flex; align-items: center; justify-content: center; color: #666; font-weight: bold;">${post.text.substring(0, 20)}...</div>`
            }
            <div class="post-overlay">
                <div class="post-stats">
                    <span><i class="fas fa-heart"></i>${post.likes}</span>
                    <span><i class="fas fa-comment"></i>${post.comments.length}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 查看用户的单个动态
function viewUserPost(postId) {
    // 跳转到故事页面并高亮显示该动态
    switchPage('stories-page');
    closeUserProfile();
    
    // 滚动到对应的动态
    setTimeout(() => {
        const postElement = document.querySelector(`[data-story-id="${postId}"]`);
        if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            postElement.style.boxShadow = '0 0 20px rgba(255, 252, 0, 0.5)';
            setTimeout(() => {
                postElement.style.boxShadow = '';
            }, 2000);
        }
    }, 300);
}

// 添加到window导出
window.openUserProfile = openUserProfile;
window.closeUserProfile = closeUserProfile;
window.toggleFollow = toggleFollow;
window.startChatFromProfile = startChatFromProfile;
window.shareUserProfile = shareUserProfile;
window.showUserOptions = showUserOptions;
window.switchUserTab = switchUserTab;
window.viewUserPost = viewUserPost;

// 全局测试函数
window.testUserProfile = function(userId) {
    console.log('=== TEST USER PROFILE FUNCTION ===');
    console.log('Testing with userId:', userId);
    
    const user = users[userId || 'user1'];
    console.log('User data:', user);
    
    openUserProfile(userId || 'user1');
};

// 添加全局点击测试
window.testClick = function() {
    console.log('=== CLICK TEST ===');
    console.log('Available users:', Object.keys(users));
    console.log('Testing openUserProfile with user1...');
    openUserProfile('user1');
};

// 强制刷新聊天列表的测试函数
window.forceUpdateChatList = function() {
    console.log('=== FORCE UPDATE CHAT LIST ===');
    updateChatList();
    console.log('Chat list updated. You can now try clicking avatars.');
};

// 检查DOM元素是否存在的测试函数
window.checkElements = function() {
    console.log('=== CHECK DOM ELEMENTS ===');
    console.log('userProfileModal exists:', !!document.getElementById('userProfileModal'));
    console.log('chatModal exists:', !!document.getElementById('chatModal'));
    console.log('chat-list exists:', !!document.querySelector('.chat-list'));
    console.log('user-list exists:', !!document.querySelector('.user-list'));
    
    // 检查聊天列表中的头像
    const avatars = document.querySelectorAll('.chat-list .avatar');
    console.log('Chat list avatars found:', avatars.length);
    
    // 检查地图用户列表中的头像
    const userAvatars = document.querySelectorAll('.user-list .avatar');
    console.log('User list avatars found:', userAvatars.length);
};

// 模拟头像点击测试
window.simulateAvatarClick = function() {
    console.log('=== SIMULATING AVATAR CLICK ===');
    
    // 检查聊天列表是否存在
    const chatList = document.querySelector('.chat-list');
    if (!chatList) {
        console.log('Chat list not found, forcing update...');
        updateChatList();
    }
    
    // 查找第一个头像
    const firstAvatar = document.querySelector('.chat-list .avatar');
    if (firstAvatar) {
        console.log('Found avatar, simulating click...');
        firstAvatar.click();
    } else {
        console.log('No avatar found, trying direct function call...');
        openUserProfile('user1');
    }
};

// 简单的用户页面显示测试
window.showUserPage = function(userId = 'user1') {
    console.log('=== DIRECT USER PAGE TEST ===');
    console.log('Trying to show user page for:', userId);
    
    const modal = document.getElementById('userProfileModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.transform = 'translateX(0)';
        
        console.log('Modal should now be visible!');
        console.log('Modal styles:', {
            display: modal.style.display,
            opacity: modal.style.opacity,
            visibility: modal.style.visibility,
            transform: modal.style.transform
        });
    } else {
        console.error('userProfileModal not found!');
    }
};

// 测试私信功能 - 直接跳转版本
window.testPrivateMessage = function(userId = 'user3') {
    console.log('=== TESTING DIRECT PRIVATE MESSAGE FUNCTION ===');
    console.log('Opening user profile first...');
    
    // 先打开用户个人主页
    openUserProfile(userId);
    
    // 等待1秒后自动点击私信按钮
    setTimeout(() => {
        console.log('Auto-clicking private message button...');
        console.log('Expected: Profile closes -> Chat window opens directly');
        startChatFromProfile();
    }, 1000);
};

// 快速测试私信跳转
window.quickTestChat = function(userId = 'user1') {
    console.log('=== QUICK CHAT TEST ===');
    console.log(`Testing direct chat with ${users[userId]?.name || 'Unknown User'}`);
    
    // 模拟有一个正在查看的用户
    currentViewingUser = users[userId];
    
    // 直接测试私信功能
    startChatFromProfile();
};

// 检查私信按钮是否存在
window.checkPrivateMessageButton = function() {
    console.log('=== CHECKING PRIVATE MESSAGE BUTTON ===');
    
    const messageBtn = document.querySelector('.message-btn');
    const userProfileModal = document.getElementById('userProfileModal');
    
    console.log('Private message button exists:', !!messageBtn);
    console.log('User profile modal exists:', !!userProfileModal);
    console.log('User profile modal is visible:', userProfileModal && userProfileModal.classList.contains('show'));
    
    if (messageBtn) {
        console.log('Button text:', messageBtn.textContent.trim());
        console.log('Button onclick:', messageBtn.getAttribute('onclick'));
    }
};

// 全局调试和测试函数
window.debugPrivateMessage = function() {
    console.log('=== 私信功能调试 ===');
    
    // 1. 检查DOM元素
    const chatModal = document.getElementById('chatModal');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    
    console.log('1. DOM元素检查:');
    console.log('chatModal:', chatModal);
    console.log('chatMessages:', chatMessages);
    console.log('messageInput:', messageInput);
    
    // 2. 检查当前查看的用户
    console.log('2. 当前查看用户:', currentViewingUser);
    
    // 3. 检查users数据
    console.log('3. 用户数据:', Object.keys(users).length, '个用户');
    console.log('Users:', users);
    
    // 4. 检查CSS样式
    if (chatModal) {
        const styles = getComputedStyle(chatModal);
        console.log('4. ChatModal 样式:');
        console.log('display:', styles.display);
        console.log('visibility:', styles.visibility);
        console.log('opacity:', styles.opacity);
        console.log('transform:', styles.transform);
        console.log('z-index:', styles.zIndex);
    }
    
    return {
        chatModal,
        chatMessages, 
        messageInput,
        currentViewingUser,
        users
    };
};

// 强制打开私信功能（用于测试）
window.forceOpenChat = function(userId = 'user1') {
    console.log('=== 强制打开私信 ===');
    console.log('目标用户ID:', userId);
    
    const user = users[userId];
    if (!user) {
        console.error('用户不存在:', userId);
        alert('用户不存在: ' + userId);
        return;
    }
    
    console.log('目标用户:', user);
    
    try {
        // 直接调用openChat函数
        openChat(userId);
        console.log('openChat 调用成功');
        
        // 检查modal是否显示
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            console.log('Modal类列表:', chatModal.classList.toString());
            console.log('Modal显示状态:', chatModal.classList.contains('active'));
            
            // 强制显示modal
            chatModal.classList.add('active');
            chatModal.style.display = 'flex';
            chatModal.style.visibility = 'visible';
            chatModal.style.opacity = '1';
            
            console.log('强制显示Modal完成');
        }
        
    } catch (error) {
        console.error('强制打开私信失败:', error);
        alert('打开私信失败: ' + error.message);
    }
};

// 测试从个人主页私信功能
window.testPrivateMessageFlow = function() {
    console.log('=== 测试私信完整流程 ===');
    
    // 1. 先打开用户个人主页
    const testUserId = 'user1';
    console.log('1. 打开用户个人主页:', testUserId);
    
    try {
        openUserProfile(testUserId);
        
        // 等待2秒后尝试点击私信
        setTimeout(() => {
            console.log('2. 尝试点击私信按钮');
            const messageBtn = document.querySelector('.message-btn');
            console.log('私信按钮:', messageBtn);
            
            if (messageBtn) {
                console.log('3. 执行私信点击');
                startChatFromProfile();
            } else {
                console.error('找不到私信按钮');
            }
        }, 2000);
        
    } catch (error) {
        console.error('测试流程失败:', error);
    }
};

// 检查CSS样式问题
window.checkChatModalStyles = function() {
    const chatModal = document.getElementById('chatModal');
    if (!chatModal) {
        console.error('找不到chatModal元素');
        return;
    }
    
    console.log('=== ChatModal CSS 诊断 ===');
    
    // 获取所有相关样式
    const computed = getComputedStyle(chatModal);
    const important_props = [
        'display', 'visibility', 'opacity', 'transform', 
        'position', 'top', 'left', 'right', 'bottom',
        'width', 'height', 'z-index', 'background'
    ];
    
    important_props.forEach(prop => {
        console.log(`${prop}: ${computed[prop]}`);
    });
    
    // 检查active类的样式
    console.log('\n=== 添加 active 类后的样式 ===');
    chatModal.classList.add('active');
    const activeComputed = getComputedStyle(chatModal);
    
    important_props.forEach(prop => {
        const newValue = activeComputed[prop];
        const oldValue = computed[prop];
        if (newValue !== oldValue) {
            console.log(`${prop}: ${oldValue} → ${newValue}`);
        }
    });
    
    // 3秒后移除active类
    setTimeout(() => {
        chatModal.classList.remove('active');
        console.log('已移除active类');
    }, 3000);
};

console.log('调试函数已加载。可以使用:');
console.log('debugPrivateMessage() - 全面诊断');
console.log('forceOpenChat("user1") - 强制打开私信');
console.log('testPrivateMessageFlow() - 测试完整流程');
console.log('checkChatModalStyles() - 检查CSS样式');
console.log('testBackButton() - 测试返回按钮');
console.log('fixBackButton() - 修复返回按钮事件');

// 测试返回按钮功能
window.testBackButton = function() {
    console.log('=== 测试返回按钮功能 ===');
    
    // 检查返回按钮元素
    const backBtn = document.querySelector('.chat-modal .back-btn');
    console.log('返回按钮元素:', backBtn);
    
    if (backBtn) {
        console.log('按钮HTML:', backBtn.outerHTML);
        console.log('按钮事件:', backBtn.onclick);
        
        // 手动调用closeChatModal函数
        console.log('手动调用closeChatModal...');
        try {
            closeChatModal();
            console.log('closeChatModal调用成功');
        } catch (error) {
            console.error('closeChatModal调用失败:', error);
        }
    } else {
        console.error('找不到返回按钮元素');
    }
    
    return {
        backButton: backBtn,
        lastPageBeforeChat,
        currentActivePage: document.querySelector('.page.active')?.id
    };
};

// 强制修复返回按钮
window.fixBackButton = function() {
    console.log('=== 强制修复返回按钮 ===');
    
    const backBtn = document.querySelector('.chat-modal .back-btn');
    if (backBtn) {
        // 移除现有事件
        backBtn.onclick = null;
        
        // 重新绑定事件
        backBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('返回按钮被点击');
            closeChatModal();
        };
        
        // 也添加addEventListener作为备份
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('返回按钮事件监听器触发');
            closeChatModal();
        }, true);
        
        console.log('返回按钮事件已重新绑定');
        return true;
    } else {
        console.error('找不到返回按钮');
        return false;
    }
};