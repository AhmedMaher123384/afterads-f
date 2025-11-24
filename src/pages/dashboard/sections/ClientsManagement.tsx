import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Globe
} from 'lucide-react';
import { smartToast } from '../../../utils/toastConfig';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../../config/api';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useQueryClient } from '@tanstack/react-query';
import ImageUploader from '../components/layout/ImageUploaderProps';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Spinner from '../../../components/ui/Spinner';

interface Client {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

const ClientsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const { data: clientsData, isLoading: clientsLoading } = useApiQuery<any>({ endpoint: API_ENDPOINTS.CLIENTS, queryKey: ['clients'] });
  const loading = clientsLoading;
  const [clientSearchTerm, setClientSearchTerm] = useState('');
 const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    logo: null as File | string | null,
    website: '',
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

  // Fetch clients
  useEffect(() => {
    if (!clientsData) return;
    const clientsArray = clientsData?.clients || clientsData || [];
    const normalizedClients = clientsArray.map((client: any, index: number) => {
      if (client.id && typeof client.id === 'number' && !Number.isNaN(client.id)) {
        return client;
      }
      return { ...client, id: -(index + 1) };
    });
    const seenIds = new Set();
    const finalClients = normalizedClients.map((client: any, index: number) => {
      if (seenIds.has(client.id)) {
        let newId = -(index + normalizedClients.length + 1);
        while (seenIds.has(newId)) {
          newId -= 1;
        }
        seenIds.add(newId);
        return { ...client, id: newId };
      } else {
        seenIds.add(client.id);
        return client;
      }
    });
    setClients(finalClients);
    setFilteredClients(finalClients);
  }, [clientsData]);

  // Filter clients based on search and filters
  const filterClients = () => {
    let result = [...clients];

    if (clientSearchTerm) {
      const term = clientSearchTerm.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(term) ||
        (client.website && client.website.toLowerCase().includes(term))      );
    }

    if (clientStatusFilter !== 'all') {
      switch (clientStatusFilter) {
        case 'active':
          result = result.filter(client => client.isActive);
          break;
        case 'inactive':
          result = result.filter(client => !client.isActive);
          break;
        case 'featured':
          result = result.filter(client => client.isFeatured);
          break;
      }
    }

    setFilteredClients(result);
  };

  // Handle save client
  const handleSaveClient = async (clientData: any) => {
    try {
      const formData = new FormData();
      formData.append('name', clientData.name);
      if (clientData.website) formData.append('website', clientData.website);
      if (clientData.logo) {
        if (clientData.logo instanceof File) {
          formData.append('logo', clientData.logo);
        } else if (typeof clientData.logo === 'string') {
          if (clientData.logo.startsWith('data:image')) {
            const arr = clientData.logo.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], 'logo.png', { type: mime });
            formData.append('logo', file);
          } else {
            formData.append('existingLogo', clientData.logo);
          }
        }
      }

      if (editingClient) {
        // Update existing client
        const response = await apiCall(API_ENDPOINTS.CLIENT_BY_ID(editingClient.id.toString()), {
          method: 'PUT',
          body: formData
        });
        const updatedClient = response?.client || response;
        
        // Update the client in the list
        const updatedClients = clients.map(client => 
          client.id === editingClient.id ? updatedClient : client
        );
        setClients(updatedClients);
        smartToast.dashboard.success('تم تحديث العميل بنجاح');
      } else {
        // Add new client
        const response = await apiCall(API_ENDPOINTS.CLIENTS, {
          method: 'POST',
          body: formData
        });
        const raw = response?.client || response;
        
        // If the server doesn't return a valid ID or returns a duplicate ID, 
        // we create a local negative and unique ID to avoid conflicts
        const existingIds = new Set(clients.map(c => c.id));
        const hasValidNumericId = raw && typeof raw.id === 'number' && !Number.isNaN(raw.id);
        let chosenId: number;
        
        if (hasValidNumericId && !existingIds.has(raw.id)) {
          chosenId = raw.id;
        } else {
          const minId = clients.length ? Math.min(...clients.map(c => (typeof c.id === 'number' ? c.id : Infinity))) : 0;
          let fallbackId = (Number.isFinite(minId) ? Math.min(0, minId) - 1 : -1);
          while (existingIds.has(fallbackId)) {
            fallbackId -= 1;
          }
          chosenId = fallbackId;
        }
        
        const newClientItem: any = {
          ...raw,
          id: chosenId,
        };
        setClients([...clients, newClientItem]);
        smartToast.dashboard.success('تم إضافة العميل بنجاح');
      }
      setIsClientModalOpen(false);
      setEditingClient(null);
      setNewClient({
        name: '',
        logo: null,
        website: '',
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      console.error('Error saving client:', error);
      smartToast.dashboard.error('خطأ في حفظ العميل');
    }
  };

  // Handle add client
  const handleAddClient = () => {
    setEditingClient(null);
    setNewClient({
      name: '',
      logo: null,
      website: '',
    });
    setIsClientModalOpen(true);
  };

  // Handle edit client
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      logo: client.logo || null,
      website: client.website || '',
    });
    setIsClientModalOpen(true);
  };

  // Handle delete client
  const handleDeleteClient = async (clientId: number | string) => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await apiCall(API_ENDPOINTS.CLIENT_BY_ID(clientId.toString()), {
        method: 'DELETE'
      });
      
      // Remove the deleted client from the list
      const updatedClients = clients.filter(client => client.id !== Number(clientId));
      setClients(updatedClients);
      setFilteredClients(updatedClients);
      
      smartToast.dashboard.success(`تم حذف العميل "${deleteModal.name}" بنجاح`);
      closeDeleteModal();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      console.error('Error deleting client:', error);
      smartToast.dashboard.error('فشل في حذف العميل');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
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
  const confirmDelete = () => {
    handleDeleteClient(deleteModal.id);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  

  useEffect(() => {
    filterClients();
  }, [clients, clientSearchTerm, clientStatusFilter]);

  
  return (
    <div className="p-6 space-y-6">
      {loading && <Spinner overlay />}
      {/* Header */}
      <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" />
              نظام إدارة العملاء المميزون
            </h2>
            <p className="text-gray-200 text-lg">إدارة شاملة لقائمة العملاء والشركاء المميزين</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddClient}
              className="inline-flex items-center px-8 py-4 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold backdrop-blur-sm border border-white/30 shadow-lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              إضافة عميل جديد
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في العملاء..."
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
            />
          </div>
          <select
            value={clientStatusFilter}
onChange={(e) => setClientStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'featured')}            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all bg-white"
          >
            <option value="all">جميع العملاء</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="featured">مميز</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد عملاء</h3>
          <p className="text-gray-600 mb-8 text-lg">ابدأ بإضافة عملائك الأوائل</p>
          <button
            onClick={handleAddClient}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg font-medium transform hover:scale-105"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة عميل جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, idx) => (
            <div
              key={client.id ?? `${client.name}-${client.website ?? ''}-${client.createdAt ?? ''}-${idx}`}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {/* Header */}
            <div className="bg-white border-b-4 border-[#203f61] p-5">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-4">
      {client.logo ? (
        <img
          src={buildImageUrl(client.logo)}
          alt={client.name}
          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow-md bg-white p-1"
        />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-[#203f61]/10 to-[#2a537e]/10 rounded-xl flex items-center justify-center border border-[#203f61]/20">
          <Users className="w-8 h-8 text-[#203f61]" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-lg text-gray-900">{client.name}</h3>
      </div>
    </div>
    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
      client.isActive 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-gray-50 text-gray-700 border border-gray-200'
    }`}>
      {client.isActive ? '✓ نشط' : '✗ غير نشط'}
    </span>
  </div>
</div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4 space-y-3">
                  {/* Website Info */}
                  {client.website && (
                    <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Globe className="w-5 h-5 text-[#203f61]" />
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#203f61] hover:text-[#2a537e] font-medium transition-colors duration-200 flex-1 truncate"
                      >
                        زيارة الموقع
                      </a>
                    </div>
                  )}

           

                  {/* Date */}
                  <div className="text-sm text-gray-500 font-medium">
                    📅 {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleEditClient(client);
                      setIsClientModalOpen(true);
                    }}
                    className="flex-1 p-2.5 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">تعديل</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal('client', client.id, client.name)}
                    className="flex-1 p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing client */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r z-10 from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">
                {editingClient ? '✏️ تعديل العميل' : '➕ إضافة عميل جديد'}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم</label>
                  <input
                    type="text"
                    name="name"
                    value={newClient.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                
                <div>
                  <ImageUploader
                    value={
                      typeof newClient.logo === 'string'
                        ? (newClient.logo.startsWith('data:image') ? newClient.logo : buildImageUrl(newClient.logo))
                        : ''
                    }
                    onChange={(val) =>
                      setNewClient(prev => ({
                        ...prev,
                        logo: typeof val === 'string' ? val : (Array.isArray(val) ? (val[0] || null) : null)
                      }))
                    }
                    label="الشعار"
                    multiple={false}
                    accept="image/*"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الموقع الإلكتروني</label>
                  <input
                    type="url"
                    name="website"
                    value={newClient.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all"
                    placeholder="https://example.com"
                  />
                </div>
                
        
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsClientModalOpen(false);
                    setEditingClient(null);
                    setNewClient({
                      name: '',
                      logo: null,
                      website: '',
                    });
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleSaveClient(newClient)}
                  className="px-6 py-3 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingClient ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="⚠️ تأكيد الحذف"
        message={`هل أنت متأكد من حذف العميل "${deleteModal.name}"؟\nلا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        confirmText={deleteModal.loading ? 'جاري الحذف...' : 'حذف'}
        cancelText="إلغاء"
      />
    </div>
  );
};

export default ClientsManagement;