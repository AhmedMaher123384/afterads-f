import { apiCall, API_ENDPOINTS } from '../config/api';

// تعريف نوع التعليق
export interface Comment {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  productName?: string;
  productImage?: string;
}

// تعريف نوع البيانات للبحث والتصفية
export interface CommentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  productId?: number;
  sortBy?: 'createdAt' | 'rating' | 'userName';
  sortOrder?: 'asc' | 'desc';
}

// تعريف نوع الاستجابة للتعليقات
export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// تعريف نوع بيانات إنشاء تعليق جديد
export interface CreateCommentData {
  productId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  rating?: number;
}

// منتج التعليقات
export const commentService = {
  // جلب جميع التعليقات مع التصفية والبحث
  async getComments(query: CommentsQuery = {}): Promise<CommentsResponse> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.productId) params.append('productId', query.productId.toString());

    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const endpoint = `${API_ENDPOINTS.COMMENTS}?${params.toString()}`;
    return await apiCall(endpoint, { method: 'GET' });
  },

  // جلب تعليقات منتج معين
  async getProductComments(productId: number): Promise<Comment[]> {
    const endpoint = API_ENDPOINTS.PRODUCT_COMMENTS(productId);
    const response = await apiCall(endpoint, { method: 'GET' });
    return response.comments || response;
  },

  // جلب تعليق واحد بالـ ID
  async getCommentById(id: number): Promise<Comment> {
    const endpoint = API_ENDPOINTS.COMMENT_BY_ID(id);
    return await apiCall(endpoint, { method: 'GET' });
  },

  // إنشاء تعليق جديد
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    return await apiCall(API_ENDPOINTS.COMMENTS, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },



  // حذف تعليق
  async deleteComment(id: number): Promise<void> {
    const endpoint = API_ENDPOINTS.COMMENT_BY_ID(id);
    await apiCall(endpoint, { method: 'DELETE' });
  },

  // تحديث تعليق
  async updateComment(id: number, updateData: Partial<CreateCommentData>): Promise<Comment> {
    const endpoint = API_ENDPOINTS.COMMENT_BY_ID(id);
    return await apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },
};

export default commentService;