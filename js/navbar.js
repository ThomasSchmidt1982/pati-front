function loadNavbar(activePage) {
    document.body.insertAdjacentHTML("afterbegin", `
    <nav class="navbar navbar-expand bg-white border-bottom mb-4">
        <div class="container">
            <a class="navbar-brand fw-bold" href="../index.html">🧁 PatiCalcul</a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link ${activePage === 'matiere' ? 'active fw-bold' : ''}" href="matiere.html">Matières</a>
                <a class="nav-link ${activePage === 'recette' ? 'active fw-bold' : ''}" href="recette.html">Recettes</a>
                <a class="nav-link ${activePage === 'produit' ? 'active fw-bold' : ''}" href="produit.html">Produits</a>
            </div>
        </div>
    </nav>
    `);
}