/* ============================================
   PRODUIT.JS
   Gestion des produits, calcul de marges
   ============================================ */

// ──────────────────────────────────────────────
//  INITIALISATION
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();
});

// ──────────────────────────────────────────────
// CRUD PRODUITS
// ──────────────────────────────────────────────

// Charger tous les produits d'une personne
async function loadProducts() {
    const response = await fetch(`${API_PRODUCT}/person/${PERSON_ID}`);
    const products = await response.json();
    const tbody = document.getElementById("product-list");
    tbody.innerHTML = "";

    const rows = await Promise.all(products.map(async (product) => {
        let costData = "-";
        let rawCost = "-";
        let sellingPrice ="-";
        try {
            const costResponse = await fetch(`${API_PRODUCT}/${product.id}/cost`);
            if (costResponse.ok) {
                costData = await costResponse.json();
                rawCost = costData.rawCost;
                sellingPrice = costData.sellingPrice;
            }
        } catch (e) {}
        return `
        <tr>
            <td>${product.name}</td>
            <td class="d-none d-md-table-cell">${product.description || ""}</td>
            <td>${product.recipe?.name || ""}</td>
            <td>${rawCost.toFixed(2)} €</td>
            <td>${product.marginCoefficient}</td>
            <td>${sellingPrice.toFixed(2) || "-"} €</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">Modifier</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Supprimer</button>
            </td>
        </tr>
        `;
    }));

    tbody.innerHTML = rows.join("");
}

// Create un produit
async function createProduct(product) {
    const response = await fetch(`${API_PRODUCT}/person/${PERSON_ID}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(product),
    });
    if (!response.ok) alert("Erreur lors de la création");
    loadProducts();
}

// Modifier un produit
async function updateProduct(productId, product) {
    const response = await fetch(`${API_PRODUCT}/${productId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(product),
    });
    if(!response.ok) alert("Erreur lors de la modification");
    loadProducts();
}


// Effacer tous les produits d'une personne
async function deleteProduct(productId) {
    const response = await fetch(`${API_PRODUCT}/${productId}`, {
        method: "DELETE",
    });
    if (!response.ok) alert("Impossible de supprimer cette ligne");
    loadProducts();
}


// ──────────────────────────────────────────────
//  MODAL PRODUITS (création & modification)
// ──────────────────────────────────────────────
let currentMode = null;

// Charger les recettes dans le select
async function loadRecipes(){
    const response = await fetch(`${API_RECIPE}/person/${PERSON_ID}`);
    const recipes = await response.json();
    const select = document.getElementById("edit-recipeId");
    select.innerHTML = '<option value="" disabled selected>Choisir une recette</option>';
    recipes.forEach(recipe => {
        select.innerHTML += `<option value="${recipe.id}">${recipe.name}</option>`;
    });
    new bootstrap.Modal(document.getElementById("editModal")).show();
}

// ouvrir modal en mode création
async function openCreateModal() {
    currentMode = "create";
    document.getElementById("modal-title").textContent = "Nouveau produit";
    document.getElementById("edit-id").value = "";
    document.getElementById("edit-name").value = "";
    document.getElementById("edit-description").value = "";
    document.getElementById("edit-marginCoefficient").value = "";
    loadRecipes();
}

// ouvrir la modale en mode modification
async function editProduct(productId){
    currentMode = "edit";
    document.getElementById("modal-title").textContent = "Modifier le produit";
    fetch(`${API_PRODUCT}/${productId}`)
        .then(res => res.json())
        .then(product => {
            document.getElementById("edit-id").value = product.id;
            document.getElementById("edit-name").value = product.name;
            document.getElementById("edit-description").value = product.description || "";
            document.getElementById("edit-marginCoefficient").value = product.marginCoefficient || "";
            new bootstrap.Modal(document.getElementById("editModal")).show();
        });
}


function submitForm() {
    const product = {
        name: document.getElementById("edit-name").value,
        description: document.getElementById("edit-description").value,
        marginCoefficient: document.getElementById("edit-marginCoefficient").value,
        recipe: { id: document.getElementById("edit-recipeId").value },
    };
    if (currentMode === "create") {
        createProduct(product);
    }else {
        updateProduct(document.getElementById("edit-id").value, product);
    }
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();

}

