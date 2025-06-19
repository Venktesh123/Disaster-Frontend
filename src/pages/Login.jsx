import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  MapPin,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Auto-fill demo credentials
    setValue("userId", "citizen1");
    setValue("password", "password");
  }, [setValue]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await login(data.userId, data.password);

      if (result.success) {
        toast.success("Welcome to Disaster Response Platform!");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    {
      id: "citizen1",
      role: "User",
      name: "Jane Citizen",
      desc: "Report and view disasters",
    },
    {
      id: "contributor1",
      role: "Contributor",
      name: "John Contributor",
      desc: "Manage resources and reports",
    },
    {
      id: "reliefAdmin",
      role: "Admin",
      name: "Relief Admin",
      desc: "Full access to all features",
    },
    {
      id: "netrunnerX",
      role: "Super Admin",
      name: "Net Runner",
      desc: "System administrator",
    },
  ];

  const features = [
    {
      icon: AlertTriangle,
      title: "Disaster Tracking",
      description: "Real-time monitoring and reporting of emergency situations",
    },
    {
      icon: Users,
      title: "Coordination",
      description: "Connect relief organizations and emergency responders",
    },
    {
      icon: MapPin,
      title: "Resource Mapping",
      description: "Locate shelters, hospitals, and emergency resources",
    },
    {
      icon: MessageSquare,
      title: "Social Monitoring",
      description: "Track social media for emergency alerts and updates",
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
        {/* Left side - Hero section */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <div className="flex items-center mb-8">
              <Shield className="h-12 w-12 text-primary-600" />
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Disaster Response
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Emergency Coordination Platform
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Coordinating emergency response in real-time
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Connect with emergency responders, track resources, and stay
              informed during critical situations with our comprehensive
              disaster management platform.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {feature.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto w-full max-w-md"
          >
            {/* Theme toggle */}
            <div className="flex justify-end mb-8">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="mb-8 text-center lg:hidden">
                <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Disaster Response
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Emergency Coordination Platform
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sign in to access the emergency coordination platform
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="userId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      User ID
                    </label>
                    <input
                      id="userId"
                      type="text"
                      autoComplete="username"
                      {...register("userId", {
                        required: "User ID is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your user ID"
                    />
                    {errors.userId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.userId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...register("password", {
                          required: "Password is required",
                        })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                {/* Demo accounts */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Demo Accounts
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {demoUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setValue("userId", user.id);
                          setValue("password", "password");
                        }}
                        className="group relative w-full flex justify-between items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.desc}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "Super Admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
                              : user.role === "Admin"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                              : user.role === "Contributor"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Password for all demo accounts:{" "}
                    <span className="font-mono font-medium">password</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
