// UI Utilities for loading states, notifications, and error handling

// Show loading spinner
function showLoading(targetElementId = 'main-content') {
    const target = document.getElementById(targetElementId);
    if (target) {
        const loadingHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
    `;
        target.innerHTML = loadingHTML;
    }
}

// Hide loading spinner
function hideLoading() {
    const loadingContainers = document.querySelectorAll('.loading-container');
    loadingContainers.forEach(container => container.remove());
}

// Show notification toast
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Show error message in a specific container
function showError(message, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
      <div class="error-message">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
        container.style.display = 'block';
    }
}

// Clear error message
function clearError(containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}

// Show success message in a specific container
function showSuccess(message, containerId = 'success-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
      <div class="success-message">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
        container.style.display = 'block';
    }
}

// Format price
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle async operations with loading state
async function handleAsync(asyncFunction, loadingElementId = null) {
    try {
        if (loadingElementId) {
            showLoading(loadingElementId);
        }

        const result = await asyncFunction();

        if (loadingElementId) {
            hideLoading();
        }

        return result;
    } catch (error) {
        if (loadingElementId) {
            hideLoading();
        }

        showNotification(error.message || 'Ha ocurrido un error', 'error');
        throw error;
    }
}
// Initialize mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('main-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }
});
