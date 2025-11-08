// dashboard.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, limit, getDocs, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getStorage, ref as sRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

/* =========================
   IMPORTANT: ganti konfigurasi ini dengan milikmu
   ========================= */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
/* ====================================================== */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

/* ---------- UI elems ---------- */
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebar = document.getElementById('closeSidebar');
const menuItems = document.querySelectorAll('.menu-item');
const panels = document.querySelectorAll('.panel');
const tambahBtn = document.getElementById('tambahBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const productsList = document.getElementById('productsList');
const panelStatus = document.getElementById('panelStatus');
const topProducts = document.getElementById('topProducts');
const topAdmins = document.getElementById('topAdmins');
const adminNameInput = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');

const prodName = document.getElementById('prodName');
const prodDesc = document.getElementById('prodDesc');
const prodPrice = document.getElementById('prodPrice');
const prodImage = document.getElementById('prodImage');

/* ---------- Sidebar behavior ---------- */
function openSidebar(){ sidebar.classList.add('open'); overlay.classList.add('show'); sidebar.setAttribute('aria-hidden','false'); }
function closeSidebarFn(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); sidebar.setAttribute('aria-hidden','true'); }

menuBtn.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', closeSidebarFn);
overlay.addEventListener('click', closeSidebarFn);

/* sidebar menu clicks -> switch panels and auto-close */
menuItems.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const target = e.currentTarget.dataset.target;
    panels.forEach(p => p.classList.remove('active'));
    const activePanel = document.getElementById(target);
    if(activePanel) activePanel.classList.add('active');

    // close sidebar automatically
    closeSidebarFn();

    // load analytics when requested
    if(target === 'panel-analytics-products') loadTopProducts();
    if(target === 'panel-analytics-admin') loadTopAdmins();
  });
});

/* logout goes to index.html */
logoutBtn.addEventListener('click', ()=>{
  if(confirm('Keluar dari dashboard?')) location.href = 'index.html';
});

/* default admin name from localStorage */
const storedAdmin = localStorage.getItem('scpd_admin') || 'admin';
adminNameInput.value = storedAdmin;
adminNameInput.addEventListener('change', ()=>{
  localStorage.setItem('scpd_admin', adminNameInput.value.trim() || 'admin');
});

/* ---------- Modal behavior ---------- */
function openModal(){ modalBackdrop.classList.add('show'); modalBackdrop.setAttribute('aria-hidden','false'); }
function closeModal(){ modalBackdrop.classList.remove('show'); modalBackdrop.setAttribute('aria-hidden','true'); resetForm(); }
function resetForm(){
  prodName.value = ''; prodDesc.value = ''; prodPrice.value = ''; prodImage.value = '';
}
tambahBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e)=>{ if(e.target === modalBackdrop) closeModal(); });

/* ---------- Firestore references ---------- */
const productsCol = collection(db, 'products');
const activityCol = collection(db, 'adminActivity');

/* ---------- Save product with optional image upload ---------- */
saveBtn.addEventListener('click', async ()=>{
  const name = prodName.value.trim();
  const desc = prodDesc.value.trim();
  const price = Number(prodPrice.value) || 0;
  const file = prodImage.files[0] || null;
  const admin = adminNameInput.value.trim() || 'admin';

  if(!name){
    alert('Nama produk wajib diisi.');
    return;
  }

  saveBtn.disabled = true; saveBtn.textContent = 'Menyimpan...';

  try {
    let imageUrl = '';
    if(file){
      const path = `products/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
      const storageRef = sRef(storage, path);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(productsCol, {
      name, desc, price, imageUrl, likes: 0, createdAt: serverTimestamp(), createdBy: admin
    });

    // record admin activity
    await addDoc(activityCol, {
      admin, action: 'add_product', productId: docRef.id, ts: serverTimestamp()
    });

    closeModal();
  } catch (err){
    console.error('Gagal simpan produk:', err);
    alert('Gagal menyimpan produk. Lihat console untuk detail.');
  } finally {
    saveBtn.disabled = false; saveBtn.textContent = 'Simpan';
  }
});

/* ---------- Real-time products listener ---------- */
onSnapshot(productsCol, (snapshot)=>{
  productsList.innerHTML = '';
  if(snapshot.empty){
    panelStatus.textContent = 'Belum ada produk. Tambah produk untuk mengisi.';
    topProducts.innerHTML = 'Belum ada data.';
    return;
  }

  panelStatus.textContent = `Menampilkan ${snapshot.size} produk`;
  snapshot.forEach(docSnap => {
    const id = docSnap.id;
    const data = docSnap.data();

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;

    const img = document.createElement('img');
    img.alt = data.name || 'produk';
    img.src = data.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%" height="100%" fill="%230a0a0a"/><text x="50%" y="50%" fill="%23ffd57a" font-size="18" text-anchor="middle" dy=".3em">No Image</text></svg>';

    const h4 = document.createElement('h4'); h4.textContent = data.name || 'Tanpa nama';
    const p = document.createElement('p'); p.textContent = data.desc || '';
    const price = document.createElement('div'); price.className='price'; price.textContent = data.price ? `Rp ${Number(data.price).toLocaleString('id-ID')}` : '';

    const actions = document.createElement('div'); actions.className = 'card-actions';
    const likeBtn = document.createElement('button'); likeBtn.className='btn-small'; likeBtn.textContent = `❤ ${data.likes || 0}`;
    const delBtn = document.createElement('button'); delBtn.className='btn-small'; delBtn.textContent = 'Hapus';

    // like: increment likes field and record activity
    likeBtn.addEventListener('click', async ()=>{
      try {
        const docRef = doc(db, 'products', id);
        // optimistic UI: increment locally then update
        await updateDoc(docRef, { likes: (data.likes || 0) + 1 });
        await addDoc(activityCol, { admin: adminNameInput.value || 'admin', action: 'like', productId: id, ts: serverTimestamp() });
      } catch (e){
        console.error('like error', e);
        alert('Gagal memberi like.');
      }
    });

    // delete: confirm then delete doc; record activity
    delBtn.addEventListener('click', async ()=>{
      if(!confirm('Hapus produk ini?')) return;
      try {
        await deleteDoc(doc(db, 'products', id));
        await addDoc(activityCol, { admin: adminNameInput.value || 'admin', action: 'delete_product', productId: id, ts: serverTimestamp() });
      } catch (e){
        console.error('hapus error', e);
        alert('Gagal menghapus produk.');
      }
    });

    actions.appendChild(likeBtn);
    actions.appendChild(delBtn);

    card.appendChild(img);
    card.appendChild(h4);
    card.appendChild(p);
    card.appendChild(price);
    card.appendChild(actions);

    productsList.appendChild(card);
  });
}, (err) => {
  console.error('listen products error', err);
  panelStatus.textContent = 'Gagal mengambil produk (cek console).';
});

/* ---------- Analytics: Top products by likes (realtime-ish) ---------- */
async function loadTopProducts(){
  try {
    // order by likes desc, limit 5
    const q = query(productsCol, orderBy('likes', 'desc'), limit(5));
    const snap = await getDocs(q);
    if(snap.empty){
      topProducts.innerHTML = '<div class="analytics-item">Belum ada produk.</div>';
      return;
    }
    topProducts.innerHTML = '';
    snap.forEach(d=>{
      const data = d.data();
      const el = document.createElement('div'); el.className='analytics-item';
      el.innerHTML = `<strong>${data.name || 'Tanpa nama'}</strong>
                      <div class="muted">Likes: ${data.likes || 0} · Harga: ${data.price ? 'Rp '+Number(data.price).toLocaleString('id-ID') : '-'}</div>
                      <div style="margin-top:6px;font-size:13px;color:var(--muted)">${(data.desc||'')}</div>`;
      topProducts.appendChild(el);
    });
  } catch (e){
    console.error('loadTopProducts', e);
    topProducts.innerHTML = '<div class="analytics-item">Gagal memuat analitik produk.</div>';
  }
}

/* ---------- Analytics: Admin activity (count actions per admin in last 30 days) ---------- */
async function loadTopAdmins(){
  try {
    const now = Date.now();
    const days30 = 1000 * 60 * 60 * 24 * 30;
    // we don't have server-side timestamp queries easily with modular SDK without importing Timestamp,
    // so we'll fetch recent entries and aggregate client-side (works for modest dataset)
    const recent = await getDocs(activityCol);
    const counts = {};
    recent.forEach(docSnap=>{
      const d = docSnap.data();
      // d.ts may be a Firestore Timestamp or null; try to normalize
      let t = d.ts;
      let tsMillis = 0;
      if(t && t.toMillis) tsMillis = t.toMillis();
      else if(t && typeof t === 'number') tsMillis = t;
      else tsMillis = Date.now(); // fallback: treat as recent

      if((now - tsMillis) <= days30){
        const name = d.admin || 'admin';
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    // transform to array and sort
    const arr = Object.entries(counts).map(([admin, cnt])=>({admin, cnt}));
    arr.sort((a,b)=>b.cnt - a.cnt);

    if(arr.length === 0){
      topAdmins.innerHTML = '<div class="analytics-item">Belum ada aktivitas admin dalam 30 hari.</div>';
      return;
    }

    topAdmins.innerHTML = '';
    arr.forEach(item=>{
      const el = document.createElement('div'); el.className='analytics-item';
      el.innerHTML = `<strong>${item.admin}</strong><div class="muted">${item.cnt} aksi (30 hari)</div>`;
      topAdmins.appendChild(el);
    });
  } catch (e){
    console.error('loadTopAdmins', e);
    topAdmins.innerHTML = '<div class="analytics-item">Gagal memuat analitik admin.</div>';
  }
}

/* Load analytics when panels open (handled earlier on menu click)
   Also refresh topProducts periodically (optional) */
setInterval(() => {
  // if analytics panel visible, refresh
  if(document.getElementById('panel-analytics-products').classList.contains('active')) loadTopProducts();
  if(document.getElementById('panel-analytics-admin').classList.contains('active')) loadTopAdmins();
}, 1000 * 30); // refresh every 30s

/* initial: show dashboard panel */
document.addEventListener('DOMContentLoaded', ()=>{
  // place any init code here
  // ensure adminName stored
  if(!localStorage.getItem('scpd_admin')) localStorage.setItem('scpd_admin', adminNameInput.value || 'admin');
});
