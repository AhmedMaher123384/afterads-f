import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { Trash2, AlertCircle, MessageSquare, Star, User, Mail, Package, Calendar, X, Eye } from 'lucide-react';
import Spinner from '../../../components/ui/Spinner';
import { apiCall, API_ENDPOINTS } from '../../../config/api';

interface Comment {
  _id: string;
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
}

const CommentsManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await apiCall(API_ENDPOINTS.COMMENTS);
      setComments(Array.isArray(data) ? data : (data.comments || data || []));
      setError('');
    } catch (err) {
      setError('فشل في تحميل التعليقات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiCall(API_ENDPOINTS.COMMENT_BY_ID(deleteTargetId), { method: 'DELETE' });
      setSuccess('تم حذف التعليق بنجاح');
      fetchComments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء حذف التعليق');
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white rounded-2xl p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8" />
            إدارة التعليقات
          </h2>
          <p className="text-gray-200">عرض وإدارة تعليقات العملاء على المنتجات</p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/30">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">إجمالي التعليقات: {comments.length}</span>
        </div>
      </div>
    </div>

    {/* Success Message */}
    {success && (
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <span className="font-medium">{success}</span>
      </div>
    )}

    {/* Error Message */}
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <span className="font-medium">{error}</span>
      </div>
    )}

    {/* Comments Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">إجمالي التعليقات</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{comments.length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">متوسط التقييم</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {comments.length > 0 
                ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1) 
                : '0.0'}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-semibold">عدد العملاء</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {new Set(comments.map(c => c.userId)).size}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>

    {loading && <Spinner overlay />}

    {/* Comments Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {comments.length === 0 ? (
        <div className="p-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#203f61] to-[#2a537e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">لا توجد تعليقات</h3>
            <p className="text-gray-500 text-lg">لم يتم إضافة أي تعليقات بعد</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#203f61]">
              <tr>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">ID</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">العميل</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">المنتج</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">التقييم</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">التعليق</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-white">التاريخ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <tr key={comment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      #{comment.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{comment.userName}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{comment.userEmail}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          User ID: {comment.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      <Package className="w-4 h-4 text-[#203f61]" />
                      <span className="text-sm font-medium text-gray-900">ID: {comment.productId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {renderStars(comment.rating)}
                      <span className="text-xs text-gray-500 font-medium">{comment.rating} من 5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-sm text-gray-900 line-clamp-3">{comment.content}</p>
                      {comment.content.length > 150 && (
                        <button
                          onClick={() => setSelectedComment(comment)}
                          className="text-xs text-[#203f61] hover:text-[#2a537e] mt-1 font-medium"
                        >
                          عرض المزيد ←
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="font-medium">{formatDate(comment.createdAt)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedComment(comment)}
                        className="p-2 bg-[#203f61] text-white hover:bg-[#2a537e] rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 transform hover:scale-105"
                        title="حذف التعليق"
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

    {/* Comment Details Modal */}
    {selectedComment && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-[#203f61] to-[#2a537e] text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">📝 تفاصيل التعليق</h3>
              <button
                onClick={() => setSelectedComment(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedComment.userName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Mail className="w-4 h-4" />
                  {selectedComment.userEmail}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  User ID: {selectedComment.userId}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="border-t pt-4">
              <label className="text-sm font-semibold text-gray-700 block mb-3">التقييم</label>
              <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                {renderStars(selectedComment.rating)}
                <span className="text-lg font-bold text-gray-900">
                  {selectedComment.rating} من 5
                </span>
              </div>
            </div>

            {/* Product ID */}
            <div className="border-t pt-4">
              <label className="text-sm font-semibold text-gray-700 block mb-3">المنتج</label>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                <Package className="w-5 h-5 text-[#203f61]" />
                <span className="font-medium text-gray-900">Product ID: {selectedComment.productId}</span>
              </div>
            </div>

            {/* Comment Content */}
            <div className="border-t pt-4">
              <label className="text-sm font-semibold text-gray-700 block mb-3">التعليق</label>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedComment.content}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="text-sm font-semibold text-gray-700 block mb-2">تاريخ النشر</label>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Calendar className="w-4 h-4 text-[#203f61]" />
                  {formatDate(selectedComment.createdAt)}
                </div>
              </div>
              {selectedComment.updatedAt && selectedComment.updatedAt !== selectedComment.createdAt && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">آخر تحديث</label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-[#203f61]" />
                    {formatDate(selectedComment.updatedAt)}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedComment(null)}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedComment._id);
                  setSelectedComment(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف التعليق
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <ConfirmationModal
      isOpen={isConfirmOpen}
      title="تأكيد حذف التعليق"
      message="هل أنت متأكد من حذف هذا التعليق؟"
      confirmText="حذف"
      cancelText="إلغاء"
      onConfirm={performDelete}
      onCancel={() => {
        setConfirmOpen(false);
        setDeleteTargetId(null);
      }}
    />
  </div>
);
};

export default CommentsManagement;