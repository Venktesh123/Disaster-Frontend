import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Navigation,
  Home,
  Utensils,
  Droplets,
  Shield,
  Truck,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Cross,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { resourceAPI, disasterAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    disaster_id: "",
    nearby: false,
  });

  const { user } = useAuth();
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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation && filters.nearby) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast.error("Unable to get your location");
          setFilters((prev) => ({ ...prev, nearby: false }));
        }
      );
    }
  }, [filters.nearby]);

  // Fetch disasters for filter dropdown
  const { data: disasters } = useQuery(
    "disasters-for-resources",
    () => disasterAPI.getAll({ limit: 100 }),
    { staleTime: 300000 }
  );

  // Safely get disasters data as array
  const disastersData = Array.isArray(disasters?.data) ? disasters.data : [];

  // Fetch resources
  const {
    data: resourcesData,
    isLoading,
    error,
  } = useQuery(
    ["resources", filters, userLocation],
    async () => {
      if (filters.disaster_id) {
        return await resourceAPI.getByDisaster(filters.disaster_id, {
          type: filters.type,
        });
      } else if (filters.nearby && userLocation) {
        return await resourceAPI.getNearby({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 10,
          type: filters.type,
        });
      } else {
        // Mock all resources data
        return {
          data: [
            {
              id: "1",
              name: "City Emergency Shelter",
              location_name: "123 Main St, Downtown",
              type: "shelter",
              disaster_id: "dis1",
              disaster: {
                title: "Downtown Flooding",
                location_name: "Downtown Area",
              },
              created_by: "reliefAdmin",
              created_at: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              distance: 1.2,
            },
            {
              id: "2",
              name: "General Hospital",
              location_name: "456 Health Blvd, Medical District",
              type: "hospital",
              disaster_id: "dis2",
              disaster: {
                title: "Wildfire Emergency",
                location_name: "Forest Hills",
              },
              created_by: "medical_staff",
              created_at: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
              distance: 2.8,
            },
            {
              id: "3",
              name: "Community Food Bank",
              location_name: "789 Community Ave, Westside",
              type: "food",
              disaster_id: "dis1",
              disaster: {
                title: "Downtown Flooding",
                location_name: "Downtown Area",
              },
              created_by: "volunteer",
              created_at: new Date(
                Date.now() - 6 * 60 * 60 * 1000
              ).toISOString(),
              distance: 3.5,
            },
            {
              id: "4",
              name: "Water Distribution Point",
              location_name: "Central Park Pavilion",
              type: "water",
              disaster_id: "dis3",
              disaster: {
                title: "Storm Damage",
                location_name: "Elm Street Area",
              },
              created_by: "city_official",
              created_at: new Date(
                Date.now() - 8 * 60 * 60 * 1000
              ).toISOString(),
              distance: 0.8,
            },
            {
              id: "5",
              name: "Mobile Medical Unit",
              location_name: "Parking Lot - 555 Oak St",
              type: "medical",
              disaster_id: "dis2",
              disaster: {
                title: "Wildfire Emergency",
                location_name: "Forest Hills",
              },
              created_by: "medical_staff",
              created_at: new Date(
                Date.now() - 12 * 60 * 60 * 1000
              ).toISOString(),
              distance: 4.2,
            },
            {
              id: "6",
              name: "Search & Rescue Base",
              location_name: "Fire Station #3",
              type: "rescue",
              disaster_id: "dis2",
              disaster: {
                title: "Wildfire Emergency",
                location_name: "Forest Hills",
              },
              created_by: "firstresponder",
              created_at: new Date(
                Date.now() - 16 * 60 * 60 * 1000
              ).toISOString(),
              distance: 5.1,
            },
          ],
        };
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: 60000,
      enabled: !filters.nearby || !!userLocation,
    }
  );

  // Create resource mutation
  const createResourceMutation = useMutation(resourceAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      setShowCreateModal(false);
      reset();
      toast.success("Resource added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add resource");
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation(resourceAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(["resources"]);
      toast.success("Resource deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete resource");
    },
  });

  const onSubmit = (data) => {
    createResourceMutation.mutate(data);
  };

  const handleDelete = (resource) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(resource.id);
    }
  };

  const resourceTypes = [
    { value: "shelter", label: "Shelter", icon: Home, color: "blue" },
    { value: "hospital", label: "Hospital", icon: Cross, color: "red" },
    { value: "food", label: "Food", icon: Utensils, color: "green" },
    { value: "water", label: "Water", icon: Droplets, color: "cyan" },
    { value: "medical", label: "Medical", icon: Shield, color: "purple" },
    { value: "rescue", label: "Rescue", icon: Truck, color: "orange" },
  ];

  const getResourceIcon = (type) => {
    const resourceType = resourceTypes.find((rt) => rt.value === type);
    return resourceType ? resourceType.icon : MapPin;
  };

  const getResourceColor = (type) => {
    const resourceType = resourceTypes.find((rt) => rt.value === type);
    const colors = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      red: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
      orange:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    };
    return colors[resourceType?.color] || colors.blue;
  };

  // Safely get resources data as array
  const resourcesDataArray = Array.isArray(resourcesData?.data)
    ? resourcesData.data
    : [];

  const filteredResources = resourcesDataArray.filter((resource) => {
    const matchesSearch =
      !filters.search ||
      resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      resource.location_name
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesType = !filters.type || resource.type === filters.type;

    return matchesSearch && matchesType;
  });

  // Sort by distance if nearby filter is active
  if (filters.nearby && userLocation) {
    filteredResources.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  const stats = resourceTypes.map((type) => ({
    ...type,
    count: filteredResources.filter((r) => r.type === type.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find and manage emergency resources and facilities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMapView(!showMapView)}
            className="btn-secondary flex items-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>{showMapView ? "List View" : "Map View"}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.value}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
                <IconComponent
                  className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {resourceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
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
            {disastersData.map((disaster) => (
              <option key={disaster.id} value={disaster.id}>
                {disaster.title}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 px-3 py-2">
            <input
              type="checkbox"
              checked={filters.nearby}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, nearby: e.target.checked }))
              }
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
              <Navigation className="h-4 w-4 mr-1" />
              Nearby only
            </span>
          </label>
        </div>
      </div>

      {/* Map View Placeholder */}
      {showMapView && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Interactive Map
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Map integration would show all resources with their locations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {!showMapView && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredResources.length > 0 ? (
            <AnimatePresence>
              {filteredResources.map((resource) => {
                const ResourceIcon = getResourceIcon(resource.type);

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${getResourceColor(
                              resource.type
                            )}`}
                          >
                            <ResourceIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {resource.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResourceColor(
                                resource.type
                              )} capitalize`}
                            >
                              {resource.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {resource.location_name}
                          </span>
                        </div>

                        {resource.distance !== undefined && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Navigation className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {resource.distance.toFixed(1)} km away
                            </span>
                          </div>
                        )}

                        {resource.disaster && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Link
                              to={`/disasters/${resource.disaster_id}`}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                            >
                              {resource.disaster.title}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{resource.created_by}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(
                                resource.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {(user?.id === resource.created_by ||
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
                                  onClick={() => handleDelete(resource)}
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
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="col-span-full text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No resources found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.search || filters.type || filters.disaster_id
                  ? "Try adjusting your filters to see more results."
                  : "No resources have been added yet."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Add First Resource
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Resource Modal */}
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
                  Add New Resource
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Related Disaster
                    </label>
                    <select
                      {...register("disaster_id")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select disaster (optional)</option>
                      {disastersData.map((disaster) => (
                        <option key={disaster.id} value={disaster.id}>
                          {disaster.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
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

export default Resources;
