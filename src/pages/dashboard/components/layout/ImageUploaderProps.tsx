import React, { useState } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  MoveVertical,
  Grid
} from 'lucide-react';

interface ImageUploaderProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  maxImages?: number;
  accept?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  required = false,
  multiple = false,
  layout = 'grid',
  maxImages = 10,
  accept = 'image/*'
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Convert value to array for easier handling
  const images = multiple 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (value ? [value as string] : []);

  // Add image
  const handleAddImage = () => {
    if (!imageUrl.trim()) return;

    if (multiple) {
      if (images.length >= maxImages) {
        alert(`الحد الأقصى ${maxImages} صور`);
        return;
      }
      onChange([...images, imageUrl]);
    } else {
      onChange(imageUrl);
    }

    setImageUrl('');
    setShowUrlInput(false);
  };

  // Handle file upload from device
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (multiple) {
        if (images.length >= maxImages) {
          alert(`الحد الأقصى ${maxImages} صور`);
          return;
        }
        onChange([...images, base64String]);
      } else {
        onChange(base64String);
      }
      setSelectedFile(null);
    };
    reader.readAsDataURL(file);
  }
};

  // Remove image
  const handleRemoveImage = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  // Reorder images (drag and drop)
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingIndex === null || draggingIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggingIndex];
    newImages.splice(draggingIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onChange(newImages);
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  // Layout classes
  const getLayoutClass = () => {
    if (layout === 'horizontal') {
      return 'flex gap-4 overflow-x-auto pb-2';
    } else if (layout === 'vertical') {
      return 'flex flex-col gap-4';
    }
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';
  };

  const getImageContainerClass = () => {
    if (layout === 'horizontal') {
      return 'flex-shrink-0 w-48';
    } else if (layout === 'vertical') {
      return 'w-full';
    }
    return '';
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
            {multiple && <span className="text-gray-500 text-xs mr-2">({images.length}/{maxImages})</span>}
          </label>
          
          {/* Layout Toggle (for multiple images) */}
          {multiple && images.length > 0 && (
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onChange(images)}
                className={`p-1.5 rounded ${layout === 'grid' ? 'bg-white shadow' : ''}`}
                title="شبكة"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(images)}
                className={`p-1.5 rounded ${layout === 'horizontal' ? 'bg-white shadow' : ''}`}
                title="أفقي"
              >
                <MoveVertical className="w-4 h-4 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => onChange(images)}
                className={`p-1.5 rounded ${layout === 'vertical' ? 'bg-white shadow' : ''}`}
                title="عمودي"
              >
                <MoveVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Images Display */}
      {images.length > 0 && (
        <div className={getLayoutClass()}>
          {images.map((img, index) => (
            <div
              key={index}
              draggable={multiple}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`${getImageContainerClass()} relative group cursor-move`}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#203f61] transition-all">
                <img
                  src={img}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform hover:scale-110"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Image number badge */}
                {multiple && (
                  <div className="absolute top-2 right-2 bg-[#203f61] text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                )}

                {/* Main image badge (for multiple mode) */}
                {multiple && index === 0 && (
                  <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    رئيسية
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Section */}
 {/* Add Image Section */}
      {(!multiple) || (multiple && images.length < maxImages) ? (
        <div className="space-y-3">
          {!showUrlInput ? (
            <div className="space-y-3">
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id={`image-upload-${label || 'default'}`}
              />
              
              {/* Upload button */}
              <label
                htmlFor={`image-upload-${label || 'default'}`}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-[#203f61] hover:bg-gray-50 transition-all group cursor-pointer block"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#203f61] group-hover:text-white transition-all">
                    {images.length === 0 ? (
                      <ImageIcon className="w-8 h-8" />
                    ) : (
                      <Plus className="w-8 h-8" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-gray-700 font-semibold mb-1">
                      {images.length === 0 ? 'إضافة صورة' : (multiple ? 'إضافة صورة أخرى' : 'استبدال الصورة')}
                    </p>
                    <p className="text-sm text-gray-500">
                      انقر لاختيار صورة من جهازك
                    </p>
                  </div>
                </div>
              </label>
              
              {/* URL input option */}
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="w-full text-sm text-[#203f61] hover:text-[#2a537e] font-medium py-2 hover:underline"
              >
                💡 أو أدخل رابط صورة من الإنترنت
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Upload className="w-5 h-5" />
                <span className="font-semibold">إضافة صورة جديدة</span>
              </div>
              
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!imageUrl.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#203f61] text-white rounded-lg hover:bg-[#2a537e] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setImageUrl('');
                  }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
                <p className="font-semibold mb-1">💡 نصيحة:</p>
                <p>يمكنك رفع الصور على خدمات مثل Imgur أو ImgBB ثم نسخ الرابط هنا</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Info message for multiple images */}

      {/* Info message for multiple images */}
      {multiple && images.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-sm text-blue-800">
          <ImageIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">الصورة الأولى ستكون الصورة الرئيسية</p>
            <p className="text-blue-600">يمكنك سحب وإفلات الصور لإعادة ترتيبها</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;