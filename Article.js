// Load dynamic articles when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadDynamicArticles();
});

async function loadDynamicArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        
        if (articles.length === 0) {
            return; // No dynamic articles to add
        }
        
        // Find the articles-grid container
        const articlesGrid = document.querySelector('.articles-grid');
        
        if (!articlesGrid) {
            console.error('Articles grid not found');
            return;
        }
        
        // Generate HTML for each article
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card mb-4';
            articleCard.innerHTML = `
                <span class="article-category">${article.category}</span>
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">By ${article.author} • ${article.date} • ${article.readTime} min read</div>
                <p class="article-excerpt">
                    ${article.excerpt}
                </p>
                <a href="article-${article.id}.html" class="read-more">Read full article →</a>
            `;
            
            // Append to the grid
            articlesGrid.appendChild(articleCard);
        });
        
        console.log(`Loaded ${articles.length} dynamic articles`);
        
    } catch (error) {
        console.error('Error loading dynamic articles:', error);
    }
}