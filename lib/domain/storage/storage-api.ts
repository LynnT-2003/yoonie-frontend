import { postFileRequest } from "../api/NetworkManager";
import { apiPath } from "../../config/api-path";

export type StorageFolder = "rooms" | "branches" | "restaurants" | "services" | "avatars";

export type UploadResult = {
  url: string;
  key: string;
  contentType?: string;
  sizeBytes?: number;
};

/**
 * Uploads an image file to Cloudflare R2 storage via the backend storage endpoint.
 * Returns the public CDN / R2 URL and object key.
 */
export async function uploadMedia(file: File, folder: StorageFolder): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return postFileRequest<UploadResult>(
    apiPath(`storage/upload?folder=${encodeURIComponent(folder)}`),
    formData
  );
}
