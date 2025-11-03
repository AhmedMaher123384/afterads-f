import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, FileText, HelpCircle, MessageSquare } from 'lucide-react';
import { smartToast } from '../utils/toastConfig';
import { apiCall, API_ENDPOINTS } from '../config/api';

interface AddOn {
  id?: number;
  name: string;
  price: number;
  description: string;
  productId?: number;
  productName?: string;
}

interface FAQ {
  id?: number;
  question: string;
  answer: string;
}

interface Product {
  id: number;
  name: string;
  addOns?: AddOn[];
  faqs?: FAQ[];
}

interface AddOnsManagementProps {
  onClose?: () => void;
}

const AddOnsManagement: React.FC<AddOnsManagementProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [formData, setFormData] = useState<AddOn>({
    name: '',
    price: 0,
    description: ''
  });
  const [newFAQ, setNewFAQ] = useState<FAQ>({ question: '', answer: '' });
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [activeTab, setActiveTab] = useState<'addons' | 'faqs'>('addons');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiCall(API_ENDPOINTS.PRODUCTS);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      smartToast.dashboard.error('حدث خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddOn = (product: Product) => {
    setSelectedProduct(product);
    setEditingAddOn(null);
    setFormData({ name: '', price: 0, description: '' });
    setShowAddOnModal(true);
  };

  const handleEditAddOn = (product: Product, addOn: AddOn, index: number) => {
    setSelectedProduct(product);
    setEditingAddOn({ ...addOn, id: index });
    setFormData({ ...addOn });
    setShowAddOnModal(true);
  };

  const handleDeleteAddOn = async (product: Product, addOnIndex: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنتج الإضافية؟')) return;

    try {
      const updatedAddOns = product.addOns?.filter((_, index) => index !== addOnIndex) || [];
      const updateData = {
        ...product,
        addOns: updatedAddOns
      };

      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(product.id), {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setProducts(products.map(p => 
        p.id === product.id 
          ? { ...p, addOns: updatedAddOns }
          : p
      ));
      
      smartToast.dashboard.success('تم حذف المنتج الإضافية بنجاح');
    } catch (error) {
      console.error('Error deleting add-on:', error);
      smartToast.dashboard.error('حدث خطأ في حذف المنتج الإضافية');
    }
  };

  const handleSubmitAddOn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    if (!formData.name.trim()) {
      smartToast.dashboard.error('يرجى إدخال اسم المنتج الإضافية');
      return;
    }
    if (formData.price < 0) {
      smartToast.dashboard.error('يرجى إدخال سعر صحيح');
      return;
    }

    try {
      let updatedAddOns = [...(selectedProduct.addOns || [])];
      
      if (editingAddOn && editingAddOn.id !== undefined) {
        // تحديث منتج موجودة
        updatedAddOns[editingAddOn.id] = {
          name: formData.name,
          price: formData.price,
          description: formData.description
        };
      } else {
        // إضافة منتج جديدة
        updatedAddOns.push({
          name: formData.name,
          price: formData.price,
          description: formData.description
        });
      }

      const updateData = {
        ...selectedProduct,
        addOns: updatedAddOns
      };

      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(selectedProduct.id), {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, addOns: updatedAddOns }
          : p
      ));
      
      setShowAddOnModal(false);
      smartToast.dashboard.success(editingAddOn ? 'تم تحديث المنتج الإضافية بنجاح' : 'تم إضافة المنتج الإضافية بنجاح');
    } catch (error) {
      console.error('Error saving add-on:', error);
      smartToast.dashboard.error('حدث خطأ في حفظ المنتج الإضافية');
    }
  };

  // FAQ Management Functions
  const addFAQ = async () => {
    if (!selectedProduct || !newFAQ.question.trim() || !newFAQ.answer.trim()) {
      smartToast.dashboard.error('يرجى ملء جميع حقول السؤال والإجابة');
      return;
    }

    try {
      setLoading(true);
      const faqToAdd = {
        ...newFAQ,
        id: Date.now()
      };
      
      const updatedFAQs = [...(selectedProduct.faqs || []), faqToAdd];
      
      await apiCall(`${API_ENDPOINTS.PRODUCTS}/${selectedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({ faqs: updatedFAQs }),
        headers: { 'Content-Type': 'application/json' }
      });

      setSelectedProduct({ ...selectedProduct, faqs: updatedFAQs });
      setNewFAQ({ question: '', answer: '' });
      smartToast.dashboard.success('تم إضافة السؤال بنجاح');
    } catch (error) {
      console.error('Error adding FAQ:', error);
      smartToast.dashboard.error('حدث خطأ أثناء إضافة السؤال');
    } finally {
      setLoading(false);
    }
  };

  const updateFAQ = async () => {
    if (!selectedProduct || !editingFAQ || !editingFAQ.question.trim() || !editingFAQ.answer.trim()) {
      smartToast.dashboard.error('يرجى ملء جميع حقول السؤال والإجابة');
      return;
    }

    try {
      setLoading(true);
      const updatedFAQs = selectedProduct.faqs?.map(faq => 
        faq.id === editingFAQ.id ? editingFAQ : faq
      ) || [];
      
      await apiCall(`${API_ENDPOINTS.PRODUCTS}/${selectedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({ faqs: updatedFAQs }),
        headers: { 'Content-Type': 'application/json' }
      });

      setSelectedProduct({ ...selectedProduct, faqs: updatedFAQs });
      setEditingFAQ(null);
      smartToast.dashboard.success('تم تحديث السؤال بنجاح');
    } catch (error) {
      console.error('Error updating FAQ:', error);
      smartToast.dashboard.error('حدث خطأ أثناء تحديث السؤال');
    } finally {
      setLoading(false);
    }
  };

  const deleteFAQ = async (faqId: number) => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const updatedFAQs = selectedProduct.faqs?.filter(faq => faq.id !== faqId) || [];
      
      await apiCall(`${API_ENDPOINTS.PRODUCTS}/${selectedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify({ faqs: updatedFAQs }),
        headers: { 'Content-Type': 'application/json' }
      });

      setSelectedProduct({ ...selectedProduct, faqs: updatedFAQs });
      smartToast.dashboard.success('تم حذف السؤال بنجاح');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      smartToast.dashboard.error('حدث خطأ أثناء حذف السؤال');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8" />
              إدارة المنتجات الإضافية
            </h1>
            <p className="text-gray-200 mt-2">إدارة وتنظيم المنتجات الإضافية لجميع المنتجات</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              العودة
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.addOns?.length || 0} منتج إضافية • {product.faqs?.length || 0} سؤال شائع
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  إدارة المنتج
                </button>
              </div>
            </div>

            {/* Quick Preview */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add-ons Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">المنتجات الإضافية</h4>
                  </div>
                  {product.addOns && product.addOns.length > 0 ? (
                    <div className="space-y-2">
                      {product.addOns.slice(0, 3).map((addOn, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{addOn.name}</span>
                          <span className="font-medium text-gray-900">{addOn.price.toFixed(2)} ر.س</span>
                        </div>
                      ))}
                      {product.addOns.length > 3 && (
                        <p className="text-xs text-gray-500">و {product.addOns.length - 3} منتج أخرى...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">لا توجد منتجات إضافية</p>
                  )}
                </div>

                {/* FAQs Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">الأسئلة الشائعة</h4>
                  </div>
                  {product.faqs && product.faqs.length > 0 ? (
                    <div className="space-y-2">
                      {product.faqs.slice(0, 2).map((faq, index) => (
                        <div key={index} className="text-sm">
                          <p className="text-gray-700 font-medium">{faq.question}</p>
                          <p className="text-gray-500 text-xs mt-1">{faq.answer.substring(0, 50)}...</p>
                        </div>
                      ))}
                      {product.faqs.length > 2 && (
                        <p className="text-xs text-gray-500">و {product.faqs.length - 2} سؤال آخر...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">لا توجد أسئلة شائعة</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Management Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  إدارة المنتج - {selectedProduct.name}
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('addons')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'addons'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    المنتجات الإضافية
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('faqs')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'faqs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    الأسئلة الشائعة
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'addons' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">المنتجات الإضافية</h3>
                    <button
                      onClick={() => handleAddAddOn(selectedProduct)}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة منتج جديدة
                    </button>
                  </div>

                  {selectedProduct.addOns && selectedProduct.addOns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProduct.addOns.map((addOn, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{addOn.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">{addOn.price.toFixed(2)} ر.س</span>
                              </div>
                              {addOn.description && (
                                <p className="text-sm text-gray-600">{addOn.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleEditAddOn(selectedProduct, addOn, index)}
                                className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddOn(selectedProduct, index)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات إضافية</h4>
                      <p className="text-gray-500 mb-4">لم يتم إضافة أي منتجات إضافية لهذا المنتج بعد</p>
                      <button
                        onClick={() => handleAddAddOn(selectedProduct)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة أول منتج
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'faqs' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">الأسئلة الشائعة</h3>
                  </div>

                  {/* Add New FAQ */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة سؤال جديد
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">السؤال</label>
                        <input
                          type="text"
                          value={newFAQ.question}
                          onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="أدخل السؤال..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الإجابة</label>
                        <textarea
                          value={newFAQ.answer}
                          onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="أدخل الإجابة..."
                        />
                      </div>
                      <button
                        onClick={addFAQ}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        إضافة السؤال
                      </button>
                    </div>
                  </div>

                  {/* FAQs List */}
                  {selectedProduct.faqs && selectedProduct.faqs.length > 0 ? (
                    <div className="space-y-4">
                      {selectedProduct.faqs.map((faq) => (
                        <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          {editingFAQ && editingFAQ.id === faq.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">السؤال</label>
                                <input
                                  type="text"
                                  value={editingFAQ.question}
                                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الإجابة</label>
                                <textarea
                                  value={editingFAQ.answer}
                                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={updateFAQ}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={() => setEditingFAQ(null)}
                                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600" />
                                  {faq.question}
                                </h5>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingFAQ(faq)}
                                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteFAQ(faq.id!)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد أسئلة شائعة</h4>
                      <p className="text-gray-500">لم يتم إضافة أي أسئلة شائعة لهذا المنتج بعد</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Add-on Modal */}
      {showAddOnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddOn ? 'تعديل المنتج الإضافية' : 'إضافة منتج إضافية جديدة'}
                </h3>
                <button
                  onClick={() => setShowAddOnModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitAddOn} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم المنتج الإضافية *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="أدخل اسم المنتج..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    السعر (ر.س) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                    placeholder="أدخل وصف المنتج..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    {editingAddOn ? 'تحديث المنتج' : 'إضافة المنتج'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOnModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOnsManagement;