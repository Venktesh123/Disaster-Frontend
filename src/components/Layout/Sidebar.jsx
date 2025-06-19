import React from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location.pathname === "/",
    },
    {
      name: "Disasters",
      href: "/disasters",
      icon: AlertTriangle,
      current: location.pathname.startsWith("/disasters"),
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      current: location.pathname === "/reports",
    },
    {
      name: "Resources",
      href: "/resources",
      icon: MapPin,
      current: location.pathname === "/resources",
    },
    {
      name: "Social Media",
      href: "/social-media",
      icon: MessageSquare,
      current: location.pathname === "/social-media",
    },
  ];

  // Add admin-only routes
  if (user?.role === "admin" || user?.role === "contributor") {
    navigation.push({
      name: "Verification",
      href: "/verification",
      icon: ShieldCheck,
      current: location.pathname === "/verification",
    });
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const linkVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/50 text-primary-900 dark:text-primary-100 border-r-2 border-primary-500"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <motion.div
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center w-full"
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        item.current
                          ? "text-primary-500"
                          : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                      }`}
                    />
                    {item.name}
                  </motion.div>
                </NavLink>
              ))}
            </nav>

            {/* User info at bottom */}
            <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900/50 text-primary-900 dark:text-primary-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex items-center w-full"
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      item.current
                        ? "text-primary-500"
                        : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                    }`}
                  />
                  {item.name}
                </motion.div>
              </NavLink>
            ))}
          </nav>

          {/* User info at bottom */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-medium">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
