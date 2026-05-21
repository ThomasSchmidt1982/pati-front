function loadNavbar(activePage) {
    const user = getUser();
    const userName = user ? user.firstname + " " + user.lastname : "";
    const userRole = user ? (user.role === "ROLE_ADMIN" ? "Admin" : "Pâtissier") : "";
    const badgeColor = user?.role === "ROLE_ADMIN" ? "bg-danger" : "bg-primary";

    const prefix = window.location.pathname.includes("/html/") ? "" : "html/";
    const indexPath = window.location.pathname.includes("/html/") ? "../index.html" : "index.html";

    document.body.insertAdjacentHTML("afterbegin", `
    <nav class="navbar navbar-expand-md bg-white border-bottom mb-4">
        <div class="container">
            <a class="navbar-brand fw-bold" href="${indexPath}">🧁 PatiCalcul</a>
            <span class="d-md-none text-secondary small">👤 ${userName}</span>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                <div class="navbar-nav ms-auto">
                    <a class="nav-link ${activePage === 'matiere' ? 'active fw-bold' : ''}" href="${prefix}matiere.html">Matières</a>
                    <a class="nav-link ${activePage === 'recette' ? 'active fw-bold' : ''}" href="${prefix}recette.html">Recettes</a>
                    <a class="nav-link ${activePage === 'produit' ? 'active fw-bold' : ''}" href="${prefix}produit.html">Produits</a>
                    <a class="nav-link ${activePage === 'help' ? 'active fw-bold' : ''}" href="${prefix}help.html">Help</a>
                    <hr class="d-md-none">
                    <span class="nav-link text-secondary d-none d-md-inline">👤 ${userName} <span class="badge ${badgeColor}">${userRole}</span></span>
                    <a class="nav-link text-danger" href="#" onclick="logout()">Déconnexion</a>
                </div>
            </div>
        </div>
    </nav>
    `);
}