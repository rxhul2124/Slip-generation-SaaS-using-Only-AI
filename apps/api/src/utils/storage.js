import { cloudinary } from "../config/cloudinary.js";

export async function uploadAsset(file, folder = "packslip") {
  if (!file) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return {
      provider: "local",
      url: `/uploads/${file.filename}`,
      publicId: file.filename,
      bytes: file.size,
      mimeType: file.mimetype
    };
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: "auto"
  });

  return {
    provider: "cloudinary",
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    mimeType: file.mimetype
  };
}
