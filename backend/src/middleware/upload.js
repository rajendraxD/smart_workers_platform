import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, "..", "..", "uploads");
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedDocs = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedImages.includes(file.mimetype) || allowedDocs.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF, DOC"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadAvatar = upload.single("avatar");
export const uploadAttachment = upload.single("attachment");
