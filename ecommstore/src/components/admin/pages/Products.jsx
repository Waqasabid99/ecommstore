"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Edit,
  Trash2,
  X,
  LoaderIcon,
  Plus,
  Search,
  Filter,
  Package,
  DollarSign,
  Eye,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  PackageX,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    categoryId: "",
    isActive: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.page, filters.categoryId, filters.isActive]);

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
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.isActive && { isActive: filters.isActive }),
      });

      const { data } = await axios.get(`${baseUrl}/products?${queryParams}`, {
        withCredentials: true,
      });

      if (data.success) {
        setProducts(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));

        // Calculate stats
        const activeCount = data.data.filter((p) => p.isActive).length;
        const inactiveCount = data.data.filter((p) => !p.isActive).length;
        const lowStockCount = data.data.filter((p) =>
          p.variants.some((v) => v.availableQty > 0 && v.availableQty <= 10)
        ).length;

        setStats({
          total: data.pagination.total,
          active: activeCount,
          inactive: inactiveCount,
          lowStock: lowStockCount,
        });
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeletingLoading(true);
      const { data } = await axios.post(
        `${baseUrl}/products/delete/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Product deleted successfully");
        setIsDeleting(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getStockBadge = (variants) => {
    const totalStock = variants.reduce((sum, v) => sum + v.availableQty, 0);

    if (totalStock === 0) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1 w-fit">
          <PackageX size={12} />
          Out of Stock
        </span>
      );
    }

    if (totalStock <= 10) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 w-fit">
          <AlertCircle size={12} />
          Low Stock ({totalStock})
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
          In Stock ({totalStock})
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
        Active
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
        Inactive
      </span>
    );
  };

  const DeleteModal = ({ id, product }) => {
    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-12 py-10 flex flex-col gap-3 items-center max-w-md">
          <h1 className="text-2xl font-semibold">Delete Product</h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-black">{product?.name}</span>?
            This action will soft-delete the product and its variants.
          </p>
          <div className="flex items-center gap-5 mt-4">
            <button
              onClick={() => setIsDeleting(null)}
              className="bg-black text-white px-4 py-2 rounded border hover:bg-white hover:text-black hover:border hover:border-gray-300 flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={() => handleDelete(id)}
              className="flex items-center gap-2 bg-red-500 text-white rounded font-semibold px-4 py-2 border border-transparent hover:text-white hover:bg-red-600"
            >
              {isDeletingLoading ? (
                <LoaderIcon size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Products"
        subHeading="Manage your product catalog"
        button={
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={fetchProducts}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/products/new`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Product
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Products",
            value: stats.total,
            icon: <Package size={32} />,
          },
          {
            label: "Active Products",
            value: stats.active,
            icon: <ToggleRight size={32} />,
          },
          {
            label: "Inactive Products",
            value: stats.inactive,
            icon: <ToggleLeft size={32} />,
          },
          {
            label: "Low Stock Items",
            value: stats.lowStock,
            icon: <AlertCircle size={32} />,
          },
        ]}
        toShow={4}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Products</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleting && (
        <DeleteModal
          id={isDeleting}
          product={products.find((p) => p.id === isDeleting)}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.categoryId || filters.isActive || filters.search
              ? "Try adjusting your filters"
              : "Get started by creating your first product"}
          </p>
          <button
            onClick={() => navigate.push(`/admin/${adminID}/products/new`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={products}
            columns={[
              {
                header: "Product",
                key: "name",
                render: (_, product) => (
                  <div className="flex items-center gap-3">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.brand || "No brand"}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                header: "Category",
                key: "category",
                render: (_, product) => (
                  <span className="text-sm text-gray-700">
                    {product.categoryName}
                  </span>
                ),
              },
              {
                header: "Variants",
                key: "variants",
                render: (_, product) => (
                  <div>
                    <div className="font-semibold text-gray-900">
                      {product.variants.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.variants.length === 1 ? "variant" : "variants"}
                    </div>
                  </div>
                ),
              },
              {
                header: "Price Range",
                key: "price",
                render: (_, product) => {
                  const prices = product.variants.map((v) => v.price);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);

                  return (
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {minPrice === maxPrice
                          ? minPrice.toFixed(2)
                          : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`}
                      </span>
                    </div>
                  );
                },
              },
              {
                header: "Stock",
                key: "stock",
                render: (_, product) => getStockBadge(product.variants),
              },
              {
                header: "Status",
                key: "isActive",
                render: (_, product) => getStatusBadge(product.isActive),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate.push(`/admin/${adminID}/products/${item.id}`)
                  }
                  className="p-2 hover:text-white hover:bg-black rounded transition-colors duration-200"
                  aria-label={`View ${item.name}`}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() =>
                    navigate.push(`/admin/${adminID}/products/${item.id}/edit`)
                  }
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`Edit ${item.name}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setIsDeleting(item.id)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} products
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 &&
                        pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg ${
                            pagination.page === pageNum
                              ? "bg-black text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Products;