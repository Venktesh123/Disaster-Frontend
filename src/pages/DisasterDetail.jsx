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
} from "lucide-react";

// Mock data based on your API response
const mockDisasterData = {
  id: "5b6fa154-0797-4674-a984-dee0a6bd7dad",
  title: "Rain",
  location_name: "Uttar Pradesh",
  location: "0101000020E6100000ECDE8AC404375440358B61985D213B40",
  description:
    "Heavy Rain causing flooding in multiple areas of Uttar Pradesh. Emergency services are responding to reports of waterlogged roads and affected communities.",
  tags: ["flood", "rain", "emergency"],
  owner_id: "citizen1",
  status: "active",
  created_at: "2025-06-20T06:48:47.949766+00:00",
  audit_trail: [
    {
      action: "create",
      details: "Disaster record created",
      user_id: "citizen1",
      timestamp: "2025-06-20T06:48:47.960Z",
    },
  ],
};

// Mock reports data
const mockReports = [
  {
    id: "1",
    user_id: "citizen1",
    content:
      "Heavy flooding on Main Street. Water level is approximately 2 feet deep. Several vehicles are stranded.",
    image_url:
      "https://via.placeholder.com/300x200/4F46E5/ffffff?text=Flood+Report",
    verification_status: "verified",
    created_at: "2025-06-20T07:30:00.000Z",
  },
  {
    id: "2",
    user_id: "citizen2",
    content:
      "Rescue operations ongoing near the river bank. Multiple families evacuated safely to higher ground.",
    verification_status: "pending",
    created_at: "2025-06-20T08:15:00.000Z",
  },
];

// Mock resources data
const mockResources = [
  {
    id: "1",
    name: "Community Relief Center",
    location_name: "Central District, Uttar Pradesh",
    type: "shelter",
    created_at: "2025-06-20T07:00:00.000Z",
  },
  {
    id: "2",
    name: "Emergency Medical Camp",
    location_name: "District Hospital, Uttar Pradesh",
    type: "medical",
    created_at: "2025-06-20T07:30:00.000Z",
  },
  {
    id: "3",
    name: "Food Distribution Point",
    location_name: "Government School, Block A",
    type: "food",
    created_at: "2025-06-20T08:00:00.000Z",
  },
];

// Mock social media data
const mockSocialMedia = [
  {
    user: "localreporter",
    post: "Breaking: Heavy rainfall continues in Uttar Pradesh. Roads flooded, traffic severely affected. #UPFloods #Emergency",
    timestamp: "2025-06-20T09:00:00.000Z",
    priority: "high",
    engagement: { likes: 45, retweets: 23, replies: 12 },
  },
  {
    user: "emergencyservices",
    post: "Rescue teams deployed in affected areas. If you need help, call emergency helpline: 108",
    timestamp: "2025-06-20T08:45:00.000Z",
    priority: "urgent",
    engagement: { likes: 89, retweets: 67, replies: 34 },
  },
];

// Mock official updates
const mockOfficialUpdates = [
  {
    source: "State Disaster Management",
    title: "Flood Warning Extended for Uttar Pradesh",
    summary:
      "Weather department has extended flood warning for next 48 hours. Residents advised to stay alert.",
    date: "2025-06-20T10:00:00.000Z",
    link: "#",
  },
  {
    source: "District Collector Office",
    title: "Relief Operations Update",
    summary:
      "Emergency shelters opened in 15 locations. Food and medical aid being distributed.",
    date: "2025-06-20T09:30:00.000Z",
    link: "#",
  },
];

const DisasterDetail = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [loadingDisaster, setLoadingDisaster] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [reportImageUrl, setReportImageUrl] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [resourceLocation, setResourceLocation] = useState("");
  const [resourceType, setResourceType] = useState("");

  // Simulate data loading
  const disasterData = mockDisasterData;
  const reportsData = mockReports;
  const resourcesData = mockResources;
  const socialMediaData = mockSocialMedia;
  const officialUpdatesData = mockOfficialUpdates;

  const tabs = [
    { id: "overview", name: "Overview", icon: AlertTriangle },
    {
      id: "reports",
      name: "Reports",
      icon: FileText,
      count: reportsData.length,
    },
    {
      id: "resources",
      name: "Resources",
      icon: MapPin,
      count: resourcesData.length,
    },
    {
      id: "social",
      name: "Social Media",
      icon: MessageSquare,
      count: socialMediaData.length,
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

  const priorityColors = {
    urgent:
      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    medium:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  const handleSubmitReport = () => {
    console.log("Submitting report:", {
      content: reportContent,
      image_url: reportImageUrl,
    });
    setShowReportModal(false);
    setReportContent("");
    setReportImageUrl("");
    // In real app, this would call an API
  };

  const handleSubmitResource = () => {
    console.log("Submitting resource:", {
      name: resourceName,
      location: resourceLocation,
      type: resourceType,
    });
    setShowResourceModal(false);
    setResourceName("");
    setResourceLocation("");
    setResourceType("");
    // In real app, this would call an API
  };

  if (loadingDisaster) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 flex items-center space-x-2"
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
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
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
                    {officialUpdatesData.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Official Updates
                        </h3>
                        <div className="space-y-4">
                          {officialUpdatesData
                            .slice(0, 3)
                            .map((update, index) => (
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
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
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
                            {reportsData.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Resources
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {resourcesData.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Social Alerts
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {socialMediaData.length}
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
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Resource</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div className="space-y-6">
                  {reportsData.length > 0 ? (
                    <div className="grid gap-4">
                      {reportsData.map((report) => (
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
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                      >
                        Submit Report
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-6">
                  {resourcesData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resourcesData.map((resource) => (
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
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                      >
                        Add Resource
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "social" && (
                <div className="space-y-6">
                  {socialMediaData.length > 0 ? (
                    <div className="space-y-4">
                      {socialMediaData.map((post, index) => (
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

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Report Content *
                        </label>
                        <textarea
                          rows={4}
                          value={reportContent}
                          onChange={(e) => setReportContent(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Describe what you've observed or experienced..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Image URL (optional)
                        </label>
                        <input
                          type="url"
                          value={reportImageUrl}
                          onChange={(e) => setReportImageUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowReportModal(false)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitReport}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                        >
                          Submit Report
                        </button>
                      </div>
                    </div>
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

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Resource Name *
                        </label>
                        <input
                          type="text"
                          value={resourceName}
                          onChange={(e) => setResourceName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Community Center, Hospital, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={resourceLocation}
                          onChange={(e) => setResourceLocation(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Address or area description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Resource Type *
                        </label>
                        <select
                          value={resourceType}
                          onChange={(e) => setResourceType(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select type</option>
                          {resourceTypes.map((type) => (
                            <option
                              key={type}
                              value={type}
                              className="capitalize"
                            >
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowResourceModal(false)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitResource}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                        >
                          Add Resource
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetail;
