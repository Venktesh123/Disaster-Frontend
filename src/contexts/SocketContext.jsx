import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const connectSocket = () => {
    if (socket?.connected) return;

    // Use the same base URL as the API but for socket connection
    const socketUrl = "https://disaster-1.onrender.com";

    const socketInstance = io(socketUrl, {
      auth: {
        userId: user?.id,
        token: localStorage.getItem("token"),
      },
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join general updates room
      socketInstance.emit("join_general");

      toast.success("Connected to real-time updates", {
        duration: 2000,
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect") {
        // The disconnection was initiated by the server, reconnect manually
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        toast.error(
          `Connection lost. Retrying... (${reconnectAttempts.current}/${maxReconnectAttempts})`,
          { duration: 3000 }
        );
      } else {
        toast.error(
          "Unable to connect to real-time updates. You can still use the app but won't receive live notifications.",
          {
            duration: 5000,
          }
        );
      }
    });

    socketInstance.on("connected", (data) => {
      console.log("Socket confirmation:", data);
    });

    // Real-time event handlers based on API documentation
    socketInstance.on("disaster_updated", (data) => {
      console.log("Disaster updated:", data);

      const messages = {
        create: "New disaster reported",
        update: "Disaster information updated",
        delete: "Disaster removed",
      };

      const message = messages[data.type] || "Disaster updated";

      if (data.type === "create") {
        toast.error(`🚨 ${message}: ${data.data?.title || "Unknown"}`, {
          duration: 6000,
        });
      } else {
        toast.success(message, {
          duration: 4000,
        });
      }
    });

    socketInstance.on("social_media_updated", (data) => {
      console.log("Social media updated:", data);

      const urgentPosts = data.posts?.filter(
        (post) => post.priority === "urgent"
      );

      if (urgentPosts?.length > 0) {
        toast.error(
          `🚨 ${urgentPosts.length} urgent social media alerts detected!`,
          {
            duration: 8000,
          }
        );
      } else if (data.posts?.length > 0) {
        toast.success(`${data.posts.length} new social media posts detected`, {
          duration: 3000,
        });
      }
    });

    socketInstance.on("resources_updated", (data) => {
      console.log("Resources updated:", data);

      const messages = {
        create: "New resource added",
        update: "Resource information updated",
        delete: "Resource removed",
      };

      const message = messages[data.type] || "Resources updated";
      toast.success(`${message}: ${data.data?.name || "Unknown resource"}`, {
        duration: 4000,
      });
    });

    socketInstance.on("report_verified", (data) => {
      console.log("Report verified:", data);

      if (data.status === "verified") {
        toast.success("Report has been verified", {
          duration: 4000,
        });
      } else if (data.status === "flagged") {
        toast.error("Report has been flagged for review", {
          duration: 4000,
        });
      }
    });

    socketInstance.on("user_count", (count) => {
      setOnlineUsers(count);
    });

    // Handle urgent notifications
    socketInstance.on("urgent_notification", (data) => {
      toast.error(`🚨 URGENT: ${data.message}`, {
        duration: 10000,
      });
    });

    setSocket(socketInstance);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(0);
    }
  };

  const joinDisasterRoom = (disasterId) => {
    if (socket && isConnected && disasterId) {
      socket.emit("join_disaster", disasterId);
      console.log(`Joined disaster room: ${disasterId}`);
    }
  };

  const leaveDisasterRoom = (disasterId) => {
    if (socket && isConnected && disasterId) {
      socket.emit("leave_disaster", disasterId);
      console.log(`Left disaster room: ${disasterId}`);
    }
  };

  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", eventName);
    }
  };

  const onEvent = (eventName, callback) => {
    if (socket) {
      socket.on(eventName, callback);
      return () => socket.off(eventName, callback);
    }
    return () => {};
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinDisasterRoom,
    leaveDisasterRoom,
    emitEvent,
    onEvent,
    connectSocket,
    disconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
