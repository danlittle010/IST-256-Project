
let form = document.getElementById("loginForm");

form.addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();
    
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

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
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            // Check if admin and redirect accordingly
            if (email === "admin@example.com") {
                window.location.href = 'editorialPage.html';
            } else {
                window.location.href = 'Author-Page.html';
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}