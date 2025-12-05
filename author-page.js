// Load author name and articles on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAuthorName();
    loadSubmittedArticles();
});

// Load author name from localStorage
function loadAuthorName() {
    const authorName = localStorage.getItem('authorName') || 'Author';
    document.getElementById('authorName').textContent = authorName;
    document.getElementById('articleAuthor').value = authorName;
}

// Logout function
function logout() {
    localStorage.removeItem('authorName');
    window.location.href = 'index.html';
}

// Function to format content with proper HTML paragraphs
function formatContent(text) {
    // Split by double line breaks (paragraphs) or single line breaks
    const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
    
    // Wrap each paragraph in <p> tags and replace single line breaks with <br>
    const formattedParagraphs = paragraphs.map(paragraph => {
        const lines = paragraph.split('\n').filter(line => line.trim() !== '');
        const formattedLines = lines.join('<br>');
        return `<p>${formattedLines}</p>`;
    });
    
    return formattedParagraphs.join('\n');
}

// Handle form submission with AJAX
document.getElementById('articleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    const title = document.getElementById('articleTitle').value;
    const category = document.getElementById('articleCategory').value;
    const author = document.getElementById('articleAuthor').value;
    const readTime = document.getElementById('articleReadTime').value;
    const excerpt = document.getElementById('articleExcerpt').value;
    const content = document.getElementById('articleContent').value;
    
    // Format the content with proper HTML
    const formattedContent = formatContent(content);
    
    // Create article object
    const article = {
        id: Date.now(),
        title: title,
        category: category,
        author: author,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        readTime: readTime,
        excerpt: excerpt,
        content: formattedContent
    };
    
    try {
        // Send POST request to submissions endpoint (for review)
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showNotification('Article submitted for review!', 'success');
            
            // Reset form
            document.getElementById('articleForm').reset();
            document.getElementById('articleAuthor').value = author; // Keep author name
            
            // Reload the submissions list immediately without page refresh
            await loadSubmittedArticles();
            
            // Scroll to the submitted articles section
            document.getElementById('publishedArticles').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        } else {
            showNotification('Error: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error submitting article:', error);
        showNotification('Failed to submit article. Please try again.', 'error');
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

// Load and display submitted articles with AJAX
async function loadSubmittedArticles() {
    try {
        const response = await fetch('/api/submissions');
        const submissions = await response.json();
        
        const publishedContainer = document.getElementById('publishedArticles');
        
        // Get current author name
        const currentAuthor = localStorage.getItem('authorName') || 'Author';
        
        // Filter submissions by current author
        const mySubmissions = submissions.filter(s => s.author === currentAuthor);
        
        if (mySubmissions.length === 0) {
            publishedContainer.innerHTML = `
                <div class="text-center text-muted py-5">
                    <p>No articles submitted yet. Create your first article above!</p>
                </div>
            `;
            return;
        }
        
        // Sort articles by ID (newest first)
        mySubmissions.sort((a, b) => b.id - a.id);
        
        // Display articles
        publishedContainer.innerHTML = mySubmissions.map(article => `
            <div class="article-card mb-4" style="animation: fadeIn 0.5s ease-in;">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="article-category">${article.category}</span>
                    <span class="badge bg-warning text-dark">Pending Review</span>
                </div>
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">By ${article.author} • ${article.date} • ${article.readTime} min read</div>
                <p class="article-body">
                    ${article.excerpt}
                </p>
                <div class="mt-3">
                    <button class="btn btn-sm btn-danger" onclick="deleteSubmission(${article.id})">
                        Delete Submission
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        showNotification('Failed to load submissions.', 'error');
    }
}

// Delete submission with AJAX
async function deleteSubmission(articleId) {
    if (!confirm('Are you sure you want to delete this submission?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/submissions/${articleId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Submission deleted successfully!', 'success');
            // Reload the submissions list immediately without page refresh
            await loadSubmittedArticles();
        } else {
            showNotification('Error: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting submission:', error);
        showNotification('Failed to delete submission. Please try again.', 'error');
    }
}

// Show notification function (replaces alert)
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .article-card {
        transition: transform 0.2s, box-shadow 0.2s;
        padding: 1.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .article-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .article-title {
        color: #333;
        margin: 0.8rem 0;
        font-size: 1.5rem;
        font-weight: 600;
    }
    
    .article-meta {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    
    .article-body {
        color: #555;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);