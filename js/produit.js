/* ============================================
   PRODUIT.JS
   Gestion des produits et de leurs compositions
   (recettes via ProductLine), calcul de coûts
   ============================================ */

// ──────────────────────────────────────────────
//  INITIALISATION
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadProducts();
});

// ──────────────────────────────────────────────
//  CRUD PRODUITS
// ──────────────────────────────────────────────

// Charger tous les produits de l'utilisateur connecté
async function loadProducts() {
    const response = await authFetch(`${API_PRODUCT}`);
    const products = await response.json();
    const tbody = document.getElementById("product-list");
    tbody.innerHTML = "";

    const rows = await Promise.all(products.map(async (product) => {
        // Récupérer le coût et le prix de vente
        let rawCost = "-";
        let sellingPrice = "-";
        try {
            const costResponse = await authFetch(`${API_PRODUCT}/${product.id}/cost`);
            if (costResponse.ok) {
                const costData = await costResponse.json();
                rawCost = costData.rawCost;
                sellingPrice = costData.sellingPrice;
            }
        } catch (e) {
        }

        return `
        <tr>
            <td>${product.name}</td>
            <td class="d-none d-md-table-cell">${product.description || ""}</td>
            <td id="cost-${product.id}">${typeof rawCost === "number" ? rawCost.toFixed(2) + " €" : "-"}</td>
            <td class="d-none d-md-table-cell">${product.marginCoefficient}</td>
            <td id="price-${product.id}">${typeof sellingPrice === "number" ? sellingPrice.toFixed(2) + " €" : "-"}</td>
            <td>
                <button class="btn btn-sm btn-info" id="btn-lines-${product.id}" onclick="toggleProductLines(${product.id})"><i class="bi bi-eye"></i><span class="d-none d-md-inline"> Recette</span></button>
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})"><i class="bi bi-pencil"></i><span class="d-none d-md-inline"> Modifier</span></button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})"><i class="bi bi-trash"></i><span class="d-none d-md-inline"> Supprimer</span></button>
            </td>
        </tr>
        <tr id="lines-${product.id}" class="collapse">
            <td colspan="6">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th>Recette</th>
                            <th>Quantité</th>
                            <th>Unité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="productline-${product.id}"></tbody>
                </table>
                <button class="btn btn-sm btn-primary mt-2" onclick="openAddLineModal(${product.id})">Ajouter une recette</button>
            </td>
        </tr>
        `;
    }));

    tbody.innerHTML = rows.join("");
}

// Créer un produit
async function createProduct(product) {
    const response = await authFetch(`${API_PRODUCT}`, {
        method: "POST",
        body: JSON.stringify(product),
    });
    if (!response.ok) alert("Erreur lors de la création");
    await loadProducts();
}

// Modifier un produit
async function updateProduct(productId, product) {
    const response = await authFetch(`${API_PRODUCT}/${productId}`, {
        method: "PUT",
        body: JSON.stringify(product),
    });
    if (!response.ok) alert("Erreur lors de la modification");
    await loadProducts();
}

// Supprimer un produit
async function deleteProduct(productId) {
    const response = await authFetch(`${API_PRODUCT}/${productId}`, {
        method: "DELETE",
    });
    if (!response.ok) alert("Impossible de supprimer ce produit");
    await loadProducts();
}

// ──────────────────────────────────────────────
//  MODAL PRODUIT (création & modification)
// ──────────────────────────────────────────────

let currentMode = null;

// Ouvrir le modal en mode création (champs vides)
async function openCreateModal() {
    currentMode = "create";
    document.getElementById("modal-title").textContent = "Nouveau produit";
    document.getElementById("edit-id").value = "";
    document.getElementById("edit-name").value = "";
    document.getElementById("edit-description").value = "";
    document.getElementById("edit-marginCoefficient").value = "";
    new bootstrap.Modal(document.getElementById("editModal")).show();
}

// Ouvrir le modal en mode modification (pré-rempli)
async function editProduct(productId) {
    currentMode = "edit";
    document.getElementById("modal-title").textContent = "Modifier le produit";
    const response = await authFetch(`${API_PRODUCT}/${productId}`);
    const product = await response.json();
    document.getElementById("edit-id").value = product.id;
    document.getElementById("edit-name").value = product.name;
    document.getElementById("edit-description").value = product.description || "";
    document.getElementById("edit-marginCoefficient").value = product.marginCoefficient || "";
    new bootstrap.Modal(document.getElementById("editModal")).show();
}

// Soumettre le formulaire (création ou modification selon le mode)
function submitForm() {
    const product = {
        name: document.getElementById("edit-name").value,
        description: document.getElementById("edit-description").value,
        marginCoefficient: document.getElementById("edit-marginCoefficient").value,
    };
    if (currentMode === "create") {
        createProduct(product);
    } else {
        updateProduct(document.getElementById("edit-id").value, product);
    }
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
}

// ──────────────────────────────────────────────
//  PRODUCT LINES (recettes d'un produit)
// ──────────────────────────────────────────────

// Afficher / cacher les recettes d'un produit
async function toggleProductLines(productId) {
    const row = document.getElementById(`lines-${productId}`);
    const btn = document.getElementById(`btn-lines-${productId}`);

    if (row.classList.contains("show")) {
        row.classList.remove("show");
        btn.innerHTML = '<i class="bi bi-eye"></i><span class="d-none d-md-inline"> Recette</span>';
        return;
    }

    await loadProductLines(productId);
    row.classList.add("show");
    btn.innerHTML = '<i class="bi bi-eye-slash"></i><span class="d-none d-md-inline"> Cacher</span>';
}

// Charger les recettes d'un produit dans le tableau collapsible
async function loadProductLines(productId) {
    const response = await authFetch(`${API_PRODUCT_LINE}/product/${productId}`);
    const lines = await response.json();
    const tbody = document.getElementById(`productline-${productId}`);
    tbody.innerHTML = "";

    lines.forEach(line => {
        tbody.innerHTML += `
            <tr>
                <td>${line.recipe.name}</td>
                <td>${line.quantity}</td>
                <td>${line.unit}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteProductLine(${line.id}, ${productId})"><i class="bi bi-trash"></i><span class="d-none d-md-inline"> Supprimer</span></button>
                </td>
            </tr>
        `;
    });
}

// Supprimer une recette du produit, rafraîchir lignes et coût
async function deleteProductLine(productLineId, productId) {
    const response = await authFetch(`${API_PRODUCT_LINE}/${productLineId}`, {
        method: "DELETE",
    });
    if (!response.ok) alert("Impossible de supprimer cette ligne");
    await loadProductLines(productId);
    await refreshProductCost(productId);
}

// Mettre à jour le coût affiché sans reconstruire le tableau
async function refreshProductCost(productId) {
    try {
        const response = await authFetch(`${API_PRODUCT}/${productId}/cost`);
        if (response.ok) {
            const costData = await response.json();
            document.getElementById(`cost-${productId}`).textContent = costData.rawCost.toFixed(2) + " €";
            document.getElementById(`price-${productId}`).textContent = costData.sellingPrice.toFixed(2) + " €";
        }
    } catch (e) {
    }
}

// ──────────────────────────────────────────────
//  MODAL PRODUCT LINE (ajout d'une recette)
// ──────────────────────────────────────────────

// Ouvrir le modal d'ajout de recette à un produit
async function openAddLineModal(productId) {
    document.getElementById("line-productId").value = productId;
    document.getElementById("line-quantity").value = "";
    document.getElementById("line-unit").value = "";

    // Charger la liste des recettes disponibles
    const response = await authFetch(`${API_RECIPE}`);
    const recipes = await response.json();
    const select = document.getElementById("line-recipeId");
    select.innerHTML = '<option value="" disabled selected>Choisir une recette</option>';
    recipes.forEach(recipe => {
        select.innerHTML += `<option value="${recipe.id}" data-unit="${recipe.targetUnit || ""}">${recipe.name} (${recipe.targetQuantity || "?"} ${recipe.targetUnit || "?"})</option>`;
    });

// Auto-remplir l'unité quand on change la recette
    document.getElementById("line-recipeId").onchange = function() {
        const selected = this.options[this.selectedIndex];
        document.getElementById("line-unit").value = selected.dataset.unit;
    };
    new bootstrap.Modal(document.getElementById("addLineModal")).show();
}

// Soumettre l'ajout d'une recette au produit
async function submitAddLine() {
    const productId = document.getElementById("line-productId").value;
    const recipeId = document.getElementById("line-recipeId").value;
    const productLine = {
        quantity: document.getElementById("line-quantity").value,
        unit: document.getElementById("line-unit").value,
    };

    const response = await authFetch(`${API_PRODUCT_LINE}/${productId}/${recipeId}`, {
        method: "POST",
        body: JSON.stringify(productLine),
    });
    if (!response.ok) {
        alert("Erreur lors de l'ajout");
        return;
    }

    bootstrap.Modal.getInstance(document.getElementById("addLineModal")).hide();
    await loadProductLines(productId);
    await refreshProductCost(productId);
}