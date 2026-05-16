const API_BASE = "http://localhost:8080";
const API_STUFF = `${API_BASE}/stuffs`;
const API_PERSON = `${API_BASE}/persons`;
const API_RECIPE = `${API_BASE}/recipes`;
const API_RECIPE_LINE = `${API_BASE}/recipelines`;
const API_PRODUCT = `${API_BASE}/products`;
const API_PRODUCT_LINE = `${API_BASE}/productlines`;
const API_PROCESS = `${API_BASE}/processes`;

const TOKEN_KEY = "pati_token";

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

async function authFetch(url, options = {}) {
    options.headers = authHeaders();
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403){
        logout();
    }
    return response;
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken(),
    };
}

function checkAuth() {
    if (!getToken()) {
        window.location.href = window.location.pathname.includes("/html/")
            ? "login.html"
            : "html/login.html";
    }
}

function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    checkAuth();
}

function getUser() {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
}