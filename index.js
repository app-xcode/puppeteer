import fs from "fs";
import path from "path";

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*"); // CORS
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  const filePath = path.join(process.cwd(), "komentar.json");

  // Buat file kosong kalau belum ada
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  // Load data JSON
  const rawData = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(rawData);

  // Fungsi waktu relatif
  function waktuRelatif(timestamp) {
    const detik = Math.floor(Date.now() / 1000) - Math.floor(new Date(timestamp).getTime() / 1000);
    if (detik < 60) return "sekarang";
    else if (detik < 3600) return Math.floor(detik / 60) + " menit lalu";
    else if (detik < 86400) return Math.floor(detik / 3600) + " jam lalu";
    else if (detik < 604800) return Math.floor(detik / 86400) + " hari lalu";
    else if (detik < 2592000) return Math.floor(detik / 604800) + " minggu lalu";
    else if (detik < 31536000) return Math.floor(detik / 2592000) + " bulan lalu";
    else return Math.floor(detik / 31536000) + " tahun lalu";
  }

  // Fungsi singkat nama
  function singkatNama(nama) {
    const parts = nama.trim().split(" ");
    if (parts.length <= 2) return nama;
    let hasil = parts[0];
    for (let i = 1; i < parts.length - 1; i++) {
      hasil += " " + parts[i].charAt(0).toUpperCase() + ".";
    }
    hasil += " " + parts[parts.length - 1];
    return hasil;
  }

  // Handle POST → simpan komentar
  if (req.method === "POST") {
    const { nama, pesan } = req.body;

    if (!nama || !pesan) {
      return res.status(400).json({ success: false, message: "Nama & pesan wajib diisi" });
    }

    const newKomentar = {
      id: Date.now(),
      nama,
      pesan,
      waktu: new Date().toISOString()
    };

    data.push(newKomentar);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return res.json({ success: true, message: "Komentar berhasil disimpan" });
  }

  // Handle GET → ambil semua komentar
  const komentar = data
    .sort((a, b) => b.id - a.id)
    .map(k => ({
      id: k.id,
      nama: singkatNama(k.nama),
      pesan: k.pesan,
      waktu: waktuRelatif(k.waktu),
      avatar: `https://framer-university.boringavatars.dev/api/avatar?variant=marble&square&name=${encodeURIComponent(singkatNama(k.nama))}`
    }));

  res.json(komentar);
}
