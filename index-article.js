// Load dynamic articles when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadLatestArticles();
});

async function loadLatestArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        
        if (articles.length === 0) {
            return; // No dynamic articles to add
        }
        
        // Find the articles-section container
        const articlesSection = document.querySelector('.articles-section');
        
        if (!articlesSection) {
            console.error('Articles section not found');
            return;
        }
        
        // Get the latest 2 articles
        const latestArticles = articles.slice(-2).reverse();
        
        // Generate HTML for each article
        latestArticles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card mb-4';
            articleCard.innerHTML = `
                <span class="article-badge">${article.category}</span>
                <h3 class="article-title">${article.title}</h3>
                <div class="article-meta">By ${article.author} • ${article.date} • ${article.readTime} min read</div>
                <p class="article-excerpt">
                    ${article.excerpt}
                </p>
                <a href="article-${article.id}.html" class="read-more">Read full article →</a>
            `;
            
            // Append to the section
            articlesSection.appendChild(articleCard);
        });
        
        console.log(`Loaded ${latestArticles.length} latest articles`);
        
    } catch (error) {
        console.error('Error loading latest articles:', error);
    }
}