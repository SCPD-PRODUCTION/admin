// ==== FIREBASE CONFIG ====
const firebaseConfig = {
  apiKey: "AIzaSyC5gAbdlbVL3t6oreb_ZZhAUT1YJVTKwPU",
  authDomain: "scpd-production.firebaseapp.com",
  databaseURL: "https://scpd-production-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scpd-production",
  storageBucket: "scpd-production.appspot.com",
  messagingSenderId: "72136560829",
  appId: "1:72136560829:web:1c14d8087f9c3b88ade7d4",
  measurementId: "G-LGXCFVNFTH"
};

// ==== INISIALISASI FIREBASE ====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ==== LOGIN GOOGLE ====
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("Login berhasil:", user);

      // Simpan informasi user ke localStorage
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userPhoto", user.photoURL);

      alert("Login berhasil sebagai: " + user.email);

      // Tambahkan jeda kecil agar popup Google menutup sempurna sebelum redirect
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 400);
    })
    .catch((error) => {
      console.error("Login gagal:", error);
      alert("Login gagal: " + error.message);
    });
}

// ==== CEK STATUS LOGIN (untuk auto-redirect di index.html & dashboard.html) ====
auth.onAuthStateChanged((user) => {
  // Cek halaman saat ini
  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    console.log("Sudah login:", user.email);

    // Jika user buka index.html padahal sudah login → langsung ke dashboard
    if (currentPage === "index.html" || currentPage === "") {
      window.location.href = "dashboard.html";
    }

  } else {
    console.log("Belum login");

    // Jika user buka dashboard tanpa login → arahkan ke login
    if (currentPage === "dashboard.html") {
      window.location.href = "index.html";
    }
  }
});

// ==== LOGOUT ====
function logout() {
  auth.signOut().then(() => {
    localStorage.clear();
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Gagal logout:", error);
  });
}
