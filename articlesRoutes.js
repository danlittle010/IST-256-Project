const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Article = require('./models/Article');

const articleHtmlPath = path.join(__dirname, 'Article.html');
const indexHtmlPath = path.join(__dirname, 'index.html');

// Function to generate HTML file for individual article
function generateArticleHTML(articleData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title} - Tech Tomorrow</title>
    <link rel="stylesheet" href="mainArticle.css">
</head>
<body>
    <div class="article-card mb-4">
        <span class="article-category">${articleData.category}</span>
        <h2 class="article-title">${articleData.title}</h2>
        <div class="article-meta">By ${articleData.author} • ${articleData.date} • ${articleData.readTime} min read</div>
        <p class="article-body">
            ${articleData.excerpt}
        </p>
        <div class="article-full-content">
            ${articleData.content}
        </div>
    </div>
</body>
</html>`;
}

// Function to generate article card HTML for Article.html
function generateArticleCard(article) {
    return `
            <!-- Article ${article.id} -->
            <div class="article-card mb-4">
                <span class="article-category">${article.category}</span>
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">By ${article.author} • ${article.date} • ${article.readTime} min read</div>
                <p class="article-excerpt">
                    ${article.excerpt}
                </p>
                <a href="article-${article.id}.html" class="read-more">Read full article →</a>
            </div>
`;
}

// Function to generate article card HTML for index.html
function generateIndexArticleCard(article) {
    return `
            <!-- Article ${article.id} -->
            <div class="article-card mb-4">
                <span class="article-badge">${article.category}</span>
                <h3 class="article-title">${article.title}</h3>
                <div class="article-meta">By ${article.author} • ${article.date} • ${article.readTime} min read</div>
                <p class="article-excerpt">
                    ${article.excerpt}
                </p>
                <a href="article-${article.id}.html" class="read-more">Read full article →</a>
            </div>
`;
}

// Function to update Article.html with all articles
function updateArticleHtml(articles) {
    fs.readFile(articleHtmlPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading Article.html:", err);
            return;
        }
        
        const articlesHtml = articles.map(article => generateArticleCard(article)).join('');
        const markerComment = '<!-- Dynamic Articles Start -->';
        let insertPosition = data.indexOf(markerComment);
        
        if (insertPosition === -1) {
            const lastArticleEnd = data.lastIndexOf('</article>');
            if (lastArticleEnd !== -1) {
                insertPosition = lastArticleEnd + '</article>'.length;
                const beforeInsert = data.substring(0, insertPosition);
                const afterInsert = data.substring(insertPosition);
                data = beforeInsert + '\n            \n            ' + markerComment + '\n            <!-- Dynamic Articles End -->' + afterInsert;
                insertPosition = data.indexOf(markerComment) + markerComment.length;
            }
        } else {
            insertPosition += markerComment.length;
        }
        
        if (insertPosition !== -1) {
            const dynamicEnd = data.indexOf('<!-- Dynamic Articles End -->');
            
            if (dynamicEnd !== -1) {
                const beforeDynamic = data.substring(0, insertPosition);
                const afterDynamic = data.substring(dynamicEnd);
                const updatedHtml = beforeDynamic + '\n' + articlesHtml + '            ' + afterDynamic;
                
                fs.writeFile(articleHtmlPath, updatedHtml, 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error("Error updating Article.html:", writeErr);
                    } else {
                        console.log("Article.html updated successfully");
                    }
                });
            }
        }
    });
}

// Function to update index.html with latest articles
function updateIndexHtml(articles) {
    fs.readFile(indexHtmlPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading index.html:", err);
            return;
        }
        
        const latestArticles = articles.slice(-2).reverse();
        const articlesHtml = latestArticles.map(article => generateIndexArticleCard(article)).join('');
        const markerComment = '<!-- Dynamic Articles Start -->';
        let insertPosition = data.indexOf(markerComment);
        
        if (insertPosition === -1) {
            let firstCardStart = data.indexOf('<div class="article-card mb-4">');
            let firstCardEnd = data.indexOf('</div>', data.indexOf('</div>', firstCardStart) + 1);
            let secondCardStart = data.indexOf('<div class="article-card', firstCardEnd);
            let secondCardEnd = data.indexOf('</div>', data.indexOf('</div>', secondCardStart) + 1);
            
            if (secondCardEnd !== -1) {
                insertPosition = secondCardEnd + '</div>'.length;
                const beforeInsert = data.substring(0, insertPosition);
                const afterInsert = data.substring(insertPosition);
                data = beforeInsert + '\n\n            ' + markerComment + '\n            <!-- Dynamic Articles End -->' + afterInsert;
                insertPosition = data.indexOf(markerComment) + markerComment.length;
            }
        } else {
            insertPosition += markerComment.length;
        }
        
        if (insertPosition !== -1) {
            const dynamicEnd = data.indexOf('<!-- Dynamic Articles End -->');
            
            if (dynamicEnd !== -1) {
                const beforeDynamic = data.substring(0, insertPosition);
                const afterDynamic = data.substring(dynamicEnd);
                const updatedHtml = beforeDynamic + '\n' + articlesHtml + '            ' + afterDynamic;
                
                fs.writeFile(indexHtmlPath, updatedHtml, 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error("Error updating index.html:", writeErr);
                    } else {
                        console.log("index.html updated successfully");
                    }
                });
            }
        }
    });
}

// GET all articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find().sort({ id: 1 });
        // Convert mongoose documents to plain objects
        const plainArticles = articles.map(article => article.toObject());
        res.status(200).json(plainArticles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching articles" 
        });
    }
});

// POST new article
router.post('/', async (req, res) => {
    try {
        const articleData = req.body;
        console.log("Article data received:", articleData);
        
        // Create new article
        const newArticle = new Article(articleData);
        await newArticle.save();
        
        // Generate HTML file for the new article
        const htmlContent = generateArticleHTML(articleData);
        const htmlFileName = `article-${articleData.id}.html`;
        const htmlFilePath = path.join(__dirname, htmlFileName);
        
        // Write the HTML file
        fs.writeFile(htmlFilePath, htmlContent, 'utf8', async (htmlWriteErr) => {
            if (htmlWriteErr) {
                console.error("Error writing HTML file:", htmlWriteErr);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error creating article HTML file" 
                });
            }
            
            console.log(`HTML file created: ${htmlFileName}`);
            console.log("Article saved successfully to MongoDB");
            
            // Get all articles for updating HTML pages
            const allArticles = await Article.find().sort({ id: 1 });
            const plainArticles = allArticles.map(a => a.toObject());
            
            // Update Article.html and index.html
            updateArticleHtml(plainArticles);
            updateIndexHtml(plainArticles);
            
            res.status(200).json({ 
                success: true, 
                message: "Article published successfully!",
                htmlFile: htmlFileName
            });
        });
    } catch (error) {
        console.error("Error saving article:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error saving article" 
        });
    }
});

// DELETE article by id
router.delete('/:id', async (req, res) => {
    try {
        const articleId = parseInt(req.params.id);
        console.log("Delete request for article ID:", articleId);
        
        // Find and delete article
        const deletedArticle = await Article.findOneAndDelete({ id: articleId });
        
        if (!deletedArticle) {
            return res.status(404).json({ 
                success: false, 
                message: "Article not found" 
            });
        }
        
        // Delete the HTML file
        const htmlFileName = `article-${articleId}.html`;
        const htmlFilePath = path.join(__dirname, htmlFileName);
        
        fs.unlink(htmlFilePath, async (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting HTML file:", unlinkErr);
            }
            
            console.log("Article deleted successfully from MongoDB");
            
            // Get all remaining articles for updating HTML pages
            const allArticles = await Article.find().sort({ id: 1 });
            const plainArticles = allArticles.map(a => a.toObject());
            
            // Update Article.html and index.html
            updateArticleHtml(plainArticles);
            updateIndexHtml(plainArticles);
            
            res.status(200).json({ 
                success: true, 
                message: "Article deleted successfully!" 
            });
        });
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting article" 
        });
    }
});

module.exports = router;