/**
 * UniVault Script Loader
 * Automatically loads all required scripts for UniVault functionality
 */

(function() {
    'use strict';
    
    // Base path for scripts (adjust if needed)
    const SCRIPT_BASE = '../js/';
    
    // Required scripts in loading order
    const SCRIPTS = [
        'api-config.js',
        'form-utils.js',
        'dropdown-config.js', 
        'registration-manager.js',
        'univault-init.js'
    ];
    
    // Required stylesheets
    const STYLESHEETS = [
        'univault-ui.css'
    ];
    
    // Load a script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = SCRIPT_BASE + src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Load a stylesheet dynamically
    function loadStylesheet(href) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = SCRIPT_BASE + href;
            link.onload = resolve;
            link.onerror = resolve; // Don't fail on CSS errors
            document.head.appendChild(link);
        });
    }
    
    // Load all scripts and stylesheets
    async function loadUniVaultScripts() {
        try {
            console.log('🚀 Loading UniVault scripts...');
            
            // Load stylesheets first
            await Promise.all(STYLESHEETS.map(loadStylesheet));
            
            // Load scripts in order
            for (const script of SCRIPTS) {
                await loadScript(script);
            }
            
            console.log('✅ UniVault scripts loaded successfully');
            
            // Dispatch custom event when all scripts are loaded
            window.dispatchEvent(new CustomEvent('univault:scriptsLoaded'));
            
        } catch (error) {
            console.error('❌ Failed to load UniVault scripts:', error);
            
            // Show basic error message if UINotifications isn't available
            if (typeof UINotifications === 'undefined') {
                alert('Failed to load UniVault system. Please refresh the page.');
            } else {
                UINotifications.error('Failed to load system components. Please refresh the page.');
            }
        }
    }
    
    // Auto-load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadUniVaultScripts);
    } else {
        loadUniVaultScripts();
    }
    
    // Add global helper for manual loading
    window.loadUniVaultScripts = loadUniVaultScripts;
    
})();
