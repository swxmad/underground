export function formatImageUrl(image) {
  if (!image || typeof image !== "string") return image;
  if (image.startsWith("/api/media?")) return image;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return `/api/media?src=${encodeURIComponent(image)}`;
  }

  return image;
}

export function formatImagesDeep(data) {
  if (data == null) return data;

  if (Array.isArray(data)) {
    return data.map(formatImagesDeep);
  }

  if (typeof data !== "object") return data;

  if (typeof data.toJSON === "function") {
    return formatImagesDeep(data.toJSON());
  }

  const result = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "image" && typeof value === "string") {
      result[key] = formatImageUrl(value);
    } else {
      result[key] = formatImagesDeep(value);
    }
  }

  return result;
}
