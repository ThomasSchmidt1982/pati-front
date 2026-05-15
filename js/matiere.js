/* ============================================
   MATIERE.JS
   Gestion des matières premières
   ============================================ */

// ──────────────────────────────────────────────
//  INITIALISATION
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    loadStuffs();
});

// ──────────────────────────────────────────────
//  CRUD MATIÈRES PREMIÈRES
// ──────────────────────────────────────────────

// Charger toutes les matières d'une personne
async function loadStuffs() {
    const response = await fetch(`${API_STUFF}/person/${PERSON_ID}`);
    const stuffs = await response.json();
    const tbody = document.getElementById("stuff-list");
    tbody.innerHTML = "";

    stuffs.forEach(stuff => {
        tbody.innerHTML += `
            <tr>
                <td>${stuff.name}</td>
                <td class="d-none d-md-table-cell">${stuff.description || ""}</td>
                <td>${stuff.cost}€</td>
                <td>${stuff.packageQuantity}</td>
                <td>${stuff.unit}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editStuff(${stuff.id})">Modifier</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStuff(${stuff.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

// Créer une matière
async function createStuff(stuff) {
    const response = await fetch(`${API_STUFF}/person/${PERSON_ID}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(stuff),
    });
    if (!response.ok) alert("Erreur lors de la création");
    loadStuffs();
}

// Modifier une matière
async function updateStuff(stuffId, stuff) {
    const response = await fetch(`${API_STUFF}/${stuffId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(stuff),
    });
    if (!response.ok) alert("Erreur lors de la modification");
    loadStuffs();
}

// Supprimer une matière
async function deleteStuff(stuffId) {
    const response = await fetch(`${API_STUFF}/${stuffId}`, {
        method: "DELETE",
    });
    if (!response.ok) alert("Cette matière est utilisée dans une recette et ne peut pas être supprimée");
    loadStuffs();
}

// ──────────────────────────────────────────────
//  MODAL MATIÈRE (création & modification)
// ──────────────────────────────────────────────

let currentMode = null;

// Ouvrir le modal en mode création (champs vides)
function openCreateModal() {
    currentMode = "create";
    document.getElementById("modal-title").textContent = "Nouvelle matière";
    document.getElementById("edit-id").value = "";
    document.getElementById("edit-name").value = "";
    document.getElementById("edit-description").value = "";
    document.getElementById("edit-cost").value = "";
    document.getElementById("edit-packageQuantity").value = "";
    document.getElementById("edit-unit").value = "gram";
    new bootstrap.Modal(document.getElementById("editModal")).show();
}

// Ouvrir le modal en mode modification (pré-rempli)
function editStuff(stuffId) {
    currentMode = "edit";
    document.getElementById("modal-title").textContent = "Modifier la matière";
    fetch(`${API_STUFF}/${stuffId}`)
        .then(res => res.json())
        .then(stuff => {
            document.getElementById("edit-id").value = stuff.id;
            document.getElementById("edit-name").value = stuff.name;
            document.getElementById("edit-description").value = stuff.description || "";
            document.getElementById("edit-cost").value = stuff.cost;
            document.getElementById("edit-packageQuantity").value = stuff.packageQuantity;
            document.getElementById("edit-unit").value = stuff.unit;
            new bootstrap.Modal(document.getElementById("editModal")).show();
        });
}

// Soumettre le formulaire (création ou modification selon le mode)
function submitForm() {
    const stuff = {
        name: document.getElementById("edit-name").value,
        description: document.getElementById("edit-description").value,
        cost: document.getElementById("edit-cost").value,
        packageQuantity: document.getElementById("edit-packageQuantity").value,
        unit: document.getElementById("edit-unit").value,
    };
    if (currentMode === "create") {
        createStuff(stuff);
    } else {
        updateStuff(document.getElementById("edit-id").value, stuff);
    }
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
}