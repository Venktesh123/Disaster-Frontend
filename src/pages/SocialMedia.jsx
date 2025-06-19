import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Heart,
  Repeat,
  MessageCircle,
  ExternalLink,
  Clock,
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Settings,
} from "lucide-react";
import { useQuery } from "react-query";
import { socialMediaAPI, disasterAPI } from "../services/api";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";

const SocialMedia = () => {
  const [filters, setFilters] = useState({
    keywords: "",
    disaster_id: "",
    priority: "",
  });
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [refreshInterval, setRefreshInterval] = useState(30);

  const { onEvent } = useSocket();

  // Fetch disasters for filter dropdown
  const { data: disasters } = useQuery(
    "disasters-for-social",
    () => disasterAPI.getAll({ limit: 100 }),
    { staleTime: 300000 }
  );

  // Fetch social media posts
  const {
    data: socialData,
    isLoading,
    refetch,
  } = useQuery(
    ["social-media", filters],
    async () => {
      if (filters.disaster_id) {
        return await socialMediaAPI.getByDisaster(filters.disaster_id, {
          keywords: filters.keywords,
        });
      } else {
        return await socialMediaAPI.search({
          keywords: filters.keywords || "emergency,disaster,help,urgent,sos",
        });
      }
    },
    {
      refetchInterval: isLiveMode ? refreshInterval * 1000 : false,
      keepPreviousData: true,
    }
  );

  // Listen for real-time social media updates
  useEffect(() => {
    const unsubscribe = onEvent?.("social_media_updated", (data) => {
      refetch();

      // Play notification sound for urgent posts
      if (
        soundEnabled &&
        data.posts?.some((post) => post.priority === "urgent")
      ) {
        // Would play notification sound here
        toast.error("🚨 Urgent social media alerts detected!");
      }
    });

    return unsubscribe;
  }, [onEvent, refetch, soundEnabled]);

  const handleRefresh = () => {
    refetch();
    toast.success("Social media feed refreshed");
  };

  const platforms = [
    { id: "all", name: "All Platforms", color: "gray" },
    { id: "twitter", name: "Twitter", color: "blue" },
    { id: "facebook", name: "Facebook", color: "indigo" },
    { id: "instagram", name: "Instagram", color: "pink" },
    { id: "reddit", name: "Reddit", color: "orange" },
  ];

  const priorityLevels = [
    { value: "", label: "All Priorities" },
    { value: "urgent", label: "Urgent", color: "red" },
    { value: "high", label: "High", color: "orange" },
    { value: "medium", label: "Medium", color: "blue" },
  ];

  const priorityColors = {
    urgent:
      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    medium:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  const posts = socialData?.data || [];
  const filteredPosts = posts.filter((post) => {
    const matchesPriority =
      !filters.priority || post.priority === filters.priority;
    const matchesPlatform =
      selectedPlatform === "all" || post.platform === selectedPlatform;
    return matchesPriority && matchesPlatform;
  });

  const stats = {
    total: filteredPosts.length,
    urgent: filteredPosts.filter((p) => p.priority === "urgent").length,
    high: filteredPosts.filter((p) => p.priority === "high").length,
    medium: filteredPosts.filter((p) => p.priority === "medium").length,
  };

  const getTimestamp = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return postTime.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Social Media Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time social media alerts and emergency communications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled
                ? "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20"
                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={soundEnabled ? "Mute notifications" : "Enable notifications"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isLiveMode
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {isLiveMode ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isLiveMode ? "Live" : "Paused"}
            </span>
          </button>

          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Posts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.urgent}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Urgent</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.high}
              </p>
              <p className="text-gray-600 dark:text-gray-400">High Priority</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.medium}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Medium Priority
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search keywords..."
              value={filters.keywords}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keywords: e.target.value }))
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {priorityLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>

          <select
            value={filters.disaster_id}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, disaster_id: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Disasters</option>
            {disasters?.data?.map((disaster) => (
              <option key={disaster.id} value={disaster.id}>
                {disaster.title}
              </option>
            ))}
          </select>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={15}>Refresh every 15s</option>
            <option value={30}>Refresh every 30s</option>
            <option value={60}>Refresh every 1m</option>
            <option value={300}>Refresh every 5m</option>
          </select>
        </div>

        {/* Platform Filter */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                selectedPlatform === platform.id
                  ? "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Feed */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredPosts.length > 0 ? (
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${
                  priorityColors[post.priority] ||
                  "border-gray-200 dark:border-gray-700"
                } hover:shadow-md transition-all duration-200`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {(post.user || post.username || "U")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          @{post.user || post.username || "unknown"}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{post.platform || "Twitter"}</span>
                          <span>•</span>
                          <span>{getTimestamp(post.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          priorityColors[post.priority] ||
                          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {post.priority || "medium"}
                      </span>

                      {post.priority === "urgent" && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      {post.post || post.content || post.text}
                    </p>
                  </div>

                  {post.image_url && (
                    <div className="mb-4">
                      <img
                        src={post.image_url}
                        alt="Social media post"
                        className="rounded-lg max-w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      {post.engagement && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.engagement.likes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Repeat className="h-4 w-4" />
                            <span>
                              {post.engagement.retweets ||
                                post.engagement.shares ||
                                0}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>
                              {post.engagement.replies ||
                                post.engagement.comments ||
                                0}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View original post"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No social media posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filters.keywords || filters.priority || filters.disaster_id
                ? "Try adjusting your filters to see more posts."
                : "No social media activity detected at the moment."}
            </p>
            <div className="flex justify-center space-x-3">
              <button onClick={handleRefresh} className="btn-secondary">
                Refresh Feed
              </button>
              <button
                onClick={() =>
                  setFilters({ keywords: "", disaster_id: "", priority: "" })
                }
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Status Indicator */}
      {isLiveMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-2 bg-white rounded-full"
          />
          <span className="text-sm font-medium">Live monitoring active</span>
        </motion.div>
      )}
    </div>
  );
};

export default SocialMedia;
