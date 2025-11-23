// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const startJournalingBtn = document.getElementById('startJournaling');
const saveEntryBtn = document.getElementById('saveEntry');
const prevDateBtn = document.getElementById('prevDate');
const nextDateBtn = document.getElementById('nextDate');
const currentDateEl = document.getElementById('currentDate');
const journalTextarea = document.querySelector('.journal-textarea');
const moodOptions = document.querySelectorAll('.mood-option');
const entriesList = document.getElementById('entriesList');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const closeButtons = document.querySelectorAll('.close');
const saveConfirmation = document.getElementById('saveConfirmation');
const darkModeToggle = document.getElementById('darkModeToggle');
const exportDataBtn = document.getElementById('exportData');

// State
let currentDate = new Date();
let selectedMood = null;
let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set home page as active
    showPage('home');
    
    // Load journal entries
    loadJournalEntries();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update date display
    updateDateDisplay();
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
    saveEntryBtn.addEventListener('click', saveJournalEntry);
    prevDateBtn.addEventListener('click', goToPreviousDate);
    nextDateBtn.addEventListener('click', goToNextDate);
    
    // Mood selection
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            moodOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Store selected mood
            selectedMood = this.getAttribute('data-mood');
        });
    });
    
    // Settings functionality
    darkModeToggle.addEventListener('change', toggleDarkMode);
    exportDataBtn.addEventListener('click', exportJournalData);
    
    // Auto-expand textarea
    journalTextarea.addEventListener('input', autoExpandTextarea);
}

// Show specific page and hide others
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    
    // If journal page is shown, load entries for current date
    if (pageId === 'journal') {
        loadEntryForDate();
    }
}

// Modal controls
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Date navigation
function goToPreviousDate() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadEntryForDate();
}

function goToNextDate() {
    // Don't allow navigating to future dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (currentDate < tomorrow) {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
        loadEntryForDate();
    }
}

function updateDateDisplay() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (currentDate.toDateString() === today.toDateString()) {
        currentDateEl.textContent = 'Today';
    } else if (currentDate.toDateString() === yesterday.toDateString()) {
        currentDateEl.textContent = 'Yesterday';
    } else {
        currentDateEl.textContent = currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Disable next button if it's today or in the future
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    nextDateBtn.disabled = currentDate >= tomorrow;
}

// Load entry for current date
function loadEntryForDate() {
    const dateString = currentDate.toISOString().split('T')[0];
    const existingEntry = journalEntries.find(entry => entry.date === dateString);
    
    // Reset form
    journalTextarea.value = '';
    moodOptions.forEach(opt => opt.classList.remove('active'));
    selectedMood = null;
    
    // If entry exists, populate form
    if (existingEntry) {
        journalTextarea.value = existingEntry.content;
        
        if (existingEntry.mood) {
            const moodOption = document.querySelector(`.mood-option[data-mood="${existingEntry.mood}"]`);
            if (moodOption) {
                moodOption.classList.add('active');
                selectedMood = existingEntry.mood;
            }
        }
    }
    
    // Auto-expand textarea
    autoExpandTextarea.call(journalTextarea);
}

// Save journal entry
function saveJournalEntry() {
    const content = journalTextarea.value.trim();
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Find existing entry for this date
    const existingEntryIndex = journalEntries.findIndex(entry => entry.date === dateString);
    
    if (existingEntryIndex !== -1) {
        // Update existing entry
        journalEntries[existingEntryIndex].content = content;
        journalEntries[existingEntryIndex].mood = selectedMood;
        journalEntries[existingEntryIndex].updated = new Date().toISOString();
    } else {
        // Create new entry
        journalEntries.push({
            date: dateString,
            content: content,
            mood: selectedMood,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    
    // Show confirmation
    showSaveConfirmation();
    
    // Reload entries list
    loadJournalEntries();
}

// Load journal entries for the list
function loadJournalEntries() {
    // Sort entries by date (newest first)
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedEntries.length === 0) {
        entriesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No entries yet</h3>
                <p>Your journal entries will appear here once you start writing.</p>
            </div>
        `;
        return;
    }
    
    entriesList.innerHTML = '';
    
    sortedEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const dateDisplay = entryDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const moodIcons = {
            'amazing': 'fas fa-grin-stars',
            'good': 'fas fa-smile',
            'okay': 'fas fa-meh',
            'bad': 'fas fa-frown',
            'awful': 'fas fa-sad-tear'
        };
        
        const moodIcon = entry.mood ? moodIcons[entry.mood] : 'fas fa-question';
        const moodText = entry.mood ? entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1) : 'Not set';
        
        const entryEl = document.createElement('div');
        entryEl.className = 'entry-card';
        entryEl.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${dateDisplay}</div>
                <div class="entry-mood">
                    <i class="${moodIcon}"></i>
                    <span>${moodText}</span>
                </div>
            </div>
            <div class="entry-content">${entry.content || '<em>No content</em>'}</div>
        `;
        
        entriesList.appendChild(entryEl);
    });
}

// Show save confirmation
function showSaveConfirmation() {
    saveConfirmation.classList.add('show');
    
    setTimeout(() => {
        saveConfirmation.classList.remove('show');
    }, 3000);
}

// Auto-expand textarea as user types
function autoExpandTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // In a real app, you would save this preference to local storage
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

// Export journal data
function exportJournalData() {
    if (journalEntries.length === 0) {
        alert('No journal entries to export.');
        return;
    }
    
    // Create a JSON string of the journal entries
    const dataStr = JSON.stringify(journalEntries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pages-of-peace-journal-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Journal data exported successfully!');
}