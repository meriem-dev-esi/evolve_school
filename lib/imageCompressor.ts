/**
 * Client-side file validation and image compression utility.
 * Enforces strict upload limits (max 5MB) and reduces image dimensions/quality
 * before uploading to Supabase Storage.
 */

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(
  file: File,
  maxSizeBytes = MAX_UPLOAD_SIZE_BYTES,
  allowedTypes = ALLOWED_IMAGE_TYPES,
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Format de fichier non supporté (${file.type || "inconnu"}). Formats autorisés : JPG, PNG, WEBP.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Le fichier est trop lourd (${sizeMb} Mo). La taille maximale autorisée est de ${maxMb} Mo.`,
    };
  }

  return { valid: true };
}

/**
 * Compresses an image file in the browser using an off-screen canvas.
 * Reduces dimensions to maxDimension (default 1600px) and quality (default 0.82).
 */
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<File> {
  // Only compress raster images
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Keep original if compressed isn't smaller
            resolve(file);
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);

    reader.readAsDataURL(file);
  });
}
