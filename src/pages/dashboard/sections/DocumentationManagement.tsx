import React, { useState, useEffect } from 'react';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../../../config/api';
import { smartToast } from '../../../utils/toastConfig';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { Plus, Edit2, Trash2, AlertCircle, X, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import RichTextEditor from '../components/layout/RichTextEditor';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';

// --- Interfaces for the hierarchical structure ---
interface Documentation {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  classificationId?: string;
  content: Array<{
    text: string;
    images: Array<{
      url: string;
      orientation: 'horizontal' | 'vertical';
    }>;
  }>;
  metadata?: {
    totalViews?: number;
    lastViewed?: string;
  };
}

interface Classification {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  order?: number;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  classifications: Classification[];
  documentations: Documentation[];
  isActive: boolean;
  metadata?: {
    totalViews?: number;
    totalDocs?: number;
    totalClassifications?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  mainClassificationId?: string;
}

interface MainClassification {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  color?: string;
  categories: Category[];
  isActive?: boolean;
  metadata?: {
    totalViews?: number;
    totalCategories?: number;
    totalDocs?: number;
  };
}

// --- Types for modal state ---
type EditingItem = Category | Classification | Documentation | MainClassification | null;
type EditingLevel = 'main' | 'category' | 'classification' | 'documentation' | null;

const DocumentationManagement: React.FC = () => {
  const [structure, setStructure] = useState<Category[]>([]);
  const [mainClassifications, setMainClassifications] = useState<MainClassification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [editingLevel, setEditingLevel] = useState<EditingLevel>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ level: EditingLevel; id: string; parentId?: string } | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    content: '',
    isActive: true,
    classificationId: '',
    description: '',
    icon: '',
    order: 0,
    mainId: '',
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { data: structResp, isLoading: structLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.DOCUMENTATION_STRUCTURE, queryKey: ['documentation-structure'] });
  useEffect(() => {
    if (!structResp) return;
    const mains: MainClassification[] = Array.isArray((structResp as any)?.mainClassifications)
      ? (structResp as any).mainClassifications
      : (Array.isArray((structResp as any)?.navigation) ? (structResp as any).navigation : (Array.isArray(structResp) ? structResp : []));
    setMainClassifications(mains || []);
    const cats: Category[] = [];
    (mains || []).forEach((m) => {
      const mcats = Array.isArray(m.categories) ? m.categories : [];
      mcats.forEach((c) => {
        cats.push({
          ...c,
          mainClassificationId: (c as any).mainClassificationId || m.id,
          classifications: Array.isArray(c.classifications) ? c.classifications : [],
          documentations: Array.isArray(c.documentations) ? c.documentations : [],
        });
      });
    });
    setStructure(cats);
    setError('');
    setLoading(false);
  }, [structResp]);

  // --- Helper Functions ---
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
    const text = container.innerHTML.trim();
    if (text) {
      blocks.push({ text, images: [] });
    }
    return blocks.filter(b => b.text.trim() || (b.images && b.images.length > 0));
  };

  const generateId = () => Array.from({ length: 24 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // --- Modal Functions ---
  const openModal = (item: EditingItem, level: EditingLevel, parentId?: string) => {
    setEditingItem(item);
    setEditingLevel(level);

    if (level === 'main' && item) {
      setFormData({
        title: (item as MainClassification).title || '',
        slug: (item as MainClassification).slug || '',
        description: (item as MainClassification).description || '',
        icon: (item as MainClassification).icon || '',
        isActive: (item as any).isActive !== undefined ? (item as any).isActive : true,
        order: (item as MainClassification).order || 0,
        color: (item as MainClassification).color || '',
      });
    } else if (level === 'category' && item) {
      setFormData({
        title: (item as Category).title || '',
        slug: (item as Category).slug || '',
        description: (item as Category).description || '',
        icon: (item as Category).icon || '',
        isActive: (item as Category).isActive,
        order: (item as Category).order || 0,
        mainId: (item as Category).mainClassificationId || '',
      });
    } else if (level === 'classification' && item && parentId) {
      setFormData({
        title: (item as Classification).title || '',
        slug: (item as Classification).slug || '',
        icon: (item as Classification).icon || '',
        order: (item as Classification).order || 0,
        categoryId: parentId,
        mainId: structure.find(c => c.id === parentId)?.mainClassificationId || '',
      });
    } else if (level === 'documentation' && item && parentId) {
      setFormData({
        title: (item as Documentation).title || '',
        slug: (item as Documentation).slug || '',
        description: (item as Documentation).description || '',
        icon: (item as Documentation).icon || '',
        order: (item as Documentation).order || 0,
        classificationId: (item as Documentation).classificationId || '',
        content: Array.isArray((item as Documentation).content) ? blocksToHtml((item as Documentation).content) : '',
        categoryId: parentId,
        mainId: structure.find(c => c.id === parentId)?.mainClassificationId || '',
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        description: '',
        icon: '',
        isActive: true,
        classificationId: '',
        order: 0,
        categoryId: level === 'classification' || level === 'documentation' ? (parentId || '') : '',
        mainId: level === 'category' ? (parentId || '') : (parentId ? (structure.find(c => c.id === parentId)?.mainClassificationId || '') : ''),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setEditingLevel(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      description: '',
      icon: '',
      isActive: true,
      classificationId: '',
      order: 0,
      categoryId: '',
      mainId: '',
    });
  };

  const handleSubmit = async () => {
    if (!editingLevel) return;

    try {
      let url, method, payload, response;

      if (editingLevel === 'main') {
        url = editingItem
          ? API_ENDPOINTS.DOCUMENTATION_V2.MAIN.UPDATE((editingItem as MainClassification).id)
          : API_ENDPOINTS.DOCUMENTATION_V2.MAIN.CREATE;
        method = editingItem ? 'PUT' : 'POST';
        payload = editingItem
          ? { ...formData }
          : { ...formData, id: generateId() };
      } else if (editingLevel === 'category') {
        const mainId = editingItem ? (editingItem as Category).mainClassificationId : formData.mainId;
        if (!mainId) {
          setError('يرجى اختيار التصنيف الرئيسي');
          return;
        }
        url = editingItem
          ? API_ENDPOINTS.DOCUMENTATION_V2.CATEGORY.UPDATE(mainId, (editingItem as Category).id)
          : API_ENDPOINTS.DOCUMENTATION_V2.CATEGORY.ADD(mainId);
        method = editingItem ? 'PUT' : 'POST';
        payload = editingItem
          ? {
              ...formData,
              isActive: formData.isActive !== undefined ? formData.isActive : true,
            }
          : {
              ...formData,
              id: generateId(),
              isActive: formData.isActive !== undefined ? formData.isActive : true,
              classifications: [],
              documentations: [],
            };
      } else if (editingLevel === 'classification' && formData.categoryId) {
        const mainId = structure.find(c => c.id === formData.categoryId)?.mainClassificationId || formData.mainId || '';
        if (!mainId) {
          setError('تعذر تحديد التصنيف الرئيسي لهذه الفئة');
          return;
        }
        url = editingItem
          ? API_ENDPOINTS.DOCUMENTATION_V2.CLASSIFICATION.UPDATE(mainId, formData.categoryId, (editingItem as Classification).id)
          : API_ENDPOINTS.DOCUMENTATION_V2.CLASSIFICATION.ADD(mainId, formData.categoryId);
        method = editingItem ? 'PUT' : 'POST';
        payload = editingItem ? formData : { ...formData, id: generateId() };
      } else if (editingLevel === 'documentation' && formData.categoryId) {
        const contentBlocks = Array.isArray(formData.content)
          ? (formData.content as any)
          : htmlToBlocks(formData.content as string || '');
        
        if (!contentBlocks || contentBlocks.length === 0) {
          setError('الرجاء إضافة محتوى للتوثيق');
          return;
        }
        
        const mainId = structure.find(c => c.id === formData.categoryId)?.mainClassificationId || formData.mainId || '';
        if (!mainId) {
          setError('تعذر تحديد التصنيف الرئيسي لهذه الفئة');
          return;
        }
        url = editingItem
          ? API_ENDPOINTS.DOCUMENTATION_V2.DOC.UPDATE(mainId, formData.categoryId, (editingItem as Documentation).id)
          : API_ENDPOINTS.DOCUMENTATION_V2.DOC.ADD(mainId, formData.categoryId);
        method = editingItem ? 'PUT' : 'POST';
        payload = editingItem
          ? {
              ...formData,
              content: contentBlocks,
            }
          : {
              ...formData,
              id: generateId(),
              content: contentBlocks,
            };
      } else {
        setError('بيانات غير مكتملة للحفظ.');
        return;
      }

      response = await apiCall(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response) {
        const msg = editingItem
          ? `تم ${editingLevel === 'category' ? 'تحديث الفئة' : editingLevel === 'classification' ? 'تحديث التصنيف' : 'تحديث التوثيق'} بنجاح`
          : `تم ${editingLevel === 'category' ? 'إضافة الفئة' : editingLevel === 'classification' ? 'إضافة التصنيف' : 'إضافة التوثيق'} بنجاح`;
        setSuccess(msg);
        smartToast.dashboard.success(msg);
        closeModal();
        queryClient.invalidateQueries({ queryKey: ['documentation-structure'] });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const msg = `فشل في ${editingItem ? 'تحديث' : 'حفظ'} ${editingLevel === 'category' ? 'الفئة' : editingLevel === 'classification' ? 'التصنيف' : 'التوثيق'}`;
        setError(msg);
        smartToast.dashboard.error(msg);
      }
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || `حدث خطأ أثناء ${editingItem ? 'تحديث' : 'حفظ'} ${editingLevel === 'category' ? 'الفئة' : editingLevel === 'classification' ? 'التصنيف' : 'التوثيق'}`;
      setError(msg);
      smartToast.dashboard.error(msg);
    }
  };

  const handleDelete = (level: EditingLevel, id: string, parentId?: string) => {
    setDeleteTarget({ level, id, parentId });
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTarget) return;

    try {
      let url, method = 'DELETE', response;

      if (deleteTarget.level === 'main') {
        url = API_ENDPOINTS.DOCUMENTATION_V2.MAIN.DELETE(deleteTarget.id);
      } else if (deleteTarget.level === 'category') {
        const mainId = structure.find(c => c.id === deleteTarget.id)?.mainClassificationId || '';
        if (!mainId) {
          setError('تعذر تحديد التصنيف الرئيسي لهذه الفئة');
          return;
        }
        url = API_ENDPOINTS.DOCUMENTATION_V2.CATEGORY.DELETE(mainId, deleteTarget.id);
      } else if (deleteTarget.level === 'classification' && deleteTarget.parentId) {
        const mainId = structure.find(c => c.id === deleteTarget.parentId)?.mainClassificationId || '';
        if (!mainId) {
          setError('تعذر تحديد التصنيف الرئيسي لهذه الفئة');
          return;
        }
        url = API_ENDPOINTS.DOCUMENTATION_V2.CLASSIFICATION.DELETE(mainId, deleteTarget.parentId, deleteTarget.id);
      } else if (deleteTarget.level === 'documentation' && deleteTarget.parentId) {
        const mainId = structure.find(c => c.id === deleteTarget.parentId)?.mainClassificationId || '';
        if (!mainId) {
          setError('تعذر تحديد التصنيف الرئيسي لهذه الفئة');
          return;
        }
        url = API_ENDPOINTS.DOCUMENTATION_V2.DOC.DELETE(mainId, deleteTarget.parentId, deleteTarget.id);
      } else {
        setError('بيانات غير مكتملة للحذف.');
        return;
      }

      response = await apiCall(url, { method });

      if (response) {
        const msg = `تم حذف ${deleteTarget.level === 'category' ? 'الفئة' : deleteTarget.level === 'classification' ? 'التصنيف' : 'التوثيق'} بنجاح`;
        setSuccess(msg);
        smartToast.dashboard.success(msg);
        queryClient.invalidateQueries({ queryKey: ['documentation-structure'] });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const msg = `فشل في حذف ${deleteTarget.level === 'category' ? 'الفئة' : deleteTarget.level === 'classification' ? 'التصنيف' : 'التوثيق'}`;
        setError(msg);
        smartToast.dashboard.error(msg);
      }
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || `حدث خطأ أثناء حذف ${deleteTarget.level === 'category' ? 'الفئة' : deleteTarget.level === 'classification' ? 'التصنيف' : 'التوثيق'}`;
      setError(msg);
      smartToast.dashboard.error(msg);
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = (formData.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev: any) => ({ ...prev, slug }));
    }
  };

  // --- Render Functions ---
  const renderDocumentations = (documentations: Documentation[], categoryId: string) => (
    <>
      {documentations.map(doc => (
        <div key={doc.id} className="pl-4 border-l-2 border-gray-200">
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">{doc.title}</span>
              <span className="text-xs text-gray-500">({doc.slug})</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => openModal(doc, 'documentation', categoryId)}
                className="p-1 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-md transition-all duration-300 shadow-sm"
                title="تعديل التوثيق"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete('documentation', doc.id, categoryId)}
                className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-all duration-300 border border-red-200 hover:border-red-300"
                title="حذف التوثيق"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const renderClassifications = (classifications: Classification[], documentations: Documentation[], categoryId: string) => {
    const unclassifiedDocs = documentations.filter(doc => !doc.classificationId);
    return (
      <>
        {classifications.map(classification => {
          const classificationDocs = documentations.filter(doc => doc.classificationId === classification.id);
          return (
            <div key={classification.id} className="pl-8 border-l-2 border-gray-300">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-800">{classification.title}</span>
                  <span className="text-xs text-gray-500">({classification.slug})</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(classification, 'classification', categoryId)}
                    className="p-1 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-md transition-all duration-300 shadow-sm"
                    title="تعديل التصنيف"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete('classification', classification.id, categoryId)}
                    className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-all duration-300 border border-red-200 hover:border-red-300"
                    title="حذف التصنيف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => openModal(null, 'documentation', categoryId)}
                    className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-all duration-300 border border-green-200 hover:border-green-300"
                    title="إضافة توثيق"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {renderDocumentations(classificationDocs, categoryId)}
            </div>
          );
        })}
        {unclassifiedDocs.length > 0 && (
          <div className="pl-8 border-l-2 border-gray-300">
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">بدون تصنيف</span>
              </div>
              <button
                onClick={() => openModal(null, 'documentation', categoryId)}
                className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-all duration-300 border border-green-200 hover:border-green-300"
                title="إضافة توثيق"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {renderDocumentations(unclassifiedDocs, categoryId)}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8" />
                إدارة هيكل التوثيق
              </h2>
              <p className="text-gray-200">إضافة وتعديل وحذف الفئات والتصنيفات والتوثيقات</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openModal(null, 'main')}
                className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
              >
                <Plus className="w-5 h-5" />
                إضافة تصنيف رئيسي
              </button>
              <button
                onClick={() => openModal(null, 'category')}
                className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
              >
                <Plus className="w-5 h-5" />
                إضافة فئة
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {loading && <Spinner overlay />}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {mainClassifications.length > 0 && (
            <div className="mb-6">
              {mainClassifications.map(main => (
                <div key={main.id} className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#203f61]" />
                      <h3 className="text-lg font-bold text-gray-900">{main.title}</h3>
                      <span className="text-sm text-gray-500">({main.slug})</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${(main as any).isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {(main as any).isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(main, 'main')}
                        className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="تعديل التصنيف الرئيسي"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(null, 'category', main.id)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-300 transform hover:scale-105"
                        title="إضافة فئة"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('main', main.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                        title="حذف التصنيف الرئيسي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {structure.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد فئات توثيق</h3>
              <p className="text-gray-500 mb-8 text-lg">ابدأ بإضافة فئة جديدة</p>
              <button
                onClick={() => openModal(null, 'category')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                إنشاء فئة جديدة
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {structure.map(category => {
                const isExpanded = expandedCategories.has(category.id);
                return (
                  <div key={category.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleCategory(category.id)} className="p-1 rounded-md hover:bg-gray-200">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <FileText className="w-5 h-5 text-[#203f61]" />
                        <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                        <span className="text-sm text-gray-500">({category.slug})</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {category.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(null, 'classification', category.id)}
                          className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-300 border border-purple-200 hover:border-purple-300 transform hover:scale-105"
                          title="إضافة تصنيف"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(null, 'documentation', category.id)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-300 transform hover:scale-105"
                          title="إضافة توثيق"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(category, 'category')}
                          className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="تعديل الفئة"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('category', category.id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                          title="حذف الفئة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 pl-4">
                        {category.classifications && category.classifications.length > 0 ? (
                          renderClassifications(category.classifications, category.documentations, category.id)
                        ) : (
                          <div className="pl-4">
                            <div className="flex justify-between items-center py-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">بدون تصنيف</span>
                              </div>
                              <button
                                onClick={() => openModal(null, 'documentation', category.id)}
                                className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-all duration-300 border border-green-200 hover:border-green-300"
                                title="إضافة توثيق"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            {renderDocumentations(category.documentations, category.id)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Modal --- */}
        {isModalOpen && editingLevel && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">
                    {editingItem
                      ? `✏️ تعديل ${editingLevel === 'main' ? 'تصنيف رئيسي' : editingLevel === 'category' ? 'فئة' : editingLevel === 'classification' ? 'تصنيف' : 'توثيق'}`
                      : `➕ إضافة ${editingLevel === 'main' ? 'تصنيف رئيسي جديد' : editingLevel === 'category' ? 'فئة جديدة' : editingLevel === 'classification' ? 'تصنيف جديد' : 'توثيق جديد'}`}
                  </h3>
                  <button onClick={closeModal} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* --- Common Fields --- */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder={`أدخل عنوان ال${editingLevel === 'category' ? 'فئة' : editingLevel === 'classification' ? 'تصنيف' : 'توثيق'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder={`أدخل الرابط`}
                      />
                      <button onClick={generateSlug} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap font-medium">توليد تلقائي</button>
                    </div>
                  </div>
                  
                  {editingLevel !== 'classification' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        placeholder={`أدخل وصف ال${editingLevel === 'category' ? 'فئة' : 'توثيق'}`}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الرمز (Icon)</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="مثلاً: feather, book, file-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الترتيب</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      placeholder="رقم الترتيب"
                    />
                  </div>

                  {/* --- Level-Specific Fields --- */}
                  {editingLevel === 'main' && (
                    <>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="isActive"
                          id="isActive"
                          checked={!!formData.isActive}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#203f61] border-gray-300 rounded focus:ring-[#203f61]"
                        />
                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">نشط</label>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">اللون</label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="#203f61"
                        />
                      </div>
                    </>
                  )}
                  {editingLevel === 'category' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">التصنيف الرئيسي *</label>
                        <select
                          name="mainId"
                          value={formData.mainId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        >
                          <option value="">اختر التصنيف الرئيسي</option>
                          {mainClassifications.map(mc => (
                            <option key={mc.id} value={mc.id}>{mc.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="isActive"
                          id="isActive"
                          checked={!!formData.isActive}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#203f61] border-gray-300 rounded focus:ring-[#203f61]"
                        />
                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">نشط</label>
                      </div>
                    </>
                  )}

                  {(editingLevel === 'documentation' || editingLevel === 'classification') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة *</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                      >
                        <option value="">اختر الفئة</option>
                        {structure.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {editingLevel === 'documentation' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">التصنيف (اختياري)</label>
                        <select
                          name="classificationId"
                          value={formData.classificationId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                        >
                          <option value="">بدون تصنيف</option>
                          {structure
                            .find(cat => cat.id === formData.categoryId)
                            ?.classifications?.map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.title}</option>
                            ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">المحتوى *</label>
                        <RichTextEditor
                          value={typeof formData.content === 'string' ? (formData.content as string) : ''}
                          onChange={(value) => setFormData((prev: any) => ({ ...prev, content: value }))}
                          label="محتوى التوثيق"
                          required={true}
                          minHeight="400px"
                          placeholder="أدخل محتوى التوثيق"
                        />
                      </div>
                    </>
                  )}

                </div>
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button onClick={closeModal} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium">إلغاء</button>
                  <button onClick={handleSubmit} className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium">
                    {editingItem ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={isConfirmOpen}
          title={`تأكيد حذف ${deleteTarget?.level === 'category' ? 'فئة' : deleteTarget?.level === 'classification' ? 'تصنيف' : 'توثيق'}`}
          message={`هل أنت متأكد من حذف هذا ال${deleteTarget?.level === 'category' ? 'فئة' : deleteTarget?.level === 'classification' ? 'تصنيف' : 'توثيق'}؟`}
          confirmText="حذف"
          cancelText="إلغاء"
          onConfirm={performDelete}
          onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        />
      </div>
    </div>
  );
};

export default DocumentationManagement;
