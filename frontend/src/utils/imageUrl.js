const SERVER_URL = "https://underground-server.onrender.com";

export function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${SERVER_URL}${image}`;
}
