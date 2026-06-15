import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const handleUpload = (fieldName = "image") => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error("Ошибка загрузки файла:", err);
      return res.status(400).json({ message: "Ошибка загрузки изображения" });
    }
    next();
  });
};

export default upload;
