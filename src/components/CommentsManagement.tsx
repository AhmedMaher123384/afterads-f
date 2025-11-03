import React, { useState, useEffect } from 'react';
import { smartToast } from '../utils/toastConfig';
import {
  MessageSquare,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Star,
  Calendar,
  User,
  X
} from 'lucide-react';
import { commentService, Comment, CommentsQuery } from '../services/commentService';

const CommentsManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // جلب التعليقات
  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // استخدام نفس الطريقة المستمنتج في Dashboard
       const response = await commentService.getComments({});
      
      const allComments = response.comments || [];
      
      // تطبيق البحث محلياً إذا كان هناك مصطلح بحث
      let filteredComments = allComments;
      if (searchTerm) {
        filteredComments = allComments.filter((comment: any) => 
          comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.productName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // تطبيق التصفح محلياً
      const startIndex = (currentPage - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedComments = filteredComments.slice(startIndex, endIndex);
      
      setComments(paginatedComments);
      setTotalPages(Math.ceil(filteredComments.length / 10));
    } catch (error) {
      console.error('Error fetching comments:', error);
      smartToast.dashboard.error('حدث خطأ في تحميل التعليقات');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // حذف تعليق
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      smartToast.dashboard.success('تم حذف التعليق بنجاح');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      smartToast.dashboard.error('حدث خطأ في حذف التعليق');
    }
  };

  // عرض تفاصيل التعليق
  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDetailModal(true);
  };

  // تأثيرات جانبية
  useEffect(() => {
    fetchComments();
  }, [currentPage, searchTerm]);

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة التعليقات</h2>
            <p className="text-sm text-gray-500">{comments.length} تعليق</p>
          </div>
        </div>
        <button
          onClick={fetchComments}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Search */}
      <div className="bg-black rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في التعليقات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-black rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">جاري تحميل التعليقات...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد تعليقات</h3>
            <p className="text-gray-500">لم يتم العثور على تعليقات تطابق المعايير المحددة</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{comment.userName}</h4>
                        <p className="text-sm text-gray-300">{comment.userEmail}</p>
                      </div>
                      {comment.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < comment.rating!
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mb-3 p-4 bg-gray-800 border-l-4 border-gray-600 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-300">المنتج:</span>
                          <span className="text-lg font-bold text-white mr-2">
                            {comment.productName || 'منتج غير محدد'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="mb-3 p-4 bg-gray-800 border border-gray-600 rounded-lg">
                      <span className="text-sm font-medium text-gray-300 block mb-2">التعليق:</span>
                      <p className="text-white leading-relaxed line-clamp-3">{comment.content}</p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewComment(comment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <span className="text-sm text-gray-700">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تفاصيل التعليق</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedComment.userName}</h4>
                    <p className="text-sm text-gray-500">{selectedComment.userEmail}</p>
                  </div>
                  {selectedComment.rating && (
                    <div className="flex items-center gap-1 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedComment.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المنتج</label>
                  <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
                    <span className="text-lg font-bold text-gray-800">
                      {selectedComment.productName || 'منتج غير محدد'}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">محتوى التعليق</label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedComment.content}</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنشاء</label>
                  <p className="text-gray-600">{formatDate(selectedComment.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleDeleteComment(selectedComment.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  حذف التعليق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;