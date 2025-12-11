let form = document.getElementById("loginForm");

// Initialize with user tab active
document.addEventListener('DOMContentLoaded', () => {
    switchTab('user');
});

function switchTab(type) {
    const userTab = document.getElementById('userLoginTab');
    const authorTab = document.getElementById('authorLoginTab');
    const loginTypeInput = document.getElementById('loginType');
    
    if (type === 'user') {
        userTab.classList.add('active');
        authorTab.classList.remove('active');
        loginTypeInput.value = 'user';
    } else {
        authorTab.classList.add('active');
        userTab.classList.remove('active');
        loginTypeInput.value = 'author';
    }
}

form.addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();
    
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let loginType = document.getElementById("loginType").value;

    if (email === "" || password === "") {
        alert("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, loginType })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            
            // Store the author name if it's an author login
            if (loginType === 'author') {
                localStorage.setItem('authorName', result.user.name || email);
            }
            
            // Redirect based on role and login type
            if (loginType === 'author') {
                if (email === "admin@example.com") {
                    window.location.href = 'editorialPage.html';
                } else {
                    window.location.href = 'Author-Page.html';
                }
            } else {
                // User login - redirect to home page
                window.location.href = 'index.html';
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}