export interface ImageData {
  data: string;
  metadata: {
    originalSize: { width: number; height: number };
    normalizedSize: { width: number; height: number };
  };
}

export const processImage = async (file: File): Promise<ImageData> => {
  // Create a canvas for image processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load image
  const img = await createImageBitmap(file);

  // Calculate dimensions for 896x896
  const { width, height } = calculateDimensions(img.width, img.height, 896);

  // Set canvas size and draw
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return {
    data: canvas.toDataURL('image/jpeg', 0.9),
    metadata: {
      originalSize: { width: img.width, height: img.height },
      normalizedSize: { width, height },
    },
  };
};

export const calculateDimensions = (
  width: number,
  height: number,
  targetSize: number
): { width: number; height: number } => {
  const aspectRatio = width / height;

  if (aspectRatio > 1) {
    // Image is wider than tall
    return {
      width: targetSize,
      height: Math.round(targetSize / aspectRatio),
    };
  } else {
    // Image is taller than wide or square
    return {
      width: Math.round(targetSize * aspectRatio),
      height: targetSize,
    };
  }
};

export const validateImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image type. Please upload a JPEG, PNG, GIF, or WebP image.');
  }

  if (file.size > maxSize) {
    throw new Error('Image size too large. Maximum size is 10MB.');
  }

  return true;
};
