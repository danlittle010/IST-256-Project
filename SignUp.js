let form = document.getElementById("signupForm");

function handleSubmit(event) {
    event.preventDefault();

    // Get form values using getElementById to match your HTML
    let userName = document.getElementById("name").value;
    let ageNumber = document.getElementById("age").value;
    let emailAddress = document.getElementById("email").value;
    let address = document.getElementById("address").value;
    let phoneNumber = document.getElementById("phone").value;

    // Validate username (at least 3 characters)
    if (userName.length < 3) {
        console.log("Input is invalid");
        showMessage("Username must be at least 3 characters", "danger");
        return;
    }

    // Validate age (must be a number between 1 and 120)
    let ageNum = parseInt(ageNumber);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        console.log("Input is invalid");
        showMessage("Age must be between 1 and 120", "danger");
        return;
    }

    // Validate email (basic email format check)
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailAddress)) {
        console.log("Input is invalid");
        showMessage("Please enter a valid email address", "danger");
        return;
    }

    // Validate address (at least 5 characters)
    if (address.length < 5) {
        console.log("Input is invalid");
        showMessage("Address must be at least 5 characters", "danger");
        return;
    }

    // Validate phone number (exactly 10 digits, optional field)
    let phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneNumber.length > 0 && phoneDigits.length !== 10) {
        console.log("Input is invalid");
        showMessage("Phone number must be exactly 10 digits", "danger");
        return;
    }

    // Create user data object
    let userData = {
        userName: userName,
        age: ageNum,
        email: emailAddress,
        address: address,
        phoneNumber: phoneNumber,
        timestamp: new Date().toISOString()
    };

    // Send data to server
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
        showMessage("Sign up successful! Thank you for subscribing. Redirecting...", "success");
        form.reset();
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    })
    .catch((error) => {
        console.error("Error:", error);
        showMessage("An error occurred. Please try again.", "danger");
    });
}

// Helper function to display messages
function showMessage(message, type) {
    let output = document.getElementById("output");
    output.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
        output.innerHTML = '';
    }, 3000);
}

form.addEventListener("submit", handleSubmit);

// Optional: Function to retrieve all users from server
async function getAllUsers() {
    try {
        const response = await fetch('/users');
        const users = await response.json();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}