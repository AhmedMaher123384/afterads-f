import React from 'react';
import { X, Clock, CheckCircle, Package, Star, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
}

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const statusOptions = [
    { value: 'pending', label: 'قيد المراجعة', icon: Clock },
    { value: 'confirmed', label: 'مؤكد', icon: CheckCircle },
    { value: 'preparing', label: 'قيد التحضير', icon: Package },
    { value: 'delivered', label: 'تم التسليم', icon: CheckCircle },
    { value: 'cancelled', label: 'ملغي', icon: AlertCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#292929] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18b5d5] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white border-b border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">الطلب #{order.id}</h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-x-6">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 bg-[#18b5d5] text-white">
                {order.total} ر.س
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#18b5d5] rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all border border-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] bg-[#292929]">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#18b5d5]">تتبع مراحل الطلب</h3>
            <div className="relative">
              {statusOptions.map((status, index) => {
                const Icon = status.icon;
                const isCompleted = statusOptions.findIndex(s => s.value === order.status) >= index;
                const isCurrent = order.status === status.value;
                
                return (
                  <div key={status.value} className={`flex items-center mb-6 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrent ? 'bg-[#292929] text-white shadow-lg scale-110' :
                        isCompleted ? 'bg-[#18b5d5] text-white' : 'bg-gray-300 text-gray-500'
                      } transition-all duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {index < statusOptions.length - 1 && (
                        <div className={`w-0.5 h-6 mt-2 ${isCompleted ? 'bg-[#18b5d5]' : 'bg-gray-300'}`} />
                      )}
                    </div>
                    <div className="mr-4">
                      <h4 className={`font-bold ${isCurrent ? 'text-[#18b5d5]' : isCompleted ? 'text-[#18b5d5]' : 'text-gray-500'}`}>
                        {status.label}
                      </h4>
                      <p className="text-sm text-white">
                        {isCurrent ? `الحالة الحالية` : isCompleted ? 'تم إنجازها' : 'في الانتظار'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;