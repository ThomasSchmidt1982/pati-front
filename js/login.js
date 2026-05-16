function toggleRegister() {
    const card = document.getElementById("register-card");
    card.style.display = card.style.display === "none" ? "block" : "none";
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
    });

    if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(TOKEN_KEY, data.token);
        window.location.href = "../index.html";
    } else {
        document.getElementById("login-error").textContent = "Email ou mot de passe incorrect";
        document.getElementById("login-error").style.display = "block";
    }
}

async function register() {
    const firstname = document.getElementById("register-firstname").value;
    const lastname = document.getElementById("register-lastname").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password, firstname, lastname}),
    });

    if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(TOKEN_KEY, data.token);
        window.location.href = "../index.html";
    } else {
        document.getElementById("register-error").textContent = "Erreur lors de l'inscription";
        document.getElementById("register-error").style.display = "block";
    }
}