import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { disasterAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";

const Disasters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    tag: "",
    owner_id: "",
  });

  const { user } = useAuth();
  const { onEvent } = useSocket();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Check if we should show create modal from URL params
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowCreateModal(true);
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribe = onEvent?.("disaster_updated", (data) => {
      queryClient.invalidateQueries("disasters");
      if (data.type === "create") {
        toast.success("New disaster reported");
      } else if (data.type === "update") {
        toast.success("Disaster updated");
      }
    });

    return unsubscribe;
  }, [onEvent, queryClient]);

  // Fetch disasters
  const {
    data: disasters,
    isLoading,
    error,
  } = useQuery(
    ["disasters", filters],
    () =>
      disasterAPI.getAll({
        ...filters,
        limit: 50,
      }),
    {
      refetchInterval: 30000,
      keepPreviousData: true,
    }
  );

  // Create disaster mutation
  const createMutation = useMutation(disasterAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries("disasters");
      setShowCreateModal(false);
      reset();
      toast.success("Disaster reported successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to create disaster");
    },
  });

  // Delete disaster mutation
  const deleteMutation = useMutation(disasterAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries("disasters");
      toast.success("Disaster deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete disaster");
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this disaster?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const disasterTypes = [
    "flood",
    "fire",
    "earthquake",
    "storm",
    "landslide",
    "drought",
    "other",
  ];

  const priorityColors = {
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    low: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  };

  const statusColors = {
    active: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    resolved:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    monitoring:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Disasters
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage emergency situations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Report Disaster</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search disasters..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filters.tag}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, tag: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {disasterTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
          <select
            value={filters.owner_id}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, owner_id: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Reporters</option>
            <option value={user?.id}>My Reports</option>
          </select>
        </div>
      </div>

      {/* Disasters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
              </motion.div>
            ))
          ) : disasters?.data?.length > 0 ? (
            disasters.data.map((disaster) => (
              <motion.div
                key={disaster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {disaster.title}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {disaster.location_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[disaster.status] || statusColors.active
                        }`}
                      >
                        {disaster.status || "Active"}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {disaster.description}
                  </p>

                  {/* Tags */}
                  {disaster.tags && disaster.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {disaster.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                      {disaster.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{disaster.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(disaster.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {disaster.reports && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{disaster.reports[0]?.count || 0} reports</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/disasters/${disaster.id}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {(user?.id === disaster.owner_id ||
                        user?.role === "admin") && (
                        <>
                          <button
                            onClick={() => {
                              /* TODO: Edit modal */
                            }}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleDelete(disaster.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No disasters found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.search || filters.tag || filters.owner_id
                  ? "Try adjusting your filters to see more results."
                  : "No disasters have been reported yet."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Report First Disaster
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Disaster Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Report New Disaster
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register("title", { required: "Title is required" })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Brief description of the disaster"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.title.message}
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
                      placeholder="City, State or specific address"
                    />
                    {errors.location_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.location_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      {...register("description", {
                        required: "Description is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Detailed description of the situation, damage, and immediate needs..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {disasterTypes.map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            value={type}
                            {...register("tags")}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isLoading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {createMutation.isLoading
                        ? "Reporting..."
                        : "Report Disaster"}
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

export default Disasters;
