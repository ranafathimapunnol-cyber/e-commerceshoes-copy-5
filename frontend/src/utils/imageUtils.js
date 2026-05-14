export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `/media/${imagePath}`;
};

export const getProductImageUrl = (product) => {
  if (product?.image) {
    return getImageUrl(product.image);
  }
  return '/placeholder.jpg';
};
