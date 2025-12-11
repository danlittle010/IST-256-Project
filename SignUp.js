let form = document.getElementById("signupForm");

// Add plan selection functionality
function selectPlan(plan) {
    const freeCard = document.getElementById('freeCard');
    const premiumCard = document.getElementById('premiumCard');
    const freeRadio = document.getElementById('planFree');
    const premiumRadio = document.getElementById('planPremium');
    
    if (plan === 'free') {
        freeCard.classList.add('selected');
        premiumCard.classList.remove('selected');
        freeRadio.checked = true;
    } else {
        premiumCard.classList.add('selected');
        freeCard.classList.remove('selected');
        premiumRadio.checked = true;
    }
}

// Initialize with free plan selected
document.addEventListener('DOMContentLoaded', () => {
    selectPlan('free');
});

function handleSubmit(event) {
    event.preventDefault();

    // Get form values
    let userName = document.getElementById("name").value;
    let ageNumber = document.getElementById("age").value;
    let emailAddress = document.getElementById("email").value;
    let address = document.getElementById("address").value;
    let phoneNumber = document.getElementById("phone").value;
    
    // Get selected subscription plan
    let subscription = document.querySelector('input[name="subscription"]:checked').value;

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
        subscription: subscription,
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
        const planText = subscription === 'premium' ? 'Premium' : 'Free';
        showMessage(`Sign up successful! You are now subscribed to the ${planText} plan. Redirecting...`, "success");
        form.reset();
        
        // Reset to free plan
        selectPlan('free');
        
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
    }, 2000);
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