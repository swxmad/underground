import fs from "fs";
import path from "path";
import { cloudinary, isCloudinaryEnabled } from "../config/cloudinary.js";

export async function saveImage(file, folder) {
  if (!file?.buffer) {
    throw new Error("Файл изображения не передан");
  }

  if (isCloudinaryEnabled) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: `underground/${folder}`,
        resource_type: "image",
      }
    );

    return result.secure_url;
  }

  const uploadDir = path.join("uploads", folder);
  fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

  return `/uploads/${folder}/${filename}`;
}
