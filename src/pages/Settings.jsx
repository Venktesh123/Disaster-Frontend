import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    sms: false,
    urgentOnly: false,
  });

  const { user, updateUser } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
    },
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "privacy", name: "Privacy & Security", icon: Shield },
    { id: "system", name: "System", icon: SettingsIcon },
  ];

  const onSubmitProfile = (data) => {
    updateUser(data);
    toast.success("Profile updated successfully");
  };

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
    toast.success("Notification preferences updated");
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const themeOptions = [
    {
      id: "light",
      name: "Light",
      icon: Sun,
      description: "Light theme for bright environments",
    },
    {
      id: "dark",
      name: "Dark",
      icon: Moon,
      description: "Dark theme for low-light conditions",
    },
    {
      id: "system",
      name: "System",
      icon: Monitor,
      description: "Follow your system preference",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    : "border-transparent text-gray-900 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon
                  className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                    activeTab === tab.id
                      ? "text-primary-500 dark:text-primary-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                  }`}
                />
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
                      Profile Information
                    </h3>

                    <form
                      onSubmit={handleSubmit(onSubmitProfile)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            {...register("name", {
                              required: "Name is required",
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                              },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            value={user?.role || ""}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed capitalize"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            User ID
                          </label>
                          <input
                            type="text"
                            value={user?.id || ""}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordChange(!showPasswordChange)
                          }
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          Change Password
                        </button>
                        <button type="submit" className="btn-primary">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </form>

                    {/* Password Change Section */}
                    <AnimatePresence>
                      {showPasswordChange && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                        >
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                            Change Password
                          </h4>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <button className="btn-primary text-sm">
                              Update Password
                            </button>
                            <button
                              onClick={() => setShowPasswordChange(false)}
                              className="btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
                      Notification Preferences
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Notification Methods
                        </h4>
                        <div className="space-y-4">
                          {[
                            {
                              key: "email",
                              label: "Email notifications",
                              description: "Receive alerts via email",
                            },
                            {
                              key: "push",
                              label: "Push notifications",
                              description: "Browser push notifications",
                            },
                            {
                              key: "desktop",
                              label: "Desktop notifications",
                              description: "System desktop notifications",
                            },
                            {
                              key: "sms",
                              label: "SMS notifications",
                              description: "Text message alerts (urgent only)",
                            },
                          ].map(({ key, label, description }) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {label}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {description}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleNotificationChange(
                                    key,
                                    !notifications[key]
                                  )
                                }
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                  notifications[key]
                                    ? "bg-primary-600"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    notifications[key]
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Alert Preferences
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Urgent alerts only
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Only receive notifications for urgent disasters
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleNotificationChange(
                                  "urgentOnly",
                                  !notifications.urgentOnly
                                )
                              }
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                notifications.urgentOnly
                                  ? "bg-primary-600"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  notifications.urgentOnly
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
                      Appearance Settings
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Theme
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {themeOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleThemeChange(option.id)}
                              className={`relative rounded-lg border p-4 focus:outline-none transition-all ${
                                theme === option.id
                                  ? "border-primary-500 ring-2 ring-primary-500"
                                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                              }`}
                            >
                              <div className="flex items-center">
                                <option.icon className="h-5 w-5 text-gray-400 mr-3" />
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {option.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                              {theme === option.id && (
                                <Check className="absolute top-2 right-2 h-4 w-4 text-primary-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
                      Privacy & Security
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Data Privacy
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex">
                            <Shield className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                Your data is encrypted and stored securely. We
                                follow strict privacy guidelines to protect your
                                information.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Account Security
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Two-factor authentication
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                              Enable
                            </button>
                          </div>

                          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Login activity
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                See when and where your account was accessed
                              </p>
                            </div>
                            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                              View
                            </button>
                          </div>

                          <div className="flex items-center justify-between py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Download your data
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Get a copy of your data
                              </p>
                            </div>
                            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                              Request
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "system" && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-6">
                      System Information
                    </h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Version
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            1.0.0
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Last Updated
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            June 19, 2025
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Environment
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Production
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Region
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Global
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Support
                        </h4>
                        <div className="space-y-3">
                          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 block">
                            Documentation
                          </button>
                          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 block">
                            Contact Support
                          </button>
                          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 block">
                            Report a Bug
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
