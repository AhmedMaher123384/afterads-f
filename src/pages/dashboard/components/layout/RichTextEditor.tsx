import React, { useState, useRef, useEffect } from 'react';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../../../../config/api';
import { smartToast } from '../../../../utils/toastConfig';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Lightbulb,
  AlertTriangle,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'اكتب هنا...',
  label,
  required = false,
  minHeight = '300px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [textDirection, setTextDirection] = useState<'rtl' | 'ltr'>('rtl');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const toggleDirection = () => {
    setTextDirection(prev => prev === 'rtl' ? 'ltr' : 'rtl');
    if (editorRef.current) {
      editorRef.current.style.direction = textDirection === 'rtl' ? 'ltr' : 'rtl';
      editorRef.current.focus();
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  // Format commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Insert HTML at cursor
  const insertHtmlAtCursor = (html: string) => {
    const selection = window.getSelection();
    let range: Range | null = null;
    if (selection && selection.rangeCount > 0) {
      const potential = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(potential.commonAncestorContainer)) {
        range = potential;
      }
    }

    if (!range) {
      range = savedRangeRef.current;
    }

    if (!range || !editorRef.current) {
      if (editorRef.current) {
        editorRef.current.insertAdjacentHTML('beforeend', html);
        handleContentChange();
      }
      return;
    }

    range.deleteContents();

    const div = document.createElement('div');
    div.innerHTML = html;
    const frag = document.createDocumentFragment();
    let lastNode: ChildNode | null = null;
    while (div.firstChild) {
      lastNode = frag.appendChild(div.firstChild);
    }
    range.insertNode(frag);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }

    handleContentChange();
  };

  // Ensure last row exists and return it
  const ensureLastRow = () => {
    if (!editorRef.current) return null;
    const rows = editorRef.current.querySelectorAll('.row-item');
    if (!rows || rows.length === 0) {
      const row = document.createElement('div');
      row.className = 'row-item relative my-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50';
      row.innerHTML = `
        <div class="row-grid grid md:grid-cols-2 gap-4">
          <div class="block-item text-block" contenteditable="true" data-type="text" style="min-height: 3rem; padding: 0.75rem; border: 2px dashed #e5e7eb; border-radius: 0.5rem;">
            <p><br></p>
          </div>
          <div class="block-item image-block" contenteditable="false" data-type="images">
            <div class="images-grid grid gap-2" data-orientation="horizontal" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));"></div>
            <div class="mt-3 flex gap-2 flex-wrap">
              <button type="button" class="add-more-images px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">+ إضافة صور</button>
              <select class="orientation-selector px-2 py-1 border border-gray-300 rounded text-sm">
                <option value="horizontal" selected>أفقي</option>
                <option value="vertical">عمودي</option>
              </select>
            </div>
          </div>
        </div>
        <button type="button" class="delete-row-btn absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600">حذف الصف</button>
      `;
      editorRef.current.appendChild(row);
      // Move existing standalone text-block (outside rows) into the new row
      const existingTextBlock = editorRef.current.querySelector(':scope > .block-item.text-block') as HTMLElement | null;
      if (existingTextBlock) {
        const rowText = row.querySelector('.text-block') as HTMLElement | null;
        if (rowText) {
          rowText.innerHTML = existingTextBlock.innerHTML;
          existingTextBlock.remove();
        }
      }
      attachImageRowListeners();
      return row;
    }
    return rows[rows.length - 1] as HTMLElement;
  };

  // Insert image into last row (row with text + images)
  const insertImage = (url: string, orientation: 'horizontal' | 'vertical') => {
    const row = ensureLastRow();
    if (!row) return;
    const grid = row.querySelector('.images-grid') as HTMLElement | null;
    if (!grid) return;
    grid.setAttribute('data-orientation', orientation);
    grid.style.gridTemplateColumns = orientation === 'vertical'
      ? 'repeat(auto-fit, minmax(150px, 200px))'
      : 'repeat(auto-fit, minmax(250px, 1fr))';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'صورة';
    img.className = 'w-full h-auto rounded-lg shadow-md';
    grid.appendChild(img);
    handleContentChange();
  };

  // Attach event listeners to rows (images controls)
  const attachImageRowListeners = () => {
    setTimeout(() => {
      const rows = editorRef.current?.querySelectorAll('.row-item');
      rows?.forEach(row => {
        // Add more images button
        const addBtn = row.querySelector('.add-more-images');
        if (addBtn && !addBtn.hasAttribute('data-listener')) {
          addBtn.setAttribute('data-listener', 'true');
          addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;

            input.onchange = async (ev) => {
              const files = (ev.target as HTMLInputElement).files;
              if (!files) return;

              const grid = row.querySelector('.images-grid');
              if (!grid) return;

              try {
                for (const file of Array.from(files)) {
                  const fd = new FormData();
                  fd.append('image', file);
                  const resp = await apiCall(API_ENDPOINTS.UPLOAD_ATTACHMENTS, {
                    method: 'POST',
                    body: fd
                  });
                  let uploadedUrl = '';
                  if (resp?.imagePaths && Array.isArray(resp.imagePaths) && resp.imagePaths[0]) {
                    uploadedUrl = resp.imagePaths[0];
                  } else if (resp?.data?.url) {
                    uploadedUrl = resp.data.url;
                  } else if (resp?.url) {
                    uploadedUrl = resp.url;
                  }
                  const finalUrl = buildImageUrl(uploadedUrl);
                  if (!finalUrl) continue;
                  const img = document.createElement('img');
                  img.src = finalUrl;
                  img.alt = 'صورة';
                  img.className = 'w-full h-auto rounded-lg shadow-md';
                  grid.appendChild(img);
                }
                handleContentChange();
              } catch (err) {
                console.error('Upload error:', err);
                smartToast.dashboard.error('فشل رفع الصور، حاول مرة أخرى');
              }
            };

            input.click();
          });
        }

        // Orientation selector
        const selector = row.querySelector('.orientation-selector') as HTMLSelectElement;
        if (selector && !selector.hasAttribute('data-listener')) {
          selector.setAttribute('data-listener', 'true');
          selector.addEventListener('change', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const grid = row.querySelector('.images-grid');
            if (!grid) return;

            const orientation = (e.target as HTMLSelectElement).value;
            grid.setAttribute('data-orientation', orientation);

            if (orientation === 'vertical') {
              (grid as HTMLElement).style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 200px))';
            } else {
              (grid as HTMLElement).style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            }

            handleContentChange();
          });
        }

        const delRowBtn = row.querySelector('.delete-row-btn');
        if (delRowBtn && !delRowBtn.hasAttribute('data-listener')) {
          delRowBtn.setAttribute('data-listener', 'true');
          delRowBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            row.remove();
            handleContentChange();
          });
        }

        if (!row.querySelector('.delete-row-btn')) {
          const del = document.createElement('button');
          del.type = 'button';
          del.className = 'delete-row-btn absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600';
          del.textContent = 'حذف الصف';
          row.appendChild(del);
        }

        const grid = row.querySelector('.images-grid') as HTMLElement | null;
        if (grid) {
          const imgs = Array.from(grid.querySelectorAll('img'));
          imgs.forEach(img => {
            const parent = img.parentElement;
            if (!parent || !parent.classList.contains('image-item-container')) {
              const wrapper = document.createElement('div');
              wrapper.className = 'image-item-container';
              parent?.insertBefore(wrapper, img);
              wrapper.appendChild(img);

              const delBtn = document.createElement('button');
              delBtn.type = 'button';
              delBtn.className = 'delete-image-btn';
              delBtn.textContent = 'حذف';
              delBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                wrapper.remove();
                handleContentChange();
              });
              wrapper.appendChild(delBtn);
            }
          });
        }
      });
    }, 50);
  };

  // Insert special blocks
  const insertNote = (type: 'info' | 'warning') => {
    const icons = {
      info: '💡',
      warning: '⚠️'
    };

    const colors = {
      info: 'bg-yellow-50 border-yellow-300 text-yellow-900',
      warning: 'bg-red-50 border-red-300 text-red-900'
    };

    const html = `
      <div class="my-4 p-4 rounded-lg border-2 ${colors[type]}" contenteditable="true">
        <div class="flex items-start gap-3">
          <span class="text-2xl">${icons[type]}</span>
          <div class="flex-1">
            <p class="font-semibold mb-1">${type === 'info' ? 'ملاحظة' : 'تحذير'}</p>
            <p>اكتب محتوى ${type === 'info' ? 'الملاحظة' : 'التحذير'} هنا...</p>
          </div>
        </div>
      </div>
    `;

    insertHtmlAtCursor(html);
  };

  // Insert code block
  const insertCodeBlock = () => {
    const html = `
      <pre class="my-4 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto" contenteditable="true"><code>// اكتب الكود هنا
function example() {
  return "Hello World";
}</code></pre>
    `;

    insertHtmlAtCursor(html);
  };

  // Insert quote
  const insertQuote = () => {
    const html = `
      <blockquote class="my-4 pl-4 pr-4 py-2 border-r-4 border-[#203f61] bg-gray-50 italic text-gray-700" contenteditable="true">
        اكتب الاقتباس هنا...
      </blockquote>
    `;

    insertHtmlAtCursor(html);
  };

  // Handle insert image from URL
  const handleInsertImage = () => {
    if (imageUrl) {
      insertImage(imageUrl, imageOrientation);
      setImageUrl('');
      setImageOrientation('horizontal');
    }
  };

  // Handle upload images
  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const row = ensureLastRow();
    const grid = row?.querySelector('.images-grid') as HTMLElement | null;
    const currentOrientation = grid?.getAttribute('data-orientation') as 'horizontal' | 'vertical' || 'horizontal';
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const fd = new FormData();
        fd.append('image', file);
        const resp = await apiCall(API_ENDPOINTS.UPLOAD_ATTACHMENTS, {
          method: 'POST',
          body: fd
        });
        let uploadedUrl = '';
        if (resp?.imagePaths && Array.isArray(resp.imagePaths) && resp.imagePaths[0]) {
          uploadedUrl = resp.imagePaths[0];
        } else if (resp?.data?.url) {
          uploadedUrl = resp.data.url;
        } else if (resp?.url) {
          uploadedUrl = resp.url;
        }
        const finalUrl = buildImageUrl(uploadedUrl);
        if (!finalUrl) continue;
        insertImage(finalUrl, currentOrientation);
      }
    } catch (err) {
      console.error('Upload error:', err);
      smartToast.dashboard.error('فشل رفع الصور، حاول مرة أخرى');
    } finally {
      e.target.value = '';
    }
  };

  // Insert link
  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      const html = `<a href="${linkUrl}" class="text-[#203f61] underline hover:text-[#2a537e]" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      insertHtmlAtCursor(html);
      setLinkUrl('');
      setLinkText('');
      setShowLinkInput(false);
    }
  };

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      onChange(editorRef.current.innerHTML);

      if (range) {
        setTimeout(() => {
          try {
            selection?.removeAllRanges();
            selection?.addRange(range);
          } catch (e) {
            // ignore
          }
        }, 0);
      }
    }
  };

  // Toolbar button component
  const ToolbarButton: React.FC<{
    icon: React.ReactNode;
    onClick: () => void;
    title: string;
    active?: boolean;
  }> = ({ icon, onClick, title, active }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all hover:bg-gray-200 ${active ? 'bg-gray-300' : 'bg-white'
        }`}
    >
      {icon}
    </button>
  );

  useEffect(() => {
    if (editorRef.current) {
      if (!value || value.trim() === '') {
        editorRef.current.innerHTML = '<p><br></p>';
      } else if (editorRef.current.innerHTML !== value) {
        const selection = window.getSelection();
        const hadFocus = editorRef.current.contains(document.activeElement);

        editorRef.current.innerHTML = value;

        if (hadFocus && selection) {
          editorRef.current.focus();
        }

        // Re-attach listeners when content is loaded
        attachImageRowListeners();
      }
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Toolbar */}
      <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <ToolbarButton
            icon={<Heading1 className="w-4 h-4" />}
            onClick={() => execCommand('formatBlock', '<h1>')}
            title="عنوان رئيسي"
          />
          <ToolbarButton
            icon={<Heading2 className="w-4 h-4" />}
            onClick={() => execCommand('formatBlock', '<h2>')}
            title="عنوان فرعي"
          />
          <ToolbarButton
            icon={<Heading3 className="w-4 h-4" />}
            onClick={() => execCommand('formatBlock', '<h3>')}
            title="عنوان صغير"
          />
          <ToolbarButton
            icon={<Type className="w-4 h-4" />}
            onClick={() => execCommand('formatBlock', '<p>')}
            title="نص عادي"
          />
        </div>

        {/* Text style */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <ToolbarButton
            icon={<Bold className="w-4 h-4" />}
            onClick={() => execCommand('bold')}
            title="عريض"
          />
          <ToolbarButton
            icon={<Italic className="w-4 h-4" />}
            onClick={() => execCommand('italic')}
            title="مائل"
          />
          <ToolbarButton
            icon={<Underline className="w-4 h-4" />}
            onClick={() => execCommand('underline')}
            title="تحته خط"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <ToolbarButton
            icon={<AlignRight className="w-4 h-4" />}
            onClick={() => execCommand('justifyRight')}
            title="محاذاة لليمين"
          />
          <ToolbarButton
            icon={<AlignCenter className="w-4 h-4" />}
            onClick={() => execCommand('justifyCenter')}
            title="محاذاة للوسط"
          />
          <ToolbarButton
            icon={<AlignLeft className="w-4 h-4" />}
            onClick={() => execCommand('justifyLeft')}
            title="محاذاة لليسار"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <ToolbarButton
            icon={<List className="w-4 h-4" />}
            onClick={() => execCommand('insertUnorderedList')}
            title="قائمة نقطية"
          />
          <ToolbarButton
            icon={<ListOrdered className="w-4 h-4" />}
            onClick={() => execCommand('insertOrderedList')}
            title="قائمة مرقمة"
          />
        </div>

        {/* Special blocks */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <ToolbarButton
            icon={<Quote className="w-4 h-4" />}
            onClick={insertQuote}
            title="اقتباس"
          />
          <ToolbarButton
            icon={<Code className="w-4 h-4" />}
            onClick={insertCodeBlock}
            title="كود برمجي"
          />
          <ToolbarButton
            icon={<Lightbulb className="w-4 h-4 text-yellow-600" />}
            onClick={() => insertNote('info')}
            title="ملاحظة"
          />
          <ToolbarButton
            icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
            onClick={() => insertNote('warning')}
            title="تحذير"
          />
        </div>

        {/* Media */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <ToolbarButton
            icon={<Image className="w-4 h-4" />}
            onClick={() => imageInputRef.current?.click()}
            title="إضافة صورة"
          />
          <ToolbarButton
            icon={<Link className="w-4 h-4" />}
            onClick={() => setShowLinkInput(!showLinkInput)}
            title="إضافة رابط"
          />
        </div>

        {/* Add New Row */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <button
            type="button"
            onClick={() => {
              if (!editorRef.current) return;
              const row = document.createElement('div');
              row.className = 'row-item relative my-4 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50';
              row.innerHTML = `
                <div class="row-grid grid md:grid-cols-2 gap-4">
                  <div class="block-item text-block" contenteditable="true" data-type="text" style="min-height: 3rem; padding: 0.75rem; border: 2px dashed #93c5fd; border-radius: 0.5rem;"><p><br></p></div>
                  <div class="block-item image-block" contenteditable="false" data-type="images">
                    <div class="images-grid grid gap-2" data-orientation="horizontal" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));"></div>
                    <div class="mt-3 flex gap-2 flex-wrap">
                      <button type="button" class="add-more-images px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">+ إضافة صور</button>
                      <select class="orientation-selector px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="horizontal" selected>أفقي</option>
                        <option value="vertical">عمودي</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="button" class="delete-row-btn absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600">حذف الصف</button>
              `;
              editorRef.current.appendChild(row);
              attachImageRowListeners();
            }}
            title="إضافة صف جديد"
            className="p-2 rounded-lg transition-all bg-blue-500 text-white hover:bg-blue-600 font-semibold"
          >
            + صف جديد
          </button>
        </div>

        {/* Language Direction Toggle */}
        <div className="flex gap-1 border-l border-gray-300 pl-2">
          <button
            type="button"
            onClick={toggleDirection}
            title={textDirection === 'rtl' ? 'تبديل للإنجليزية' : 'تبديل للعربية'}
            className={`p-2 rounded-lg transition-all font-bold ${textDirection === 'rtl'
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
          >
            {textDirection === 'rtl' ? 'ع' : 'EN'}
          </button>
        </div>
      </div>

      {/* Image and Link Controls */}
      <div className="flex gap-2 mb-2 flex-wrap">
        <div className="flex gap-2 items-end">
          <div>
            {/* <label className="block text-xs font-semibold text-gray-700 mb-1">رابط صورة</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#203f61]"
              placeholder="https://example.com/image.jpg"
            /> */}
          </div>
          <select
            value={imageOrientation}
            onChange={(e) => setImageOrientation(e.target.value as 'horizontal' | 'vertical')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="horizontal">أفقي</option>
            <option value="vertical">عمودي</option>
          </select>
          {/* <button
            type="button"
            onClick={handleInsertImage}
            disabled={!imageUrl}
            className="px-4 py-2.5 bg-[#203f61] text-white rounded-lg hover:bg-[#2a537e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إضافة
          </button> */}

            <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
            className="px-4 py-2.5 bg-[#203f61] text-white rounded-lg hover:bg-[#2a537e] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📁 رفع صور
        </button>
        </div>

      
      </div>

      {/* Image Upload Input */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUploadImages}
        className="hidden"
        ref={imageInputRef}
      />

      {/* Link input */}
      {showLinkInput && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="نص الرابط"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="رابط URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleInsertLink}
              className="px-4 py-2.5 bg-[#203f61] text-white rounded-lg hover:bg-[#2a537e]"
            >
              إدراج
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onFocus={saveSelection}
        className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-[#203f61] focus:border-[#203f61] transition-all overflow-y-auto prose prose-sm max-w-none"
        style={{ minHeight, direction: textDirection }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable] {
          unicode-bidi: plaintext;
          text-align: start;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-right: 2em;
        }
        [contenteditable] li {
          margin: 0.5em 0;
        }
        [contenteditable]:focus {
          outline: none;
        }
        [contenteditable] code {
          direction: ltr;
          text-align: left;
          display: inline-block;
        }
        [contenteditable] pre {
          direction: ltr;
          text-align: left;
        }
        
        /* Row styling */
        [contenteditable] .row-item {
          margin: 1rem 0;
          position: relative;
        }
        
        [contenteditable] .row-item:hover {
          border-color: #203f61;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        [contenteditable] .images-grid {
          min-height: 100px;
        }
        
        [contenteditable] .images-grid img {
          width: 100%;
          height: auto;
          object-fit: cover;
        }
        [contenteditable] .image-item-container { position: relative; }
        [contenteditable] .delete-image-btn { position: absolute; top: 8px; left: 8px; background: rgba(220,38,38,0.9); color: #fff; border: none; border-radius: 6px; padding: 4px 8px; font-size: 12px; opacity: 0; transition: opacity 0.2s ease; cursor: pointer; }
        [contenteditable] .image-item-container:hover .delete-image-btn { opacity: 1; }
        
        [contenteditable] .add-more-images,
        [contenteditable] .orientation-selector {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
