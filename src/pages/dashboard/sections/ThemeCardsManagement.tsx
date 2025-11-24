import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Monitor, Tablet, Smartphone, X, Upload, Star, AlertCircle, CheckCircle } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import { apiCall, buildImageUrl } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';
import { 
  FaUser, FaShoppingCart, FaHeart, FaStar, FaBolt, FaChartLine, 
  FaTrophy, FaGift, FaShieldAlt, FaRocket, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaCamera, FaImage,
  FaCode, FaPalette, FaMobile, FaLaptop, FaSearch, FaCog,
  FaBell, FaHome, FaTag, FaFire, FaThumbsUp, FaComments,
  FaUsers, FaBox, FaCreditCard, FaTruck, FaStore, FaChartBar,
  FaGlobe, FaLock, FaKey, FaEye, FaDownload, FaUpload,
  FaEdit, FaTrash, FaPlus, FaMinus, FaSave, FaUndo,
  FaShareAlt, FaPrint, FaFilePdf, FaFileExcel, FaFileWord
} from 'react-icons/fa';

import {
  MdDashboard, MdShoppingBag, MdFavorite, MdNotifications,
  MdSettings, MdPerson, MdEmail, MdPhone, MdLocationOn,
  MdAccessTime, MdCheckCircle, MdCancel, MdEdit, MdDelete,
  MdAdd, MdRemove, MdSave, MdRefresh, MdShare, MdPrint
} from 'react-icons/md';

import {
  IoMdCart, IoMdHeart, IoMdStar, IoMdThunderstorm,
  IoMdTrophy, IoMdGift, IoMdRocket
} from 'react-icons/io';

import {
  AiFillStar, AiFillHeart, AiFillFire, AiFillThunderbolt,
  AiFillGift, AiFillTrophy, AiFillRocket, AiFillBell
} from 'react-icons/ai';

import {
  BsFillLightningFill, BsFillRocketFill, BsFillStarFill,
  BsFillHeartFill, BsFillTrophyFill, BsFillGiftFill
} from 'react-icons/bs';

const availableIcons = [
  // أيقونات عامة
  { name: 'FaUser', icon: FaUser, label: 'مستخدم', category: 'عام' },
  { name: 'FaUsers', icon: FaUsers, label: 'مستخدمين', category: 'عام' },
  { name: 'FaHome', icon: FaHome, label: 'منزل', category: 'عام' },
  { name: 'FaBell', icon: FaBell, label: 'جرس', category: 'عام' },
  { name: 'FaCog', icon: FaCog, label: 'إعدادات', category: 'عام' },
  
  // تسوق وتجارة
  { name: 'FaShoppingCart', icon: FaShoppingCart, label: 'سلة', category: 'تسوق' },
  { name: 'IoMdCart', icon: IoMdCart, label: 'عربة', category: 'تسوق' },
  { name: 'FaStore', icon: FaStore, label: 'متجر', category: 'تسوق' },
  { name: 'FaBox', icon: FaBox, label: 'صندوق', category: 'تسوق' },
  { name: 'FaTag', icon: FaTag, label: 'وسم', category: 'تسوق' },
  { name: 'FaCreditCard', icon: FaCreditCard, label: 'بطاقة', category: 'تسوق' },
  { name: 'FaTruck', icon: FaTruck, label: 'شحن', category: 'تسوق' },
  
  // تفاعلية
  { name: 'FaHeart', icon: FaHeart, label: 'قلب', category: 'تفاعل' },
  { name: 'AiFillHeart', icon: AiFillHeart, label: 'قلب ممتلئ', category: 'تفاعل' },
  { name: 'FaStar', icon: FaStar, label: 'نجمة', category: 'تفاعل' },
  { name: 'AiFillStar', icon: AiFillStar, label: 'نجمة ممتلئة', category: 'تفاعل' },
  { name: 'FaThumbsUp', icon: FaThumbsUp, label: 'إعجاب', category: 'تفاعل' },
  { name: 'FaComments', icon: FaComments, label: 'تعليقات', category: 'تفاعل' },
  { name: 'FaShareAlt', icon: FaShareAlt, label: 'مشاركة', category: 'تفاعل' },
  
  // إنجازات
  { name: 'FaTrophy', icon: FaTrophy, label: 'كأس', category: 'إنجاز' },
  { name: 'FaGift', icon: FaGift, label: 'هدية', category: 'إنجاز' },
  { name: 'AiFillTrophy', icon: AiFillTrophy, label: 'جائزة', category: 'إنجاز' },
  { name: 'FaShieldAlt', icon: FaShieldAlt, label: 'درع', category: 'إنجاز' },
  
  // طاقة وسرعة
  { name: 'FaBolt', icon: FaBolt, label: 'برق', category: 'طاقة' },
  { name: 'AiFillThunderbolt', icon: AiFillThunderbolt, label: 'صاعقة', category: 'طاقة' },
  { name: 'FaFire', icon: FaFire, label: 'نار', category: 'طاقة' },
  { name: 'AiFillFire', icon: AiFillFire, label: 'نار ممتلئة', category: 'طاقة' },
  { name: 'FaRocket', icon: FaRocket, label: 'صاروخ', category: 'طاقة' },
  { name: 'BsFillRocketFill', icon: BsFillRocketFill, label: 'صاروخ سريع', category: 'طاقة' },
  
  // إحصائيات
  { name: 'FaChartLine', icon: FaChartLine, label: 'نمو', category: 'إحصاء' },
  { name: 'FaChartBar', icon: FaChartBar, label: 'رسم بياني', category: 'إحصاء' },
  { name: 'MdDashboard', icon: MdDashboard, label: 'لوحة', category: 'إحصاء' },
  
  // اتصال
  { name: 'FaEnvelope', icon: FaEnvelope, label: 'بريد', category: 'اتصال' },
  { name: 'FaPhone', icon: FaPhone, label: 'هاتف', category: 'اتصال' },
  { name: 'MdEmail', icon: MdEmail, label: 'إيميل', category: 'اتصال' },
  { name: 'MdPhone', icon: MdPhone, label: 'موبايل', category: 'اتصال' },
  
  // موقع ووقت
  { name: 'FaMapMarkerAlt', icon: FaMapMarkerAlt, label: 'موقع', category: 'مكان' },
  { name: 'MdLocationOn', icon: MdLocationOn, label: 'دبوس', category: 'مكان' },
  { name: 'FaClock', icon: FaClock, label: 'ساعة', category: 'وقت' },
  { name: 'MdAccessTime', icon: MdAccessTime, label: 'زمن', category: 'وقت' },
  
  // تقنية
  { name: 'FaCode', icon: FaCode, label: 'كود', category: 'تقني' },
  { name: 'FaMobile', icon: FaMobile, label: 'موبايل', category: 'تقني' },
  { name: 'FaLaptop', icon: FaLaptop, label: 'لابتوب', category: 'تقني' },
  { name: 'FaGlobe', icon: FaGlobe, label: 'كرة أرضية', category: 'تقني' },
  { name: 'FaSearch', icon: FaSearch, label: 'بحث', category: 'تقني' },
  
  // تصميم
  { name: 'FaPalette', icon: FaPalette, label: 'ألوان', category: 'تصميم' },
  { name: 'FaCamera', icon: FaCamera, label: 'كاميرا', category: 'تصميم' },
  { name: 'FaImage', icon: FaImage, label: 'صورة', category: 'تصميم' },
  
  // أمان
  { name: 'FaLock', icon: FaLock, label: 'قفل', category: 'أمان' },
  { name: 'FaKey', icon: FaKey, label: 'مفتاح', category: 'أمان' },
  { name: 'FaEye', icon: FaEye, label: 'عين', category: 'أمان' },
  
  // ملفات
  { name: 'FaFilePdf', icon: FaFilePdf, label: 'PDF', category: 'ملفات' },
  { name: 'FaFileExcel', icon: FaFileExcel, label: 'Excel', category: 'ملفات' },
  { name: 'FaFileWord', icon: FaFileWord, label: 'Word', category: 'ملفات' },
  
  // إجراءات
  { name: 'FaCheck', icon: FaCheck, label: 'صح', category: 'إجراء' },
  { name: 'MdCheckCircle', icon: MdCheckCircle, label: 'تم', category: 'إجراء' },
  { name: 'FaPlus', icon: FaPlus, label: 'زائد', category: 'إجراء' },
  { name: 'FaMinus', icon: FaMinus, label: 'ناقص', category: 'إجراء' },
  { name: 'FaEdit', icon: FaEdit, label: 'تعديل', category: 'إجراء' },
  { name: 'FaTrash', icon: FaTrash, label: 'حذف', category: 'إجراء' },
  { name: 'FaSave', icon: FaSave, label: 'حفظ', category: 'إجراء' },
  { name: 'FaDownload', icon: FaDownload, label: 'تحميل', category: 'إجراء' },
  { name: 'FaUpload', icon: FaUpload, label: 'رفع', category: 'إجراء' },
  { name: 'FaPrint', icon: FaPrint, label: 'طباعة', category: 'إجراء' }
];

// تعريف نوع البيانات للكارد
interface ThemeCard {
  _id: string;
  title: string;
  description: string;
  overlayText?: string;
  orderNumber: number;
  category: string;
  features: string[];
  isActive: boolean;
  displayOrder: number;
  backgroundImage?: string;
  icon?: string;  

}

// نوع بيانات النموذج (الفورم)
interface FormData {
  title: string;
  description: string;
  overlayText: string;
  orderNumber: number;
  category: string;
  features: string[];
  isActive: boolean;
  displayOrder: number;
  backgroundImage: File | null;
  icon: string;
}

// نوع حالة المودال لحذف الكارد
interface DeleteModal {
  isOpen: boolean;
  card: ThemeCard | null;
  loading: boolean;
}

 const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
   <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-slideDown">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ThemeCardsManagement: React.FC = () => {
  const [themeCards, setThemeCards] = useState<ThemeCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<ThemeCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewCard, setPreviewCard] = useState<ThemeCard | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconSearch, setIconSearch] = useState('');
const [iconCategory, setIconCategory] = useState('all');
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    overlayText: '',
    orderNumber: 1,
    category: 'عنصر متقدم',
    features: [''],
    isActive: true,
    displayOrder: 0,
    backgroundImage: null,
    icon: 'User'
  });

  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    card: null,
    loading: false
  });

  const queryClient = useQueryClient();
  const { data: cardsResp, isLoading: cardsLoading } = useApiQuery<any>({ endpoint: 'theme-card', queryKey: ['theme-cards'] });
  useEffect(() => {
    if (!cardsResp) return;
    const list = Array.isArray(cardsResp) ? cardsResp : (cardsResp?.data || []);
    setThemeCards(list);
    setIsLoading(false);
  }, [cardsResp]);

  const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    FaUser, FaShoppingCart, FaHeart, FaStar, FaBolt, FaChartLine,
    FaTrophy, FaGift, FaShieldAlt, FaRocket, FaEnvelope, FaPhone,
    FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaCamera, FaImage,
    FaCode, FaPalette, FaMobile, FaLaptop, FaSearch, FaCog,
    FaBell, FaHome, FaTag, FaFire, FaThumbsUp, FaComments,
    FaUsers, FaBox, FaCreditCard, FaTruck, FaStore, FaChartBar,
    FaGlobe, FaLock, FaKey, FaEye, FaDownload, FaUpload,
    FaEdit, FaTrash, FaPlus, FaMinus, FaSave, FaUndo,
    FaShareAlt, FaPrint, FaFilePdf, FaFileExcel, FaFileWord,
    MdDashboard, IoMdCart, AiFillHeart, AiFillStar, AiFillFire,
    AiFillThunderbolt, AiFillGift, AiFillTrophy, BsFillRocketFill
  };
  return icons[iconName] || FaUser;
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      switch (name) {
        case 'title':
          return { ...prev, title: value };
        case 'description':
          return { ...prev, description: value };
        case 'overlayText':
          return { ...prev, overlayText: value };
        case 'category':
          return { ...prev, category: value };
        case 'orderNumber':
          return { ...prev, orderNumber: Number(value) };
        case 'displayOrder':
          return { ...prev, displayOrder: Number(value) };
        default:
          return prev;
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, backgroundImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('overlayText', formData.overlayText);
    submitData.append('orderNumber', String(formData.orderNumber));
    submitData.append('category', formData.category);
    submitData.append('features', JSON.stringify(formData.features.filter(f => f.trim())));
    submitData.append('isActive', String(formData.isActive));
    submitData.append('displayOrder', String(formData.displayOrder));
        submitData.append('icon', formData.icon); 

    
    if (formData.backgroundImage && formData.backgroundImage instanceof File) {
      submitData.append('backgroundImage', formData.backgroundImage);
    }

    const endpoint = editingCard 
      ? `theme-card/${editingCard._id}`
      : 'theme-card';
    const method = editingCard ? 'PUT' : 'POST';
    const data = await apiCall(endpoint, { method, body: submitData });
    if (data?.success !== false) {
      queryClient.invalidateQueries({ queryKey: ['theme-cards'] });
      closeModal();
      setToast({
        show: true,
        message: editingCard ? 'تم التحديث بنجاح! ✓' : 'تم الإضافة بنجاح! ✓',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Error saving theme card:', error);
    // ✅ Toast للخطأ
    setToast({
      show: true,
      message: 'حدث خطأ أثناء الحفظ ✗',
      type: 'error'
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = (card: ThemeCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description,
      overlayText: card.overlayText || '',
      orderNumber: card.orderNumber,
      category: card.category,
      features: card.features || [''],
      isActive: card.isActive,
      displayOrder: card.displayOrder || 0,
      backgroundImage: null,
       icon: card.icon || 'User'
    });
    if (card.backgroundImage) {
      setImagePreview(buildImageUrl(card.backgroundImage));
    }
    setIsModalOpen(true);
  };

  const handleDelete = (card: ThemeCard) => {
    setDeleteModal({ isOpen: true, card, loading: false });
  };

const confirmDelete = async () => {
  if (!deleteModal.card) return;
  setDeleteModal(prev => ({ ...prev, loading: true }));
  try {
    const data = await apiCall(`theme-card/${deleteModal.card._id}`, { method: 'DELETE' });
    if (data?.success !== false) {
      queryClient.invalidateQueries({ queryKey: ['theme-cards'] });
      setDeleteModal({ isOpen: false, card: null, loading: false });
      setToast({
        show: true,
        message: 'تم الحذف بنجاح! ✓',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Error deleting theme card:', error);
    // ✅ Toast للخطأ
    setToast({
      show: true,
      message: 'حدث خطأ أثناء الحذف ✗',
      type: 'error'
    });
  } finally {
    setDeleteModal(prev => ({ ...prev, loading: false }));
  }
};

const closeModal = () => {
  setIsModalOpen(false);
  setEditingCard(null);
  setImagePreview(null);
  setFormData({
    title: '',
    description: '',
    overlayText: '',
    orderNumber: 1,
    category: 'عنصر متقدم',
    features: [''],
    isActive: true,
    displayOrder: 0,
    backgroundImage: null,
    icon: 'FaUser' // ✅ أضف هذا السطر
  });
};

  const openPreview = (card: ThemeCard) => {
    setPreviewCard(card);
    setIsPreviewOpen(true);
  };

  const PreviewComponent: React.FC<{ card: ThemeCard; device: 'desktop' | 'tablet' | 'mobile' }> = ({ card, device }) => {
    const deviceStyles = {
      desktop: 'w-full max-w-6xl',
      tablet: 'w-full max-w-2xl',
      mobile: 'w-full max-w-sm'
    };

    return (
      <div className={`${deviceStyles[device]} mx-auto transition-all duration-300`}>
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#18b5d5]/5 via-transparent to-[#18b5d5]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"></div>
          
          <div className="relative bg-gradient-to-br from-[#292929]/60 via-[#1a1a1a]/80 to-[#292929]/60 rounded-3xl border border-[#18b5d5]/20 group-hover:border-[#18b5d5]/40 transition-all duration-500 overflow-hidden group-hover:shadow-2xl group-hover:shadow-[#18b5d5]/10">
            
            <div className="flex flex-col xl:flex-row">
              <div className="w-full xl:w-64 flex-shrink-0 relative">
                <div className="relative overflow-hidden rounded-t-3xl xl:rounded-l-3xl xl:rounded-tr-none aspect-w-16 aspect-h-9 bg-white">
                  
                  <div className="absolute top-0 left-0 w-16 h-16 bg-[#fec72d] transform -rotate-0 origin-top-left z-10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-6 h-6 text-gray-600" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4a828]"></div>
                    <div className="absolute top-0 right-0 h-full w-0.5 bg-[#d4a828]"></div>
                  </div>
                  
            {card.backgroundImage ? (
  <img
    src={buildImageUrl(card.backgroundImage)}
    alt={card.title}
    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
  />
) : (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4">
    {/* ✅ عرض الأيقونة */}
    {card.icon && (() => {
      const IconComponent = getIconComponent(card.icon);
      return <IconComponent className="w-16 h-16 text-gray-600" />;
    })()}
    <p className="text-gray-800 text-lg font-semibold text-center">
      {card.overlayText || card.title}
    </p>
  </div>
)}
                  
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#18b5d5]/90 to-[#18b5d5]/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#18b5d5]/30 z-20">
                    <span className="text-white text-xs font-bold">#{card.orderNumber}</span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 w-3 h-3 bg-[#18b5d5] rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-[#18b5d5]/20 to-[#18b5d5]/10 px-4 py-2 rounded-full border border-[#18b5d5]/30">
                    <span className="text-[#18b5d5] text-sm font-semibold">{card.category}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#18b5d5]/30 to-transparent"></div>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3 leading-tight group-hover:text-[#18b5d5] transition-colors duration-300">
                  {card.title}
                </h3>
                
                <p className="text-[#a1a1a1] text-base leading-relaxed mb-4">
                  {card.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {card.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="bg-[#18b5d5]/10 text-[#18b5d5] px-3 py-1 rounded-full text-xs font-medium border border-[#18b5d5]/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#18b5d5]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <Monitor className="w-8 h-8" />
              نظام إدارة عناصر الثيم
            </h2>
            <p className="text-gray-200">إنشاء وإدارة العناصر المتقدمة للثيم بكفاءة عالية</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة عنصر جديد
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themeCards.map((card) => (
          <div key={card._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 bg-white flex items-center justify-center border-b border-gray-100">
              <div className="absolute top-0 left-0 w-12 h-12 bg-[#fec72d] z-10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="w-4 h-4 text-gray-600" fill="currentColor" />
                </div>
              </div>
              
           {card.backgroundImage ? (
  <img
    src={buildImageUrl(card.backgroundImage)}
    alt={card.title}
    className="w-full h-full object-contain p-4"
  />
) : (
  <div className="flex flex-col items-center justify-center gap-2 p-4">
    {/* ✅ عرض الأيقونة */}
    {card.icon && (() => {
      const IconComponent = getIconComponent(card.icon);
      return <IconComponent className="w-12 h-12 text-gray-600" />;
    })()}
    <p className="text-gray-800 text-sm font-semibold text-center">
      {card.overlayText || card.title}
    </p>
  </div>
)}
              
              <div className="absolute top-3 right-3 bg-gradient-to-r from-[#18b5d5] to-[#16a8cc] rounded-full px-3 py-1">
                <span className="text-white text-xs font-bold">#{card.orderNumber}</span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <span className="inline-block bg-[#18b5d5]/10 text-[#18b5d5] px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  {card.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{card.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {card.features?.slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                    {feature}
                  </span>
                ))}
                {card.features?.length > 2 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                    +{card.features.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`text-xs font-medium ${card.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {card.isActive ? 'نشط' : 'غير نشط'}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPreview(card)}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="معاينة"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(card)}
                    className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(card)}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {themeCards.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عناصر</h3>
          <p className="text-gray-500 mb-6">ابدأ بإضافة عنصر جديد للثيم</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            إضافة عنصر
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky z-10 top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingCard ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
              </h3>
              <button onClick={closeModal} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                    placeholder="أدخل عنوان العنصر"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التصنيف</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                    placeholder="عنصر متقدم"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] resize-none"
                  placeholder="أدخل وصف العنصر"
                />
              </div>

              <div>
  <label className="block text-sm font-semibold text-gray-700 mb-3">
    اختر الأيقونة ({availableIcons.length} أيقونة متاحة)
  </label>
  
  {/* البحث */}
  <input
    type="text"
    placeholder="ابحث عن أيقونة..."
    value={iconSearch}
    onChange={(e) => setIconSearch(e.target.value)}
    className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
  />
  
  {/* التصنيفات */}
  <div className="flex flex-wrap gap-2 mb-3">
    <button
      type="button"
      onClick={() => setIconCategory('all')}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
        iconCategory === 'all'
          ? 'bg-[#203f61] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      الكل
    </button>
    {['عام', 'تسوق', 'تفاعل', 'إنجاز', 'طاقة', 'إحصاء', 'اتصال', 'مكان', 'وقت', 'تقني', 'تصميم', 'أمان', 'ملفات', 'إجراء'].map(cat => (
      <button
        key={cat}
        type="button"
        onClick={() => setIconCategory(cat)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          iconCategory === cat
            ? 'bg-[#203f61] text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
  
  {/* شبكة الأيقونات */}
  <div className="grid grid-cols-6 gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
    {availableIcons
      .filter(icon => 
        (iconCategory === 'all' || icon.category === iconCategory) &&
        (iconSearch === '' || icon.label.includes(iconSearch) || icon.name.toLowerCase().includes(iconSearch.toLowerCase()))
      )
      .map((iconItem) => {
        const IconComponent = iconItem.icon;
        return (
          <button
            key={iconItem.name}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, icon: iconItem.name }))}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              formData.icon === iconItem.name
                ? 'bg-[#203f61] text-white shadow-lg scale-105 ring-2 ring-[#203f61]'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
            title={iconItem.label}
          >
            <IconComponent className="w-5 h-5" />
            <span className="text-[10px] leading-tight text-center">{iconItem.label}</span>
          </button>
        );
      })}
  </div>
</div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">النص الذي يظهر على الصورة</label>
                <input
                  type="text"
                  name="overlayText"
                  value={formData.overlayText}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                  placeholder="نص اختياري يظهر على الخلفية البيضاء"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الخلفية</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#203f61] transition-all">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, backgroundImage: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">اضغط لرفع صورة</p>
                        <p className="text-xs text-gray-500 mt-1">أو اترك الحقل فارغاً لعرض النص فقط</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الترتيب *</label>
                  <input
                    type="number"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ترتيب العرض</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] bg-white"
                  >
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الخصائص</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61]"
                        placeholder={`خاصية ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-2 text-[#203f61] hover:text-[#2a537e] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة خاصية
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {isLoading ? 'جاري الحفظ...' : editingCard ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
   {/* Preview Modal */}
{isPreviewOpen && previewCard && (
  <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-[#292929] rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl flex justify-between items-center z-20">
        <h3 className="text-2xl font-bold">👁️ معاينة العنصر</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded transition-all ${previewDevice === 'desktop' ? 'bg-white text-[#203f61]' : 'text-white hover:bg-white/20'}`}
              title="Desktop"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded transition-all ${previewDevice === 'tablet' ? 'bg-white text-[#203f61]' : 'text-white hover:bg-white/20'}`}
              title="Tablet"
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded transition-all ${previewDevice === 'mobile' ? 'bg-white text-[#203f61]' : 'text-white hover:bg-white/20'}`}
              title="Mobile"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="p-8 bg-[#292929] overflow-x-hidden">
        <PreviewComponent card={previewCard} device={previewDevice} />
      </div>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-center text-gray-600 mb-6">
                هل أنت متأكد من حذف العنصر "{deleteModal.card?.title}"؟<br />
                لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, card: null, loading: false })}
                  disabled={deleteModal.loading}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteModal.loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50"
                >
                  {deleteModal.loading ? 'جاري الحذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && !isModalOpen && <Spinner overlay />}

        {toast.show && (
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    )}
    <style>{`
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
`}</style>
    </div>
  );
};

export default ThemeCardsManagement;