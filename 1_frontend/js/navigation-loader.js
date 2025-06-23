/**
 * Automatic Navigation System Loader
 * Adds navigation functionality to any page
 */

// Automatically load navigation.js if not already loaded
if (typeof Navigation === 'undefined') {
    const script = document.createElement('script');
    script.src = '../js/navigation.js';
    script.async = false; // Load synchronously
    document.head.appendChild(script);
}

// Add navigation helper functions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Replace common navigation patterns with Navigation system
    const buttons = document.querySelectorAll('button, a, [onclick]');
    
    buttons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (onclick && onclick.includes('window.location.href')) {
            // Extract the target URL
            const urlMatch = onclick.match(/['"](.*?)['"]/);
            if (urlMatch) {
                const url = urlMatch[1];
                
                // Convert to Navigation calls
                if (url === 'login.html' || url.endsWith('/login.html')) {
                    button.setAttribute('onclick', 'Navigation.goto("login")');
                } else if (url === 'register.html' || url.endsWith('/register.html')) {
                    button.setAttribute('onclick', 'Navigation.goto("register")');
                } else if (url === 'entry.html' || url.endsWith('/entry.html')) {
                    button.setAttribute('onclick', 'Navigation.goto("entry")');
                } else if (url === 'landing.html' || url.endsWith('/landing.html')) {
                    button.setAttribute('onclick', 'Navigation.goto("home")');
                } else if (url.includes('registration')) {
                    // Extract registration step number
                    const stepMatch = url.match(/registration(\d+)\.html/);
                    if (stepMatch) {
                        const step = stepMatch[1];
                        button.setAttribute('onclick', `Navigation.goto("registration${step}")`);
                    }
                } else if (url.includes('Dashboard-Customer')) {
                    button.setAttribute('onclick', 'Navigation.goto("customerDashboard")');
                } else if (url.includes('Dashboard-Admin')) {
                    button.setAttribute('onclick', 'Navigation.goto("adminDashboard")');
                }
            }
        }
    });

    // Add generic navigation functions to window
    window.goBack = function() { Navigation.back(); };
    window.goHome = function() { Navigation.home(); };
    window.goToLogin = function() { Navigation.login(); };
    window.goToRegister = function() { Navigation.register(); };
    window.logout = function() { Navigation.logout(); };
});

console.log('🔄 Navigation loader initialized');
