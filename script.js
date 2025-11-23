// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const startJournalingBtn = document.getElementById('startJournaling');
const newEntryBtn = document.getElementById('newEntryBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const closeButtons = document.querySelectorAll('.close');
const sentimentResult = document.getElementById('sentimentResult');
const journalTextarea = document.querySelector('.journal-textarea');
const darkModeToggle = document.getElementById('darkModeToggle');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const timeRange = document.getElementById('timeRange');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set home page as active
    showPage('home');
    
    // Initialize charts
    initializeCharts();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Authentication buttons
    loginBtn.addEventListener('click', () => showModal('loginModal'));
    registerBtn.addEventListener('click', () => showModal('registerModal'));
    startJournalingBtn.addEventListener('click', () => showPage('journal'));
    newEntryBtn.addEventListener('click', () => showPage('journal'));
    
    // Modal controls
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('loginModal');
        showModal('registerModal');
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('registerModal');
        showModal('loginModal');
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
    
    // Journal functionality
    analyzeBtn.addEventListener('click', analyzeSentiment);
    
    // Settings functionality
    darkModeToggle.addEventListener('change', toggleDarkMode);
    deleteAccountBtn.addEventListener('click', confirmDeleteAccount);
    
    // Visualization filters
    timeRange.addEventListener('change', updateCharts);
    
    // Auto-expand textarea
    journalTextarea.addEventListener('input', autoExpandTextarea);
}

// Show specific page and hide others
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    
    // Update charts when visualization page is shown
    if (pageId === 'visualization') {
        updateCharts();
    }
}

// Modal controls
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Auto-expand textarea as user types
function autoExpandTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

// Analyze sentiment of journal entry
function analyzeSentiment() {
    const text = journalTextarea.value.trim();
    
    if (!text) {
        alert('Please write something before analyzing.');
        return;
    }
    
    // Show loading state
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;
    
    // Simulate API call with timeout
    setTimeout(() => {
        // Simple sentiment analysis (in a real app, this would call an API)
        const sentiment = getSentiment(text);
        const sentimentScore = sentiment.score;
        const sentimentLabel = sentiment.label;
        
        // Display result
        displaySentimentResult(sentimentScore, sentimentLabel);
        
        // Reset button
        analyzeBtn.innerHTML = 'Analyze Sentiment';
        analyzeBtn.disabled = false;
        
        // In a real app, you would save the entry and sentiment to a database
        console.log('Journal entry saved with sentiment:', sentimentLabel, sentimentScore);
    }, 1500);
}

// Simple sentiment analysis (for demo purposes)
function getSentiment(text) {
    // This is a very basic implementation
    // In a real application, you would use a proper sentiment analysis API
    
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'love', 'peace', 'calm', 'content', 'grateful', 'thankful', 'blessed', 'excited', 'hopeful', 'optimistic'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'anxious', 'worried', 'stressed', 'depressed', 'tired', 'exhausted', 'frustrated', 'disappointed', 'hurt'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) {
        return { score: 0.5, label: 'neutral' };
    }
    
    const score = positiveCount / total;
    
    if (score > 0.7) {
        return { score, label: 'positive' };
    } else if (score < 0.3) {
        return { score, label: 'negative' };
    } else {
        return { score, label: 'neutral' };
    }
}

// Display sentiment analysis result
function displaySentimentResult(score, label) {
    sentimentResult.textContent = `Your entry feels mostly ${label} today. (Score: ${(score * 10).toFixed(1)}/10)`;
    sentimentResult.className = 'sentiment-result';
    
    if (label === 'positive') {
        sentimentResult.classList.add('sentiment-positive');
    } else if (label === 'negative') {
        sentimentResult.classList.add('sentiment-negative');
    } else {
        sentimentResult.classList.add('sentiment-neutral');
    }
    
    sentimentResult.style.display = 'block';
    
    // Animate the result
    sentimentResult.style.transform = 'translateY(-10px)';
    sentimentResult.style.opacity = '0';
    
    setTimeout(() => {
        sentimentResult.style.transition = 'all 0.3s ease';
        sentimentResult.style.transform = 'translateY(0)';
        sentimentResult.style.opacity = '1';
    }, 10);
}

// Initialize charts
function initializeCharts() {
    // Mood Trend Chart
    const moodCtx = document.getElementById('moodChart').getContext('2d');
    window.moodChart = new Chart(moodCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Mood Score',
                data: [6, 7, 5, 8, 7, 9, 8],
                borderColor: '#7CC7C4',
                backgroundColor: 'rgba(124, 199, 196, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
    
    // Emotion Distribution Chart
    const emotionCtx = document.getElementById('emotionChart').getContext('2d');
    window.emotionChart = new Chart(emotionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Happy', 'Calm', 'Anxious', 'Sad', 'Content'],
            datasets: [{
                data: [30, 25, 15, 10, 20],
                backgroundColor: [
                    '#A8D8F0',
                    '#7CC7C4',
                    '#F0F4F8',
                    '#1E3A5F',
                    '#DFF6FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Trend Chart for Visualization Page
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    window.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: generateDateLabels(30),
            datasets: [{
                label: 'Daily Mood',
                data: generateRandomData(30, 3, 9),
                borderColor: '#7CC7C4',
                backgroundColor: 'rgba(124, 199, 196, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
    
    // Mood Distribution Chart
    const moodDistCtx = document.getElementById('moodDistributionChart').getContext('2d');
    window.moodDistributionChart = new Chart(moodDistCtx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [60, 25, 15],
                backgroundColor: [
                    '#A8D8F0',
                    '#F0F4F8',
                    '#1E3A5F'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Weekly Pattern Chart
    const weeklyCtx = document.getElementById('weeklyPatternChart').getContext('2d');
    window.weeklyPatternChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Average Mood',
                data: [6.2, 7.1, 6.8, 7.5, 6.9, 8.2, 7.8],
                backgroundColor: '#7CC7C4'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

// Update charts based on filters
function updateCharts() {
    const days = parseInt(timeRange.value);
    
    // Update trend chart
    window.trendChart.data.labels = generateDateLabels(days);
    window.trendChart.data.datasets[0].data = generateRandomData(days, 3, 9);
    window.trendChart.update();
    
    // In a real app, you would fetch new data from an API based on the selected time range
    console.log('Updating charts for', days, 'days');
}

// Helper function to generate date labels
function generateDateLabels(days) {
    const labels = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return labels;
}

// Helper function to generate random data
function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // In a real app, you would save this preference to local storage or a database
    const isDarkMode = document.body.classList.contains('dark-mode');
    console.log('Dark mode:', isDarkMode);
    
    // Update CSS variables for dark mode
    if (isDarkMode) {
        document.documentElement.style.setProperty('--soft-blue', '#2C3E50');
        document.documentElement.style.setProperty('--light-aqua', '#1E2A3A');
        document.documentElement.style.setProperty('--cool-grey', '#2C3E50');
        document.documentElement.style.setProperty('--white', '#1E2A3A');
        document.documentElement.style.setProperty('--deep-navy', '#ECF0F1');
    } else {
        document.documentElement.style.setProperty('--soft-blue', '#A8D8F0');
        document.documentElement.style.setProperty('--light-aqua', '#DFF6FF');
        document.documentElement.style.setProperty('--cool-grey', '#F0F4F8');
        document.documentElement.style.setProperty('--white', '#FFFFFF');
        document.documentElement.style.setProperty('--deep-navy', '#1E3A5F');
    }
}

// Confirm account deletion
function confirmDeleteAccount() {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmed) {
        // In a real app, you would make an API call to delete the account
        alert('Account deletion requested. This would typically require additional confirmation in a production app.');
        console.log('Account deletion requested');
    }
}