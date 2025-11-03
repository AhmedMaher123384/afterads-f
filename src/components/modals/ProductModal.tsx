import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildApiUrl, buildImageUrl } from '../../config/api';
import ProductOptionsBuilder from '../ProductOptionsBuilder';

interface ProductOption {
  id: string;
  type: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'number' | 'color';
  name: {
    ar: string;
    en: string;
  };
  label: {
    ar: string;
    en: string;
  };
  required: boolean;
  options?: Array<{
    value: string;
    label: {
      ar: string;
      en: string;
    };
    priceModifier: number;
    colorCode?: string;
  }>;
  placeholder?: {
    ar: string;
    en: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
}

interface Product {
  id: number;
  name: string;
  shortDescription?: string;
  description: string;
  price: number;
  originalPrice?: number;
  isAvailable: boolean;
  categoryId: number | null;
  subcategoryId?: number | null;
  productType?: 'product' | 'theme';
  mainImage: string;
  detailedImages: string[];
  isActive?: boolean;
  faqs?: { question: string; answer: string }[];
  addOns?: { name: string; price: number; description?: string }[];
  productOptions?: ProductOption[];
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  parentId?: number | null;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_en: '',
    shortDescription: '',
    shortDescription_ar: '',
    shortDescription_en: '',
    description: '',
    description_ar: '',
    description_en: '',
    price: 0,
    originalPrice: 0,
    isAvailable: true,
    categoryId: null as number | null,
    subcategoryId: null as number | null,
    productType: 'product' as 'product' | 'theme',
    isActive: true,
    seoTitle: '',
    seoTitle_ar: '',
    seoTitle_en: '',
    seoDescription: '',
    seoDescription_ar: '',
    seoDescription_en: '',
    metaTitle: '',
    metaTitle_ar: '',
    metaTitle_en: '',
    metaDescription: '',
    metaDescription_ar: '',
    metaDescription_en: ''
  });

  const [faqs, setFaqs] = useState<{ 
    question: string; 
    answer: string;
    question_ar?: string;
    question_en?: string;
    answer_ar?: string;
    answer_en?: string;
  }[]>([]);
  const [addOns, setAddOns] = useState<{ 
    name: string; 
    price: number; 
    description?: string;
    name_ar?: string;
    name_en?: string;
    description_ar?: string;
    description_en?: string;
  }[]>([]);

  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailedImageFiles, setDetailedImageFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [existingDetailedImages, setExistingDetailedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const isEditing = !!product;

  // دالة لجلب البيانات الكاملة للمنتج
  const fetchFullProductData = async (productId: number) => {
    try {
      setLoading(true);
      console.log('🔍 ProductModal: Fetching full product data for ID:', productId);
      
      const fullProduct = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(productId));
      console.log('🔍 ProductModal: Full product data received:', fullProduct);
      
      setFormData({
        name: fullProduct.name || '',
        name_ar: fullProduct.name_ar || '',
        name_en: fullProduct.name_en || '',
        shortDescription: fullProduct.shortDescription || '',
        shortDescription_ar: fullProduct.shortDescription_ar || '',
        shortDescription_en: fullProduct.shortDescription_en || '',
        description: fullProduct.description || '',
        description_ar: fullProduct.description_ar || '',
        description_en: fullProduct.description_en || '',
        price: fullProduct.price || 0,
        originalPrice: fullProduct.originalPrice || 0,
        isAvailable: fullProduct.isAvailable !== undefined ? fullProduct.isAvailable : true,
        categoryId: fullProduct.categoryId || null,
        subcategoryId: fullProduct.subcategoryId || null,
        productType: fullProduct.productType || 'product',
        isActive: fullProduct.isActive !== undefined ? fullProduct.isActive : true,
        seoTitle: fullProduct.seoTitle || '',
        seoTitle_ar: fullProduct.seoTitle_ar || '',
        seoTitle_en: fullProduct.seoTitle_en || '',
        seoDescription: fullProduct.seoDescription || '',
        seoDescription_ar: fullProduct.seoDescription_ar || '',
        seoDescription_en: fullProduct.seoDescription_en || '',
        metaTitle: fullProduct.metaTitle || '',
        metaTitle_ar: fullProduct.metaTitle_ar || '',
        metaTitle_en: fullProduct.metaTitle_en || '',
        metaDescription: fullProduct.metaDescription || '',
        metaDescription_ar: fullProduct.metaDescription_ar || '',
        metaDescription_en: fullProduct.metaDescription_en || ''
      });
      
      // Ensure FAQs have multilingual fields
      const processedFaqs = (fullProduct.faqs || []).map((faq: any) => ({
        question: faq.question || '',
        answer: faq.answer || '',
        question_ar: faq.question_ar || faq.question || '',
        question_en: faq.question_en || '',
        answer_ar: faq.answer_ar || faq.answer || '',
        answer_en: faq.answer_en || ''
      }));
      setFaqs(processedFaqs);
      
      // Ensure AddOns have multilingual fields
      const processedAddOns = (fullProduct.addOns || []).map((addOn: any) => ({
        name: addOn.name || '',
        price: addOn.price || 0,
        description: addOn.description || '',
        name_ar: addOn.name_ar || addOn.name || '',
        name_en: addOn.name_en || '',
        description_ar: addOn.description_ar || addOn.description || '',
        description_en: addOn.description_en || ''
      }));
      setAddOns(processedAddOns);

      // معالجة productOptions - تحويل من تنسيق قاعدة البيانات إلى تنسيق الواجهة الأمامية
      const processedProductOptions = (fullProduct.productOptions || []).map((option: any) => ({
        id: option.id || Math.random().toString(36).substr(2, 9),
        type: option.type,
        name: {
          ar: option.name_ar || option.name || '',
          en: option.name_en || ''
        },
        label: {
          ar: option.label_ar || option.label || '',
          en: option.label_en || ''
        },
        required: option.required || false,
        options: (option.options || []).map((opt: any) => ({
          value: opt.value || '',
          label: {
            ar: opt.label_ar || opt.label || '',
            en: opt.label_en || ''
          },
          priceModifier: opt.priceModifier || 0,
          colorCode: opt.colorCode || ''
        })),
        placeholder: {
          ar: option.placeholder_ar || option.placeholder || '',
          en: option.placeholder_en || ''
        },
        validation: option.validation || {},
        order: option.order || 0
      }));
      setProductOptions(processedProductOptions);
      
      if (fullProduct.mainImage) {
        setMainImagePreview(buildImageUrl(fullProduct.mainImage));
      }
      setExistingDetailedImages(fullProduct.detailedImages || []);
      
    } catch (error) {
      console.error('Error fetching full product data:', error);
      smartToast.dashboard.error('فشل في جلب بيانات المنتج');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAllSubcategories(); // جلب جميع الفئات الفرعية عند فتح النموذج
      
      if (product) {
        console.log('🔍 ProductModal: Opening edit mode for product:', product);
        // جلب البيانات الكاملة للمنتج من API
        fetchFullProductData(product.id);
      } else {
        setFormData({
          name: '',
          name_ar: '',
          name_en: '',
          shortDescription: '',
          shortDescription_ar: '',
          shortDescription_en: '',
          description: '',
          description_ar: '',
          description_en: '',
          price: 0,
          originalPrice: 0,
          isAvailable: true,
          categoryId: null,
          subcategoryId: null,
          productType: 'product',
          isActive: true,
          seoTitle: '',
          seoTitle_ar: '',
          seoTitle_en: '',
          seoDescription: '',
          seoDescription_ar: '',
          seoDescription_en: '',
          metaTitle: '',
          metaTitle_ar: '',
          metaTitle_en: '',
          metaDescription: '',
          metaDescription_ar: '',
          metaDescription_en: ''
        });
        setFaqs([]);
        setAddOns([]);
        setProductOptions([]);
        setMainImagePreview('');
        setSubcategories([]); // إعادة تعيين الصب كاتيجوري
      }
      
      setMainImageFile(null);
      setDetailedImageFiles([]);
      setExistingDetailedImages([]);
      setErrors({});
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await apiCall(API_ENDPOINTS.CATEGORIES, {
        method: 'GET'
      });
      console.log('Categories response:', response);
      // الخادم الخلفي يعيد البيانات مباشرة كـ array وليس في شكل {success, data}
      if (Array.isArray(response)) {
        console.log('Categories data:', response);
        setCategories(response);
      } else if (response.success && response.data) {
        console.log('Categories data:', response.data);
        setCategories(response.data);
      } else {
        console.error('Failed to fetch categories:', response.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllSubcategories = async () => {
    try {
      console.log('🔍 Fetching all subcategories...');
      const response = await apiCall(API_ENDPOINTS.SUBCATEGORIES);
      console.log('📦 All subcategories API response:', response);
      
      // التعامل مع استجابة API الصحيحة
      if (response && response.success && Array.isArray(response.data)) {
        console.log('✅ Setting all subcategories from response.data:', response.data);
        setSubcategories(response.data);
      } else if (Array.isArray(response)) {
        console.log('✅ Setting all subcategories from direct response:', response);
        setSubcategories(response);
      } else if (response && Array.isArray(response.data)) {
        console.log('✅ Setting all subcategories from response.data (no success flag):', response.data);
        setSubcategories(response.data);
      } else {
        console.log('❌ No valid subcategories found, setting empty array. Response:', response);
        setSubcategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching all subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchSubcategories = async (parentCategoryId: number) => {
    try {
      console.log('🔍 Fetching subcategories for parent ID:', parentCategoryId);
      const response = await apiCall(API_ENDPOINTS.SUBCATEGORIES_BY_PARENT(parentCategoryId));
      console.log('📦 Subcategories API response:', response);
      
      // التعامل مع استجابة API الصحيحة
      if (response && response.success && Array.isArray(response.data)) {
        console.log('✅ Setting subcategories from response.data:', response.data);
        setSubcategories(response.data);
      } else if (Array.isArray(response)) {
        console.log('✅ Setting subcategories from direct response:', response);
        setSubcategories(response);
      } else if (response && Array.isArray(response.data)) {
        console.log('✅ Setting subcategories from response.data (no success flag):', response.data);
        setSubcategories(response.data);
      } else {
        console.log('❌ No valid subcategories found, setting empty array. Response:', response);
        setSubcategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // إذا تم تغيير الكاتيجوري، نحتاج لجلب الصب كاتيجوري وإعادة تعيين subcategoryId
    if (name === 'categoryId') {
      const categoryId = value === '' ? null : Number(value);
      console.log('🏷️ Category changed to:', categoryId);
      setFormData(prev => ({
        ...prev,
        categoryId,
        subcategoryId: null // إعادة تعيين الصب كاتيجوري عند تغيير الكاتيجوري
      }));
      
      // جلب الصب كاتيجوري للكاتيجوري المختار
      if (categoryId) {
        console.log('🔄 Fetching subcategories for category:', categoryId);
        fetchSubcategories(categoryId);
      } else {
        console.log('🧹 Clearing subcategories');
        setSubcategories([]);
      }
    } else if (name === 'subcategoryId') {
      const subcategoryId = value === '' ? null : Number(value);
      setFormData(prev => ({
        ...prev,
        subcategoryId,
        // ذا تم اختيار صب كاتيجوري، نحتاج لتعيين categoryId إلى parentId الخاص بالصب كاتيجوري
        categoryId: subcategoryId ? 
          subcategories.find(sub => sub.id === subcategoryId)?.parentId || prev.categoryId 
          : prev.categoryId
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'originalPrice' || name === 'stock'
          ? (value === '' ? 0 : Number(value))
          : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        setMainImageFile(compressedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          setMainImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        setMainImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setMainImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDetailedImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressedFiles = await Promise.all(
      files.map(file => compressImage(file, 800, 0.7))
    );
    setDetailedImageFiles(prev => [...prev, ...compressedFiles]);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 800, 0.7))
      );
      setDetailedImageFiles(prev => [...prev, ...compressedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeDetailedImage = (index: number) => {
    setDetailedImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDetailedImage = (index: number) => {
    setExistingDetailedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate product name (at least one language required)
    if (!formData.name_ar.trim() && !formData.name_en.trim()) {
      newErrors.name = selectedLanguage === 'ar' 
        ? 'اسم المنتج مطلوب بإحدى اللغتين على الأقل'
        : 'Product name is required in at least one language';
    }
    
    // Validate price
    if (!formData.price || formData.price <= 0) {
      newErrors.price = selectedLanguage === 'ar'
        ? 'السعر مطلوب ويجب أن يكون أكبر من صفر'
        : 'Price is required and must be greater than zero';
    }
    
    // Validate category
    if (!formData.categoryId) {
      newErrors.categoryId = selectedLanguage === 'ar'
        ? 'التصنيف مطلوب'
        : 'Category is required';
    }
    
    // Validate description (at least one language required)
    if (!formData.description_ar.trim() && !formData.description_en.trim()) {
      newErrors.description = selectedLanguage === 'ar'
        ? 'وصف المنتج مطلوب بإحدى اللغتين على الأقل'
        : 'Product description is required in at least one language';
    }
    
    // Validate productOptions
    if (productOptions.length > 0) {
      productOptions.forEach((option, optionIndex) => {
        // Validate option name (at least one language required)
        const nameAr = option.name?.ar || '';
        const nameEn = option.name?.en || '';
        if (!nameAr.trim() && !nameEn.trim()) {
          newErrors[`productOption_${optionIndex}_name`] = selectedLanguage === 'ar'
            ? `اسم الخيار ${optionIndex + 1} مطلوب بإحدى اللغتين على الأقل`
            : `Option ${optionIndex + 1} name is required in at least one language`;
        }
        
        // Validate option label (at least one language required)
        const labelAr = option.label?.ar || '';
        const labelEn = option.label?.en || '';
        if (!labelAr.trim() && !labelEn.trim()) {
          newErrors[`productOption_${optionIndex}_label`] = selectedLanguage === 'ar'
            ? `تسمية الخيار ${optionIndex + 1} مطلوبة بإحدى اللغتين على الأقل`
            : `Option ${optionIndex + 1} label is required in at least one language`;
        }
        
        // Validate option values for dropdown, radio, checkbox, and color types
        if (['dropdown', 'radio', 'checkbox', 'color'].includes(option.type)) {
          if (!option.options || option.options.length === 0) {
            newErrors[`productOption_${optionIndex}_values`] = selectedLanguage === 'ar'
              ? `الخيار ${optionIndex + 1} يجب أن يحتوي على قيمة واحدة على الأقل`
              : `Option ${optionIndex + 1} must have at least one value`;
          } else {
            option.options.forEach((optionValue, valueIndex) => {
              // Validate option value
              const value = optionValue.value || '';
              if (!value.trim()) {
                newErrors[`productOption_${optionIndex}_value_${valueIndex}`] = selectedLanguage === 'ar'
                  ? `قيمة الخيار ${optionIndex + 1} - ${valueIndex + 1} مطلوبة`
                  : `Option ${optionIndex + 1} - Value ${valueIndex + 1} is required`;
              }
              
              // Validate option value label (at least one language required)
              const valueLabelAr = optionValue.label?.ar || '';
              const valueLabelEn = optionValue.label?.en || '';
              if (!valueLabelAr.trim() && !valueLabelEn.trim()) {
                newErrors[`productOption_${optionIndex}_value_${valueIndex}_label`] = selectedLanguage === 'ar'
                  ? `تسمية قيمة الخيار ${optionIndex + 1} - ${valueIndex + 1} مطلوبة بإحدى اللغتين على الأقل`
                  : `Option ${optionIndex + 1} - Value ${valueIndex + 1} label is required in at least one language`;
              }
            });
          }
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Debug: Log form data before sending
      console.log('Form data before sending:', {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar,
        description_en: formData.description_en,
        price: formData.price,
        categoryId: formData.categoryId
      });
      
      // Multilingual fields
      formDataToSend.append('name_ar', formData.name_ar);
      formDataToSend.append('name_en', formData.name_en);
      formDataToSend.append('shortDescription_ar', formData.shortDescription_ar);
      formDataToSend.append('shortDescription_en', formData.shortDescription_en);
      formDataToSend.append('description_ar', formData.description_ar);
      formDataToSend.append('description_en', formData.description_en);
      
      // Legacy fields for backward compatibility
      const legacyName = formData.name_ar || formData.name_en;
      const legacyDescription = formData.description_ar || formData.description_en;
      
      console.log('Legacy fields:', { legacyName, legacyDescription });
      
      formDataToSend.append('name', legacyName);
      formDataToSend.append('shortDescription', formData.shortDescription_ar || formData.shortDescription_en);
      formDataToSend.append('description', legacyDescription);
      
      formDataToSend.append('price', formData.price.toString());
      if (formData.originalPrice) {
        formDataToSend.append('originalPrice', formData.originalPrice.toString());
      }
      formDataToSend.append('isAvailable', formData.isAvailable.toString());
      
      // Always send categoryId (required by backend)
      if (formData.categoryId) {
        formDataToSend.append('categoryId', formData.categoryId.toString());
        // Legacy field for backward compatibility
        formDataToSend.append('category', formData.categoryId.toString());
      }
      
      if (formData.subcategoryId) {
        formDataToSend.append('subcategoryId', formData.subcategoryId.toString());
      }
      formDataToSend.append('isActive', formData.isActive.toString());
      
      // SEO fields - multilingual
      formDataToSend.append('seoTitle_ar', formData.seoTitle_ar);
      formDataToSend.append('seoTitle_en', formData.seoTitle_en);
      formDataToSend.append('seoDescription_ar', formData.seoDescription_ar);
      formDataToSend.append('seoDescription_en', formData.seoDescription_en);
      formDataToSend.append('metaTitle_ar', formData.metaTitle_ar);
      formDataToSend.append('metaTitle_en', formData.metaTitle_en);
      formDataToSend.append('metaDescription_ar', formData.metaDescription_ar);
      formDataToSend.append('metaDescription_en', formData.metaDescription_en);
      
      // Legacy SEO fields for backward compatibility
      formDataToSend.append('seoTitle', formData.seoTitle_ar || formData.seoTitle_en);
      formDataToSend.append('seoDescription', formData.seoDescription_ar || formData.seoDescription_en);
      formDataToSend.append('metaTitle', formData.metaTitle_ar || formData.metaTitle_en);
      formDataToSend.append('metaDescription', formData.metaDescription_ar || formData.metaDescription_en);
      
      if (faqs.length > 0) {
        formDataToSend.append('faqs', JSON.stringify(faqs));
      }
      
      if (addOns.length > 0) {
        formDataToSend.append('addOns', JSON.stringify(addOns));
      }

      if (productOptions.length > 0) {
        // تحويل بنية productOptions لتتوافق مع backend
        const convertedProductOptions = productOptions.map(option => ({
          type: option.type,
          name: option.name.ar || option.name.en || '',
          name_ar: option.name.ar || '',
          name_en: option.name.en || '',
          label: option.label.ar || option.label.en || '',
          label_ar: option.label.ar || '',
          label_en: option.label.en || '',
          required: option.required,
          options: option.options?.map(opt => ({
            value: opt.value,
            label: opt.label.ar || opt.label.en || '',
            label_ar: opt.label.ar || '',
            label_en: opt.label.en || '',
            priceModifier: opt.priceModifier,
            colorCode: opt.colorCode || ''
          })) || [],
          placeholder: option.placeholder?.ar || option.placeholder?.en || '',
          placeholder_ar: option.placeholder?.ar || '',
          placeholder_en: option.placeholder?.en || '',
          validation: option.validation || {},
          order: option.order
        }));
        
        formDataToSend.append('productOptions', JSON.stringify(convertedProductOptions));
      }

      if (mainImageFile) {
        formDataToSend.append('mainImage', mainImageFile);
      }
      
      if (detailedImageFiles.length > 0) {
        detailedImageFiles.forEach((file, index) => {
          formDataToSend.append(`detailedImages`, file);
        });
      }

      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const endpoint = isEditing
        ? API_ENDPOINTS.PRODUCT_BY_ID(product!.id.toString())
        : API_ENDPOINTS.PRODUCTS;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      console.log('Sending request to:', endpoint, 'with method:', method);
      
      const response = await apiCall(endpoint, {
        method,
        body: formDataToSend
      });
      
      // Check if response contains product data (successful creation/update)
      if (response && (response.id || response._id)) {
        smartToast.dashboard.success(isEditing ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
        onSuccess();
        handleClose();
      } else {
        smartToast.dashboard.error(response.message || 'حدث خطأ أثناء حفظ المنتج');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      smartToast.dashboard.error('حدث خطأ أثناء حفظ المنتج');
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
            {isEditing 
              ? (selectedLanguage === 'ar' ? 'تعديل المنتج' : 'Edit Product')
              : (selectedLanguage === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')
            }
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
          {/* Language Toggle */}
          <div className="mb-6 flex justify-center">
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                type="button"
                onClick={() => setSelectedLanguage('ar')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedLanguage === 'ar'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedLanguage === 'en'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                المعلومات الأساسية
              </h3>
              
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {selectedLanguage === 'ar' ? 'اسم المنتج *' : 'Product Name *'}
                  </label>
                  <input
                    type="text"
                    name={selectedLanguage === 'ar' ? 'name_ar' : 'name_en'}
                    value={selectedLanguage === 'ar' ? formData.name_ar : formData.name_en}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={selectedLanguage === 'ar' ? 'أدخل اسم المنتج...' : 'Enter product name...'}
                    dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {selectedLanguage === 'ar' ? 'وصف مختصر' : 'Short Description'}
                  </label>
                  <textarea
                    name={selectedLanguage === 'ar' ? 'shortDescription_ar' : 'shortDescription_en'}
                    value={selectedLanguage === 'ar' ? formData.shortDescription_ar : formData.shortDescription_en}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                    placeholder={selectedLanguage === 'ar' ? 'أدخل وصف مختصر...' : 'Enter short description...'}
                    dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {selectedLanguage === 'ar' ? 'وصف كامل *' : 'Full Description *'}
                  </label>
                  <textarea
                    name={selectedLanguage === 'ar' ? 'description_ar' : 'description_en'}
                    value={selectedLanguage === 'ar' ? formData.description_ar : formData.description_en}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={selectedLanguage === 'ar' ? 'أدخل وصف تفصيلي...' : 'Enter detailed description...'}
                    dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedLanguage === 'ar' ? 'التصنيف *' : 'Category *'}
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                      errors.categoryId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">{selectedLanguage === 'ar' ? 'اختر التصنيف' : 'Select Category'}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {selectedLanguage === 'ar' 
                          ? (category.name_ar || category.name) 
                          : (category.name_en || category.name)
                        }
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                  )}
                </div>

                {/* Subcategory */}
                {(() => {
                  console.log('🎯 Render check - categoryId:', formData.categoryId, 'subcategories:', subcategories);
                  console.log('🎯 Render check - formData.subcategoryId:', formData.subcategoryId);
                  return null;
                })()}
                {subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {selectedLanguage === 'ar' ? 'التصنيف الفرعي' : 'Subcategory'}
                    </label>
                    <select
                      name="subcategoryId"
                      value={formData.subcategoryId || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    >
                      <option value="">{selectedLanguage === 'ar' ? 'اختر التصنيف الفرعي (اختياري)' : 'Select Subcategory (Optional)'}</option>
                      {subcategories.map(subcategory => {
                        const parentCategory = categories.find(cat => cat.id === subcategory.parentId);
                        const subcategoryName = selectedLanguage === 'ar' 
                          ? (subcategory.name_ar || subcategory.name) 
                          : (subcategory.name_en || subcategory.name);
                        const parentName = parentCategory 
                          ? (selectedLanguage === 'ar' 
                              ? (parentCategory.name_ar || parentCategory.name) 
                              : (parentCategory.name_en || parentCategory.name))
                          : '';
                        
                        return (
                          <option key={subcategory.id} value={subcategory.id}>
                            {parentName ? `${parentName} - ${subcategoryName}` : subcategoryName}
                          </option>
                        );
                      })}
                    </select>
                    {!formData.categoryId && (
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedLanguage === 'ar' 
                          ? 'ملاحظة: اختيار التصنيف الفرعي سيحدد التصنيف الرئيسي تلقائياً' 
                          : 'Note: Selecting a subcategory will automatically set the main category'
                        }
                      </p>
                    )}
                  </div>
                )}

                

                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      السعر الحالي (ر.س) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="أدخل السعر"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">ر.س</span>
                      </div>
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      السعر قبل الخصم (ر.س)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="السعر الأصلي (اختياري)"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">ر.س</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      حالة التوفر *
                    </label>
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="isAvailable"
                          checked={formData.isAvailable === true}
                          onChange={() => setFormData(prev => ({ ...prev, isAvailable: true }))}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="mr-2 text-sm font-medium text-green-700">متوفر</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="isAvailable"
                          checked={formData.isAvailable === false}
                          onChange={() => setFormData(prev => ({ ...prev, isAvailable: false }))}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 focus:ring-2"
                        />
                        <span className="mr-2 text-sm font-medium text-red-700">غير متوفر</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    حالة المنتج
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={formData.isActive === true}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black focus:ring-2"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">مفعل</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={formData.isActive === false}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black focus:ring-2"
                      />
                      <span className="mr-2 text-sm font-medium text-gray-700">غير مفعل</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm ml-3">📷</span>
                صور المنتج
              </h3>
              
              <div className="space-y-6">
                {/* Main Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الصورة الرئيسية
                    <span className="text-xs text-gray-500 mr-2">(يمكن السحب والإفلات)</span>
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const files = Array.from(e.dataTransfer.files);
                      if (files.length > 0 && files[0].type.startsWith('image/')) {
                        handleMainImageChange({ target: { files } } as any);
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      onChange={handleMainImageChange}
                      accept="image/*"
                      className="hidden"
                      id="mainImage"
                    />
                    <label htmlFor="mainImage" className="cursor-pointer">
                      {mainImagePreview || mainImageFile ? (
                        <div className="space-y-2">
                          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-gray-300 group relative">
                            <img
                              src={mainImageFile 
                                ? URL.createObjectURL(mainImageFile) 
                                : mainImagePreview
                              }
                              alt="صورة رئيسية"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMainImageFile(null);
                                setMainImagePreview('');
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                              title="حذف الصورة"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                              رئيسية
                            </div>
                            {mainImageFile && (
                              <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                                {(mainImageFile.size / 1024).toFixed(0)}KB
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 font-semibold">اضغط لتغيير الصورة</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                            dragActive ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <ImageIcon className={`w-8 h-8 transition-colors ${
                              dragActive ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                          </div>
                          <p className={`font-semibold transition-colors ${
                            dragActive ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {dragActive ? 'اتركها هنا' : 'اضغط أو اسحب الصورة الرئيسية'}
                          </p>
                          <p className="text-sm text-gray-500">PNG, JPG أو JPEG</p>
                          <p className="text-xs text-gray-400">
                            سيتم ضغط الصورة تلقائياً لتحسين الأداء
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Detailed Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    صور تفصيلية
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
                      onChange={handleDetailedImagesChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="detailedImages"
                    />
                    <label htmlFor="detailedImages" className="cursor-pointer">
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
                          {dragActive ? 'اتركها هنا' : 'اضغط أو اسحب الصور هنا'}
                        </p>
                        <p className="text-sm text-gray-500">
                          يمكن اختيار عدة صور • PNG, JPG, JPEG
                        </p>
                        <p className="text-xs text-gray-400">
                          سيتم ضغط الصور تلقائياً لتحسين الأداء
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Preview Images */}
                  {(detailedImageFiles.length > 0 || existingDetailedImages.length > 0) && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">
                          الصور المختارة ({detailedImageFiles.length + existingDetailedImages.length})
                        </p>
                        <p className="text-xs text-gray-500">
                          اضغط على × لحذف الصورة
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {/* Existing Images */}
                        {existingDetailedImages.map((image, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                              <img
                                src={buildImageUrl(image)}
                                alt={`صورة موجودة ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingDetailedImage(index)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                              title="حذف الصورة"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                              موجودة
                            </div>
                          </div>
                        ))}
                        
                        {/* New Images */}
                        {detailedImageFiles.map((file, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-300 transition-colors">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`صورة جديدة ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDetailedImage(index)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                              title="حذف الصورة"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                              جديدة
                            </div>
                            <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                              {(file.size / 1024).toFixed(0)}KB
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FAQs Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm ml-3">❓</span>
                {selectedLanguage === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h3>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {selectedLanguage === 'ar' ? `السؤال ${index + 1}` : `Question ${index + 1}`}
                        </label>
                        <input
                          type="text"
                          value={selectedLanguage === 'ar' ? (faq.question_ar || '') : (faq.question_en || '')}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            if (selectedLanguage === 'ar') {
                              newFaqs[index].question_ar = e.target.value;
                              newFaqs[index].question = e.target.value; // Keep backward compatibility
                            } else {
                              newFaqs[index].question_en = e.target.value;
                            }
                            setFaqs(newFaqs);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          placeholder={selectedLanguage === 'ar' ? 'أدخل السؤال...' : 'Enter question...'}
                          dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {selectedLanguage === 'ar' ? 'الإجابة' : 'Answer'}
                        </label>
                        <textarea
                          value={selectedLanguage === 'ar' ? (faq.answer_ar || '') : (faq.answer_en || '')}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            if (selectedLanguage === 'ar') {
                              newFaqs[index].answer_ar = e.target.value;
                              newFaqs[index].answer = e.target.value; // Keep backward compatibility
                            } else {
                              newFaqs[index].answer_en = e.target.value;
                            }
                            setFaqs(newFaqs);
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                          placeholder={selectedLanguage === 'ar' ? 'أدخل الإجابة...' : 'Enter answer...'}
                          dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFaqs = faqs.filter((_, i) => i !== index);
                          setFaqs(newFaqs);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        {selectedLanguage === 'ar' ? 'حذف السؤال' : 'Delete Question'}
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setFaqs([...faqs, { question: '', answer: '', question_ar: '', question_en: '', answer_ar: '', answer_en: '' }])}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors font-medium"
                >
                  {selectedLanguage === 'ar' ? '+ إضافة سؤال جديد' : '+ Add New Question'}
                </button>
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm ml-3">➕</span>
                {selectedLanguage === 'ar' ? 'المنتجات الإضافية' : 'Add-ons'}
              </h3>
              
              <div className="space-y-4">
                {addOns.map((addOn, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {selectedLanguage === 'ar' ? 'اسم المنتج الإضافي' : 'Add-on Name'}
                        </label>
                        <input
                          type="text"
                          value={selectedLanguage === 'ar' ? (addOn.name_ar || '') : (addOn.name_en || '')}
                          onChange={(e) => {
                            const newAddOns = [...addOns];
                            if (selectedLanguage === 'ar') {
                              newAddOns[index].name_ar = e.target.value;
                              newAddOns[index].name = e.target.value; // Keep backward compatibility
                            } else {
                              newAddOns[index].name_en = e.target.value;
                            }
                            setAddOns(newAddOns);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          placeholder={selectedLanguage === 'ar' ? 'أدخل اسم المنتج...' : 'Enter add-on name...'}
                          dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {selectedLanguage === 'ar' ? 'السعر (ر.س)' : 'Price (SAR)'}
                        </label>
                        <input
                          type="number"
                          value={addOn.price || ''}
                          onChange={(e) => {
                            const newAddOns = [...addOns];
                            newAddOns[index].price = Number(e.target.value);
                            setAddOns(newAddOns);
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          placeholder={selectedLanguage === 'ar' ? 'أدخل السعر...' : 'Enter price...'}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {selectedLanguage === 'ar' ? 'وصف المنتج (اختياري)' : 'Description (Optional)'}
                      </label>
                      <textarea
                        value={selectedLanguage === 'ar' ? (addOn.description_ar || '') : (addOn.description_en || '')}
                        onChange={(e) => {
                          const newAddOns = [...addOns];
                          if (selectedLanguage === 'ar') {
                            newAddOns[index].description_ar = e.target.value;
                            newAddOns[index].description = e.target.value; // Keep backward compatibility
                          } else {
                            newAddOns[index].description_en = e.target.value;
                          }
                          setAddOns(newAddOns);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                        placeholder={selectedLanguage === 'ar' ? 'أدخل وصف المنتج...' : 'Enter description...'}
                        dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newAddOns = addOns.filter((_, i) => i !== index);
                        setAddOns(newAddOns);
                      }}
                      className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      {selectedLanguage === 'ar' ? 'حذف المنتج' : 'Delete Add-on'}
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setAddOns([...addOns, { name: '', price: 0, description: '', name_ar: '', name_en: '', description_ar: '', description_en: '' }])}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors font-medium"
                >
                  {selectedLanguage === 'ar' ? '+ إضافة منتج جديد' : '+ Add New Add-on'}
                </button>
              </div>
            </div>

            {/* Product Options Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm ml-3">⚙️</span>
                {selectedLanguage === 'ar' ? 'خيارات المنتج' : 'Product Options'}
              </h3>
              
              <ProductOptionsBuilder
                options={productOptions}
                onChange={setProductOptions}
                language={selectedLanguage}
                errors={errors}
              />
            </div>

            {/* SEO Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm ml-3">🔍</span>
                {selectedLanguage === 'ar' ? 'إعدادات SEO' : 'SEO Settings'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {selectedLanguage === 'ar' ? 'عنوان SEO' : 'SEO Title'}
                      <span className="text-xs text-gray-500 mr-2">
                        ({selectedLanguage === 'ar' ? 'يُفضل 50-60 حرف' : 'Recommended 50-60 characters'})
                      </span>
                    </label>
                    <input
                      type="text"
                      name={selectedLanguage === 'ar' ? 'seoTitle_ar' : 'seoTitle_en'}
                      value={selectedLanguage === 'ar' ? formData.seoTitle_ar : formData.seoTitle_en}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      placeholder={selectedLanguage === 'ar' ? 'أدخل عنوان SEO...' : 'Enter SEO title...'}
                      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedLanguage === 'ar' ? formData.seoTitle_ar : formData.seoTitle_en).length}/60 {selectedLanguage === 'ar' ? 'حرف' : 'characters'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {selectedLanguage === 'ar' ? 'عنوان Meta' : 'Meta Title'}
                      <span className="text-xs text-gray-500 mr-2">
                        ({selectedLanguage === 'ar' ? 'يُفضل 50-60 حرف' : 'Recommended 50-60 characters'})
                      </span>
                    </label>
                    <input
                      type="text"
                      name={selectedLanguage === 'ar' ? 'metaTitle_ar' : 'metaTitle_en'}
                      value={selectedLanguage === 'ar' ? formData.metaTitle_ar : formData.metaTitle_en}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      placeholder={selectedLanguage === 'ar' ? 'أدخل عنوان Meta...' : 'Enter Meta title...'}
                      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedLanguage === 'ar' ? formData.metaTitle_ar : formData.metaTitle_en).length}/60 {selectedLanguage === 'ar' ? 'حرف' : 'characters'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {selectedLanguage === 'ar' ? 'وصف SEO' : 'SEO Description'}
                      <span className="text-xs text-gray-500 mr-2">
                        ({selectedLanguage === 'ar' ? 'يُفضل 150-160 حرف' : 'Recommended 150-160 characters'})
                      </span>
                    </label>
                    <textarea
                      name={selectedLanguage === 'ar' ? 'seoDescription_ar' : 'seoDescription_en'}
                      value={selectedLanguage === 'ar' ? formData.seoDescription_ar : formData.seoDescription_en}
                      onChange={handleInputChange}
                      rows={3}
                      maxLength={160}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                      placeholder={selectedLanguage === 'ar' ? 'أدخل وصف SEO...' : 'Enter SEO description...'}
                      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedLanguage === 'ar' ? formData.seoDescription_ar : formData.seoDescription_en).length}/160 {selectedLanguage === 'ar' ? 'حرف' : 'characters'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {selectedLanguage === 'ar' ? 'وصف Meta' : 'Meta Description'}
                      <span className="text-xs text-gray-500 mr-2">
                        ({selectedLanguage === 'ar' ? 'يُفضل 150-160 حرف' : 'Recommended 150-160 characters'})
                      </span>
                    </label>
                    <textarea
                      name={selectedLanguage === 'ar' ? 'metaDescription_ar' : 'metaDescription_en'}
                      value={selectedLanguage === 'ar' ? formData.metaDescription_ar : formData.metaDescription_en}
                      onChange={handleInputChange}
                      rows={3}
                      maxLength={160}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                      placeholder={selectedLanguage === 'ar' ? 'أدخل وصف Meta...' : 'Enter Meta description...'}
                      dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedLanguage === 'ar' ? formData.metaDescription_ar : formData.metaDescription_en).length}/160 {selectedLanguage === 'ar' ? 'حرف' : 'characters'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {selectedLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading 
              ? (selectedLanguage === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
              : (isEditing 
                  ? (selectedLanguage === 'ar' ? 'تحديث المنتج' : 'Update Product') 
                  : (selectedLanguage === 'ar' ? 'إضافة المنتج' : 'Add Product')
                )
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;