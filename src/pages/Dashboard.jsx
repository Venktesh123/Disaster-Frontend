import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Users,
  MapPin,
  MessageSquare,
  TrendingUp,
  Clock,
  Shield,
  Activity,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { disasterAPI, socialMediaAPI } from "../services/api";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  const { user } = useAuth();
  const { onEvent } = useSocket();

  // Fetch dashboard data
  const { data: disasters, isLoading: loadingDisasters } = useQuery(
    "dashboard-disasters",
    () => disasterAPI.getAll({ limit: 10 }),
    { refetchInterval: 30000 }
  );

  const { data: socialMedia } = useQuery(
    "dashboard-social",
    () => socialMediaAPI.getMock(),
    { refetchInterval: 60000 }
  );

  // Mock data for charts
  const weeklyData = [
    { day: "Mon", disasters: 12, reports: 45, resources: 23 },
    { day: "Tue", disasters: 8, reports: 32, resources: 18 },
    { day: "Wed", disasters: 15, reports: 58, resources: 31 },
    { day: "Thu", disasters: 6, reports: 28, resources: 15 },
    { day: "Fri", disasters: 11, reports: 41, resources: 27 },
    { day: "Sat", disasters: 9, reports: 35, resources: 19 },
    { day: "Sun", disasters: 7, reports: 25, resources: 14 },
  ];

  const disasterTypes = [
    { name: "Floods", value: 35, color: "#3b82f6" },
    { name: "Fires", value: 25, color: "#ef4444" },
    { name: "Storms", value: 20, color: "#f59e0b" },
    { name: "Earthquakes", value: 15, color: "#8b5cf6" },
    { name: "Other", value: 5, color: "#6b7280" },
  ];

  // Safely get disasters data as array
  const disastersData = Array.isArray(disasters?.data) ? disasters.data : [];
  const socialMediaData = Array.isArray(socialMedia?.data)
    ? socialMedia.data
    : [];

  const stats = [
    {
      name: "Active Disasters",
      value: disastersData.filter((d) => d.status === "active")?.length || 0,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "People Affected",
      value: "2.4K",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      change: "+5%",
      changeType: "increase",
    },
    {
      name: "Resources Available",
      value: "156",
      icon: MapPin,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      change: "+8%",
      changeType: "increase",
    },
    {
      name: "Social Alerts",
      value: socialMediaData.length || 0,
      icon: MessageSquare,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      change: "+23%",
      changeType: "increase",
    },
  ];

  // Real-time updates listener
  useEffect(() => {
    const unsubscribe = onEvent?.("disaster_updated", (data) => {
      const update = {
        id: Date.now(),
        type: data.type,
        message: `Disaster ${data.type}: ${data.data?.title || "Unknown"}`,
        time: new Date().toLocaleTimeString(),
        priority: "high",
      };
      setRealtimeUpdates((prev) => [update, ...prev.slice(0, 4)]);
    });

    return unsubscribe;
  }, [onEvent]);

  const recentDisasters = disastersData.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Emergency response overview and real-time monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Activity className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Welcome message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-primary-100">
              You have {stats[0].value} active disasters to monitor today.
            </p>
          </div>
          <Shield className="h-12 w-12 text-primary-200" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <TrendingUp
                  className={`h-4 w-4 ${
                    stat.changeType === "increase"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                <span
                  className={
                    stat.changeType === "increase"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f9fafb",
                }}
              />
              <Line
                type="monotone"
                dataKey="disasters"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="reports"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="resources"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Disaster Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Disaster Types
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={disasterTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {disasterTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity & Real-time Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Disasters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Disasters
              </h3>
              <Link
                to="/disasters"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {loadingDisasters ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Loading...
                </p>
              </div>
            ) : (
              recentDisasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {disaster.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {disaster.location_name}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                          Active
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(disaster.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/disasters/${disaster.id}`}
                      className="ml-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Real-time Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Real-time Updates
              </h3>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Live
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {realtimeUpdates.length > 0 ? (
              realtimeUpdates.map((update) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {update.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {update.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-6 text-center">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Waiting for real-time updates...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/disasters?action=create"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
          >
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Report Disaster
              </p>
            </div>
          </Link>
          <Link
            to="/resources?action=create"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
          >
            <div className="text-center">
              <MapPin className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Add Resource
              </p>
            </div>
          </Link>
          <Link
            to="/social-media"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
          >
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Monitor Social Media
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
