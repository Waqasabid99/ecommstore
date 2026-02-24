"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowLeft,
  LoaderIcon,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import Stats from "@/components/ui/Stats";
import { baseUrl } from "@/lib/utils";
import axios from "axios";

const ReturnStatistics = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  const { adminID } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${baseUrl}/retruns-refunds/refunds/stats?period=${period}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
      toast.error("Failed to fetch statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-red-800",
      RECEIVED: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <section>
      <ToastContainer />

      <DashboardHeadingBox
        text="Returns & Refunds Statistics"
        subHeading="Analytics and insights for returns and refunds"
        button={
          <>
            <button
              onClick={() => navigate.push(`/admin/${adminID}/returns`)}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Returns
            </button>
            <button
              onClick={fetchStats}
              className="bg-white text-black rounded font-semibold p-3 border border-transparent hover:text-white hover:bg-black hover:border hover:border-gray-300 hover:rounded hover:p-3 flex items-center gap-2"
            >
              <BarChart3 size={16} />
              Refresh Stats
            </button>
          </>
        }
      />

      {/* Period Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Period
        </label>
        <div className="flex gap-2">
          {[
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
            { value: "90d", label: "Last 90 Days" },
            { value: "365d", label: "Last Year" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === option.value
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 flex items-center justify-center">
          <div className="text-center">
            <LoaderIcon
              size={48}
              className="animate-spin mx-auto mb-4 text-black"
            />
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Overview Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <Stats
              stats={[
                {
                  label: "Total Returns",
                  value: stats.returns.total,
                  icon: <Package size={32} />,
                },
                {
                  label: "Recent Returns (7d)",
                  value: stats.returns.recent7Days,
                  icon: <TrendingUp size={32} />,
                },
                {
                  label: "Avg Processing Time",
                  value: `${stats.returns.avgProcessingHours.toFixed(1)}h`,
                  icon: <Clock size={32} />,
                },
                {
                  label: "Total Refund Amount",
                  value: `$${stats.refunds.totalAmount.toFixed(2)}`,
                  icon: <DollarSign size={32} />,
                },
              ]}
              toShow={4}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            />
          </div>

          {/* Return Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={20} />
              Return Status Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.returns.distribution).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="bg-gray-50 rounded-lg p-4 text-center"
                  >
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(
                        status
                      )}`}
                    >
                      {status}
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{count}</p>
                    <p className="text-sm text-gray-600">
                      {stats.returns.total > 0
                        ? ((count / stats.returns.total) * 100).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Top Return Reasons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown size={20} />
              Top Return Reasons
            </h3>
            <div className="space-y-3">
              {stats.returns.topReasons.length > 0 ? (
                stats.returns.topReasons.map((reason, index) => {
                  const totalReturns = stats.returns.total;
                  const percentage =
                    totalReturns > 0
                      ? (Number(reason.count) / totalReturns) * 100
                      : 0;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-800 flex-1">
                          {reason.reason}
                        </p>
                        <span className="text-sm font-semibold text-gray-600 ml-4">
                          {reason.count} returns
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-black rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}% of all returns
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No return reasons available for this period
                </p>
              )}
            </div>
          </div>

          {/* Refund Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Refund Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">
                  Total Refunds
                </p>
                <p className="text-3xl font-bold text-green-800">
                  {stats.refunds.total}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Total Amount
                </p>
                <p className="text-3xl font-bold text-blue-800">
                  ${stats.refunds.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">
                  Average Refund
                </p>
                <p className="text-3xl font-bold text-purple-800">
                  ${stats.refunds.averageAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>
                Statistics for period: {formatDate(stats.period.start)} -{" "}
                {formatDate(stats.period.end)} ({stats.period.days} days)
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Statistics Available
          </h3>
          <p className="text-gray-600">
            Unable to load statistics at this time
          </p>
        </div>
      )}
    </section>
  );
};

export default ReturnStatistics;