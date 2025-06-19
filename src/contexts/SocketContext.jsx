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

    const socketInstance = io("https://disaster-1.onrender.com", {
      auth: {
        userId: user?.id,
      },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join general updates room
      socketInstance.emit("join_general");

      toast.success("Connected to real-time updates");
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        toast.error(
          `Connection lost. Retrying... (${reconnectAttempts.current}/${maxReconnectAttempts})`
        );
      } else {
        toast.error("Unable to connect to real-time updates");
      }
    });

    socketInstance.on("connected", (data) => {
      console.log("Socket confirmation:", data);
    });

    // Real-time event handlers
    socketInstance.on("disaster_updated", (data) => {
      console.log("Disaster updated:", data);

      const messages = {
        create: "New disaster reported",
        update: "Disaster information updated",
        delete: "Disaster removed",
      };

      toast.success(messages[data.type] || "Disaster updated");
    });

    socketInstance.on("social_media_updated", (data) => {
      console.log("Social media updated:", data);

      const urgentPosts = data.posts?.filter(
        (post) => post.priority === "urgent"
      );
      if (urgentPosts?.length > 0) {
        toast.error(`${urgentPosts.length} urgent social media alerts`);
      }
    });

    socketInstance.on("resources_updated", (data) => {
      console.log("Resources updated:", data);

      const messages = {
        create: "New resource added",
        update: "Resource information updated",
        delete: "Resource removed",
      };

      toast.success(messages[data.type] || "Resources updated");
    });

    socketInstance.on("user_count", (count) => {
      setOnlineUsers(count);
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
    if (socket && isConnected) {
      socket.emit("join_disaster", disasterId);
    }
  };

  const leaveDisasterRoom = (disasterId) => {
    if (socket && isConnected) {
      socket.emit("leave_disaster", disasterId);
    }
  };

  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  const onEvent = (eventName, callback) => {
    if (socket) {
      socket.on(eventName, callback);
      return () => socket.off(eventName, callback);
    }
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
