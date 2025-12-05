const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const submissionsDataPath = path.join(__dirname, 'submissions.json');
const articlesDataPath = path.join(__dirname, 'articles.json');
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
    <header>
        <h1>Tech Tomorrow</h1>
    </header>
    <div class="article-card mb-4">
        <span class="article-category">${articleData.category}</span>
        <h2 class="article-title">${articleData.title}</h2>
        <div class="article-meta">By ${articleData.author} • ${articleData.date} • ${articleData.readTime} min read</div>
        <div class="article-body">
            <strong>Summary:</strong><br>
            ${articleData.excerpt}
        </div>
        <hr>
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

// GET all submissions
router.get('/', (req, res) => {
    fs.readFile(submissionsDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(200).json([]);
        }
        
        try {
            const submissions = JSON.parse(data);
            res.status(200).json(submissions);
        } catch (parseErr) {
            res.status(200).json([]);
        }
    });
});

// POST new submission (from author)
router.post('/', (req, res) => {
    const submissionData = req.body;
    console.log("Submission received:", submissionData);
    
    fs.readFile(submissionsDataPath, 'utf8', (err, data) => {
        let submissions = [];
        
        if (!err && data) {
            try {
                submissions = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing submissions JSON:", parseErr);
                submissions = [];
            }
        }
        
        submissions.push(submissionData);
        
        fs.writeFile(submissionsDataPath, JSON.stringify(submissions, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error("Error writing submissions file:", writeErr);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error saving submission" 
                });
            }
            
            console.log("Submission saved successfully");
            res.status(200).json({ 
                success: true, 
                message: "Article submitted for review!" 
            });
        });
    });
});

// POST approve submission (move to published articles)
router.post('/:id/approve', (req, res) => {
    const submissionId = parseInt(req.params.id);
    console.log("Approve request for submission ID:", submissionId);
    
    // Read submissions
    fs.readFile(submissionsDataPath, 'utf8', (err, submissionsData) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: "Error reading submissions" 
            });
        }
        
        try {
            let submissions = JSON.parse(submissionsData);
            const submission = submissions.find(s => s.id === submissionId);
            
            if (!submission) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Submission not found" 
                });
            }
            
            // Remove from submissions
            submissions = submissions.filter(s => s.id !== submissionId);
            
            // Read articles
            fs.readFile(articlesDataPath, 'utf8', (err, articlesData) => {
                let articles = [];
                
                if (!err && articlesData) {
                    try {
                        articles = JSON.parse(articlesData);
                    } catch (parseErr) {
                        console.error("Error parsing articles JSON:", parseErr);
                    }
                }
                
                // Add to articles
                articles.push(submission);
                
                // Generate HTML file for the article
                const htmlContent = generateArticleHTML(submission);
                const htmlFileName = `article-${submission.id}.html`;
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
                    
                    // Save updated submissions
                    fs.writeFile(submissionsDataPath, JSON.stringify(submissions, null, 2), 'utf8', (writeErr) => {
                        if (writeErr) {
                            console.error("Error updating submissions:", writeErr);
                            return res.status(500).json({ 
                                success: false, 
                                message: "Error updating submissions" 
                            });
                        }
                        
                        // Save updated articles
                        fs.writeFile(articlesDataPath, JSON.stringify(articles, null, 2), 'utf8', (writeErr2) => {
                            if (writeErr2) {
                                console.error("Error saving article:", writeErr2);
                                return res.status(500).json({ 
                                    success: false, 
                                    message: "Error publishing article" 
                                });
                            }
                            
                            console.log("Article approved and published");
                            
                            // Update Article.html and index.html
                            updateArticleHtml(articles);
                            updateIndexHtml(articles);
                            
                            res.status(200).json({ 
                                success: true, 
                                message: "Article approved and published!" 
                            });
                        });
                    });
                });
            });
        } catch (parseErr) {
            console.error("Error parsing submissions JSON:", parseErr);
            res.status(500).json({ 
                success: false, 
                message: "Error processing submissions" 
            });
        }
    });
});

// DELETE submission (reject)
router.delete('/:id', (req, res) => {
    const submissionId = parseInt(req.params.id);
    console.log("Delete request for submission ID:", submissionId);
    
    fs.readFile(submissionsDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: "Error reading submissions" 
            });
        }
        
        try {
            let submissions = JSON.parse(data);
            const initialLength = submissions.length;
            
            submissions = submissions.filter(s => s.id !== submissionId);
            
            if (submissions.length === initialLength) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Submission not found" 
                });
            }
            
            fs.writeFile(submissionsDataPath, JSON.stringify(submissions, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("Error writing submissions file:", writeErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error deleting submission" 
                    });
                }
                
                console.log("Submission rejected and deleted");
                res.status(200).json({ 
                    success: true, 
                    message: "Submission rejected successfully" 
                });
            });
        } catch (parseErr) {
            console.error("Error parsing submissions JSON:", parseErr);
            res.status(500).json({ 
                success: false, 
                message: "Error processing submissions" 
            });
        }
    });
});

module.exports = router;