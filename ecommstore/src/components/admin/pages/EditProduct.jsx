"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Save,
  X,
  LoaderIcon,
  Upload,
  Trash2,
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Package,
  Tag,
  AlertCircle,
  Info,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const EditProduct = () => {
  const { adminID, productID: id } = useParams();
  const navigate = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tag: [],
    brand: "",
    categoryId: "",
    isActive: true,
  });

  // Variants state
  const [variants, setVariants] = useState([]);

  // Images state
  const [existingImages, setExistingImages] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/categories`, {
        withCredentials: true,
      });
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/products/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        const product = data.data;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          tag: product.tag || [],
          brand: product.brand || "",
          categoryId: product.categoryId || "",
          isActive: product.isActive ?? true,
        });

        // Set variants
        setVariants(
          product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            price: v.price,
            attributesText: v.attributes,
            attributes: v.attributes,
            quantity: v.inventory?.quantity ?? 0,
            _delete: false,
          })),
        );

        // Set images
        setExistingImages(product.images || []);
        const mainImage = product.images?.find((img) => img.isMain);
        if (mainImage) {
          setThumbnailPreview(mainImage.url);
        }
      }
    } catch (error) {
      console.error("Fetch product error:", error);
      toast.error("Failed to load product");
      navigate.push(`/admin/${adminID}/products`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: "",
        price: "",
        attributesText: "",
        attributes: null,
        quantity: 0,
        _delete: false,
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, _delete: true } : v)),
    );
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail must be less than 5MB");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setNewImageFiles((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId) => {
    setImagesToRemove((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Category is required");
      return;
    }

    const activeVariants = variants.filter((v) => !v._delete);
    if (activeVariants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    for (const variant of activeVariants) {
      if (!variant.sku || !variant.price) {
        toast.error("All variants must have SKU and price");
        return;
      }
    }

    try {
      setIsSaving(true);

      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("tag", JSON.stringify(formData.tag));
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("isActive", String(formData.isActive));

      // Append variants
      formDataToSend.append("variants", JSON.stringify(variants));

      // Append images to remove
      if (imagesToRemove.length > 0) {
        formDataToSend.append("removeImageIds", JSON.stringify(imagesToRemove));
      }

      // Append thumbnail
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      // Append new images
      newImageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const { data } = await axios.patch(
        `${baseUrl}/products/update/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      if (data.success) {
        toast.success("Product updated successfully");
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/products`);
        }, 1500);
      }
    } catch (error) {
      console.error("Update product error:", error);
      toast.error(error.response?.data?.error || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section>
        <DashboardHeadingBox
          text="Edit Product"
          subHeading="Loading product details..."
        />
        <div className="bg-white rounded-lg shadow-md mt-6 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Edit Product"
        subHeading={`Update product: ${formData.name}`}
        button={
          <button
            onClick={() => navigate.push(`/admin/${adminID}/products`)}
            className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Package size={20} />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white transition-colors"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <>
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                    {category.children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag
              </label>
              <input
                type="text"
                name="tag"
                value={formData.tag.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tag: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="e.g., New, Sale, Featured"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">
                  Product is active (visible to customers)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={20} />
              Product Variants
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Variant
            </button>
          </div>

          {variants.filter((v) => !v._delete).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No variants added yet. Click "Add Variant" to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => {
                if (variant._delete) return null;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(index, "sku", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="SKU-001"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.quantity}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attributes (JSON)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
  value={variant.attributesText}
                      onChange={(e) => {
                        const value = e.target.value;

                        setVariants((prev) =>
                          prev.map((v, i) => {
                            if (i !== index) return v;

                            let parsed = null;
                            try {
                              parsed = value ? JSON.parse(value) : null;
                            } catch {
                              
                            }

                            return {
                              ...v,
                              attributesText: value, // ALWAYS update text
                              attributes: parsed, // update only if valid
                            };
                          }),
                        );
                      }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            placeholder='{"size":"M"}'
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Variant Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>SKU must be unique across all variants</li>
                <li>
                  Attributes should be valid JSON (e.g.,{" "}
                  {`{"size":"L","color":"Red"}`})
                </li>
                <li>Deleted variants will be soft-deleted in the database</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ImageIcon size={20} />
            Product Images
          </h2>

          {/* Thumbnail */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Thumbnail
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview(null);
                      setThumbnailFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
              )}

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors flex items-center gap-2">
                  <Upload size={16} />
                  Upload Thumbnail
                </div>
              </label>
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.filter((img) => !img.isMain).length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Current Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {existingImages
                  .filter((img) => !img.isMain)
                  .map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Product"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add New Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt="New"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImagesChange}
                className="hidden"
              />
              <div className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2">
                <Upload size={32} className="text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload additional images
                </p>
                <p className="text-xs text-gray-400">Max 5MB per image</p>
              </div>
            </label>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-yellow-600 shrink-0 mt-0.5"
            />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Image Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use high-quality images (recommended: 1200x1200px)</li>
                <li>Maximum file size: 5MB per image</li>
                <li>Supported formats: JPG, PNG, WEBP</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <button
            type="button"
            onClick={() => navigate.push(`/admin/${adminID}/products`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <LoaderIcon size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct;
