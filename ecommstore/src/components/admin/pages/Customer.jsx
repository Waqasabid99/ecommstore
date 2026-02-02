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
  Users,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  RefreshCw,
  Shield,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Table from "@/components/ui/Table";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
    recentSignups: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [pagination, setPagination] = useState({
    take: 20,
    skip: 0,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, [pagination.skip, pagination.take]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        take: pagination.take,
        skip: pagination.skip,
      });

      const { data } = await axios.get(`${baseUrl}/users?${queryParams}`, {
        withCredentials: true,
      });

      if (data.success) {
        // Apply client-side filters
        let filteredData = data.data;

        if (filters.search) {
          filteredData = filteredData.filter(
            (customer) =>
              customer.userName
                ?.toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              customer.email?.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        if (filters.role) {
          filteredData = filteredData.filter(
            (customer) => customer.role === filters.role
          );
        }

        setCustomers(filteredData);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));

        // Calculate stats
        const adminsCount = data.data.filter((c) => c.role === "ADMIN").length;
        const usersCount = data.data.filter((c) => c.role === "USER").length;

        // Calculate recent signups (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = data.data.filter(
          (c) => new Date(c.createdAt) >= sevenDaysAgo
        ).length;

        setStats({
          total: data.pagination.total,
          admins: adminsCount,
          users: usersCount,
          recentSignups: recentCount,
        });
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeletingLoading(true);
      const { data } = await axios.delete(`${baseUrl}/users/delete/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Customer deleted successfully");
        setIsDeleting(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete customer"
      );
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchCustomers();
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      role: "",
    });
    fetchCustomers();
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && pagination.skip + pagination.take < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        skip: prev.skip + prev.take,
      }));
    } else if (direction === "prev" && pagination.skip > 0) {
      setPagination((prev) => ({
        ...prev,
        skip: Math.max(0, prev.skip - prev.take),
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role) => {
    if (role === "ADMIN") {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 flex items-center gap-1 w-fit">
          <Shield size={12} />
          Admin
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
        <UserCheck size={12} />
        User
        </span>
    );
  };

  const DeleteModal = ({ id }) => {
    const customer = customers.find((c) => c.id === id);

    return (
      <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center">
        <div className="bg-white border rounded-lg px-12 py-10 flex flex-col gap-3 items-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Delete Customer</h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{customer?.userName}</span>?
          </p>
          <p className="text-sm text-gray-500 text-center">
            This action will soft delete the customer and revoke all their tokens.
          </p>
          <div className="flex items-center gap-3 mt-4 w-full">
            <button
              onClick={() => setIsDeleting(null)}
              className="flex-1 bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={() => handleDelete(id)}
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

  const currentPage = Math.floor(pagination.skip / pagination.take) + 1;

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Customers"
        subHeading="Manage your customer accounts"
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
              onClick={fetchCustomers}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </>
        }
      />

      {/* Stats */}
      <Stats
        stats={[
          {
            label: "Total Customers",
            value: stats.total,
            icon: <Users size={32} />,
          },
          {
            label: "Admin Users",
            value: stats.admins,
            icon: <Shield size={32} />,
          },
          {
            label: "Regular Users",
            value: stats.users,
            icon: <UserCheck size={32} />,
          },
          {
            label: "Recent Signups (7d)",
            value: stats.recentSignups,
            icon: <Calendar size={32} />,
          },
        ]}
        toShow={4}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      />

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search by Name or Email
              </label>
              <input
                type="text"
                placeholder="Enter name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
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

      {/* Delete Modal */}
      {isDeleting && <DeleteModal id={isDeleting} />}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading customers...</p>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg mt-3 shadow-md border border-gray-200 p-12 text-center">
          <UserX size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Customers Found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.role
              ? "Try adjusting your filters"
              : "No customers have signed up yet"}
          </p>
          {(filters.search || filters.role) && (
            <button
              onClick={resetFilters}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mt-3 border border-gray-200 overflow-hidden">
          <Table
            data={customers}
            columns={[
              {
                header: "Name",
                key: "userName",
                render: (_, customer) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-black to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {customer.userName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} />
                        {customer.email}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                header: "Role",
                key: "role",
                render: (_, customer) => getRoleBadge(customer.role),
              },
              {
                header: "Joined Date",
                key: "createdAt",
                render: (_, customer) => (
                  <div>
                    <div className="font-medium text-gray-800">
                      {formatDate(customer.createdAt).split(",")[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(customer.createdAt).split(",")[1]}
                    </div>
                  </div>
                ),
              },
              {
                header: "Last Updated",
                key: "updatedAt",
                render: (_, customer) => (
                  <div>
                    <div className="font-medium text-gray-800">
                      {formatDate(customer.updatedAt).split(",")[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(customer.updatedAt).split(",")[1]}
                    </div>
                  </div>
                ),
              },
            ]}
            actions={(item) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate.push(`/admin/${adminID}/customers/${item.id}`)
                  }
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`View ${item.userName}`}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() =>
                    navigate.push(`/admin/${adminID}/customers/${item.id}/edit`)
                  }
                  className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200"
                  aria-label={`Edit ${item.userName}`}
                  title="Edit Customer"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setIsDeleting(item.id)}
                  className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors duration-200"
                  aria-label={`Delete ${item.userName}`}
                  title="Delete Customer"
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
                Showing {pagination.skip + 1} to{" "}
                {Math.min(pagination.skip + pagination.take, pagination.total)} of{" "}
                {pagination.total} customers
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={pagination.skip === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={
                    pagination.skip + pagination.take >= pagination.total
                  }
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

export default Customers;