const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "receita-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|gif|webp/;
  const extOk = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = tiposPermitidos.test(file.mimetype.split("/")[1]);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens (jpg, png, gif, webp) são permitidas."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
