'use client';
import { useState, useEffect, useCallback } from 'react';
import { Tag, FolderTree, Save, ArrowLeft, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { deleteCategoryAction, fetchCategoryById, updateCategoryAction } from '@/actions/category.action';
import { useParams, useRouter } from 'next/navigation';
import DashboardHeadingBox from '@/components/ui/DashboardHeadingBox';

const EditCategoryPage = ({ existingCategories }) => {
  const [formData, setFormData] = useState({
    name: '',
    parentId: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { categoryID } = useParams();
  const router = useRouter();
const fetchCategory = useCallback(async () => {
  try {
    setIsLoading(true);
    const category = await fetchCategoryById(categoryID);
    setFormData(category);
    setOriginalData(category);
  } catch (error) {
    console.error('Error fetching category:', error);
  } finally {
    setIsLoading(false);
  }
}, [categoryID]);


  useEffect(() => {
    if (categoryID) {
        fetchCategory();
    }
  }, [])
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setNotification({
        type: 'error',
        message: 'Category name is required'
      });
      return;
    }

    // Check if form is preventing circular reference
    if (formData.parentId === categoryID) {
      setNotification({
        type: 'error',
        message: 'A category cannot be its own parent'
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const data = await updateCategoryAction(formData);

      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Category updated successfully!'
        });
        setOriginalData(formData);
        router.refresh();
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to update category'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setNotification(null);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return formData.name !== originalData.name || 
           formData.parentId !== originalData.parentId;
  };

  // Filter out current category and its descendants from parent options
  const getAvailableParentCategories = () => {
    return existingCategories.filter(cat => cat.id !== categoryID);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-(--color-brand-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-(--text-secondary) font-medium">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
        <DashboardHeadingBox
          text="Edit Category"
          subHeading={"View all your categories"}
        />

      {/* Main Content */}
      <div className="mb-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Notification */}
          {notification && (
            <div className={`mb-6 border rounded-xl p-4 flex items-start gap-3 ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="text-green-600 shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 shrink-0" size={20} />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-(--text-secondary) hover:text-(--text-primary) text-xl"
              >
                ×
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category ID Display */}
              <div className="bg-(--bg-surface) border border-(--border-default) rounded-lg p-4">
                <p className="text-xs text-(--text-secondary) mb-1">Category ID</p>
                <p className="text-sm font-mono font-medium text-(--text-primary)">{categoryID}</p>
              </div>

              {/* Category Name Field */}
              <div>
                <label 
                  htmlFor="name" 
                  className="flex items-center gap-2 text-(--text-heading) font-semibold mb-3"
                >
                  <Tag size={18} className="text-(--color-brand-primary)" />
                  Category Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg 
                           focus:outline-none focus:border-(--color-brand-primary) 
                           transition-colors text-(--text-primary)"
                  required
                />
                <p className="text-(--text-secondary) text-xs mt-2">
                  Update the category name. Changes will reflect across all products.
                </p>
              </div>

              {/* Parent Category Field */}
              <div>
                <label 
                  htmlFor="parentId" 
                  className="flex items-center gap-2 text-(--text-heading) font-semibold mb-3"
                >
                  <FolderTree size={18} className="text-(--color-brand-primary)" />
                  Parent Category
                  <span className="text-(--text-secondary) text-xs font-normal">(Optional)</span>
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg 
                           focus:outline-none focus:border-(--color-brand-primary) 
                           transition-colors text-(--text-primary) bg-white"
                >
                  <option value="">None (Top-level category)</option>
                  {getAvailableParentCategories().map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-(--text-secondary) text-xs mt-2">
                  Change the parent category to reorganize your category hierarchy.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 bg-(--btn-bg-primary) text-(--btn-text-primary) 
                           px-6 py-3 rounded-full hover:bg-(--btn-bg-hover) 
                           transition-all font-medium flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 sm:flex-initial bg-white border border-(--border-default) 
                           text-(--text-primary) px-6 py-3 rounded-full 
                           hover:bg-(--bg-surface) transition-all font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>

            </form>

          </div>

          {/* Preview Section */}
          {formData.name && (
            <div className="mt-6 bg-white border border-(--border-default) rounded-xl p-6">
              <h3 className="text-lg font-semibold text-(--text-heading) mb-4">
                Preview
              </h3>
              <div className="flex items-center gap-3 p-4 bg-(--bg-surface) rounded-lg">
                <Tag size={20} className="text-(--color-brand-primary)" />
                <div>
                  <p className="font-medium text-(--text-heading)">{formData.name}</p>
                  {formData.parentId && (
                    <p className="text-xs text-(--text-secondary)">
                      Subcategory of: {existingCategories.find(c => c.id === formData.parentId)?.name}
                    </p>
                  )}
                  <p className="text-xs text-(--text-secondary) mt-1">
                    Slug: {formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditCategoryPage;