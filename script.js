// Constants
const API = {
    BASE_URL: 'https://api.github.com',
    ENDPOINTS: {
        USER: '/users/'
    },
    RATE_LIMIT: '/rate_limit'
};

// UI Elements Cache
const UI = {
    elements: {
        username: document.getElementById('username'),
        avatar: document.getElementById('avatar'),
        name: document.getElementById('name'),
        bio: document.getElementById('bio'),
        location: document.getElementById('location'),
        country: document.getElementById('country'),
        followers: document.getElementById('followers'),
        repos: document.getElementById('repos'),
        profileUrl: document.getElementById('profile-url')
    },
    sections: {
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        profile: document.getElementById('profile')
    }
};

// Function to show/hide elements with fade effect
function toggleElement(id, show) {
    const element = document.getElementById(id);
    
    if (show) {
        // Show element
        element.classList.remove('fade-out');
        element.classList.remove('hidden');
    } else {
        // Hide with fade
        element.classList.add('fade-out');
        // After fade completes, hide the element
        setTimeout(() => {
            element.classList.add('hidden');
        }, 300);
    }
}

// Function to set text content
function setText(id, text) {
    document.getElementById(id).textContent = text || 'Not specified';
}

// Function to format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Makes an API request to the GitHub API
 * @param {string} endpoint - API endpoint to call
 * @returns {Promise<Object>} - JSON response
 * @throws {Error} - With appropriate message based on status code
 */
async function apiRequest(endpoint) {
    try {
        const response = await fetch(`${API.BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            const errorMessage = getErrorMessage(response.status);
            throw new Error(errorMessage);
        }
        
        return response.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Get appropriate error message based on HTTP status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} - User-friendly error message
 */
function getErrorMessage(statusCode) {
    const errorMessages = {
        404: 'User not found. Please check the username and try again.',
        403: 'Rate limit exceeded. Please try again later.',
        500: 'GitHub server error. Please try again later.',
        default: 'An error occurred while fetching the profile.'
    };
    
    return errorMessages[statusCode] || errorMessages.default;
}

/**
 * Processes and displays user data
 * @param {Object} data - GitHub API user data 
 */
function displayUserData(data) {
    // Set basic user information
    UI.elements.avatar.src = data.avatar_url;
    setText('name', data.name || data.login);
    setText('bio', data.bio || 'This user prefers to keep an air of mystery about them.');
    
    // Set location data
    setText('location', data.location);
    
    // Extract country from location if available
    const locationParts = data.location ? data.location.split(',').map(part => part.trim()) : [];
    setText('country', locationParts[locationParts.length - 1] || 'Not specified');
    
    // Set statistics
    setText('followers', formatNumber(data.followers));
    setText('repos', formatNumber(data.public_repos));
    
    // Set profile URL
    UI.elements.profileUrl.href = data.html_url;
    UI.elements.profileUrl.textContent = data.html_url;
}

/**
 * Controls UI state during API operations
 * @param {string} state - Current state ('loading', 'error', 'success')
 * @param {string} [errorMessage] - Optional error message for error state
 */
function updateUIState(state, errorMessage = '') {
    switch (state) {
        case 'loading':
            toggleElement('loading', true);
            toggleElement('error', false);
            toggleElement('profile', false);
            break;
        case 'error':
            setText('error', errorMessage);
            toggleElement('loading', false);
            toggleElement('error', true);
            break;
        case 'success':
            toggleElement('loading', false);
            toggleElement('profile', true);
            break;
    }
}

/**
 * Main function to fetch and display GitHub profile
 */
async function fetchProfile() {
    const username = UI.elements.username.value.trim();
    
    if (!username) {
        updateUIState('error', 'Please enter a GitHub username');
        return;
    }

    // Update UI to loading state
    updateUIState('loading');

    try {
        // Add minimal loading time for better UX
        const fetchStartTime = Date.now();
        
        // Fetch user data
        const userData = await apiRequest(`${API.ENDPOINTS.USER}${username}`);
        
        // Ensure minimum loading time for better UX (at least 800ms)
        const minLoadingTime = 800;
        const timeElapsed = Date.now() - fetchStartTime;
        
        if (timeElapsed < minLoadingTime) {
            await new Promise(resolve => setTimeout(resolve, minLoadingTime - timeElapsed));
        }

        // Display the fetched data
        displayUserData(userData);
        
        // Update UI to success state
        updateUIState('success');

    } catch (error) {
        updateUIState('error', error.message);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for Enter key
    UI.elements.username.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchProfile();
        }
    });
}); 