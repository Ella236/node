// Function to show/hide elements
function toggleElement(id, show) {
    document.getElementById(id).classList.toggle('hidden', !show);
}

// Function to set text content
function setText(id, text) {
    document.getElementById(id).textContent = text || 'Not specified';
}

// Function to fetch GitHub profile
async function fetchProfile() {
    const username = document.getElementById('username').value.trim();
    
    if (!username) {
        setText('error', 'Please enter a GitHub username');
        toggleElement('error', true);
        return;
    }

    // Show loading, hide error and profile
    toggleElement('loading', true);
    toggleElement('error', false);
    toggleElement('profile', false);

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'User not found' : 'Error fetching profile');
        }

        const data = await response.json();

        // Update profile information
        document.getElementById('avatar').src = data.avatar_url;
        setText('name', data.name || username);
        setText('bio', data.bio);
        setText('location', data.location);
        
        // Extract country from location if available
        const locationParts = data.location ? data.location.split(',').map(part => part.trim()) : [];
        setText('country', locationParts[locationParts.length - 1] || 'Not specified');
        
        // Note: GitHub API doesn't provide age, so we'll show "Not available"
        setText('age', 'Not available');
        setText('education', data.education);
        setText('gender', data.gender);

        // Show profile, hide loading
        toggleElement('profile', true);
        toggleElement('loading', false);

    } catch (error) {
        setText('error', error.message);
        toggleElement('error', true);
        toggleElement('loading', false);
    }
}

// Add event listener for Enter key
document.getElementById('username').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchProfile();
    }
}); 