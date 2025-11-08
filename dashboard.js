import { auth, db, storage } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

const logoutBtn = document.getElementById("logoutBtn");
const addBtn = document.getElementById("addProductBtn");
const productContainer = document.getElementById("productContainer");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

addBtn.addEventListener("click", async () => {
  const title = prompt("Judul produk:");
  const desc = prompt("Deskripsi produk:");
  const price = prompt("Harga produk:");
  const file = await selectFile();

  if (!title || !desc || !price || !file) return;

  const storageRef = ref(storage, "produk/" + file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "produk"), { title, desc, price, url });
  alert("Produk berhasil ditambahkan!");
  loadProducts();
});

async function loadProducts() {
  productContainer.innerHTML = "";
  const snapshot = await getDocs(collection(db, "produk"));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const item = document.createElement("div");
    item.classList.add("product-card");
    item.innerHTML = `
      <img src="${data.url}" />
      <h3>${data.title}</h3>
      <p>${data.desc}</p>
      <span>Rp ${data.price}</span>
      <button class="delete-btn">Hapus</button>
    `;
    item.querySelector(".delete-btn").addEventListener("click", async () => {
      await deleteDoc(doc(db, "produk", docSnap.id));
      loadProducts();
    });
    productContainer.appendChild(item);
  });
}

function selectFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });
}

loadProducts();
