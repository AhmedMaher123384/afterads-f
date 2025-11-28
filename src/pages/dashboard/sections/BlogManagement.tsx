import React, { useState, useEffect } from 'react';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../../../config/api';
import { smartToast } from '../../../utils/toastConfig';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { Plus, Edit2, Trash2, AlertCircle, X, FileText, Calendar, User } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import RichTextEditor from '../components/layout/RichTextEditor';

interface BlogPost {
  _id: string;
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  categories: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const { data: postsData, isLoading: postsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.BLOG_POSTS, queryKey: ['blog-posts'] });
  const queryClient = useQueryClient();
  const loading = postsLoading;
  const fetchPosts = () => {
    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    categories: [],
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: ''
  });

  useEffect(() => {
    if (!postsData) return;
    const arr = Array.isArray(postsData) ? postsData : (postsData.posts || postsData?.data || []);
    setPosts(arr);
    setError('');
  }, [postsData]);

const blocksToHtml = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((b: any) => {
      const images = Array.isArray(b.images) ? b.images : [];
      const text = b.text || '';
      const orientationForGrid = images[0]?.orientation || 'horizontal';
      const gridCols = orientationForGrid === 'vertical' ? 'repeat(auto-fit, minmax(150px, 200px))' : 'repeat(auto-fit, minmax(250px, 1fr))';
      return `
        <div class="row-item my-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
          <div class="row-grid grid md:grid-cols-2 gap-4">
            <div class="block-item text-block" contenteditable="true" data-type="text" style="min-height: 3rem; padding: 0.75rem; border: 2px dashed #e5e7eb; border-radius: 0.5rem;">${text}</div>
            <div class="block-item image-block" contenteditable="false" data-type="images">
              <div class="images-grid grid gap-2" data-orientation="${orientationForGrid}" style="grid-template-columns: ${gridCols};">
                ${images.map((img: any) => `<img src="${buildImageUrl(img.url)}" alt="صورة" class="w-full h-auto rounded-lg shadow-md" />`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  return String(value || '');
};

const htmlToBlocks = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html || '';
  const blocks: Array<{ text: string; images: Array<{ url: string; orientation?: 'horizontal' | 'vertical' }> }> = [];
  
  const rowItems = container.querySelectorAll('.row-item');
  if (rowItems.length > 0) {
    rowItems.forEach((row) => {
      const textEl = row.querySelector('.text-block') as HTMLElement | null;
      const text = textEl ? textEl.innerHTML.trim() : '';
      const grid = row.querySelector('.images-grid') as HTMLElement | null;
      const orientation = grid?.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
      const imgs = Array.from(row.querySelectorAll('.images-grid img'))
        .map((img) => ({ url: img.getAttribute('src') || '', orientation }))
        .filter((i) => i.url);
      blocks.push({ text, images: imgs });
    });
    return blocks.filter(b => b.text.trim() || (b.images && b.images.length > 0));
  }

  const blockItems = container.querySelectorAll('.block-item');
  
  if (blockItems.length > 0) {
    blockItems.forEach((block) => {
      const type = block.getAttribute('data-type');
      
      if (type === 'text') {
        const text = (block as HTMLElement).innerText.trim();
        if (text) { // ✅ فقط إذا كان النص غير فارغ
          blocks.push({ text, images: [] });
        }
      } else if (type === 'image' || type === 'images') {
        const img = block.querySelector('img');
        if (img) {
          const url = img.getAttribute('src') || '';
          if (url) { // ✅ فقط إذا كان الرابط موجود
            const orientation = block.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
            blocks.push({ text: '', images: [{ url, orientation }] });
          }
        }
      }
    });
  } else {
    // Fallback للبيانات القديمة
    const imgs: HTMLImageElement[] = Array.from(container.querySelectorAll('img'));
    imgs.forEach(img => {
      const url = img.getAttribute('src') || '';
      if (url) { // ✅ فقط إذا كان الرابط موجود
        const parent = img.closest('[data-orientation]');
        const orientation = parent?.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
        blocks.push({ text: '', images: [{ url, orientation }] });
        img.parentElement?.remove();
      }
    });
    const text = container.innerHTML.trim();
    if (text) { // ✅ فقط إذا كان النص غير فارغ
      blocks.unshift({ text, images: [] });
    }
  }
  
  // ✅ إرجاع array فارغ إذا لم يكن هناك محتوى بدلاً من object فارغ
  return blocks.filter(b => b.text.trim() || (b.images && b.images.length > 0));
};
const openModal = (post?: BlogPost) => {
  if (post) {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: Array.isArray((post as any).content) ? blocksToHtml((post as any).content) : (post.content || ''),
      featuredImage: post.featuredImage || '',
      author: post.author || '',
      categories: post.categories || [],
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      keywords: post.keywords || '',
      ogTitle: post.ogTitle || '',
      ogDescription: post.ogDescription || '',
      ogImage: post.ogImage || '',
      twitterTitle: post.twitterTitle || '',
      twitterDescription: post.twitterDescription || ''
    });
  } else {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      author: '',
      categories: [],
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterTitle: '',
      twitterDescription: ''
    });
  }
  setIsModalOpen(true);
};  

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      author: '',
      categories: [],
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterTitle: '',
      twitterDescription: ''
    });
  };

const handleSubmit = async () => {
try {
    const endpoint = editingPost
      ? API_ENDPOINTS.BLOG_POST_BY_ID(editingPost._id)
      : API_ENDPOINTS.BLOG_POSTS;
    const method = editingPost ? 'PUT' : 'POST';
    
    const contentBlocks = Array.isArray(formData.content) 
      ? formData.content 
      : htmlToBlocks(formData.content || '');
    
    // ✅ تحقق من وجود محتوى فعلي
    if (!contentBlocks || contentBlocks.length === 0) {
      setError('الرجاء إضافة محتوى للمقال');
      smartToast.dashboard.error('الرجاء إضافة محتوى للمقال');
      return;
    }
    
    const payload = {
      ...formData,
      content: contentBlocks,
    };

    await apiCall(endpoint, {
      method,
      body: JSON.stringify(payload),
    });
    {
      const msg = editingPost ? 'تم تحديث المقال بنجاح' : 'تم إضافة المقال بنجاح';
      setSuccess(msg);
      smartToast.dashboard.success(msg);
      closeModal();
      fetchPosts();
      setTimeout(() => setSuccess(''), 3000);
    }
  } catch (err) {
    const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'حدث خطأ أثناء حفظ المقال';
    setError(msg);
    smartToast.dashboard.error(msg);
  }
};
  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiCall(API_ENDPOINTS.BLOG_POST_BY_ID(deleteTargetId), { method: 'DELETE' });
      setSuccess('تم حذف المقال بنجاح');
      smartToast.dashboard.success('تم حذف المقال بنجاح');
      fetchPosts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'حدث خطأ أثناء حذف المقال';
      setError(msg);
      smartToast.dashboard.error(msg);
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const categoriesArray = value.split(',').map(cat => cat.trim()).filter(cat => cat);
    setFormData(prev => ({
      ...prev,
      categories: categoriesArray
    }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8" />
                إدارة المدونة
              </h2>
              <p className="text-gray-200">إضافة وتعديل وحذف مقالات المدونة بكفاءة عالية</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              إضافة مقال جديد
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading && <Spinner overlay />}

        {/* Blog Posts Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {posts.length === 0 ? (
            <div className="p-8">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد مقالات</h3>
                <p className="text-gray-500 mb-8 text-lg">ابدأ بإنشاء مقال جديد للمدونة</p>
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء مقال جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#203f61]">
                  <tr>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">ID</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">العنوان</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">الكاتب</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">الفئات</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-900">{post.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {post.featuredImage && (
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{post.title}</div>
                            <div className="text-xs text-[#203f61] font-medium mt-1">{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{post.author}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {post.categories && post.categories.length > 0 ? (
                            post.categories.map((cat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">لا توجد فئات</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(post)}
                            className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky z-10 top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
                <div className="flex  items-center justify-between">
                  <h3 className="text-2xl font-bold">
                    {editingPost ? '✏️ تعديل المقال' : '➕ إضافة مقال جديد'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        العنوان *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder="أدخل عنوان المقال"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Slug
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل الرابط"
                        />
                        <button
                          onClick={generateSlug}
                          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap font-medium"
                        >
                          توليد تلقائي
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الكاتب *
                        </label>
                        <input
                          type="text"
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل اسم الكاتب"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الفئات (مفصولة بفاصلة)
                        </label>
                        <input
                          type="text"
                          name="categories"
                          value={formData.categories?.join(', ')}
                          onChange={handleCategoriesChange}
                          placeholder="تقنية, برمجة, تصميم"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        الملخص *
                      </label>
                      <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                        placeholder="أدخل ملخص المقال"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.excerpt?.length || 0} / 500 حرف
                      </div>
                    </div>

                    <div>
                      <RichTextEditor
                        value={typeof formData.content === 'string' ? formData.content : ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                        label="المحتوى *"
                        required={true}
                        minHeight="400px"
                        placeholder="أدخل محتوى المقال"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        رابط الصورة البارزة
                      </label>
                      <input
                        type="text"
                        name="featuredImage"
                        value={formData.featuredImage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder="أدخل رابط الصورة"
                      />
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات SEO</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          عنوان Meta
                        </label>
                        <input
                          type="text"
                          name="metaTitle"
                          value={formData.metaTitle}
                          onChange={handleInputChange}
                          maxLength={60}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل عنوان ميتا"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.metaTitle?.length || 0} / 60 حرف
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          وصف Meta
                        </label>
                        <textarea
                          name="metaDescription"
                          value={formData.metaDescription}
                          onChange={handleInputChange}
                          maxLength={160}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="أدخل وصف ميتا"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.metaDescription?.length || 0} / 160 حرف
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الكلمات المفتاحية
                        </label>
                        <input
                          type="text"
                          name="keywords"
                          value={formData.keywords}
                          onChange={handleInputChange}
                          placeholder="كلمة1, كلمة2, كلمة3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Open Graph Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Graph (Facebook)</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          عنوان OG
                        </label>
                        <input
                          type="text"
                          name="ogTitle"
                          value={formData.ogTitle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل عنوان Open Graph"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          وصف OG
                        </label>
                        <textarea
                          name="ogDescription"
                          value={formData.ogDescription}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="أدخل وصف Open Graph"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          صورة OG
                        </label>
                        <input
                          type="text"
                          name="ogImage"
                          value={formData.ogImage}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل رابط صورة Open Graph"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Twitter Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Twitter Card</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          عنوان Twitter
                        </label>
                        <input
                          type="text"
                          name="twitterTitle"
                          value={formData.twitterTitle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل عنوان Twitter"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          وصف Twitter
                        </label>
                        <textarea
                          name="twitterDescription"
                          value={formData.twitterDescription}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="أدخل وصف Twitter"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    {editingPost ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ConfirmationModal
          isOpen={isConfirmOpen}
          title="تأكيد حذف المقال"
          message="هل أنت متأكد من حذف هذا المقال؟"
          confirmText="حذف"
          cancelText="إلغاء"
          onConfirm={performDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setDeleteTargetId(null);
          }}
        />
      </div>
    </div>
  );
};

export default BlogManagement;
