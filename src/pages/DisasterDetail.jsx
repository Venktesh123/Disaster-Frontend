import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  FileText,
  MessageSquare,
  ExternalLink,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import {
  disasterAPI,
  reportAPI,
  resourceAPI,
  socialMediaAPI,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";

const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinDisasterRoom, leaveDisasterRoom, onEvent } = useSocket();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Join disaster room for real-time updates
  useEffect(() => {
    if (id) {
      joinDisasterRoom(id);
      return () => leaveDisasterRoom(id);
    }
  }, [id, joinDisasterRoom, leaveDisasterRoom]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribe = onEvent?.("disaster_updated", (data) => {
      if (data.data?.id === id) {
        queryClient.invalidateQueries(["disaster", id]);
        queryClient.invalidateQueries(["disaster-reports", id]);
        queryClient.invalidateQueries(["disaster-resources", id]);
      }
    });

    return unsubscribe;
  }, [onEvent, id, queryClient]);

  // Fetch disaster details
  const {
    data: disaster,
    isLoading: loadingDisaster,
    error,
  } = useQuery(["disaster", id], () => disasterAPI.getById(id), {
    enabled: !!id,
  });

  // Fetch reports
  const { data: reports, isLoading: loadingReports } = useQuery(
    ["disaster-reports", id],
    () => reportAPI.getByDisaster(id),
    { enabled: !!id }
  );

  // Fetch resources
  const { data: resources, isLoading: loadingResources } = useQuery(
    ["disaster-resources", id],
    () => resourceAPI.getByDisaster(id),
    { enabled: !!id }
  );

  // Fetch social media
  const { data: socialMedia, isLoading: loadingSocial } = useQuery(
    ["disaster-social", id],
    () =>
      socialMediaAPI.getByDisaster(id, { keywords: "emergency,disaster,help" }),
    { enabled: !!id, refetchInterval: 60000 }
  );

  // Fetch official updates
  const { data: officialUpdates } = useQuery(
    ["disaster-official-updates", id],
    () => reportAPI.getOfficialUpdates(id),
    { enabled: !!id, refetchInterval: 300000 } // 5 minutes
  );

  // Create report mutation
  const createReportMutation = useMutation(reportAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(["disaster-reports", id]);
      setShowReportModal(false);
      reset();
      toast.success("Report submitted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to submit report");
    },
  });

  // Create resource mutation
  const createResourceMutation = useMutation(resourceAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(["disaster-resources", id]);
      setShowResourceModal(false);
      reset();
      toast.success("Resource added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add resource");
    },
  });

  const onSubmitReport = (data) => {
    createReportMutation.mutate({
      ...data,
      disaster_id: id,
    });
  };

  const onSubmitResource = (data) => {
    createResourceMutation.mutate({
      ...data,
      disaster_id: id,
    });
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: AlertTriangle },
    {
      id: "reports",
      name: "Reports",
      icon: FileText,
      count: reports?.data?.length,
    },
    {
      id: "resources",
      name: "Resources",
      icon: MapPin,
      count: resources?.data?.length,
    },
    {
      id: "social",
      name: "Social Media",
      icon: MessageSquare,
      count: socialMedia?.data?.length,
    },
  ];

  const resourceTypes = [
    "shelter",
    "hospital",
    "food",
    "water",
    "medical",
    "rescue",
  ];

  const verificationStatusColors = {
    verified: "text-green-600 dark:text-green-400",
    pending: "text-yellow-600 dark:text-yellow-400",
    flagged: "text-red-600 dark:text-red-400",
  };

  const priorityColors = {
    urgent:
      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    medium:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  if (loadingDisaster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !disaster?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Disaster Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The disaster you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/disasters" className="btn-primary">
          Back to Disasters
        </Link>
      </div>
    );
  }

  const disasterData = disaster.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/disasters")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {disasterData.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mt-1">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{disasterData.location_name}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {new Date(disasterData.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Reported by {disasterData.owner_id}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {(user?.id === disasterData.owner_id || user?.role === "admin") && (
            <button className="btn-secondary flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Report</span>
          </button>
        </div>
      </div>

      {/* Status and Tags */}
      <div className="flex items-center space-x-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
          {disasterData.status || "Active"}
        </span>
        {disasterData.tags &&
          disasterData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize"
            >
              {tag}
            </span>
          ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Description */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {disasterData.description}
                  </p>
                </div>

                {/* Official Updates */}
                {officialUpdates?.data?.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Official Updates
                    </h3>
                    <div className="space-y-4">
                      {officialUpdates.data.slice(0, 3).map((update, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {update.source}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {update.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {update.summary}
                          </p>
                          <a
                            href={update.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                          >
                            Read more
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Reports
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {reports?.data?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Resources
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {resources?.data?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Social Alerts
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {socialMedia?.data?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {disasterData.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowResourceModal(true)}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Resource</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              {loadingReports ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Loading reports...
                  </p>
                </div>
              ) : reports?.data?.length > 0 ? (
                <div className="grid gap-4">
                  {reports.data.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Report by {report.user_id}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(report.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {report.content}
                          </p>
                          {report.image_url && (
                            <div className="mb-3">
                              <img
                                src={report.image_url}
                                alt="Report"
                                className="rounded-lg max-w-xs h-32 object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              report.verification_status === "verified"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                : report.verification_status === "flagged"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                            }`}
                          >
                            {report.verification_status === "verified" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {report.verification_status === "flagged" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {report.verification_status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No reports yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Be the first to submit a report for this disaster.
                  </p>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="btn-primary"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-6">
              {loadingResources ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Loading resources...
                  </p>
                </div>
              ) : resources?.data?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.data.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {resource.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {resource.location_name}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 capitalize">
                          {resource.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Added{" "}
                        {new Date(resource.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No resources available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Help others by adding available resources in the area.
                  </p>
                  <button
                    onClick={() => setShowResourceModal(true)}
                    className="btn-primary"
                  >
                    Add Resource
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-6">
              {loadingSocial ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Loading social media...
                  </p>
                </div>
              ) : socialMedia?.data?.length > 0 ? (
                <div className="space-y-4">
                  {socialMedia.data.map((post, index) => (
                    <div
                      key={index}
                      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 ${
                        priorityColors[post.priority] ||
                        "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              @{post.user}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(post.timestamp).toLocaleString()}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                priorityColors[post.priority] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {post.priority}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {post.post || post.content}
                          </p>
                          {post.engagement && (
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                              <span>❤️ {post.engagement.likes}</span>
                              <span>🔄 {post.engagement.retweets}</span>
                              <span>💬 {post.engagement.replies}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No social media activity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No social media posts found for this disaster.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Submit Report
                </h2>

                <form
                  onSubmit={handleSubmit(onSubmitReport)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Content *
                    </label>
                    <textarea
                      rows={4}
                      {...register("content", {
                        required: "Content is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Describe what you've observed or experienced..."
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.content.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      {...register("image_url")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createReportMutation.isLoading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {createReportMutation.isLoading
                        ? "Submitting..."
                        : "Submit Report"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resource Modal */}
      <AnimatePresence>
        {showResourceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowResourceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Add Resource
                </h2>

                <form
                  onSubmit={handleSubmit(onSubmitResource)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resource Name *
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Community Center, Hospital, etc."
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      {...register("location_name", {
                        required: "Location is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Address or area description"
                    />
                    {errors.location_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.location_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resource Type *
                    </label>
                    <select
                      {...register("type", { required: "Type is required" })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select type</option>
                      {resourceTypes.map((type) => (
                        <option key={type} value={type} className="capitalize">
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowResourceModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createResourceMutation.isLoading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {createResourceMutation.isLoading
                        ? "Adding..."
                        : "Add Resource"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisasterDetail;
