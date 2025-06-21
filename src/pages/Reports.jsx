import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { reportAPI, disasterAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Reports = () => {
  const [filters, setFilters] = useState({
    search: "",
    verification_status: "",
    disaster_id: "",
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all disasters for filter dropdown
  const { data: disasters } = useQuery(
    "disasters-for-reports",
    async () => {
      try {
        const response = await disasterAPI.getAll({ limit: 100 });
        return response;
      } catch (error) {
        console.warn("Failed to fetch disasters, using mock data");
        return {
          data: [
            {
              id: "dis1",
              title: "Downtown Flooding",
              location_name: "Downtown Area",
            },
            {
              id: "dis2",
              title: "Wildfire Emergency",
              location_name: "Forest Hills",
            },
            {
              id: "dis3",
              title: "Storm Damage",
              location_name: "Elm Street Area",
            },
          ],
        };
      }
    },
    { staleTime: 300000 }
  );

  // Safely get disasters data as array
  const disastersData = disasters?.data
    ? Array.isArray(disasters.data)
      ? disasters.data
      : []
    : [];

  // Fetch reports based on filters
  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery(
    ["all-reports", filters],
    async () => {
      try {
        // Try to fetch from specific disaster if selected
        if (filters.disaster_id) {
          const response = await reportAPI.getByDisaster(filters.disaster_id, {
            verification_status: filters.verification_status,
          });
          return response;
        } else {
          // For now, return mock data since there's no global reports endpoint
          return {
            data: [
              {
                id: "1",
                content:
                  "Severe flooding on Main Street. Water level is approximately 3 feet deep. Several cars are stranded and the emergency services are having difficulty accessing the area.",
                user_id: "citizen1",
                disaster_id: "dis1",
                disaster_title: "Downtown Flooding",
                disaster_location: "Downtown Area",
                verification_status: "verified",
                image_url: "https://picsum.photos/400/300?random=1&blur=0",
                created_at: new Date(
                  Date.now() - 2 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "2",
                content:
                  "Fire department has established a perimeter around the affected area. Evacuation is in progress for residents in the immediate vicinity.",
                user_id: "firstresponder",
                disaster_id: "dis2",
                disaster_title: "Wildfire Emergency",
                disaster_location: "Forest Hills",
                verification_status: "pending",
                image_url: "https://picsum.photos/400/300?random=2&blur=0",
                created_at: new Date(
                  Date.now() - 4 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "3",
                content:
                  "Red Cross has set up a temporary shelter at the community center. They need volunteers and supplies including blankets, food, and medical supplies.",
                user_id: "volunteer",
                disaster_id: "dis1",
                disaster_title: "Downtown Flooding",
                disaster_location: "Downtown Area",
                verification_status: "verified",
                image_url: "https://picsum.photos/400/300?random=3&blur=0",
                created_at: new Date(
                  Date.now() - 6 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "4",
                content:
                  "Power lines are down on Elm Street. AVOID THE AREA. Utility crews are working to restore power but estimate 6-8 hours for repairs.",
                user_id: "utility_worker",
                disaster_id: "dis3",
                disaster_title: "Storm Damage",
                disaster_location: "Elm Street Area",
                verification_status: "flagged",
                image_url: "https://picsum.photos/400/300?random=4&blur=0",
                created_at: new Date(
                  Date.now() - 8 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "5",
                content:
                  "Medical supplies running low at the emergency clinic. Urgent need for bandages, antiseptics, and basic medical equipment.",
                user_id: "medical_staff",
                disaster_id: "dis2",
                disaster_title: "Wildfire Emergency",
                disaster_location: "Forest Hills",
                verification_status: "pending",
                image_url: "https://picsum.photos/400/300?random=5&blur=0",
                created_at: new Date(
                  Date.now() - 12 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "6",
                content:
                  "Residents reporting gas smell in the area. Fire department investigating potential gas leak. Area being evacuated as precaution.",
                user_id: "neighbor",
                disaster_id: "dis3",
                disaster_title: "Storm Damage",
                disaster_location: "Elm Street Area",
                verification_status: "verified",
                image_url: "https://picsum.photos/400/300?random=6&blur=0",
                created_at: new Date(
                  Date.now() - 16 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "7",
                content:
                  "Helicopter rescue operations ongoing. Multiple people stranded on rooftops. Please stay clear of the area to allow emergency vehicles access.",
                user_id: "pilot",
                disaster_id: "dis1",
                disaster_title: "Downtown Flooding",
                disaster_location: "Downtown Area",
                verification_status: "pending",
                image_url: "https://picsum.photos/400/300?random=7&blur=0",
                created_at: new Date(
                  Date.now() - 20 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "8",
                content:
                  "Communication towers damaged in the fire. Cell service intermittent in affected areas. Use landlines for emergency communication.",
                user_id: "telecom_tech",
                disaster_id: "dis2",
                disaster_title: "Wildfire Emergency",
                disaster_location: "Forest Hills",
                verification_status: "flagged",
                image_url: "https://picsum.photos/400/300?random=8&blur=0",
                created_at: new Date(
                  Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
              },
            ],
          };
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        throw error;
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: 60000,
      retry: 1,
    }
  );

  // Update verification status mutation
  const updateVerificationMutation = useMutation(
    ({ id, status }) => {
      // Mock API call for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { id, verification_status: status } });
        }, 1000);
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["all-reports"]);
        setShowVerificationModal(false);
        setSelectedReport(null);
        toast.success("Report verification updated");
      },
      onError: (error) => {
        toast.error("Failed to update verification");
      },
    }
  );

  // Delete report mutation
  const deleteReportMutation = useMutation(
    (id) => {
      // Mock API call for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { deleted: id } });
        }, 500);
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["all-reports"]);
        toast.success("Report deleted successfully");
      },
      onError: (error) => {
        toast.error("Failed to delete report");
      },
    }
  );

  const handleVerificationUpdate = (status) => {
    if (selectedReport) {
      updateVerificationMutation.mutate({
        id: selectedReport.id,
        status,
      });
    }
  };

  const handleDelete = (report) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReportMutation.mutate(report.id);
    }
  };

  const verificationStatusColors = {
    verified:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    flagged: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };

  const verificationIcons = {
    verified: CheckCircle,
    pending: Clock,
    flagged: XCircle,
  };

  // Safely get reports data as array
  const reportsDataArray = reportsData?.data
    ? Array.isArray(reportsData.data)
      ? reportsData.data
      : []
    : [];

  const filteredReports = reportsDataArray.filter((report) => {
    const matchesSearch =
      !filters.search ||
      report.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.disaster_title
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      report.user_id?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      !filters.verification_status ||
      report.verification_status === filters.verification_status;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredReports.length,
    verified: filteredReports.filter(
      (r) => r.verification_status === "verified"
    ).length,
    pending: filteredReports.filter((r) => r.verification_status === "pending")
      .length,
    flagged: filteredReports.filter((r) => r.verification_status === "flagged")
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and verify disaster reports from the community
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Reports</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.verified}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Verified</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pending}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.flagged}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">
              Failed to load reports. Using cached data.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.verification_status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                verification_status: e.target.value,
              }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
          </select>

          <select
            value={filters.disaster_id}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, disaster_id: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Disasters</option>
            {disastersData.map((disaster) => (
              <option key={disaster.id} value={disaster.id}>
                {disaster.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : filteredReports.length > 0 ? (
          <AnimatePresence>
            {filteredReports.map((report) => {
              const StatusIcon =
                verificationIcons[report.verification_status] || Clock;

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {report.user_id}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(report.created_at).toLocaleString()}
                          </span>
                        </div>

                        {report.disaster_title && (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-gray-400" />
                            <Link
                              to={`/disasters/${report.disaster_id}`}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {report.disaster_title}
                            </Link>
                          </div>
                        )}

                        {report.disaster_location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {report.disaster_location}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            verificationStatusColors[
                              report.verification_status
                            ] || verificationStatusColors.pending
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {report.verification_status || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {report.content}
                      </p>
                    </div>

                    {report.image_url && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Image attachment
                          </span>
                        </div>
                        <div className="relative group cursor-pointer">
                          <img
                            src={report.image_url}
                            alt="Report attachment"
                            className="rounded-lg max-w-xs h-32 object-cover border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="hidden items-center justify-center w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        {report.disaster_id && (
                          <Link
                            to={`/disasters/${report.disaster_id}`}
                            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            View Disaster
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {(user?.role === "admin" ||
                          user?.role === "contributor") && (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowVerificationModal(true);
                            }}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Update verification status"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {(user?.id === report.user_id ||
                          user?.role === "admin") && (
                          <button
                            onClick={() => handleDelete(report)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.search ||
              filters.verification_status ||
              filters.disaster_id
                ? "Try adjusting your filters to see more results."
                : "No reports have been submitted yet."}
            </p>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowVerificationModal(false);
              setSelectedReport(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Update Verification Status
                </h2>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Report by {selectedReport.user_id}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedReport.content}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleVerificationUpdate("verified")}
                    disabled={updateVerificationMutation.isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Mark as Verified</span>
                  </button>

                  <button
                    onClick={() => handleVerificationUpdate("pending")}
                    disabled={updateVerificationMutation.isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/70 transition-colors disabled:opacity-50"
                  >
                    <Clock className="h-5 w-5" />
                    <span>Mark as Pending</span>
                  </button>

                  <button
                    onClick={() => handleVerificationUpdate("flagged")}
                    disabled={updateVerificationMutation.isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Flag as Suspicious</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedReport(null);
                  }}
                  className="w-full mt-4 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
