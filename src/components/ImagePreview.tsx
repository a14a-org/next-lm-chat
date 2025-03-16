'use client';

import React from 'react';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';
import { ImageData } from '../utils/image-processing';

interface ImagePreviewProps {
  image: ImageData;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onRemove }) => {
  return (
    <div className="relative group">
      <div className="image-preview rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={image.data}
          alt="Preview"
          width={image.metadata.normalizedSize.width}
          height={image.metadata.normalizedSize.height}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200">
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity duration-200"
          >
            <FiX size={20} />
          </button>
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            {`${image.metadata.normalizedSize.width}x${image.metadata.normalizedSize.height}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
