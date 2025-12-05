const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const articlesDataPath = path.join(__dirname, 'articles.json');
const articleHtmlPath = path.join(__dirname, 'Article.html');
const indexHtmlPath = path.join(__dirname, 'index.html');

// GET all articles
router.get('/', (req, res) => {
    fs.readFile(articlesDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(200).json([]);
        }
        
        try {
            const articles = JSON.parse(data);
            res.status(200).json(articles);
        } catch (parseErr) {
            res.status(200).json([]);
        }
    });
});

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
        
        // Generate HTML for dynamic articles only
        const articlesHtml = articles.map(article => generateArticleCard(article)).join('');
        
        // Find the marker comment or the last closing </article>
        const markerComment = '<!-- Dynamic Articles Start -->';
        let insertPosition = data.indexOf(markerComment);
        
        if (insertPosition === -1) {
            // If no marker, find the last </article> tag and insert after it
            const lastArticleEnd = data.lastIndexOf('</article>');
            if (lastArticleEnd !== -1) {
                insertPosition = lastArticleEnd + '</article>'.length;
                // Add marker comments
                const beforeInsert = data.substring(0, insertPosition);
                const afterInsert = data.substring(insertPosition);
                data = beforeInsert + '\n            \n            ' + markerComment + '\n            <!-- Dynamic Articles End -->' + afterInsert;
                insertPosition = data.indexOf(markerComment) + markerComment.length;
            }
        } else {
            insertPosition += markerComment.length;
        }
        
        if (insertPosition !== -1) {
            // Remove any existing dynamic articles between markers
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

// Function to update index.html with latest articles (limit to 2 newest)
function updateIndexHtml(articles) {
    fs.readFile(indexHtmlPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading index.html:", err);
            return;
        }
        
        // Get latest 2 articles
        const latestArticles = articles.slice(-2).reverse();
        
        // Generate HTML for latest articles
        const articlesHtml = latestArticles.map(article => generateIndexArticleCard(article)).join('');
        
        // Find the marker comment
        const markerComment = '<!-- Dynamic Articles Start -->';
        let insertPosition = data.indexOf(markerComment);
        
        if (insertPosition === -1) {
            // If no marker, find the second article-card and insert after it
            let firstCardStart = data.indexOf('<div class="article-card mb-4">');
            let firstCardEnd = data.indexOf('</div>', data.indexOf('</div>', firstCardStart) + 1);
            let secondCardStart = data.indexOf('<div class="article-card', firstCardEnd);
            let secondCardEnd = data.indexOf('</div>', data.indexOf('</div>', secondCardStart) + 1);
            
            if (secondCardEnd !== -1) {
                insertPosition = secondCardEnd + '</div>'.length;
                // Add marker comments
                const beforeInsert = data.substring(0, insertPosition);
                const afterInsert = data.substring(insertPosition);
                data = beforeInsert + '\n\n            ' + markerComment + '\n            <!-- Dynamic Articles End -->' + afterInsert;
                insertPosition = data.indexOf(markerComment) + markerComment.length;
            }
        } else {
            insertPosition += markerComment.length;
        }
        
        if (insertPosition !== -1) {
            // Remove any existing dynamic articles between markers
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

// POST new article
router.post('/', (req, res) => {
    const articleData = req.body;
    console.log("Article data received:", articleData);
    
    fs.readFile(articlesDataPath, 'utf8', (err, data) => {
        let articles = [];
        
        if (!err && data) {
            try {
                articles = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing articles JSON:", parseErr);
                articles = [];
            }
        }
        
        // Add the article to the array
        articles.push(articleData);
        
        // Generate HTML file for the new article
        const htmlContent = generateArticleHTML(articleData);
        const htmlFileName = `article-${articleData.id}.html`;
        const htmlFilePath = path.join(__dirname, htmlFileName);
        
        // Write the HTML file
        fs.writeFile(htmlFilePath, htmlContent, 'utf8', (htmlWriteErr) => {
            if (htmlWriteErr) {
                console.error("Error writing HTML file:", htmlWriteErr);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error creating article HTML file" 
                });
            }
            
            console.log(`HTML file created: ${htmlFileName}`);
            
            // Write to articles.json
            fs.writeFile(articlesDataPath, JSON.stringify(articles, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("Error writing articles file:", writeErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error saving article" 
                    });
                }
                
                console.log("Article saved successfully to articles.json");
                
                // Update Article.html and index.html
                updateArticleHtml(articles);
                updateIndexHtml(articles);
                
                res.status(200).json({ 
                    success: true, 
                    message: "Article published successfully!",
                    htmlFile: htmlFileName
                });
            });
        });
    });
});

// DELETE article by id
router.delete('/:id', (req, res) => {
    const articleId = parseInt(req.params.id);
    console.log("Delete request for article ID:", articleId);
    
    fs.readFile(articlesDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: "Error reading articles" 
            });
        }
        
        try {
            let articles = JSON.parse(data);
            const initialLength = articles.length;
            
            // Filter out the article with matching id
            articles = articles.filter(article => article.id !== articleId);
            
            if (articles.length === initialLength) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Article not found" 
                });
            }
            
            // Delete the HTML file
            const htmlFileName = `article-${articleId}.html`;
            const htmlFilePath = path.join(__dirname, htmlFileName);
            
            fs.unlink(htmlFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting HTML file:", unlinkErr);
                    // Continue anyway - file might not exist
                }
                
                // Write updated articles.json
                fs.writeFile(articlesDataPath, JSON.stringify(articles, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error("Error writing articles file:", writeErr);
                        return res.status(500).json({ 
                            success: false, 
                            message: "Error deleting article" 
                        });
                    }
                    
                    console.log("Article deleted successfully");
                    
                    // Update Article.html and index.html
                    updateArticleHtml(articles);
                    updateIndexHtml(articles);
                    
                    res.status(200).json({ 
                        success: true, 
                        message: "Article deleted successfully!" 
                    });
                });
            });
        } catch (parseErr) {
            console.error("Error parsing articles JSON:", parseErr);
            res.status(500).json({ 
                success: false, 
                message: "Error processing articles" 
            });
        }
    });
});

module.exports = router;