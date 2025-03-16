'use client';

import React, { useState, useRef } from 'react';
import { FiPaperclip, FiArrowUp } from 'react-icons/fi';
import { ImageData, processImage, validateImage } from '../utils/image-processing';
import ImagePreview from './ImagePreview';
import { trackImageUploaded } from '../utils/analytics';

interface MessageInputProps {
  onSendMessage: (message: string, images?: ImageData[]) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);
    setError(null);

    try {
      const newImages = await Promise.all(
        Array.from(files).map(async file => {
          validateImage(file);
          return await processImage(file);
        })
      );

      setImages(prev => [...prev, ...newImages]);
      trackImageUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || images.length > 0) {
      onSendMessage(message, images.length > 0 ? images : undefined);
      setMessage('');
      setImages([]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {images.length > 0 && (
        <div className="image-preview-grid">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {images.map((img, index) => (
              <ImagePreview key={index} image={img} onRemove={() => removeImage(index)} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message px-4 py-2 text-red-600 text-sm bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="input-wrapper">
        <form onSubmit={handleSubmit} className="relative flex items-center px-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="action-button"
            disabled={disabled || isProcessing}
            aria-label="Attach image"
          >
            <FiPaperclip className={isProcessing ? 'animate-pulse' : ''} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
            disabled={disabled || isProcessing}
          />

          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={isProcessing ? 'Processing image...' : 'Type a message...'}
            className="message-input"
            disabled={disabled || isProcessing}
          />

          <button
            type="submit"
            disabled={disabled || isProcessing || (!message.trim() && images.length === 0)}
            className="action-button"
            aria-label="Send message"
          >
            <FiArrowUp />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
