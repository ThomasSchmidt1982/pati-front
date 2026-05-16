/* ============================================
   RECETTE.JS
   Gestion des recettes et de leurs compositions
   ============================================ */

// ──────────────────────────────────────────────
//  INITIALISATION
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadRecipes();
});

// ──────────────────────────────────────────────
//  CRUD RECETTES
// ──────────────────────────────────────────────

// Charger toutes les recettes d'une personne
async function loadRecipes() {
    const response = await authFetch(`${API_RECIPE}`, {
    });
    const recipes = await response.json();
    const tbody = document.getElementById("recipe-list");
    tbody.innerHTML = "";

    recipes.forEach(recipe => {
        tbody.innerHTML += `
        <tr>
            <td>${recipe.name}</td>
            <td class="d-none d-md-table-cell">${recipe.description || ""}</td>
            <td>${recipe.targetQuantity || "-"} ${recipe.targetUnit || ""}</td>
            <td>
                <button class="btn btn-sm btn-info" id="btn-lines-${recipe.id}" onclick="toggleRecipeLines(${recipe.id})"><i class="bi bi-eye"></i><span class="d-none d-md-inline"> Afficher</span></button>
                <button class="btn btn-sm btn-warning" onclick="editRecipe(${recipe.id})"><i class="bi bi-pencil"></i><span class="d-none d-md-inline"> Modifier</span></button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecipe(${recipe.id})"><i class="bi bi-trash"></i><span class="d-none d-md-inline"> Supprimer</span></button>
            </td>
        </tr>
        <tr id="lines-${recipe.id}" class="collapse">
            <td colspan="3">
                <table class="table table-sm mb-0">
                    <thead>
                        <tr>
                            <th>Matière</th>
                            <th>Quantité</th>
                            <th>Unité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="recipeline-${recipe.id}"></tbody>
                </table>
                <button class="btn btn-sm btn-primary mt-2" onclick="openAddLineModal(${recipe.id})">Ajouter une matière</button>
            </td>
        </tr>
        `;
    });
}

// Créer une recette
async function createRecipe(recipe) {
    const response = await authFetch(`${API_RECIPE}`, {
        method: "POST",
        body: JSON.stringify(recipe),
    });
    if (!response.ok) alert("Erreur lors de la création");
    loadRecipes();
}

// Modifier une recette
async function updateRecipe(recipeId, recipe) {
    const response = await authFetch(`${API_RECIPE}/${recipeId}`, {
        method: "PUT",
        body: JSON.stringify(recipe),
    });
    if (!response.ok) alert("Erreur lors de la modification");
    loadRecipes();
}

// Supprimer une recette
async function deleteRecipe(recipeId) {
    const response = await authFetch(`${API_RECIPE}/${recipeId}`, {
        method: "DELETE",
    });
    if (!response.ok) alert("Erreur lors de la suppression");
    loadRecipes();
}

// ──────────────────────────────────────────────
//  MODAL RECETTE (création & modification)
// ──────────────────────────────────────────────

let currentMode = null;

// Ouvrir le modal en mode création
function openCreateModal() {
    currentMode = "create";
    document.getElementById("modal-title").textContent = "Nouvelle recette";
    document.getElementById("edit-id").value = "";
    document.getElementById("edit-name").value = "";
    document.getElementById("edit-description").value = "";
    document.getElementById("edit-targetQuantity").value = "";
    document.getElementById("edit-targetUnit").value = "gram";
    new bootstrap.Modal(document.getElementById("editModal")).show();
}

// Ouvrir le modal en mode modification (pré-rempli)
function editRecipe(recipeId) {
    currentMode = "edit";
    document.getElementById("modal-title").textContent = "Modifier la recette";
    authFetch(`${API_RECIPE}/${recipeId}`, {
    })
        .then(res => res.json())
        .then(recipe => {
            document.getElementById("edit-id").value = recipe.id;
            document.getElementById("edit-name").value = recipe.name;
            document.getElementById("edit-description").value = recipe.description || "";
            document.getElementById("edit-targetQuantity").value = recipe.targetQuantity || "";
            document.getElementById("edit-targetUnit").value = recipe.targetUnit || "gram";
            new bootstrap.Modal(document.getElementById("editModal")).show();
        });
}

// Soumettre le formulaire (création ou modification selon le mode)
function submitForm() {
    const recipe = {
        name: document.getElementById("edit-name").value,
        description: document.getElementById("edit-description").value,
        targetQuantity: document.getElementById("edit-targetQuantity").value,
        targetUnit: document.getElementById("edit-targetUnit").value,
    };
    if (currentMode === "create") {
        createRecipe(recipe);
    } else {
        updateRecipe(document.getElementById("edit-id").value, recipe);
    }
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
}

// ──────────────────────────────────────────────
//  RECIPE LINES (composition d'une recette)
// ──────────────────────────────────────────────

// Afficher / cacher les lignes d'une recette
async function toggleRecipeLines(recipeId) {
    const row = document.getElementById(`lines-${recipeId}`);
    const btn = document.getElementById(`btn-lines-${recipeId}`);

    if (row.classList.contains("show")) {
        row.classList.remove("show");
        btn.innerHTML = '<i class="bi bi-eye"></i><span class="d-none d-md-inline"> Afficher</span>';
        return;
    }

    await loadRecipeLines(recipeId);
    row.classList.add("show");
    btn.innerHTML = '<i class="bi bi-eye-slash"></i><span class="d-none d-md-inline"> Cacher</span>';
}

// Charger les lignes d'une recette dans le tableau collapsible
async function loadRecipeLines(recipeId) {
    const response = await authFetch(`${API_RECIPE_LINE}/recipe/${recipeId}`, {
    });
    const lines = await response.json();
    const tbody = document.getElementById(`recipeline-${recipeId}`);
    tbody.innerHTML = "";

    lines.forEach(line => {
        tbody.innerHTML += `
            <tr>
                <td>${line.stuff.name}</td>
                <td>${line.quantity}</td>
                <td>${line.unit}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecipeLine(${line.id}, ${recipeId})"><i class="bi bi-trash"></i><span class="d-none d-md-inline"> Supprimer</span></button>
                </td>
            </tr>
        `;
    });
}

// Supprimer une ligne et rafraîchir
async function deleteRecipeLine(recipeLineId, recipeId) {
    const response = await authFetch(`${API_RECIPE_LINE}/${recipeLineId}`, {
        method: "DELETE",
    });
    if (!response.ok) alert("Impossible de supprimer cette ligne");
    loadRecipeLines(recipeId);
}

// ──────────────────────────────────────────────
//  MODAL RECIPE LINE (ajout d'une matière)
// ──────────────────────────────────────────────

// Ouvrir le modal d'ajout de matière à une recette
async function openAddLineModal(recipeId) {
    document.getElementById("line-recipeId").value = recipeId;
    document.getElementById("line-quantity").value = "";
    document.getElementById("line-unit").value = "";

    // Charger la liste des matières disponibles
    const response = await authFetch(`${API_STUFF}`, {
    });
    const stuffs = await response.json();
    const select = document.getElementById("line-stuffId");
    select.innerHTML = "";
    select.innerHTML = '<option value="" disabled selected>Choisir une matière</option>';
    stuffs.forEach(stuff => {
        select.innerHTML += `<option value="${stuff.id}" data-unit="${stuff.unit}">${stuff.name} (${stuff.unit})</option>`;
    });

// Auto-remplir l'unité quand on change le stuff
    document.getElementById("line-stuffId").onchange = function() {
        const selected = this.options[this.selectedIndex];
        document.getElementById("line-unit").value = selected.dataset.unit;
    };
    new bootstrap.Modal(document.getElementById("addLineModal")).show();
}

// Soumettre l'ajout d'une matière à la recette
async function submitAddLine() {
    const recipeId = document.getElementById("line-recipeId").value;
    const stuffId = document.getElementById("line-stuffId").value;
    const recipeLine = {
        quantity: document.getElementById("line-quantity").value,
        unit: document.getElementById("line-unit").value,
    };

    const response = await authFetch(`${API_RECIPE_LINE}/${recipeId}/${stuffId}`, {
        method: "POST",
        body: JSON.stringify(recipeLine),
    });
    if (!response.ok) alert("Erreur lors de l'ajout");

    bootstrap.Modal.getInstance(document.getElementById("addLineModal")).hide();
    await loadRecipeLines(recipeId);
}