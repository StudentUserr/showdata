import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Your Firebase config:
const firebaseConfig = {
  apiKey: "AIzaSyD-rWV2rQ-CIksd825JxJw5Hlb430hm2Eo",
  authDomain: "armoire-equipments.firebaseapp.com",
  projectId: "armoire-equipments",
  storageBucket: "armoire-equipments.firebasestorage.app",
  messagingSenderId: "893663162061",
  appId: "1:893663162061:web:de1b3b8b611d47482c8384"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const equipmentRef = collection(db, "equipment");

// Load and render equipment; filter by search string (lowercase)
async function loadEquipment(filter = "") {
  const snapshot = await getDocs(equipmentRef);
  const tableBody = document.querySelector("#equipmentTable tbody");
  tableBody.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const match = data.name.toLowerCase().includes(filter) || (data.armoire || "").toLowerCase().includes(filter);
    if (!match) return;

    const row = document.createElement("tr");

    // Equipment Name cell
    const nameCell = document.createElement("td");
    nameCell.textContent = data.name;

    // Datasheet cell with expandable button
    const sheetCell = document.createElement("td");
    const button = document.createElement("button");
    button.textContent = "View Datasheet";
    button.className = "expand-btn";

    const datasheet = document.createElement("p");
    datasheet.textContent = data.datasheet;
    datasheet.style.display = "none";
    datasheet.style.whiteSpace = "pre-wrap";

    button.onclick = () => {
      datasheet.style.display = datasheet.style.display === "none" ? "block" : "none";
    };

    sheetCell.appendChild(button);
    sheetCell.appendChild(datasheet);

    // Armoire Number cell
    const armoireCell = document.createElement("td");
    armoireCell.textContent = data.armoire || "—";

    // Actions cell with Delete button
    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    deleteBtn.onclick = async () => {
      if (confirm(`Delete equipment "${data.name}"?`)) {
        await deleteDoc(doc(db, "equipment", docSnap.id));
        loadEquipment(filter);
      }
    };

    actionCell.appendChild(deleteBtn);

    row.appendChild(nameCell);
    row.appendChild(sheetCell);
    row.appendChild(armoireCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

// Add equipment handler
document.getElementById("addForm").addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("equipName").value.trim();
  const datasheet = document.getElementById("datasheetText").value.trim();
  const armoire = document.getElementById("armoireNumber").value.trim();

  if (!name || !datasheet || !armoire) {
    alert("Please fill in all fields.");
    return;
  }

  await addDoc(equipmentRef, { name, datasheet, armoire });

  e.target.reset();
  loadEquipment();
});

// Search input filter
document.getElementById("searchInput").addEventListener("input", e => {
  const filter = e.target.value.trim().toLowerCase();
  loadEquipment(filter);
});

// Initial load
loadEquipment();
