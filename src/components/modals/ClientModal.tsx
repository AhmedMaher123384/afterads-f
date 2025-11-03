import React, { useState, useEffect } from 'react';
import { X, Upload, Globe } from 'lucide-react';
import { smartToast } from '../../utils/toastConfig';
import { buildImageUrl } from '../../config/api';

interface Client {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
  editingClient?: Client | null;
  initialData?: Partial<Client>;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    logo: '',
    website: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        logo: editingClient.logo,
        website: editingClient.website
      });
      if (editingClient.logo) {
        setLogoPreview(buildImageUrl(editingClient.logo));
      }
    } else if (initialData) {
      setFormData({
        name: initialData.name || '',
        logo: initialData.logo || '',
        website: initialData.website || ''
      });
    } else {
      setFormData({
        name: '',
        logo: '',
        website: ''
      });
    }
    setLogoFile(null);
    setLogoPreview('');
  }, [editingClient, initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        smartToast.dashboard.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      smartToast.dashboard.error('اسم العميل مطلوب');
      return;
    }

    setIsLoading(true);
    
    try {
      let logoData = formData.logo;
      
      // Convert file to base64 if a new file was selected
      if (logoFile) {
        const reader = new FileReader();
        logoData = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logoFile);
        });
      }
      
      const submitData: Partial<Client> = {
        name: formData.name,
        logo: logoData,
        website: formData.website
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      smartToast.dashboard.error('فشل في حفظ العميل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      logo: '',
      website: ''
    });
    setLogoFile(null);
    setLogoPreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-black border-b border-black-800">
          <h2 className="text-2xl font-bold text-white">
            {editingClient ? 'تعديل العميل' : 'إضافة عميل جديد'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم العميل *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="أدخل اسم العميل"
              required
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شعار العميل
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {logoPreview ? (
                <div className="space-y-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="mx-auto h-32 w-32 object-contain rounded-lg"
                  />
                  <div className="flex justify-center gap-2">
                    <label className="cursor-pointer bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      <Upload className="w-4 h-4 inline mr-2" />
                      تغيير الشعار
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview('');
                        setLogoFile(null);
                        setFormData(prev => ({ ...prev, logo: '' }));
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-black" />
                  <div>
                    <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg hover:bg-black transition-colors inline-block">
                      <Upload className="w-4 h-4 inline mr-2" />
                      اختر شعار العميل
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF حتى 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              الموقع الإلكتروني
            </label>
            <input
              type="url"
              name="website"
              value={formData.website || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="https://example.com"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 bg-gray-50 px-6 py-4 -mx-6 -mb-6 rounded-b-xl">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الحفظ...' : (editingClient ? 'تحديث' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;