<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SimSimi Chatbot</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #4361ee;
            --secondary-color: #3a0ca3;
            --success-color: #4cc9f0;
            --danger-color: #f72585;
            --light-bg: #f8f9fa;
            --dark-bg: #121212;
            --light-text: #333;
            --dark-text: #f0f0f0;
            --light-card: #ffffff;
            --dark-card: #1e1e1e;
            --light-border: #dee2e6;
            --dark-border: #444;
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            transition: var(--transition);
            min-height: 100vh;
        }

        body.light-mode {
            background-color: var(--light-bg);
            color: var(--light-text);
        }

        body.dark-mode {
            background-color: var(--dark-bg);
            color: var(--dark-text);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid;
            margin-bottom: 30px;
        }

        body.light-mode header {
            border-bottom-color: var(--light-border);
        }

        body.dark-mode header {
            border-bottom-color: var(--dark-border);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo i {
            font-size: 2.5rem;
            color: var(--primary-color);
        }

        .logo h1 {
            font-size: 2rem;
            background: linear-gradient(90deg, var(--primary-color), var(--danger-color));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .theme-switch {
            position: relative;
            width: 60px;
            height: 30px;
        }

        .theme-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: var(--transition);
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: var(--transition);
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--primary-color);
        }

        input:checked + .slider:before {
            transform: translateX(30px);
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }

        .card {
            border-radius: 15px;
            padding: 25px;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }

        body.light-mode .card {
            background-color: var(--light-card);
            border: 1px solid var(--light-border);
        }

        body.dark-mode .card {
            background-color: var(--dark-card);
            border: 1px solid var(--dark-border);
        }

        .card h2 {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--primary-color);
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }

        input, textarea, select {
            width: 100%;
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid;
            font-size: 1rem;
            transition: var(--transition);
        }

        body.light-mode input,
        body.light-mode textarea,
        body.light-mode select {
            background-color: white;
            border-color: var(--light-border);
            color: var(--light-text);
        }

        body.dark-mode input,
        body.dark-mode textarea,
        body.dark-mode select {
            background-color: #2d2d2d;
            border-color: var(--dark-border);
            color: var(--dark-text);
        }

        textarea {
            min-height: 120px;
            resize: vertical;
            font-family: inherit;
        }

        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--secondary-color);
            transform: translateY(-2px);
        }

        .btn-success {
            background-color: var(--success-color);
            color: white;
        }

        .btn-success:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }

        .response-box {
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            min-height: 100px;
            transition: var(--transition);
        }

        body.light-mode .response-box {
            background-color: #f1f8ff;
            border: 1px solid #cce5ff;
        }

        body.dark-mode .response-box {
            background-color: #1a2b3c;
            border: 1px solid #2c4a6b;
        }

        .response-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .stat-card {
            text-align: center;
            padding: 20px;
            border-radius: 10px;
            transition: var(--transition);
        }

        body.light-mode .stat-card {
            background-color: #e9ecef;
        }

        body.dark-mode .stat-card {
            background-color: #2d2d2d;
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
        }

        .stat-label {
            margin-top: 10px;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .recent-responses {
            margin-top: 30px;
        }

        .response-item {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            transition: var(--transition);
        }

        body.light-mode .response-item {
            background-color: #f8f9fa;
            border-left: 4px solid var(--primary-color);
        }

        body.dark-mode .response-item {
            background-color: #2d2d2d;
            border-left: 4px solid var(--primary-color);
        }

        .response-question {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .response-answer {
            margin-bottom: 10px;
        }

        .response-info {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            opacity: 0.7;
        }

        footer {
            text-align: center;
            padding: 20px 0;
            margin-top: 40px;
            border-top: 1px solid;
            font-size: 0.9rem;
        }

        body.light-mode footer {
            border-top-color: var(--light-border);
        }

        body.dark-mode footer {
            border-top-color: var(--dark-border);
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        body.dark-mode .alert-success {
            background-color: #0f5132;
            color: #d1e7dd;
            border-color: #0c4128;
        }

        body.dark-mode .alert-error {
            background-color: #842029;
            color: #f8d7da;
            border-color: #6a1a21;
        }

        .tabs {
            display: flex;
            border-bottom: 1px solid;
            margin-bottom: 20px;
        }

        body.light-mode .tabs {
            border-bottom-color: var(--light-border);
        }

        body.dark-mode .tabs {
            border-bottom-color: var(--dark-border);
        }

        .tab {
            padding: 10px 20px;
            cursor: pointer;
            transition: var(--transition);
            border-bottom: 3px solid transparent;
        }

        .tab.active {
            border-bottom-color: var(--primary-color);
            font-weight: 600;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body class="light-mode">
    <div class="container">
        <header>
            <div class="logo">
                <i class="fas fa-robot"></i>
                <h1>SimSimi Chatbot</h1>
            </div>
            <div class="theme-switch">
                <input type="checkbox" id="theme-toggle">
                <label for="theme-toggle" class="slider"></label>
            </div>
        </header>

        <div class="main-content">
            <div class="card">
                <h2><i class="fas fa-question-circle"></i> Ask SimSimi</h2>
                <div class="form-group">
                    <label for="question">Type your question:</label>
                    <input type="text" id="question" placeholder="e.g., Hello, how are you?">
                </div>
                <button class="btn btn-primary" id="ask-btn">
                    <i class="fas fa-paper-plane"></i> Ask
                </button>
                
                <div id="ask-response" class="response-box" style="display: none;">
                    <div id="ask-answer"></div>
                    <div id="ask-meta" class="response-meta"></div>
                </div>
            </div>

            <div class="card">
                <h2><i class="fas fa-graduation-cap"></i> Teach SimSimi</h2>
                <div class="form-group">
                    <label for="teach-question">Question:</label>
                    <input type="text" id="teach-question" placeholder="e.g., Hello">
                </div>
                <div class="form-group">
                    <label for="teach-answer">Response to teach:</label>
                    <textarea id="teach-answer" placeholder="e.g., Hello! How can I help you today?"></textarea>
                </div>
                <button class="btn btn-success" id="teach-btn">
                    <i class="fas fa-book"></i> Teach
                </button>
                
                <div id="teach-response" class="response-box" style="display: none;">
                    <div id="teach-result"></div>
                </div>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" data-tab="stats">Statistics</div>
            <div class="tab" data-tab="recent">Recent Responses</div>
            <div class="tab" data-tab="search">Search</div>
        </div>

        <div class="tab-content active" id="stats-content">
            <div class="card">
                <h2><i class="fas fa-chart-bar"></i> System Statistics</h2>
                <div class="stats-grid" id="stats-grid">
                    <!-- Stats will be loaded here -->
                </div>
            </div>
        </div>

        <div class="tab-content" id="recent-content">
            <div class="card">
                <h2><i class="fas fa-history"></i> Recently Taught Responses</h2>
                <div id="recent-responses">
                    <!-- Recent responses will be loaded here -->
                </div>
            </div>
        </div>

        <div class="tab-content" id="search-content">
            <div class="card">
                <h2><i class="fas fa-search"></i> Search Responses</h2>
                <div class="form-group">
                    <input type="text" id="search-input" placeholder="Search questions or answers...">
                </div>
                <button class="btn btn-primary" id="search-btn">
                    <i class="fas fa-search"></i> Search
                </button>
                <div id="search-results" class="recent-responses">
                    <!-- Search results will appear here -->
                </div>
            </div>
        </div>

        <footer>
            <p>SimSimi Chatbot API v1.0.0 | Teach me and I'll remember forever! 💾</p>
        </footer>
    </div>

    <script>
        // DOM Elements
        const themeToggle = document.getElementById('theme-toggle');
        const askBtn = document.getElementById('ask-btn');
        const teachBtn = document.getElementById('teach-btn');
        const searchBtn = document.getElementById('search-btn');
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // API Base URL
        const API_BASE_URL = window.location.origin.includes('localhost') 
            ? 'http://localhost:3000/api/simsimi' 
            : '/api/simsimi';

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Load saved theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.className = savedTheme + '-mode';
            themeToggle.checked = savedTheme === 'dark';
            
            // Load stats and recent responses
            loadStats();
            loadRecentResponses();
            
            // Set up event listeners
            setupEventListeners();
        });

        function setupEventListeners() {
            // Theme toggle
            themeToggle.addEventListener('change', function() {
                const theme = this.checked ? 'dark' : 'light';
                document.body.className = theme + '-mode';
                localStorage.setItem('theme', theme);
            });

            // Ask button
            askBtn.addEventListener('click', askQuestion);
            document.getElementById('question').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') askQuestion();
            });

            // Teach button
            teachBtn.addEventListener('click', teachResponse);
            document.getElementById('teach-answer').addEventListener('keypress', function(e) {
                if (e.ctrlKey && e.key === 'Enter') teachResponse();
            });

            // Search button
            searchBtn.addEventListener('click', searchResponses);
            document.getElementById('search-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') searchResponses();
            });

            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show corresponding content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabId}-content`) {
                            content.classList.add('active');
                        }
                    });
                    
                    // Load content if needed
                    if (tabId === 'recent') {
                        loadRecentResponses();
                    }
                });
            });
        }

        async function askQuestion() {
            const questionInput = document.getElementById('question');
            const question = questionInput.value.trim();
            
            if (!question) {
                showAlert('Please enter a question', 'error');
                return;
            }
            
            try {
                setLoading(askBtn, true);
                
                const response = await fetch(`${API_BASE_URL}/ask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question })
                });
                
                const data = await response.json();
                
                const responseBox = document.getElementById('ask-response');
                const answerDiv = document.getElementById('ask-answer');
                const metaDiv = document.getElementById('ask-meta');
                
                answerDiv.innerHTML = `<strong>SimSimi:</strong> ${data.answer}`;
                
                if (data.source === 'database') {
                    metaDiv.innerHTML = `
                        <span>👨‍🏫 Taught ${data.teach_count} times</span>
                        <span>📅 First taught: ${new Date(data.first_taught).toLocaleDateString()}</span>
                    `;
                } else {
                    metaDiv.innerHTML = '<span>⚠️ This is a default response. Teach me the right answer!</span>';
                }
                
                responseBox.style.display = 'block';
                questionInput.value = '';
                
            } catch (error) {
                console.error('Ask error:', error);
                showAlert('Failed to get response. Please try again.', 'error');
            } finally {
                setLoading(askBtn, false);
            }
        }

        async function teachResponse() {
            const questionInput = document.getElementById('teach-question');
            const answerInput = document.getElementById('teach-answer');
            
            const question = questionInput.value.trim();
            const answer = answerInput.value.trim();
            
            if (!question || !answer) {
                showAlert('Please fill in both question and answer', 'error');
                return;
            }
            
            try {
                setLoading(teachBtn, true);
                
                const response = await fetch(`${API_BASE_URL}/teach`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question, answer })
                });
                
                const data = await response.json();
                
                const responseBox = document.getElementById('teach-response');
                const resultDiv = document.getElementById('teach-result');
                
                resultDiv.innerHTML = `
                    <strong>✅ ${data.message}</strong><br>
                    <small>Question: "${data.data.question}"</small><br>
                    <small>Response: "${data.data.answer}"</small><br>
                    <small>Taught ${data.data.teach_count} times</small>
                `;
                
                responseBox.style.display = 'block';
                questionInput.value = '';
                answerInput.value = '';
                
                // Refresh stats and recent responses
                loadStats();
                loadRecentResponses();
                
                showAlert('Successfully taught SimSimi!', 'success');
                
            } catch (error) {
                console.error('Teach error:', error);
                showAlert('Failed to teach response. Please try again.', 'error');
            } finally {
                setLoading(teachBtn, false);
            }
        }

        async function loadStats() {
            try {
                const response = await fetch(`${API_BASE_URL}/stats`);
                const data = await response.json();
                
                const statsGrid = document.getElementById('stats-grid');
                statsGrid.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-number">${data.statistics.total_responses || 0}</div>
                        <div class="stat-label">Total Responses</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${data.statistics.total_teachings || 0}</div>
                        <div class="stat-label">Total Teachings</div>
                    </div>
                `;
                
            } catch (error) {
                console.error('Stats load error:', error);
            }
        }

        async function loadRecentResponses() {
            try {
                const response = await fetch(`${API_BASE_URL}/responses?limit=10`);
                const data = await response.json();
                
                const container = document.getElementById('recent-responses');
                
                if (data.responses.length === 0) {
                    container.innerHTML = '<p>No responses have been taught yet. Be the first to teach SimSimi!</p>';
                    return;
                }
                
                container.innerHTML = data.responses.map(item => `
                    <div class="response-item">
                        <div class="response-question">Q: ${item.question}</div>
                        <div class="response-answer">A: ${item.answer}</div>
                        <div class="response-info">
                            <span>Taught ${item.teach_count} times</span>
                            <span>${new Date(item.last_taught).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('');
                
            } catch (error) {
                console.error('Recent responses load error:', error);
                document.getElementById('recent-responses').innerHTML = 
                    '<p>Failed to load recent responses. Please try again.</p>';
            }
        }

        async function searchResponses() {
            const searchInput = document.getElementById('search-input');
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) {
                showAlert('Please enter a search term', 'error');
                return;
            }
            
            try {
                setLoading(searchBtn, true);
                
                const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                
                const container = document.getElementById('search-results');
                
                if (data.results.length === 0) {
                    container.innerHTML = `<p>No results found for "${searchTerm}"</p>`;
                    return;
                }
                
                container.innerHTML = `
                    <p>Found ${data.count} results for "${searchTerm}":</p>
                    ${data.results.map(item => `
                        <div class="response-item">
                            <div class="response-question">Q: ${highlightText(item.question, searchTerm)}</div>
                            <div class="response-answer">A: ${highlightText(item.answer, searchTerm)}</div>
                            <div class="response-info">
                                <span>Taught ${item.teach_count} times</span>
                                <span>${new Date(item.last_taught).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `).join('')}
                `;
                
            } catch (error) {
                console.error('Search error:', error);
                showAlert('Failed to search responses. Please try again.', 'error');
            } finally {
                setLoading(searchBtn, false);
            }
        }

        function highlightText(text, searchTerm) {
            if (!searchTerm) return text;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        function setLoading(button, isLoading) {
            if (isLoading) {
                button.innerHTML = '<div class="loading"></div> Processing...';
                button.disabled = true;
            } else {
                if (button.id === 'ask-btn') {
                    button.innerHTML = '<i class="fas fa-paper-plane"></i> Ask';
                } else if (button.id === 'teach-btn') {
                    button.innerHTML = '<i class="fas fa-book"></i> Teach';
                } else if (button.id === 'search-btn') {
                    button.innerHTML = '<i class="fas fa-search"></i> Search';
                }
                button.disabled = false;
            }
        }

        function showAlert(message, type) {
            // Remove existing alerts
            const existingAlert = document.querySelector('.alert');
            if (existingAlert) existingAlert.remove();
            
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                ${message}
            `;
            
            document.querySelector('.container').insertBefore(alert, document.querySelector('.main-content'));
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.opacity = '0';
                    alert.style.transition = 'opacity 0.5s';
                    setTimeout(() => alert.remove(), 500);
                }
            }, 5000);
        }

        // Example questions for quick testing
        function populateExample() {
            document.getElementById('question').value = 'Hello';
            document.getElementById('teach-question').value = 'What is your name?';
            document.getElementById('teach-answer').value = 'I am SimSimi, your friendly chatbot!';
        }

        // Uncomment to add example button for testing
        // populateExample();
    </script>
</body>
</html>