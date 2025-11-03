import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { buildApiUrl } from '../../config/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  categories: string[];
  createdAt: string;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<BlogPost>) => void;
  editingPost?: BlogPost | null;
}

const BlogModal: React.FC<BlogModalProps> = ({ isOpen, onClose, onSave, editingPost }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: 'مدير الموقع',
    categories: [],
    // SEO fields
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const isEditing = !!editingPost;

  useEffect(() => {
    if (isOpen) {
      if (editingPost) {
        setFormData(editingPost);
        if (editingPost.featuredImage) {
          setImagePreview(editingPost.featuredImage);
        }
      } else {
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          featuredImage: '',
          author: 'مدير الموقع',
          categories: [],
          // SEO fields
          metaTitle: '',
          metaDescription: '',
          keywords: '',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          twitterTitle: '',
          twitterDescription: ''
        });
        setImagePreview('');
      }
      
      setFeaturedImageFile(null);
      setErrors({});
    }
  }, [editingPost, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.categories?.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.filter(cat => cat !== categoryToRemove) || []
    }));
  };

  // دالة لتحويل النص العادي إلى HTML مع دعم فواصل الأسطر
  const convertTextToHTML = (text: string) => {
    if (!text) return '';
    
    // إذا كان النص يحتوي على HTML tags، أرجعه كما هو
    if (text.includes('<') && text.includes('>')) {
      return text;
    }
    
    // تحويل النص العادي إلى HTML مع دعم فواصل الأسطر
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('\n');
  };

  // دالة للحصول على المحتوى المنسق للمعاينة
  const getPreviewContent = (content: string) => {
    if (!content) return '';
    
    // إذا كان المحتوى يحتوي على HTML tags، أرجعه كما هو
    if (content.includes('<') && content.includes('>')) {
      return content;
    }
    
    // تحويل النص العادي إلى HTML للمعاينة
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p style="margin-bottom: 1rem; line-height: 1.8;">${line}</p>`)
      .join('');
  };

  // Image handling functions
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        smartToast.dashboard.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setFeaturedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          smartToast.dashboard.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
          return;
        }
        
        setFeaturedImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        smartToast.dashboard.error('يرجى اختيار ملف صورة صحيح');
      }
    }
  };

  const removeImage = () => {
    setFeaturedImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, featuredImage: '' }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.excerpt) {
      setErrors({ 
        title: !formData.title ? 'العنوان مطلوب' : '', 
        content: !formData.content ? 'المحتوى مطلوب' : '',
        excerpt: !formData.excerpt ? 'الملخص مطلوب' : ''
      });
      smartToast.dashboard.error('يرجى ملء جميع الحقول المطلوبة (العنوان، الملخص، المحتوى)');
      return;
    }

    setLoading(true);
    try {
      // تحويل المحتوى إلى HTML إذا لم يكن يحتوي على HTML tags
      const formattedContent = convertTextToHTML(formData.content || '');
      
      // Prepare data for submission
      const submitData = {
        title: formData.title || '',
        slug: formData.slug || '',
        excerpt: formData.excerpt || '',
        content: formattedContent,
        author: formData.author || 'مدير الموقع',
        categories: formData.categories || []
      };
      
      // Handle image upload separately if needed
      if (featuredImageFile) {
        // For now, we'll use FormData for image uploads
        const submitFormData = new FormData();
        
        // Add text fields
         Object.keys(submitData).forEach(key => {
           const typedKey = key as keyof typeof submitData;
           if (key === 'categories') {
             submitFormData.append(key, JSON.stringify(submitData[typedKey]));
           } else {
             submitFormData.append(key, submitData[typedKey] as string);
           }
         });
        
        // Add image file
        submitFormData.append('featuredImage', featuredImageFile);

        // Submit to backend using fetch for FormData
        const url = isEditing ? buildApiUrl(`blog-posts/${editingPost?.id}`) : buildApiUrl('blog-posts');
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          body: submitFormData
        });
        
        if (!response.ok) {
          throw new Error('فشل في حفظ المقال');
        }
        
        const savedPost = await response.json();
        smartToast.dashboard.success(isEditing ? 'تم تحديث المقال بنجاح' : 'تم إنشاء المقال بنجاح');
        
        // Don't call onSave here as the post is already saved via fetch
        // Just refresh the blog posts list
        window.dispatchEvent(new CustomEvent('blogPostsChanged'));
      } else {
        // No image, use regular JSON submission through onSave
        smartToast.dashboard.success(isEditing ? 'تم تحديث المقال بنجاح' : 'تم إنشاء المقال بنجاح');
        await onSave(submitData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving blog post:', error);
      smartToast.dashboard.error('فشل في حفظ المقال');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'تعديل المقال' : 'إضافة مقال جديد'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                المعلومات الأساسية
              </h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    عنوان المقال *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل عنوان المقال"
                    required
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الرابط (Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="article-slug"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الوصف المختصر
                  </label>
                  <textarea
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="وصف مختصر للمقال"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    المحتوى *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={10}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                      errors.content ? 'border-red-500' : 'border-gray-300'
                    }`}
                    style={{
                      direction: 'rtl',
                      textAlign: 'right',
                      lineHeight: '1.6'
                    }}
                    placeholder={`ابدأ كتابة محتوى المقال هنا...

يمكنك الكتابة بطريقتين:
1. النص العادي: كل سطر جديد سيتحول تلقائياً إلى فقرة منفصلة
2. كود HTML: اكتب كود HTML مباشرة وسيتم عرضه كما هو

مثال للنص العادي:
هذا السطر الأول
هذا السطر الثاني

مثال لكود HTML:
<h2>عنوان فرعي</h2>
<p>فقرة مع <strong>نص عريض</strong></p>
<ul><li>عنصر قائمة</li></ul>`}
                    required
                  />
                  {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الكاتب
                  </label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="اسم الكاتب"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                الصورة المميزة
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الصورة المميزة
                  <span className="text-xs text-gray-500 mr-2">(يمكن السحب والإفلات)</span>
                </label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    id="featuredImage"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="معاينة الصورة" 
                        className="max-w-full h-48 object-cover rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="featuredImage" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                          dragActive ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Upload className={`w-8 h-8 transition-colors ${
                            dragActive ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <p className={`font-semibold transition-colors ${
                          dragActive ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          اسحب الصورة هنا أو انقر للاختيار
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF حتى 5MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                التصنيفات
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="إضافة تصنيف جديد"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                إعدادات SEO
              </h3>
              
              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    عنوان SEO (Meta Title)
                    <span className="text-xs text-gray-500 mr-2">(يُفضل 50-60 حرف)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="عنوان محسن لمحركات البحث"
                    maxLength={60}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(formData.metaTitle || '').length}/60 حرف
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    وصف SEO (Meta Description)
                    <span className="text-xs text-gray-500 mr-2">(يُفضل 150-160 حرف)</span>
                  </label>
                  <textarea
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="وصف محسن لمحركات البحث"
                    maxLength={160}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(formData.metaDescription || '').length}/160 حرف
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الكلمات المفتاحية
                    <span className="text-xs text-gray-500 mr-2">(مفصولة بفواصل)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.keywords || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2, كلمة مفتاحية 3"
                  />
                </div>

                {/* Open Graph Settings */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    إعدادات Open Graph (فيسبوك)
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        عنوان Open Graph
                      </label>
                      <input
                        type="text"
                        value={formData.ogTitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="عنوان للمشاركة على فيسبوك"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        وصف Open Graph
                      </label>
                      <textarea
                        value={formData.ogDescription || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="وصف للمشاركة على فيسبوك"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter Settings */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    إعدادات Twitter Card
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        عنوان Twitter
                      </label>
                      <input
                        type="text"
                        value={formData.twitterTitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, twitterTitle: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="عنوان للمشاركة على تويتر"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        وصف Twitter
                      </label>
                      <textarea
                        value={formData.twitterDescription || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, twitterDescription: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="وصف للمشاركة على تويتر"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'جاري الحفظ...' : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'تحديث المقال' : 'إضافة المقال'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;