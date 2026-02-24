"use client";
import { useState } from "react";
import {
  Tag,
  FolderTree,
  Plus,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import axios from "axios";
import { baseUrl } from "@/lib/utils";
import { createCategoryAction } from "@/actions/category.action";
import { useRouter } from "next/navigation";

const CreateCategoryPage = ({ existingCategories = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const router = useRouter();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setNotification({
        type: "error",
        message: "Category name is required",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      await createCategoryAction(formData);

      setNotification({
        type: "success",
        message: "Category created successfully!",
      });

      // Reset form
      setFormData({ name: "", parentId: "" });
      // Refresh page
      router.refresh();
    } catch (error) {
      setNotification({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", parentId: "" });
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <DashboardHeadingBox
        text="Create New Category"
        subHeading="Add a new category to your store"
        backToText="Categories"
      />
      {/* Main Content */}
      <div className=" mb-6">
        <div className="max-w-4xl mx-auto">
          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 border rounded p-3 flex items-start gap-3 ${
                notification.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="text-green-600 shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-red-600 shrink-0" size={20} />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    notification.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-(--text-secondary) hover:text-(--text-primary)"
              >
                ×
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-(--border-default) rounded-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter category name (e.g., Electronics, Headphones)"
                  className="w-full px-4 py-3 border border-(--border-default) rounded-lg 
                           focus:outline-none focus:border-(--color-brand-primary) 
                           transition-colors text-(--text-primary)"
                  required
                />
                <p className="text-(--text-secondary) text-xs mt-2">
                  A unique name for your category. This will be visible to
                  customers.
                </p>
              </div>

              {/* Parent Category Field */}
              <div>
                <label
                  htmlFor="parentId"
                  className="flex items-center gap-2 text-(--text-heading) font-semibold mb-3"
                >
                  <FolderTree
                    size={18}
                    className="text-(--color-brand-primary)"
                  />
                  Parent Category
                  <span className="text-(--text-secondary) text-xs font-normal">
                    (Optional)
                  </span>
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
                  {existingCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-(--text-secondary) text-xs mt-2">
                  Select a parent category to create a subcategory. Leave empty
                  for top-level.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-(--btn-bg-primary) text-(--btn-text-primary) 
                           px-6 py-3 rounded-full hover:bg-(--btn-bg-hover) 
                           transition-all font-medium flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Category
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
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
                  <p className="font-medium text-(--text-heading)">
                    {formData.name}
                  </p>
                  {formData.parentId && (
                    <p className="text-xs text-(--text-secondary)">
                      Subcategory of:{" "}
                      {
                        existingCategories.find(
                          (c) => c.id === formData.parentId,
                        )?.name
                      }
                    </p>
                  )}
                  <p className="text-xs text-(--text-secondary) mt-1">
                    Slug:{" "}
                    {formData.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w-]/g, "")}
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

export default CreateCategoryPage;
