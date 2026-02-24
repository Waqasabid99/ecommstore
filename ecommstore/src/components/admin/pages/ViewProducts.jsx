"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Edit,
  Trash2,
  X,
  LoaderIcon,
  ArrowLeft,
  Package,
  DollarSign,
  Tag as TagIcon,
  Calendar,
  Boxes,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  PackageX,
  Layers,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const ViewProduct = () => {
  const { adminID, productID } = useParams();
  const navigate = useRouter();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productID]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/products/${productID}`, {
        withCredentials: true,
      });

      if (data.success) {
        setProduct(data.data);
        // Set the main image as default selected
        const mainImage = data.data?.thumbnail;
        if (mainImage) {
          setSelectedImage(mainImage.url);
        } else if (data.data.images?.length > 0) {
          setSelectedImage(data.data.images[0].url);
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
  console.log(product)
  const handleDelete = async () => {
    try {
      setIsDeletingLoading(true);
      const { data } = await axios.post(
        `${baseUrl}/products/delete/${productID}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Product deleted successfully");
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/products`);
        }, 1500);
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStockBadge = (variants) => {
    const totalStock = variants.reduce(
      (sum, v) => sum + (v.inventory?.quantity || 0),
      0
    );

    if (totalStock === 0) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1 w-fit">
          <PackageX size={14} />
          Out of Stock
        </span>
      );
    }

    if (totalStock <= 10) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 w-fit">
          <AlertCircle size={14} />
          Low Stock ({totalStock} units)
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
        <CheckCircle size={14} />
        In Stock ({totalStock} units)
      </span>
    );
  };

  const DeleteModal = () => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-12 py-10 flex flex-col gap-3 items-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Delete Product
          </h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-black">{product?.name}</span>?
          </p>
          <p className="text-sm text-gray-500 text-center">
            This action will soft-delete the product and all its variants.
          </p>
          <div className="flex items-center gap-3 mt-4 w-full">
            <button
              onClick={() => setIsDeleting(false)}
              className="flex-1 bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeletingLoading}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeletingLoading ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section>
        <DashboardHeadingBox
          text="Product Details"
          subHeading="Loading product information..."
        />
        <div className="bg-white rounded-lg shadow-md mt-6 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section>
        <DashboardHeadingBox text="Product Not Found" />
        <div className="bg-white rounded-lg shadow-md mt-6 border border-gray-200 p-12 text-center">
          <PackageX size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate.push(`/admin/${adminID}/products`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </section>
    );
  }

  const totalStock = product.variants.reduce(
    (sum, v) => sum + (v.inventory?.quantity || 0),
    0
  );

  const prices = product.variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Product Details"
        subHeading={`Viewing: ${product.name}`}
        button={
          <>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/products`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() =>
                navigate.push(`/admin/${adminID}/products/${productID}`)
              }
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-red-500 hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </>
        }
      />

      {/* Delete Modal */}
      {isDeleting && <DeleteModal />}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon size={20} />
              Product Images
            </h2>

            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image Display */}
                <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={64} className="text-gray-400" />
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {product.images.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === image.url
                            ? "border-black shadow-md"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} - ${image.id}`}
                          className="w-full h-full object-cover"
                        />
                        {image.isMain && (
                          <div className="absolute top-1 right-1 bg-black text-white text-xs px-2 py-0.5 rounded">
                            Main
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={64} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} />
              Product Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Product Name
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {product.name}
                </p>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <p className="text-gray-700 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <p className="text-gray-900 font-medium mt-1">
                    {product?.categoryName || "N/A"}
                  </p>
                </div>

                {product.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Brand
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {product.brand}
                    </p>
                  </div>
                )}
              </div>

              {product.tag && Array.isArray(product.tag) && product.tag.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.tag.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 flex items-center gap-1"
                      >
                        <TagIcon size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Slug
                </label>
                <p className="text-gray-700 font-mono text-sm mt-1">
                  {product.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Layers size={20} />
              Product Variants ({product.variants.length})
            </h2>

            <div className="space-y-3">
              {product.variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">
                      Variant #{index + 1}
                    </h3>
                    {variant.inventory?.quantity === 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        Out of Stock
                      </span>
                    ) : variant.inventory?.quantity <= 10 ? (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        SKU
                      </label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {variant.sku}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Price
                      </label>
                      <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-1">
                        <DollarSign size={14} />
                        {variant.price}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Available
                      </label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {variant.inventory?.quantity || 0} units
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Reserved
                      </label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {variant.inventory?.reserved || 0} units
                      </p>
                    </div>
                  </div>

                  {variant.attributes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Attributes
                      </label>
                      <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(variant.attributes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary and Meta */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Boxes size={20} />
              Quick Stats
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="mt-2">
                  {product.isActive ? (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-lg flex items-center gap-2 w-fit">
                      <CheckCircle size={16} />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg flex items-center gap-2 w-fit">
                      <XCircle size={16} />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Stock Status
                </label>
                <div className="mt-2">{getStockBadge(product.variants)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Price Range
                </label>
                <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-1">
                  <DollarSign size={20} />
                  {minPrice === maxPrice
                    ? minPrice.toFixed(2)
                    : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Variants
                </label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {product.variants.length}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Total Stock
                </label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalStock} units
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Metadata
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Product ID
                </label>
                <p className="text-sm font-mono text-gray-700 mt-1 break-all">
                  {product.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Created At
                </label>
                <p className="text-sm text-gray-700 mt-1">
                  {formatDate(product.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <p className="text-sm text-gray-700 mt-1">
                  {formatDate(product.updatedAt)}
                </p>
              </div>

              {product.deletedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Deleted At
                  </label>
                  <p className="text-sm text-red-600 mt-1">
                    {formatDate(product.deletedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>

            <div className="space-y-2">
              <button
                onClick={() =>
                  navigate.push(`/admin/${adminID}/products/${productID}/edit`)
                }
                className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit Product
              </button>

              <button
                onClick={() => setIsDeleting(true)}
                className="w-full px-4 py-3 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ViewProduct;