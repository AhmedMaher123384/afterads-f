import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Spinner from '../../../components/ui/Spinner';
import RichTextEditor from '../components/layout/RichTextEditor';
import ImageUploader from '../components/layout/ImageUploaderProps';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';

// Types
interface Product {
  id: number;
  name: string;
  name_ar: string;
  name_en: string;
  description: string;
  description_ar: string;
  description_en: string;
  shortDescription: string;
  shortDescription_ar: string;
  shortDescription_en: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number;
  subcategoryId?: number;
  productType: 'product' | 'theme';
  mainImage: string;
  detailedImages: string[];
  isActive: boolean;
  featured: boolean;
  tags: string[];
  faqs: FAQ[];
  addOns: AddOn[];
  productOptions: ProductOption[];
  seoTitle?: string;
  seoTitle_ar?: string;
  seoTitle_en?: string;
  seoDescription?: string;
  seoDescription_ar?: string;
  seoDescription_en?: string;
}

interface FAQ {
  question: string;
  question_ar: string;
  question_en: string;
  answer: string;
  answer_ar: string;
  answer_en: string;
}

interface AddOn {
  name: string;
  name_ar: string;
  name_en: string;
  price: number;
  description: string;
  description_ar: string;
  description_en: string;
}

interface ProductOption {
  type: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'number' | 'color';
  name: string;
  name_ar: string;
  name_en: string;
  label: string;
  label_ar: string;
  label_en: string;
  required: boolean;
  options: OptionValue[];
  placeholder?: string;
  placeholder_ar?: string;
  placeholder_en?: string;
  order: number;
}

interface OptionValue {
  value: string;
  label: string;
  label_ar: string;
  label_en: string;
  priceModifier: number;
  colorCode?: string;
}

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'options' | 'faqs' | 'addons'>('basic');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    name_ar: '',
    name_en: '',
    description: '',
    description_ar: '',
    description_en: '',
    shortDescription: '',
    shortDescription_ar: '',
    shortDescription_en: '',
    price: 0,
    originalPrice: 0,
    isAvailable: true,
    categoryId: 1,
    productType: 'product',
    mainImage: '',
    detailedImages: [],
    isActive: true,
    featured: false,
    tags: [],
    faqs: [],
    addOns: [],
    productOptions: []
  });

  const queryClient = useQueryClient();
  const { data: productsResp, isLoading: productsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.PRODUCTS, queryKey: ['products'] });
  const { data: categoriesResp, isLoading: categoriesLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CATEGORIES, queryKey: ['categories'] });
  useEffect(() => {
    if (!productsResp) return;
    const data = Array.isArray(productsResp) ? productsResp : (productsResp?.products || productsResp?.data || []);
    setProducts(data);
  }, [productsResp]);
  useEffect(() => {
    if (!categoriesResp) return;
    const data = Array.isArray(categoriesResp) ? categoriesResp : (categoriesResp?.data || categoriesResp);
    setCategories(data);
  }, [categoriesResp]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation بسيط
  if (!formData.name?.trim()) {
    setError('الرجاء إدخال اسم المنتج');
    return;
  }
  
  if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
    setError('الرجاء إدخال سعر صحيح للمنتج');
    return;
  }
  
  if (!formData.categoryId) {
    setError('الرجاء اختيار تصنيف المنتج');
    return;
  }

  const descriptionRows = htmlToBlocks(formData.description || '');
  if (!Array.isArray(descriptionRows) || descriptionRows.length === 0) {
    setError('الرجاء كتابة وصف المنتج');
    return;
  }
  
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const dataToSend: any = {
      name: formData.name.trim(),
      name_ar: formData.name_ar?.trim() || '', 
      name_en: formData.name_en?.trim() || '',
      description: descriptionRows,
      description_ar: formData.description_ar?.trim() || '',
      description_en: formData.description_en?.trim() || '',
      shortDescription: formData.shortDescription?.trim() || '',
      shortDescription_ar: formData.shortDescription_ar?.trim() || '',
      shortDescription_en: formData.shortDescription_en?.trim() || '',
      price: Number(formData.price),
      isAvailable: formData.isAvailable ?? true,
      categoryId: Number(formData.categoryId),
      productType: formData.productType || 'product',
      mainImage: formData.mainImage?.trim() || '',
      detailedImages: Array.isArray(formData.detailedImages) ? formData.detailedImages : [],
      isActive: formData.isActive ?? true,
      featured: formData.featured ?? false,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      faqs: Array.isArray(formData.faqs) ? formData.faqs : [],
      addOns: Array.isArray(formData.addOns) ? formData.addOns : [],
      productOptions: Array.isArray(formData.productOptions) ? formData.productOptions : [],
      seoTitle: formData.seoTitle?.trim() || '',
      seoTitle_ar: formData.seoTitle_ar?.trim() || '',
      seoTitle_en: formData.seoTitle_en?.trim() || '',
      seoDescription: formData.seoDescription?.trim() || '',
      seoDescription_ar: formData.seoDescription_ar?.trim() || '',
      seoDescription_en: formData.seoDescription_en?.trim() || ''
    };

    if (formData.originalPrice && !isNaN(Number(formData.originalPrice)) && Number(formData.originalPrice) > 0) {
      dataToSend.originalPrice = Number(formData.originalPrice);
    }

    if (formData.subcategoryId && Number(formData.subcategoryId) > 0) {
      dataToSend.subcategoryId = Number(formData.subcategoryId);
    }

    console.log('Sending data:', dataToSend);
    
    const endpoint = editingProduct 
      ? API_ENDPOINTS.PRODUCT_BY_ID(editingProduct.id)
      : API_ENDPOINTS.PRODUCTS;
    
    await apiCall(endpoint, {
      method: editingProduct ? 'PUT' : 'POST',
      body: JSON.stringify(dataToSend)
    });
    
    setSuccess(editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setTimeout(() => closeModal(), 1500);
    
  } catch (err: any) {
    console.error('Error saving product:', err);
    setError(err.message || 'حدث خطأ أثناء حفظ المنتج');
  } finally {
    setLoading(false);
  }
};

  // Delete product
  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async (id: number) => {

    setLoading(true);
    try {
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id), { method: 'DELETE' });
      setSuccess('تم حذف المنتج بنجاح');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء حذف المنتج');
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

 
const blocksToHtml = (value: any) => {
  if (Array.isArray(value)) {
    const rows: Array<{ text: string; images: Array<{ url: string; orientation?: 'horizontal' | 'vertical' }> }> = [];
    const isTyped = value.some((b: any) => b && typeof b === 'object' && 'type' in b);
    if (isTyped) {
      let current = { text: '', images: [] as Array<{ url: string; orientation?: 'horizontal' | 'vertical' }> };
      value.forEach((b: any) => {
        if (b.type === 'text' && b.text) {
          if (current.text || (current.images && current.images.length)) {
            rows.push(current);
            current = { text: b.text, images: [] };
          } else {
            current.text = b.text;
          }
          if (Array.isArray(b.images) && b.images.length > 0) {
            const normalizedFromText = b.images.map((img: any) => {
              if (typeof img === 'string') return { url: img, orientation: 'horizontal' };
              return { url: img.url, orientation: img.orientation || 'horizontal' };
            });
            current.images = (current.images || []).concat(normalizedFromText);
          }
        } else if (b.type === 'images' && Array.isArray(b.images)) {
          const normalized = b.images.map((img: any) => {
            if (typeof img === 'string') return { url: img, orientation: 'horizontal' };
            return { url: img.url, orientation: img.orientation || 'horizontal' };
          });
          current.images = (current.images || []).concat(normalized);
        }
      });
      if (current.text || (current.images && current.images.length)) rows.push(current);
    } else {
      value.forEach((b: any) => {
        const normalized = Array.isArray(b.images)
          ? b.images.map((img: any) => (typeof img === 'string' ? { url: img, orientation: 'horizontal' } : { url: img.url, orientation: img.orientation || 'horizontal' }))
          : [];
        rows.push({ text: b.text || '', images: normalized });
      });
    }
    return rows.map((row) => {
      const orientation = row.images && row.images.length > 0 ? (row.images[0].orientation || 'horizontal') : 'horizontal';
      const gridCols = orientation === 'vertical' 
        ? 'repeat(auto-fit, minmax(150px, 200px))' 
        : 'repeat(auto-fit, minmax(250px, 1fr))';
      const imagesHtml = (row.images || []).map((img: any) => {
        const src = typeof img === 'string' ? buildImageUrl(img) : buildImageUrl(img.url);
        return `<img src="${src}" alt="صورة" class="w-full h-auto rounded-lg shadow-md" />`;
      }).join('');
      return `
        <div class="row-item my-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
          <div class="row-grid grid md:grid-cols-2 gap-4">
            <div class="block-item text-block" contenteditable="true" data-type="text" style="min-height: 3rem; padding: 0.75rem; border: 2px dashed #e5e7eb; border-radius: 0.5rem;">${row.text || ''}</div>
            <div class="block-item image-block" contenteditable="false" data-type="images">
              <div class="images-grid grid gap-2" data-orientation="${orientation}" style="grid-template-columns: ${gridCols};">
                ${imagesHtml}
              </div>
              <div class="mt-3 flex gap-2 flex-wrap">
                <button type="button" class="add-more-images px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">+ إضافة صور</button>
                <select class="orientation-selector px-2 py-1 border border-gray-300 rounded text-sm">
                  <option value="horizontal" ${orientation === 'horizontal' ? 'selected' : ''}>أفقي</option>
                  <option value="vertical" ${orientation === 'vertical' ? 'selected' : ''}>عمودي</option>
                </select>
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
  const rowItems = container.querySelectorAll('.row-item');
  if (rowItems.length > 0) {
    const rows: Array<{ text: string; images: Array<{ url: string; orientation?: 'horizontal' | 'vertical' }> }> = [];
    rowItems.forEach((row) => {
      const textEl = row.querySelector('.text-block') as HTMLElement | null;
      const textHtml = textEl ? textEl.innerHTML.trim() : '';
      const plain = textEl ? (textEl.textContent || '').trim() : '';
      const text = plain.length > 0 && textHtml && textHtml !== '<p><br></p>' && textHtml !== '<br>' ? textHtml : '';
      const grid = row.querySelector('.images-grid') as HTMLElement | null;
      const orientation = grid?.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
      const images = Array.from(row.querySelectorAll('.images-grid img'))
        .map((img) => ({ url: img.getAttribute('src') || '', orientation }))
        .filter((i) => i.url);
      rows.push({ text, images });
    });
    return rows.filter(b => (b.text && b.text.trim()) || (b.images && b.images.length > 0));
  }

  const rows: any[] = [];
  const items = Array.from(container.querySelectorAll('.block-item'));
  let current: { text: string; images: Array<{ url: string; orientation?: 'horizontal' | 'vertical' }> } = { text: '', images: [] };
  items.forEach((el) => {
    const type = el.getAttribute('data-type') || 'text';
    if (type === 'images') {
      const orientation = el.querySelector('.images-container')?.getAttribute('data-orientation') || 'horizontal';
      const imgs = Array.from(el.querySelectorAll('img')).map((img) => ({
        url: img.getAttribute('src') || '',
        orientation: (img.getAttribute('data-orientation') as 'horizontal' | 'vertical') || (orientation as 'horizontal' | 'vertical'),
      })).filter((i) => i.url);
      current.images = current.images.concat(imgs);
    } else {
      const text = el.innerHTML.trim();
      const plain = (el.textContent || '').trim();
      if (plain.length > 0 && text && text !== '<p><br></p>' && text !== '<br>') {
        if (current.text || current.images.length) {
          rows.push(current);
          current = { text, images: [] };
        } else {
          current.text = text;
        }
      }
    }
  });
  if (current.text || current.images.length) rows.push(current);
  return rows;
};
const openModal = (product?: Product) => {
  if (product) {
    setEditingProduct(product);
    setFormData({
      ...product,
      description: Array.isArray((product as any).description) 
        ? blocksToHtml((product as any).description)
        : product.description
    });
  } else {
    setEditingProduct(null);
    setFormData({
      name: '',
      name_ar: '',
      name_en: '',
      description: '',
      description_ar: '',
      description_en: '',
      shortDescription: '',
      shortDescription_ar: '',
      shortDescription_en: '',
      price: 0,
      originalPrice: 0,
      isAvailable: true,
      categoryId: 1,
      productType: 'product',
      mainImage: '',
      detailedImages: [],
      isActive: true,
      featured: false,
      tags: [],
      faqs: [],
      addOns: [],
      productOptions: []
    });
  }
  setIsModalOpen(true);
  setActiveTab('basic');
  setError('');
  setSuccess('');
};

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError('');
    setSuccess('');
  };

  // FAQ Functions
  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), {
        question: '',
        question_ar: '',
        question_en: '',
        answer: '',
        answer_ar: '',
        answer_en: ''
      }]
    });
  };

  const removeFAQ = (index: number) => {
    const newFAQs = [...(formData.faqs || [])];
    newFAQs.splice(index, 1);
    setFormData({ ...formData, faqs: newFAQs });
  };

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const newFAQs = [...(formData.faqs || [])];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    setFormData({ ...formData, faqs: newFAQs });
  };

  // AddOn Functions
  const addAddOn = () => {
    setFormData({
      ...formData,
      addOns: [...(formData.addOns || []), {
        name: '',
        name_ar: '',
        name_en: '',
        price: 0,
        description: '',
        description_ar: '',
        description_en: ''
      }]
    });
  };

  const removeAddOn = (index: number) => {
    const newAddOns = [...(formData.addOns || [])];
    newAddOns.splice(index, 1);
    setFormData({ ...formData, addOns: newAddOns });
  };

  const updateAddOn = (index: number, field: keyof AddOn, value: string | number) => {
    const newAddOns = [...(formData.addOns || [])];
    newAddOns[index] = { ...newAddOns[index], [field]: value };
    setFormData({ ...formData, addOns: newAddOns });
  };

  // Product Options Functions
  const addProductOption = () => {
    setFormData({
      ...formData,
      productOptions: [...(formData.productOptions || []), {
        type: 'dropdown',
        name: '',
        name_ar: '',
        name_en: '',
        label: '',
        label_ar: '',
        label_en: '',
        required: false,
        options: [],
        order: (formData.productOptions?.length || 0) + 1
      }]
    });
  };

  const removeProductOption = (index: number) => {
    const newOptions = [...(formData.productOptions || [])];
    newOptions.splice(index, 1);
    setFormData({ ...formData, productOptions: newOptions });
  };

  const updateProductOption = (index: number, field: string, value: any) => {
    const newOptions = [...(formData.productOptions || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, productOptions: newOptions });
  };

  const addOptionValue = (optionIndex: number) => {
    const newOptions = [...(formData.productOptions || [])];
    newOptions[optionIndex].options.push({
      value: '',
      label: '',
      label_ar: '',
      label_en: '',
      priceModifier: 0
    });
    setFormData({ ...formData, productOptions: newOptions });
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...(formData.productOptions || [])];
    newOptions[optionIndex].options.splice(valueIndex, 1);
    setFormData({ ...formData, productOptions: newOptions });
  };

  const updateOptionValue = (optionIndex: number, valueIndex: number, field: keyof OptionValue, value: any) => {
    const newOptions = [...(formData.productOptions || [])];
    newOptions[optionIndex].options[valueIndex] = {
      ...newOptions[optionIndex].options[valueIndex],
      [field]: value
    };
    setFormData({ ...formData, productOptions: newOptions });
  };

return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Package className="w-8 h-8" />
                إدارة المنتجات
              </h2>
              <p className="text-gray-200">إضافة وتعديل وحذف المنتجات بكفاءة عالية</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              إضافة منتج جديد
            </button>
          </div>
        </div>

        {/* Success Message */}
        {!isModalOpen && success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {!isModalOpen && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Products Table */}
        {loading && <Spinner overlay />}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {products.length === 0 ? (
            <div className="p-8">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Package className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-8 text-lg">ابدأ بإنشاء منتج جديد لمتجرك</p>
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-300 mx-auto font-medium transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء منتج جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#203f61]">
                  <tr>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">ID</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">الاسم</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">السعر</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-white">الحالة</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-900">{product.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-[#203f61] font-medium mt-1">{product.name_ar}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {product.originalPrice && (
                            <span className="line-through text-gray-400 ml-2">
                              {product.originalPrice} ج.م
                            </span>
                          )}
                          <span className="font-semibold">{product.price} ج.م</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          product.isAvailable && product.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {product.isAvailable && product.isActive ? '✓ متاح' : '✗ غير متاح'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product.id)}
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
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r z-10 from-[#203f61] to-[#2a537e] text-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">
                    {editingProduct ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 px-6 bg-gray-50">
                {[
                  { id: 'basic', label: 'المعلومات الأساسية' },
                  { id: 'seo', label: 'SEO' },
                  { id: 'options', label: 'الخيارات' },
                  { id: 'faqs', label: 'الأسئلة الشائعة' },
                  { id: 'addons', label: 'الإضافات' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#203f61] text-[#203f61]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الاسم (افتراضي) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل اسم المنتج"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الاسم بالعربية
                        </label>
                        <input
                          type="text"
                          value={formData.name_ar}
                          onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="أدخل الاسم بالعربية"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الاسم بالإنجليزية
                        </label>
                        <input
                          type="text"
                          value={formData.name_en}
                          onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="Enter name in English"
                        />
                      </div>
                    </div>

                   <RichTextEditor
  value={formData.description || ''}
  onChange={(value) => setFormData({ ...formData, description: value })}
  label="الوصف *"
  required={true}
  minHeight="400px"
  placeholder="اكتب وصف المنتج التفصيلي هنا..."
/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الوصف المختصر
                        </label>
                        <textarea
                          rows={2}
                          value={formData.shortDescription}
                          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="وصف مختصر"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الوصف المختصر بالعربية
                        </label>
                        <textarea
                          rows={2}
                          value={formData.shortDescription_ar}
                          onChange={(e) => setFormData({ ...formData, shortDescription_ar: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="وصف مختصر بالعربية"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          السعر *
                        </label>
                     <input
  type="number"
  required
  min="0"
  step="0.01"
  value={formData.price || ''}
  onChange={(e) => {
    const value = e.target.value;
    setFormData({ 
      ...formData, 
      price: value === '' ? 0 : parseFloat(value) || 0
    });
  }}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
  placeholder="أدخل السعر (مطلوب)"
/>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          السعر الأصلي (قبل الخصم)
                        </label>
                   <input
  type="number"
  min="0"
  step="0.01"
  value={formData.originalPrice || ''}
  onChange={(e) => {
    const value = e.target.value;
    setFormData({ 
      ...formData, 
      originalPrice: value === '' ? undefined : parseFloat(value)
    });
  }}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
  placeholder="0.00 (اختياري)"
/>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    التصنيف *
  </label>
  <select
    required
    value={formData.categoryId}
    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
  >
    <option value="">اختر التصنيف</option>
    {categories.map((category) => (
      <option key={category.id} value={category.id}>
        {category.name || category.name_ar || category.name_en}
      </option>
    ))}
  </select>
</div>
                    </div>

                  <ImageUploader
  value={formData.mainImage || ''}
  onChange={(value) => setFormData({ ...formData, mainImage: value as string })}
  label="الصورة الرئيسية"
  required={false}
  multiple={false}
/>

<ImageUploader
  value={formData.detailedImages || []}
  onChange={(value) => setFormData({ ...formData, detailedImages: value as string[] })}
  label="الصور التفصيلية"
  required={false}
  multiple={true}
  layout="grid"
  maxImages={8}
/>

                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                          className="w-4 h-4 text-[#203f61] rounded focus:ring-2 focus:ring-[#203f61]"
                        />
                        <span className="text-sm font-medium text-gray-700">متاح للبيع</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 text-[#203f61] rounded focus:ring-2 focus:ring-[#203f61]"
                        />
                        <span className="text-sm font-medium text-gray-700">نشط</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 text-[#203f61] rounded focus:ring-2 focus:ring-[#203f61]"
                        />
                        <span className="text-sm font-medium text-gray-700">مميز</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          عنوان SEO (افتراضي)
                        </label>
                        <input
                          type="text"
                          maxLength={60}
                          value={formData.seoTitle || ''}
                          onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="عنوان SEO"
                        />
                        <p className="text-xs text-gray-500 mt-1">{(formData.seoTitle || '').length}/60</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          عنوان SEO بالعربية
                        </label>
                        <input
                          type="text"
                          maxLength={60}
                          value={formData.seoTitle_ar || ''}
                          onChange={(e) => setFormData({ ...formData, seoTitle_ar: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="عنوان SEO بالعربية"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          عنوان SEO بالإنجليزية
                        </label>
                        <input
                          type="text"
                          maxLength={60}
                          value={formData.seoTitle_en || ''}
                          onChange={(e) => setFormData({ ...formData, seoTitle_en: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                          placeholder="SEO Title in English"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        وصف SEO
                      </label>
                      <textarea
                        rows={3}
                        maxLength={160}
                        value={formData.seoDescription || ''}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                        placeholder="وصف SEO"
                      />
                      <p className="text-xs text-gray-500 mt-1">{(formData.seoDescription || '').length}/160</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          وصف SEO بالعربية
                        </label>
                        <textarea
                          rows={3}
                          maxLength={160}
                          value={formData.seoDescription_ar || ''}
                          onChange={(e) => setFormData({ ...formData, seoDescription_ar: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="وصف SEO بالعربية"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          وصف SEO بالإنجليزية
                        </label>
                        <textarea
                          rows={3}
                          maxLength={160}
                          value={formData.seoDescription_en || ''}
                          onChange={(e) => setFormData({ ...formData, seoDescription_en: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all resize-none"
                          placeholder="SEO Description in English"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Options Tab */}
                {activeTab === 'options' && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={addProductOption}
                      className="flex items-center gap-2 text-[#203f61] hover:text-[#2a537e] font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة خيار جديد
                    </button>
                    {formData.productOptions?.map((option, optionIndex) => (
                      <div key={optionIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">خيار {optionIndex + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeProductOption(optionIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              نوع الخيار
                            </label>
                            <select
                              value={option.type}
                              onChange={(e) => updateProductOption(optionIndex, 'type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="dropdown">قائمة منسدلة</option>
                              <option value="radio">اختيار واحد</option>
                              <option value="checkbox">اختيار متعدد</option>
                              <option value="text">نص</option>
                              <option value="number">رقم</option>
                              <option value="color">لون</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              اسم الخيار
                            </label>
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) => updateProductOption(optionIndex, 'name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              التسمية (افتراضي)
                            </label>
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateProductOption(optionIndex, 'label', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              التسمية بالعربية
                            </label>
                            <input
                              type="text"
                              value={option.label_ar}
                              onChange={(e) => updateProductOption(optionIndex, 'label_ar', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              التسمية بالإنجليزية
                            </label>
                            <input
                              type="text"
                              value={option.label_en}
                              onChange={(e) => updateProductOption(optionIndex, 'label_en', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={option.required}
                            onChange={(e) => updateProductOption(optionIndex, 'required', e.target.checked)}
                            className="w-4 h-4 text-[#203f61] rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">خيار إلزامي</span>
                        </label>

                        {/* Option Values */}
                        {['dropdown', 'radio', 'checkbox', 'color'].includes(option.type) && (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-700">القيم المتاحة</h5>
                              <button
                                type="button"
                                onClick={() => addOptionValue(optionIndex)}
                                className="text-sm text-[#203f61] hover:text-[#2a537e] flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                إضافة قيمة
                              </button>
                            </div>
                            {option.options?.map((optValue, valueIndex) => (
                              <div key={valueIndex} className="flex gap-2 items-start">
                                <input
                                  type="text"
                                  placeholder="القيمة"
                                  value={optValue.value}
                                  onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'value', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="التسمية"
                                  value={optValue.label}
                                  onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'label', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="السعر +"
                                  value={optValue.priceModifier}
                                  onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'priceModifier', parseFloat(e.target.value))}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                {option.type === 'color' && (
                                  <input
                                    type="color"
                                    value={optValue.colorCode || '#000000'}
                                    onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'colorCode', e.target.value)}
                                    className="w-12 h-10 border border-gray-300 rounded-lg"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={addFAQ}
                      className="flex items-center gap-2 text-[#203f61] hover:text-[#2a537e] font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة سؤال شائع
                    </button>
                    {formData.faqs?.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">سؤال {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeFAQ(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="السؤال (افتراضي)"
                            value={faq.question}
                            onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="السؤال بالعربية"
                            value={faq.question_ar}
                            onChange={(e) => updateFAQ(index, 'question_ar', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="السؤال بالإنجليزية"
                            value={faq.question_en}
                            onChange={(e) => updateFAQ(index, 'question_en', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <textarea
                            placeholder="الإجابة (افتراضي)"
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                          />
                          <textarea
                            placeholder="الإجابة بالعربية"
                            rows={3}
                            value={faq.answer_ar}
                            onChange={(e) => updateFAQ(index, 'answer_ar', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                          />
                          <textarea
                            placeholder="الإجابة بالإنجليزية"
                            rows={3}
                            value={faq.answer_en}
                            onChange={(e) => updateFAQ(index, 'answer_en', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add-ons Tab */}
                {activeTab === 'addons' && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={addAddOn}
                      className="flex items-center gap-2 text-[#203f61] hover:text-[#2a537e] font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة خدمة إضافية
                    </button>
                    {formData.addOns?.map((addon, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">إضافة {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeAddOn(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="الاسم (افتراضي)"
                            value={addon.name}
                            onChange={(e) => updateAddOn(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="الاسم بالعربية"
                            value={addon.name_ar}
                            onChange={(e) => updateAddOn(index, 'name_ar', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="الاسم بالإنجليزية"
                            value={addon.name_en}
                            onChange={(e) => updateAddOn(index, 'name_en', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            السعر الإضافي
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={addon.price}
                            onChange={(e) => updateAddOn(index, 'price', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="0.00"
                          />
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <RichTextEditor
    value={formData.description_ar || ''}
    onChange={(value) => setFormData({ ...formData, description_ar: value })}
    label="الوصف بالعربية"
    minHeight="250px"
    placeholder="اكتب الوصف بالعربية..."
  />
  <RichTextEditor
    value={formData.description_en || ''}
    onChange={(value) => setFormData({ ...formData, description_en: value })}
    label="الوصف بالإنجليزية"
    minHeight="250px"
    placeholder="Write description in English..."
  />
</div>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && <Spinner overlay />}

        <ConfirmationModal
          isOpen={isConfirmOpen}
          title="⚠️ تأكيد الحذف"
          message={`هل أنت متأكد من حذف هذا المنتج؟\nلا يمكن التراجع عن هذا الإجراء.`}
          onConfirm={() => deleteTargetId != null && handleDelete(deleteTargetId)}
          onCancel={() => {
            setIsConfirmOpen(false);
            setDeleteTargetId(null);
          }}
          confirmText={loading ? 'جاري الحذف...' : 'حذف'}
          cancelText="إلغاء"
        />
      </div>
    </div>
  );
};

export default ProductsManagement;

// ✅ عدّل دالة htmlToBlocks لتتعامل مع الحالات الخاصة:

 