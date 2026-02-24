"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  Star,
  Edit2,
  Trash2,
  X,
  LoaderIcon,
  RefreshCw,
  MessageSquare,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";
import { baseUrl } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import StarRating from "@/components/ui/StarRating";
import RatingInput from "@/components/ui/RatingInput";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";

// Edit Modal Component
const EditModal = ({
  selectedReview,
  editForm,
  setEditForm,
  handleEditSubmit,
  setShowEditModal,
  setSelectedReview,
  isSubmitting,
  formatDate,
}) => (
  <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center overflow-y-auto p-4">
    <div className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
        <h2 className="text-2xl font-bold text-gray-900">Edit Review</h2>
        <button
          onClick={() => {
            setShowEditModal(false);
            setSelectedReview(null);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
        {/* Product Info */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
            <Image
              src={selectedReview?.product?.thumbnail || "/placeholder.png"}
              width={80}
              height={80}
              alt={selectedReview?.product?.name || "Product"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {selectedReview?.product?.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Original review: {formatDate(selectedReview?.createdAt)}
            </p>
          </div>
        </div>

        {/* Rating Input */}
        <div>
          <RatingInput
            value={editForm.rating}
            onChange={(value) => setEditForm({ ...editForm, rating: value })}
            label="Update Your Rating"
            helperText="Rate this product from 1 to 5 stars"
            size="lg"
            showLabels={true}
          />
        </div>

        {/* Comment Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={editForm.comment}
            onChange={(e) =>
              setEditForm({ ...editForm, comment: e.target.value })
            }
            placeholder="Share your experience with this product..."
            rows={5}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            {editForm.comment.length}/500 characters
          </p>
        </div>

        {/* Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important Notice</p>
            <p>Reviews can only be edited within 30 days of creation.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setShowEditModal(false);
              setSelectedReview(null);
            }}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderIcon size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Update Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// Delete Modal Component
const DeleteModal = ({
  selectedReview,
  handleDeleteConfirm,
  setShowDeleteModal,
  setSelectedReview,
  isSubmitting,
}) => (
  <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full">
      <div className="p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Review?
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete your review for{" "}
          <strong>{selectedReview?.product?.name}</strong>? This action cannot
          be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedReview(null);
            }}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
  </div>
);

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({ rating: 0, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, sortBy]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      const { data } = await axios.get(
        `${baseUrl}/reviews/my-reviews?${queryParams}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setReviews(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      toast.error("Failed to fetch your reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (review) => {
    setSelectedReview(review);
    setEditForm({
      rating: review.rating,
      comment: review.comment || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.rating || editForm.rating < 1 || editForm.rating > 5) {
      toast.error("Please provide a valid rating between 1 and 5");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.patch(
        `${baseUrl}/reviews/${selectedReview.id}`,
        editForm,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Review updated successfully!");
        setShowEditModal(false);
        fetchReviews();
      }
    } catch (error) {
      console.error("Update review error:", error);
      const errorMessage = 
        error.response?.data?.error || 
        "Failed to update review. Reviews can only be edited within 30 days.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.delete(
        `${baseUrl}/reviews/${selectedReview.id}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Review deleted successfully");
        setShowDeleteModal(false);
        fetchReviews();
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error(error.response?.data?.error || "Failed to delete review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredReviews = reviews.filter((review) =>
    review.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ToastContainer />

      {/* Header */}
      <DashboardHeadingBox text="My Reviews" />

      {/* Filters and Search */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search reviews by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchReviews}
            className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedReview && (
        <EditModal
          selectedReview={selectedReview}
          editForm={editForm}
          setEditForm={setEditForm}
          handleEditSubmit={handleEditSubmit}
          setShowEditModal={setShowEditModal}
          setSelectedReview={setSelectedReview}
          isSubmitting={isSubmitting}
          formatDate={formatDate}
        />
      )}
      {showDeleteModal && selectedReview && (
        <DeleteModal
          selectedReview={selectedReview}
          handleDeleteConfirm={handleDeleteConfirm}
          setShowDeleteModal={setShowDeleteModal}
          setSelectedReview={setSelectedReview}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <Star size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            {searchTerm ? "No Reviews Found" : "No Reviews Yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? `No reviews found matching "${searchTerm}"`
              : "You haven't reviewed any products yet. Purchase products and share your experience!"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => router.push(`/user/${id}/orders`)}
              className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              View Your Orders
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Image and Info */}
                  <div className="flex gap-4 flex-1">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <Image
                        src={review.product.thumbnail || "/placeholder.png"}
                        width={96}
                        height={96}
                        alt={review.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                        {review.product.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <StarRating
                        rating={review.rating}
                        size="md"
                        showValue={true}
                      />
                    </div>
                    {review.comment && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageSquare
                            size={16}
                            className="text-gray-500 mt-0.5 shrink-0"
                          />
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Your Review
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 justify-end">
                    <button
                      onClick={() => handleEditClick(review)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 font-medium"
                    >
                      <Edit2 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(review)}
                      className="px-4 py-2 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 font-medium"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} reviews
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className={`px-3 py-2 rounded-lg transition-colors ${
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
                      return (
                        <span key={pageNum} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
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
        </>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          Review Guidelines
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
            <p>
              You can only review products you've purchased and that have been
              delivered or shipped
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
            <p>Reviews can be edited within 30 days of creation</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
            <p>
              You can only submit one review per product - update your existing
              review instead
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
            <p>
              Your reviews help other customers make informed purchase decisions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReviews;