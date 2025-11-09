import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" })); // Biar bisa upload gambar base64

const GITHUB_REPO = "SCPD-PRODUCTION/web-utama";
const FILE_PATH = "produk.json";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const TOKEN = process.env.GITHUB_TOKEN; // simpan token di .env (jangan di kode)

app.post("/add-product", async (req, res) => {
  try {
    const { judul, deskripsi, harga, foto } = req.body;

    // Ambil data produk lama
    const getRes = await fetch(GITHUB_API, {
      headers: { Authorization: `token ${TOKEN}` },
    });
    const oldData = await getRes.json();

    let produkList = [];
    let sha = null;

    if (oldData.content) {
      const decoded = Buffer.from(oldData.content, "base64").toString("utf-8");
      produkList = JSON.parse(decoded);
      sha = oldData.sha;
    }

    // Tambah produk baru
    produkList.push({ judul, deskripsi, harga, foto });

    const newContent = Buffer.from(JSON.stringify(produkList, null, 2)).toString("base64");

    // Push ke GitHub
    const updateRes = await fetch(GITHUB_API, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Tambah produk: ${judul}`,
        content: newContent,
        sha: sha || undefined,
      }),
    });

    const result = await updateRes.json();
    res.json({ success: true, commit: result.commit.sha });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
