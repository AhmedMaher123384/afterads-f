import React, { useState, useEffect } from 'react';
import { buildImageUrl } from '../../../config/api';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Check,
  X
} from 'lucide-react';
import { smartToast } from '../../../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Spinner from '../../../components/ui/Spinner';
import RichTextEditor from '../components/layout/RichTextEditor';

interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  seoTitle?: string;        
  seoKeywords?: string[]; 
  createdAt?: string;      
  updatedAt?: string;      
  isActive: boolean;
  showInFooter?: boolean;
}

const StaticPagesManagement: React.FC = () => {
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [isStaticPagesLoading, setIsStaticPagesLoading] = useState<boolean>(true);
  const [isStaticPageModalOpen, setIsStaticPageModalOpen] = useState(false);
  const [editingStaticPage, setEditingStaticPage] = useState<StaticPage | null>(null);
  const [newPageData, setNewPageData] = useState<Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    isActive: true,
    showInFooter: true
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: string;
    id: number | string;
    name: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: '',
    id: 0,
    name: '',
    loading: false
  });

  // Fetch static pages
  // Fetch static pages
  const queryClient = useQueryClient();
  const { data: pagesResp, isLoading: pagesLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.STATIC_PAGES, queryKey: ['static-pages'] });
  useEffect(() => {
    if (!pagesResp) return;
    const pages = Array.isArray(pagesResp) ? pagesResp : (pagesResp.data || pagesResp || []);
    const transformedPages = pages.map((page: any) => ({
      ...page,
      metaTitle: page.seoTitle || '',
      keywords: page.seoKeywords ? page.seoKeywords.join(', ') : ''
    }));
    setStaticPages(transformedPages);
    setIsStaticPagesLoading(false);
  }, [pagesResp]);

  // Handle save static page
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
        if (text) {
          blocks.push({ text, images: [] });
        }
      } else if (type === 'image' || type === 'images') {
        const img = block.querySelector('img');
        if (img) {
          const url = img.getAttribute('src') || '';
          if (url) {
            const orientation = block.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
            blocks.push({ text: '', images: [{ url, orientation }] });
          }
        }
      }
    });
  } else {
    const imgs: HTMLImageElement[] = Array.from(container.querySelectorAll('img'));
    imgs.forEach(img => {
      const url = img.getAttribute('src') || '';
      if (url) {
        const parent = img.closest('[data-orientation]');
        const orientation = parent?.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
        blocks.push({ text: '', images: [{ url, orientation }] });
        img.parentElement?.remove();
      }
    });
    const text = container.innerHTML.trim();
    if (text) {
      blocks.unshift({ text, images: [] });
    }
  }
  
  return blocks.filter(b => b.text.trim() || (b.images && b.images.length > 0));
};

const handleSaveStaticPage = async (pageData: any) => {
try {
    const contentBlocks = Array.isArray(pageData.content) 
      ? pageData.content 
      : htmlToBlocks(pageData.content || '');
    
    // ✅ تحقق من وجود محتوى
    if (!contentBlocks || contentBlocks.length === 0) {
      smartToast.dashboard.error('الرجاء إضافة محتوى للصفحة');
      return;
    }
    
    const transformedData = {
      ...pageData,
      seoTitle: pageData.metaTitle,
      seoKeywords: pageData.keywords ? 
        pageData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k) 
        : [],
      content: contentBlocks,
      metaTitle: undefined,
      keywords: undefined
    };

    // نظف البيانات من الحقول undefined
    const cleanData = Object.fromEntries(
      Object.entries(transformedData).filter(([_, value]) => value !== undefined)
    );

    console.log('📤 Sending transformed data:', cleanData);

    if (editingStaticPage) {
      // Update existing page
      const response = await apiCall(
        API_ENDPOINTS.STATIC_PAGE_BY_ID(editingStaticPage.id.toString()),
        {
          method: 'PUT',
          body: JSON.stringify(cleanData)
        }
      );
      
      // عند استلام الرد، حول البيانات مرة أخرى للعرض في Frontend
      const frontendResponse = {
        ...response,
        metaTitle: response.seoTitle,
        keywords: response.seoKeywords ? response.seoKeywords.join(', ') : ''
      };
      
      const updatedPages = staticPages.map(page =>
        page.id === editingStaticPage.id ? frontendResponse : page
      );
      setStaticPages(updatedPages);
      smartToast.dashboard.success('تم تحديث الصفحة بنجاح!');
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
    } else {
      // Create new page
      const response = await apiCall(API_ENDPOINTS.STATIC_PAGES, {
        method: 'POST',
        body: JSON.stringify(cleanData)
      });
      
      // حول البيانات للعرض في Frontend
      const frontendResponse = {
        ...response,
        metaTitle: response.seoTitle,
        keywords: response.seoKeywords ? response.seoKeywords.join(', ') : ''
      };
      
      const newPages = [...staticPages, frontendResponse];
      setStaticPages(newPages);
      smartToast.dashboard.success('تم إنشاء الصفحة بنجاح!');
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
    }
    
    setIsStaticPageModalOpen(false);
    setEditingStaticPage(null);
    setNewPageData({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      isActive: true
    });
  } catch (error) {
    console.error('Error saving static page:', error);
    smartToast.dashboard.error('فشل في حفظ الصفحة');
  }
};

  // Handle edit static page
// Handle edit static page
const handleEditStaticPage = (page: StaticPage) => {
  // تأكد من أن البيانات معدة للعرض في Frontend
  const frontendPage = {
    ...page,
    metaTitle: page.seoTitle || '',
    keywords: page.seoKeywords ? page.seoKeywords.join(', ') : ''
  };

  setEditingStaticPage(frontendPage);
  setNewPageData({
    title: frontendPage.title,
    slug: frontendPage.slug,
    content: blocksToHtml(frontendPage.content),
    metaTitle: frontendPage.metaTitle,
    metaDescription: frontendPage.metaDescription || '',
    keywords: frontendPage.keywords,
    isActive: frontendPage.isActive,
    showInFooter: frontendPage.showInFooter ?? true
  });
  setIsStaticPageModalOpen(true);
};

  // Handle delete static page
  const handleDeleteStaticPage = (page: StaticPage) => {
    openDeleteModal('static-page', page.id, page.title);
  };

  // Open delete modal
  const openDeleteModal = (type: string, id: number | string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name,
      loading: false
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  // Confirm delete
  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await apiCall(API_ENDPOINTS.STATIC_PAGE_BY_ID(deleteModal.id.toString()), {
        method: 'DELETE'
      });
      
      // Remove the deleted page from the list
      const updatedPages = staticPages.filter(page => page.id !== Number(deleteModal.id));
      setStaticPages(updatedPages);
      
      smartToast.dashboard.success(`تم حذف الصفحة "${deleteModal.name}" بنجاح`);
      closeDeleteModal();
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
    } catch (error) {
      console.error('Error deleting static page:', error);
      smartToast.dashboard.error('فشل في حذف الصفحة');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPageData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value
    }));
  };

  // Handle slug generation from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (newPageData.title && !editingStaticPage) {
      setNewPageData(prev => ({
        ...prev,
        slug: generateSlug(prev.title)
      }));
    }
  }, [newPageData.title]);

  // Load static pages on component mount
  useEffect(() => {
    if (!pagesLoading) setIsStaticPagesLoading(false);
  }, [pagesLoading]);

  if (isStaticPagesLoading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

 return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8" />
              نظام إدارة الصفحات الثابتة
            </h2>
            <p className="text-gray-200">إنشاء وإدارة صفحات المحتوى الثابت للموقع بكفاءة عالية</p>
          </div>
          <button
            onClick={() => setIsStaticPageModalOpen(true)}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة صفحة جديدة
          </button>
        </div>
      </div>

      {/* Static Pages List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {staticPages.length === 0 ? (
          <div className="p-8">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد صفحات ثابتة</h3>
              <p className="text-gray-500 mb-8 text-lg">ابدأ بإنشاء صفحة ثابتة جديدة لموقعك</p>
              <button
                onClick={() => setIsStaticPageModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                إنشاء صفحة جديدة
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#203f61]">
                <tr>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">العنوان</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">الرابط</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-white">تاريخ الإنشاء</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staticPages && staticPages.length > 0 && staticPages.map((page) => (
                  page && page.title ? (
                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-900">{page.title}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-[#203f61] font-medium">/{page.slug}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          page.isActive 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {page.isActive ? '✓ نشط' : '✗ غير نشط'}
                        </span>
                      </td>
                     <td className="py-4 px-6">
              <div className="text-sm text-gray-600">
                {new Date(page.createdAt!).toLocaleDateString('ar-SA')}
              </div>
            </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditStaticPage(page)}
                            className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaticPage(page)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for adding/editing static page */}
      {isStaticPageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky  z-10 top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">
                {editingStaticPage ? '✏️ تعديل الصفحة' : '➕ إضافة صفحة جديدة'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان</label>
                  <input
                    type="text"
                    name="title"
                    value={newPageData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="أدخل عنوان الصفحة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الرابط</label>
                  <input
                    type="text"
                    name="slug"
                    value={newPageData.slug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="أدخل رابط الصفحة"
                  />
                </div>
                
                <div>
                  <RichTextEditor
                    value={typeof newPageData.content === 'string' ? newPageData.content : ''}
                    onChange={(value) => setNewPageData(prev => ({ ...prev, content: value }))}
                    label="المحتوى"
                    minHeight="300px"
                    placeholder="أدخل محتوى الصفحة"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان ميتا</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={newPageData.metaTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="أدخل عنوان ميتا"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الكلمات المفتاحية</label>
                    <input
                      type="text"
                      name="keywords"
                      value={newPageData.keywords}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="أدخل الكلمات المفتاحية مفصولة بفواصل"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">وصف ميتا</label>
                  <textarea
                    name="metaDescription"
                    value={newPageData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                    placeholder="أدخل وصف ميتا"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                  <select
                    name="isActive"
                    value={newPageData.isActive.toString()}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
                  >
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">إظهار في الفوتر</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(newPageData.showInFooter)}
                      onChange={(e) => setNewPageData(prev => ({ ...prev, showInFooter: e.target.checked }))}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">عرض الرابط ضمن روابط الفوتر</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsStaticPageModalOpen(false);
                    setEditingStaticPage(null);
                    setNewPageData({
                      title: '',
                      slug: '',
                      content: '',
                      metaTitle: '',
                      metaDescription: '',
                      keywords: '',
                      isActive: true
                    });
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleSaveStaticPage({
                    ...newPageData,
                    id: editingStaticPage?.id
                  })}
                  className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingStaticPage ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStaticPagesLoading && <Spinner overlay />}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="⚠️ تأكيد الحذف"
        message={`هل أنت متأكد من حذف الصفحة "${deleteModal.name}"؟\nلا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        confirmText={deleteModal.loading ? 'جاري الحذف...' : 'حذف'}
        cancelText="إلغاء"
      />
    </div>
  );
};

export default StaticPagesManagement;