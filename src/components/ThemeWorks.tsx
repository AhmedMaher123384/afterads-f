import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Eye, X, ExternalLink, MessageSquare, Calendar, User } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '../config/api';
import fallbackImg from '../assets/search_not_found.png';
import { useTranslation } from 'react-i18next';

interface ThemeWork {
  _id?: string;
  id: number;
  imageMobile: string;
  imageTablet: string;
  imageDesktop: string;
  link: string;
  clientOpinion?: string;
  clientName?: string;
  clientImage?: string;
  workDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PreviewModalProps {
  work: ThemeWork;
  isOpen: boolean;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ work, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const currentImage = device === 'desktop' ? work.imageDesktop : 
                       device === 'tablet' ? work.imageTablet : 
                       work.imageMobile;

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `http://localhost:3001${path}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-gradient-to-br from-[#1a1a1a]/98 via-[#292929]/95 to-[#1a1a1a]/98 rounded-2xl border border-[#18b5d8]/30 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#18b5d8]/20">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] p-2 rounded-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{t('theme_works.modal.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Device Selector */}
        <div className="flex justify-center items-center gap-3 p-4 bg-gradient-to-r from-[#18b5d8]/10 to-transparent border-b border-[#18b5d8]/20">
          <span className="text-[#18b5d8] text-sm font-medium">{t('theme_works.modal.preview_label')}</span>
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-lg transition-all ${
              device === 'desktop' 
                ? 'bg-[#18b5d8] text-white shadow-lg' 
                : 'bg-white/10 text-[#18b5d8] hover:bg-white/20'
            }`}
            title={t('theme_works.modal.device.desktop')}
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-lg transition-all ${
              device === 'tablet' 
                ? 'bg-[#18b5d8] text-white shadow-lg' 
                : 'bg-white/10 text-[#18b5d8] hover:bg-white/20'
            }`}
            title={t('theme_works.modal.device.tablet')}
          >
            <Tablet className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-lg transition-all ${
              device === 'mobile' 
                ? 'bg-[#18b5d8] text-white shadow-lg' 
                : 'bg-white/10 text-[#18b5d8] hover:bg-white/20'
            }`}
            title={t('theme_works.modal.device.mobile')}
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          <div className="relative">
            <div className="absolute top-4 right-4 bg-[#18b5d8]/90 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold border border-[#18b5d8]/30 z-10 flex items-center gap-2">
              {device === 'desktop' && <><Monitor className="w-4 h-4" /> {t('theme_works.modal.device.desktop')}</>}
              {device === 'tablet' && <><Tablet className="w-4 h-4" /> {t('theme_works.modal.device.tablet')}</>}
              {device === 'mobile' && <><Smartphone className="w-4 h-4" /> {t('theme_works.modal.device.mobile')}</>}
            </div>

            <div className={`bg-white/5 rounded-lg overflow-hidden mx-auto transition-all duration-500 ${
              device === 'desktop' ? 'aspect-video max-w-full' :
              device === 'tablet' ? 'aspect-[3/4] max-w-2xl' :
              'aspect-[9/16] max-w-sm'
            }`}>
              <img 
                src={getImageUrl(currentImage)}
                alt={`${device} Preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = fallbackImg;
                }}
              />
            </div>

            {work.clientOpinion && (
              <div className="mt-6 bg-gradient-to-r from-[#18b5d8]/10 to-transparent rounded-xl p-4 border border-[#18b5d8]/20">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-[#18b5d8] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">{t('theme_works.modal.client_opinion_title')}</h4>
                    <p className="text-[#a1a1a1] text-sm leading-relaxed">
                      {work.clientOpinion}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Client Info in Modal */}
            {(work.clientName || work.clientImage) && (
              <div className="mt-4">
                <div className="h-px bg-gradient-to-r from-transparent via-[#18b5d8]/20 to-transparent mb-4"></div>
                <div className="flex items-center gap-3">
                  {work.clientImage ? (
                    <img
                      src={getImageUrl(work.clientImage)}
                      alt={work.clientName || 'Client'}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#18b5d8]/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[#18b5d8] to-[#0f8aa3] rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-base">{work.clientName || t('theme_works.modal.client_name_placeholder')}</h3>
                    {work.workDate && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(work.workDate).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-[#18b5d8]/20">
          <a
            href={work.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#16a8cc] hover:to-[#18b5d8] transition-all duration-300 transform hover:scale-105"
          >
            <ExternalLink className="w-5 h-5" />
            <span>{t('theme_works.footer.visit_site')}</span>
          </a>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
          >
            {t('theme_works.footer.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ThemeWorks: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [works, setWorks] = useState<ThemeWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWork, setSelectedWork] = useState<ThemeWork | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(API_ENDPOINTS.THEME_WORKS.LIST);
      const data = Array.isArray(res) ? res : res?.data || res?.items || [];
      const activeWorks = data.filter((work: ThemeWork) => work.isActive);
      setWorks(activeWorks);
    } catch (err) {
      console.error('Error fetching theme works:', err);
      setError(t('theme_works.error_fetching'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (work: ThemeWork) => {
    setSelectedWork(work);
    setIsModalOpen(true);
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `http://localhost:3001${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18b5d8]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a1a1a1] text-lg">{t('theme_works.no_works')}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 sm:mt-20 mb-12 sm:mb-16 relative animate-section">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#18b5d8]/3 via-transparent to-[#292929]/10 rounded-3xl"></div>
      <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-br from-[#18b5d8]/15 to-transparent rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-tl from-[#18b5d8]/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative bg-gradient-to-br from-[#1a1a1a]/98 via-[#292929]/95 to-[#1a1a1a]/98 rounded-3xl backdrop-blur-xl border border-[#18b5d8]/20 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="relative p-6 sm:p-12 pb-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#18b5d8]/20 to-[#18b5d8]/10 px-6 py-3 rounded-full border border-[#18b5d8]/30 mb-6">
              <div className="w-2 h-2 bg-[#18b5d8] rounded-full animate-pulse"></div>
                <span className="text-[#18b5d8] font-medium text-sm">{t('theme_works.header.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#18b5d8] to-white mb-6 leading-tight">
              {t('theme_works.header.title')}
            </h2>
            <p className="text-lg sm:text-xl text-[#a1a1a1] max-w-3xl mx-auto leading-relaxed">
              {t('theme_works.header.description')}
            </p>
          </div>
        </div>

        {/* Works Grid */}
        <div className="relative px-4 sm:px-12 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work, index) => (
              <div 
                key={work._id || work.id || index}
                className="bg-[#1e1e1e]/95 backdrop-blur-lg border border-gray-700/20 rounded-2xl overflow-hidden hover:border-[#18b5d8]/30 transition-all duration-300 group h-full flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                  <img 
                    src={getImageUrl(work.imageDesktop)}
                    alt="Work Preview"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImg;
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => handlePreview(work)}
                      className="bg-gradient-to-r from-[#18b5d8] to-[#16a8cc] text-white px-4 py-2 rounded-lg font-semibold hover:from-[#16a8cc] hover:to-[#18b5d8] transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('theme_works.overlay.preview')}</span>
                    </button>
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{t('theme_works.overlay.visit')}</span>
                    </a>
                  </div>

               
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-end">
                  {work.clientOpinion && (
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm leading-relaxed italic text-center line-clamp-3">
                        "{work.clientOpinion}"
                      </p>
                    </div>
                  )}
                  
                  {/* Client Info */}
                  <div className="relative">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#18b5d8]/20 to-transparent mb-4"></div>
                    <div className="flex items-center gap-3">
                      {work.clientImage ? (
                        <img
                          src={getImageUrl(work.clientImage)}
                          alt={work.clientName || 'Client'}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-[#18b5d8]/20 shadow-lg group-hover:border-[#18b5d8]/60 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#18b5d8] to-[#0f8aa3] rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {work.clientName ? work.clientName.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-base group-hover:text-[#18b5d8]/90 transition-colors">
                          {work.clientName || 'اسم العميل'}
                        </h3>
                        {work.workDate && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(work.workDate).toLocaleDateString('ar-SA')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Line Animation */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#18b5d8]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedWork && (
        <PreviewModal 
          work={selectedWork}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeWorks;