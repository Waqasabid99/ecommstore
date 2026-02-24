"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Edit,
  Trash2,
  X,
  LoaderIcon,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Truck,
  DollarSign,
  MapPin,
  Package,
  Globe,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import Select from "react-select";

const ShippingMethods = () => {
  const [shippingRates, setShippingRates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    standard: 0,
    express: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    method: "",
    isActive: "",
    country: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  // Country-State-City options
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  useEffect(() => {
    fetchShippingRates();
  }, [pagination.page, filters.method, filters.isActive]);

  const fetchShippingRates = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.method && { method: filters.method }),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.country && { country: filters.country }),
      });

      const { data } = await axios.get(
        `${baseUrl}/shipping?${queryParams}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        let filteredData = data.data;

        // Apply client-side search filter
        if (filters.search) {
          filteredData = filteredData.filter(
            (rate) =>
              rate.country?.toLowerCase().includes(filters.search.toLowerCase()) ||
              rate.state?.toLowerCase().includes(filters.search.toLowerCase()) ||
              rate.method?.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setShippingRates(filteredData);
        setPagination((prev) => ({
          ...prev,
          totalCount: data.pagination.totalCount,
          totalPages: data.pagination.totalPages,
        }));

        // Calculate stats
        const activeCount = data.data.filter((r) => r.isActive).length;
        const inactiveCount = data.data.filter((r) => !r.isActive).length;
        const standardCount = data.data.filter((r) => r.method === "STANDARD").length;
        const expressCount = data.data.filter((r) => r.method === "EXPRESS").length;

        setStats({
          total: data.pagination.totalCount,
          active: activeCount,
          inactive: inactiveCount,
          standard: standardCount,
          express: expressCount,
        });
      }
    } catch (error) {
      console.error("Fetch shipping rates error:", error);
      toast.error("Failed to fetch shipping rates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, permanent = false) => {
    try {
      setIsDeletingLoading(true);
      const queryParam = permanent ? "?permanent=true" : "";
      const { data } = await axios.delete(
        `${baseUrl}/shipping/delete/${id}${queryParam}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsDeleting(null);
        fetchShippingRates();
      }
    } catch (error) {
      console.error("Delete shipping rate error:", error);
      toast.error(
        error.response?.data?.error || "Failed to delete shipping rate"
      );
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

  const resetFilters = () => {
    setFilters({
      search: "",
      method: "",
      isActive: "",
      country: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getMethodBadge = (method) => {
    if (method === "EXPRESS") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 flex items-center gap-1 w-fit">
          <Zap size={12} />
          Express
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
        <Truck size={12} />
        Standard
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1 w-fit">
        <XCircle size={12} />
        Inactive
      </span>
    );
  };

  // Get country name from ISO code
  const getCountryName = (isoCode) => {
    const country = Country.getCountryByCode(isoCode);
    return country?.name || isoCode;
  };

  // Get state name from ISO code
  const getStateName = (countryCode, stateCode) => {
    if (!stateCode) return null;
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state?.name || stateCode;
  };

  const DeleteModal = ({ id }) => {
    const rate = shippingRates.find((r) => r.id === id);

    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-12 py-10 flex flex-col gap-3 items-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Delete Shipping Rate
          </h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete the{" "}
            <span className="font-semibold">{rate?.method}</span> shipping rate for{" "}
            <span className="font-semibold">
              {getCountryName(rate?.country)}
              {rate?.state ? `, ${getStateName(rate?.country, rate?.state)}` : ""}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500 text-center">
            This will deactivate the rate. To permanently delete, contact support.
          </p>
          <div className="flex items-center gap-3 mt-4 w-full">
            <button
              onClick={() => setIsDeleting(null)}
              className="flex-1 bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={() => handleDelete(id, false)}
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
                  Deactivate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CreateEditModal = ({ mode = "create", rate = null }) => {
    const [formData, setFormData] = useState({
      country: rate?.country || "",
      state: rate?.state || "",
      method: rate?.method || "STANDARD",
      price: rate?.price || "",
      minOrder: rate?.minOrder || "",
      maxOrder: rate?.maxOrder || "",
      currency: rate?.currency || "PKR",
      isActive: rate?.isActive !== undefined ? rate.isActive : true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stateOptions, setStateOptions] = useState([]);

    // Currency options
    const currencyOptions = [
      { value: "PKR", label: "PKR - Pakistani Rupee" },
      { value: "USD", label: "USD - US Dollar" },
      { value: "EUR", label: "EUR - Euro" },
      { value: "GBP", label: "GBP - British Pound" },
      { value: "CAD", label: "CAD - Canadian Dollar" },
      { value: "AUD", label: "AUD - Australian Dollar" },
    ];

    // Initialize state options when country is set
    useEffect(() => {
      if (formData.country) {
        const states = State.getStatesOfCountry(formData.country);
        setStateOptions(states);
      } else {
        setStateOptions([]);
      }
    }, [formData.country]);

    const handleChange = (key, value) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleCountryChange = (option) => {
      setFormData((prev) => ({
        ...prev,
        country: option?.value || "",
        state: "", // Reset state when country changes
      }));
      
      if (option?.value) {
        const states = State.getStatesOfCountry(option.value);
        setStateOptions(states);
      } else {
        setStateOptions([]);
      }
    };

    const handleStateChange = (option) => {
      setFormData((prev) => ({
        ...prev,
        state: option?.value || "",
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validation
      if (!formData.country) {
        toast.error("Country is required");
        return;
      }
      if (!formData.method) {
        toast.error("Shipping method is required");
        return;
      }
      if (formData.price === "" || formData.price === null) {
        toast.error("Price is required");
        return;
      }

      try {
        setIsSubmitting(true);
        
        const endpoint =
          mode === "create"
            ? `${baseUrl}/shipping/create`
            : `${baseUrl}/shipping/update/${rate.id}`;
        
        const method = mode === "create" ? "post" : "patch";

        const payload = {
          country: formData.country, // Already ISO code
          state: formData.state || null, // Already ISO code or null
          method: formData.method,
          price: parseFloat(formData.price),
          minOrder: formData.minOrder ? parseFloat(formData.minOrder) : null,
          maxOrder: formData.maxOrder ? parseFloat(formData.maxOrder) : null,
          currency: formData.currency,
          isActive: formData.isActive,
        };

        const { data } = await axios[method](endpoint, payload, {
          withCredentials: true,
        });

        if (data.success) {
          toast.success(data.message);
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedRate(null);
          fetchShippingRates();
        }
      } catch (error) {
        console.error("Submit shipping rate error:", error);
        toast.error(
          error.response?.data?.error || `Failed to ${mode} shipping rate`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    // Prepare state select options
    const stateSelectOptions = stateOptions.map((state) => ({
      value: state.isoCode,
      label: state.name,
    }));

    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto py-8">
        <div className="bg-white border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "create" ? "Create Shipping Rate" : "Edit Shipping Rate"}
            </h2>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedRate(null);
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <Select
                  isClearable
                  isSearchable
                  options={countryOptions}
                  value={countryOptions.find(
                    (opt) => opt.value === formData.country
                  )}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province (Optional)
                </label>
                <Select
                  isClearable
                  isSearchable
                  options={stateSelectOptions}
                  value={stateSelectOptions.find(
                    (opt) => opt.value === formData.state
                  )}
                  onChange={handleStateChange}
                  placeholder="Select State"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isDisabled={!formData.country}
                />
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Method *
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => handleChange("method", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  required
                >
                  <option value="STANDARD">Standard</option>
                  <option value="EXPRESS">Express</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  required
                >
                  {currencyOptions.map((curr) => (
                    <option key={curr.value} value={curr.value}>
                      {curr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ({formData.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order ({formData.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.minOrder}
                  onChange={(e) => handleChange("minOrder", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Max Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Order ({formData.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.maxOrder}
                  onChange={(e) => handleChange("maxOrder", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (available for checkout)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedRate(null);
                }}
                className="flex-1 bg-white text-black px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderIcon size={16} className="animate-spin" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    {mode === "create" ? "Create Rate" : "Update Rate"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Shipping Methods"
        subHeading="Manage shipping rates and delivery options"
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
              onClick={fetchShippingRates}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white rounded font-semibold p-3 border border-transparent hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Rate
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Rates",
            value: stats.total,
            icon: <Truck size={32} />,
          },
          {
            label: "Active Rates",
            value: stats.active,
            icon: <CheckCircle size={32} />,
          },
          {
            label: "Inactive Rates",
            value: stats.inactive,
            icon: <XCircle size={32} />,
          },
          {
            label: "Standard",
            value: stats.standard,
            icon: <Package size={32} />,
          },
          {
            label: "Express",
            value: stats.express,
            icon: <Zap size={32} />,
          },
        ]}
        toShow={5}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Country, state, or method..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Method
              </label>
              <select
                value={filters.method}
                onChange={(e) => handleFilterChange("method", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Methods</option>
                <option value="STANDARD">Standard</option>
                <option value="EXPRESS">Express</option>
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
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <Select
                isClearable
                isSearchable
                options={countryOptions}
                value={countryOptions.find(
                  (opt) => opt.value === filters.country
                )}
                onChange={(option) =>
                  handleFilterChange("country", option?.value || "")
                }
                placeholder="Select Country"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchShippingRates}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isDeleting && <DeleteModal id={isDeleting} />}
      {showCreateModal && <CreateEditModal mode="create" />}
      {showEditModal && selectedRate && (
        <CreateEditModal mode="edit" rate={selectedRate} />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading shipping rates...</p>
          </div>
        </div>
      ) : shippingRates.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <Truck size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Shipping Rates Found
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.values(filters).some((f) => f)
              ? "Try adjusting your filters"
              : "Get started by creating your first shipping rate"}
          </p>
          {!Object.values(filters).some((f) => f) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create Shipping Rate
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={shippingRates}
            columns={[
              {
                header: "Country/Region",
                key: "country",
                render: (_, rate) => (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {getCountryName(rate.country)}
                      </div>
                      {rate.state && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={10} />
                          {getStateName(rate.country, rate.state)}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                header: "Method",
                key: "method",
                render: (_, rate) => getMethodBadge(rate.method),
              },
              {
                header: "Price",
                key: "price",
                render: (_, rate) => (
                  <div>
                    <span className="font-bold text-green-600">
                      {rate.currency} {Number(rate.price).toFixed(2)}
                    </span>
                  </div>
                ),
              },
              {
                header: "Order Range",
                key: "orderRange",
                render: (_, rate) => (
                  <div className="text-sm text-gray-600">
                    {rate.minOrder || rate.maxOrder ? (
                      <>
                        {rate.minOrder && (
                          <>
                            Min: {rate.currency} {Number(rate.minOrder).toFixed(2)}
                          </>
                        )}
                        {rate.minOrder && rate.maxOrder && <br />}
                        {rate.maxOrder && (
                          <>
                            Max: {rate.currency} {Number(rate.maxOrder).toFixed(2)}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">No limits</span>
                    )}
                  </div>
                ),
              },
              {
                header: "Status",
                key: "isActive",
                render: (_, rate) => getStatusBadge(rate.isActive),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRate(item);
                    setShowEditModal(true);
                  }}
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`Edit ${item.method} rate`}
                  title="Edit Rate"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setIsDeleting(item.id)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                  aria-label={`Delete ${item.method} rate`}
                  title="Delete Rate"
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
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
                {pagination.totalCount} rates
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default ShippingMethods;