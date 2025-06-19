import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Zap,
  AlertTriangle,
  FileText,
  ExternalLink,
  User,
  Calendar,
  MapPin,
  Loader,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { verificationAPI, reportAPI, disasterAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Verification = () => {
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedImages, setSelectedImages] = useState([]);
  const [verificationResults, setVerificationResults] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Check if user has verification permissions
  const canVerify = user?.role === "admin" || user?.role === "contributor";

  // Fetch pending reports with images
  const { data: pendingReports, isLoading: loadingReports } = useQuery(
    "pending-verification",
    async () => {
      // Mock data since we don't have a global pending reports endpoint
      return {
        data: [
          {
            id: "1",
            content:
              "Severe flooding on Main Street. Water level rising rapidly.",
            image_url: "https://picsum.photos/400/300?random=1",
            user_id: "citizen1",
            disaster_id: "dis1",
            disaster_title: "Downtown Flooding",
            disaster_location: "Downtown Area",
            verification_status: "pending",
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            priority: "high",
          },
          {
            id: "2",
            content:
              "Fire has spread to three buildings. Evacuation in progress.",
            image_url: "https://picsum.photos/400/300?random=2",
            user_id: "witness",
            disaster_id: "dis2",
            disaster_title: "Wildfire Emergency",
            disaster_location: "Forest Hills",
            verification_status: "pending",
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            priority: "urgent",
          },
          {
            id: "3",
            content: "Damaged power lines blocking the main road.",
            image_url: "https://picsum.photos/400/300?random=3",
            user_id: "driver",
            disaster_id: "dis3",
            disaster_title: "Storm Damage",
            disaster_location: "Highway 101",
            verification_status: "pending",
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            priority: "medium",
          },
          {
            id: "4",
            content: "Medical team needs access through this route.",
            image_url: "https://picsum.photos/400/300?random=4",
            user_id: "paramedic",
            disaster_id: "dis1",
            disaster_title: "Downtown Flooding",
            disaster_location: "Downtown Area",
            verification_status: "pending",
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            priority: "urgent",
          },
        ],
      };
    },
    {
      enabled: canVerify,
      refetchInterval: 60000, // 1 minute
    }
  );

  // Fetch verification history
  const { data: verificationHistory } = useQuery(
    "verification-history",
    async () => {
      // Mock verification history
      return {
        data: [
          {
            id: "v1",
            report_id: "r1",
            image_url: "https://picsum.photos/400/300?random=5",
            status: "verified",
            confidence: 0.92,
            verified_by: user?.id,
            verified_at: new Date(
              Date.now() - 24 * 60 * 60 * 1000
            ).toISOString(),
            analysis:
              "Image appears authentic. Shows genuine flood damage with consistent lighting and no signs of manipulation.",
          },
          {
            id: "v2",
            report_id: "r2",
            image_url: "https://picsum.photos/400/300?random=6",
            status: "flagged",
            confidence: 0.78,
            verified_by: user?.id,
            verified_at: new Date(
              Date.now() - 36 * 60 * 60 * 1000
            ).toISOString(),
            analysis:
              "Potential inconsistencies detected. Image metadata suggests possible editing.",
          },
        ],
      };
    },
    { enabled: canVerify }
  );

  // Single image verification mutation
  const verifySingleMutation = useMutation(
    ({ disasterId, data }) => verificationAPI.verifyImage(disasterId, data),
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries("pending-verification");
        toast.success("Image verification completed");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Verification failed");
      },
    }
  );

  // Batch verification mutation
  const verifyBatchMutation = useMutation(verificationAPI.batchVerify, {
    onSuccess: (result) => {
      queryClient.invalidateQueries("pending-verification");
      setVerificationResults(result.data.data);
      setShowBatchModal(false);
      setSelectedImages([]);
      toast.success(
        `Batch verification completed: ${result.data.meta.verified} verified, ${result.data.meta.flagged} flagged`
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Batch verification failed");
    },
  });

  const handleSingleVerification = (report) => {
    verifySingleMutation.mutate({
      disasterId: report.disaster_id,
      data: {
        image_url: report.image_url,
        report_id: report.id,
      },
    });
  };

  const handleBatchVerification = () => {
    if (selectedImages.length === 0) {
      toast.error("Please select images to verify");
      return;
    }

    const imagesToVerify = selectedImages.map((report) => ({
      image_url: report.image_url,
      disaster_id: report.disaster_id,
      report_id: report.id,
    }));

    verifyBatchMutation.mutate({ images: imagesToVerify });
  };

  const toggleImageSelection = (report) => {
    setSelectedImages((prev) => {
      const isSelected = prev.some((img) => img.id === report.id);
      if (isSelected) {
        return prev.filter((img) => img.id !== report.id);
      } else {
        return [...prev, report];
      }
    });
  };

  const onSubmitManualVerification = (data) => {
    if (!data.image_url) {
      toast.error("Please provide an image URL");
      return;
    }

    verifySingleMutation.mutate({
      disasterId: data.disaster_id || "manual",
      data: {
        image_url: data.image_url,
        context: data.context,
      },
    });
    reset();
  };

  const tabs = [
    {
      id: "queue",
      name: "Verification Queue",
      icon: Clock,
      count: pendingReports?.data?.length,
    },
    { id: "history", name: "Verification History", icon: ShieldCheck },
    { id: "manual", name: "Manual Verification", icon: Upload },
  ];

  const verificationStatusColors = {
    verified:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    flagged: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  };

  const priorityColors = {
    urgent:
      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    medium:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  if (!canVerify) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <ShieldCheck className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to access the verification system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify authenticity of disaster reports and images using AI analysis
          </p>
        </div>
        {selectedImages.length > 0 && (
          <button
            onClick={() => setShowBatchModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Verify {selectedImages.length} Selected</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingReports?.data?.length || 0}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Pending Verification
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verificationHistory?.data?.filter(
                  (v) => v.status === "verified"
                ).length || 0}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Verified Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verificationHistory?.data?.filter(
                  (v) => v.status === "flagged"
                ).length || 0}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Flagged Today</p>
            </div>
          </div>
        </div>
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
          {activeTab === "queue" && (
            <div className="space-y-4">
              {loadingReports ? (
                <div className="text-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading verification queue...
                  </p>
                </div>
              ) : pendingReports?.data?.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingReports.data.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${
                        selectedImages.some((img) => img.id === report.id)
                          ? "border-primary-500"
                          : priorityColors[report.priority] ||
                            "border-gray-200 dark:border-gray-700"
                      } transition-all duration-200`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedImages.some(
                                (img) => img.id === report.id
                              )}
                              onChange={() => toggleImageSelection(report)}
                              className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                            />
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {report.user_id}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    priorityColors[report.priority] ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {report.priority}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>
                                    {new Date(
                                      report.created_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{report.disaster_location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                            {report.content}
                          </p>

                          <div className="relative group">
                            <img
                              src={report.image_url}
                              alt="Report evidence"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {report.disaster_title}
                            </span>
                          </div>

                          <button
                            onClick={() => handleSingleVerification(report)}
                            disabled={verifySingleMutation.isLoading}
                            className="btn-primary text-sm disabled:opacity-50"
                          >
                            {verifySingleMutation.isLoading ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-1" />
                                Verify
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No pending verifications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All reports with images have been verified.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {verificationHistory?.data?.length > 0 ? (
                verificationHistory.data.map((verification) => (
                  <div
                    key={verification.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={verification.image_url}
                        alt="Verified content"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              verificationStatusColors[verification.status]
                            }`}
                          >
                            {verification.status === "verified" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {verification.status === "flagged" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {verification.status}
                          </span>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Confidence:{" "}
                            {(verification.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                          {verification.analysis}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Verified by {verification.verified_by} on{" "}
                          {new Date(verification.verified_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ShieldCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No verification history
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verification history will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "manual" && (
            <div className="max-w-md mx-auto">
              <form
                onSubmit={handleSubmit(onSubmitManualVerification)}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    {...register("image_url", {
                      required: "Image URL is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.image_url.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Context (optional)
                  </label>
                  <textarea
                    rows={3}
                    {...register("context")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Provide context about what the image should show..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifySingleMutation.isLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {verifySingleMutation.isLoading ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Verify Image
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Batch Verification Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowBatchModal(false)}
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
                  Batch Verification
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You're about to verify {selectedImages.length} images using AI
                  analysis. This process may take a few moments.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBatchModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchVerification}
                    disabled={verifyBatchMutation.isLoading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {verifyBatchMutation.isLoading ? (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Verify All
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Verification;
