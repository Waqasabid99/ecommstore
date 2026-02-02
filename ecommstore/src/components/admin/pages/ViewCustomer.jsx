"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Home,
  Building,
  Map,
  Globe,
  Hash,
  LoaderIcon,
  X,
  Clock,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const ViewCustomer = () => {
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { adminID, customerID: id } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${baseUrl}/users/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        setCustomer(data.data);
        setAddresses(data.address || []);
      }
    } catch (error) {
      console.error("Fetch customer error:", error);
      toast.error("Failed to fetch customer data");
      navigate.push(`/admin/${adminID}/customers`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { data } = await axios.delete(`${baseUrl}/users/delete/${id}`, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Customer deleted successfully");
        setTimeout(() => {
          navigate.push(`/admin/${adminID}/customers`);
        }, 1000);
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete customer"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
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

  const getRoleBadge = (role) => {
    if (role === "ADMIN") {
      return (
        <span className="px-4 py-2 text-sm font-semibold rounded-full bg-purple-100 text-purple-700 flex items-center gap-2 w-fit">
          <Shield size={16} />
          Admin
        </span>
      );
    }
    return (
      <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-2 w-fit">
        <User size={16} />
        User
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
            Delete Customer
          </h1>
          <p className="text-gray-600 text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{customer?.userName}</span>?
          </p>
          <p className="text-sm text-gray-500 text-center">
            This action will soft delete the customer and revoke all their
            tokens. This cannot be undone.
          </p>
          <div className="flex items-center gap-3 mt-4 w-full">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
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
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon
            size={48}
            className="animate-spin mx-auto mb-4 text-black"
          />
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Customer Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The customer you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate.push(`/admin/${adminID}/customers`)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <ToastContainer />

      <DashboardHeadingBox
        text="Customer Details"
        subHeading={`View complete information for ${customer.userName}`}
        button={
          <div className="flex gap-3">
            <button
              onClick={() => navigate.push(`/admin/${adminID}/customers`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() =>
                navigate.push(`/admin/${adminID}/customers/${id}/edit`)
              }
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-white text-red-600 rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-red-500 hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        }
      />

      {showDeleteModal && <DeleteModal />}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-linear-to-br from-black to-gray-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {customer.userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {customer.userName}
                </h2>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail size={16} />
                  {customer.email}
                </p>
                <div className="mt-2">{getRoleBadge(customer.role)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Hash size={18} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Customer ID</p>
                    <p className="font-mono text-sm text-gray-800 font-medium">
                      {customer.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User size={18} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-gray-800 font-medium">
                      {customer.userName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-gray-800 font-medium">
                      {customer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-gray-800 font-medium">
                      {customer.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} />
                Account Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="text-gray-800 font-medium">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-800 font-medium">
                      {formatDate(customer.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={20} />
              Saved Addresses ({addresses.length})
            </h3>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                No Addresses Found
              </h4>
              <p className="text-gray-600">
                This customer hasn't added any addresses yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address, index) => (
                <div
                  key={address.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-black transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Home size={18} />
                      Address {index + 1}
                    </h4>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {address.fullName && (
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="text-sm text-gray-800 font-medium">
                            {address.fullName}
                          </p>
                        </div>
                      </div>
                    )}

                    {address.phoneNumber && (
                      <div className="flex items-start gap-2">
                        <Phone size={16} className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-800 font-medium">
                            {address.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {address.streetAddress && (
                      <div className="flex items-start gap-2">
                        <Home size={16} className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Street Address
                          </p>
                          <p className="text-sm text-gray-800 font-medium">
                            {address.streetAddress}
                          </p>
                        </div>
                      </div>
                    )}

                    {address.apartment && (
                      <div className="flex items-start gap-2">
                        <Building size={16} className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Apartment/Suite
                          </p>
                          <p className="text-sm text-gray-800 font-medium">
                            {address.apartment}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {[address.city, address.state, address.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>

                    {address.country && (
                      <div className="flex items-start gap-2">
                        <Globe size={16} className="text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Country</p>
                          <p className="text-sm text-gray-800 font-medium">
                            {address.country}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                navigate.push(`/admin/${adminID}/customers/${id}/edit`)
              }
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors group"
            >
              <Edit
                size={20}
                className="text-black group-hover:text-white"
              />
              <div className="text-left">
                <p className="font-semibold">Edit Customer</p>
                <p className="text-xs text-gray-500 group-hover:text-gray-300">
                  Update customer information
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate.push(`/admin/${adminID}/orders`)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors group"
            >
              <Hash size={20} className="text-black group-hover:text-white" />
              <div className="text-left">
                <p className="font-semibold">View Orders</p>
                <p className="text-xs text-gray-500 group-hover:text-gray-300">
                  See customer's order history
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-500 hover:text-white transition-colors group"
            >
              <Trash2
                size={20}
                className="text-red-600 group-hover:text-white"
              />
              <div className="text-left">
                <p className="font-semibold text-red-600 group-hover:text-white">
                  Delete Customer
                </p>
                <p className="text-xs text-red-500 group-hover:text-red-100">
                  Permanently remove account
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;