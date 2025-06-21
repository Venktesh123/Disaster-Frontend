import React, { createContext, useContext, useReducer, useEffect } from "react";
import api, { healthAPI } from "../services/api";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        try {
          // Test if the API is accessible and the user is valid
          api.defaults.headers.common["x-user-id"] = userId;

          // Try to make a health check to validate the connection
          const healthCheck = await healthAPI.check();

          if (healthCheck.data.status === "OK") {
            // Mock user data based on stored userId (since the API doesn't have user endpoints)
            const mockUsers = {
              netrunnerX: {
                id: "netrunnerX",
                role: "admin",
                name: "Net Runner",
                email: "admin@disaster.com",
              },
              reliefAdmin: {
                id: "reliefAdmin",
                role: "admin",
                name: "Relief Admin",
                email: "relief@disaster.com",
              },
              contributor1: {
                id: "contributor1",
                role: "contributor",
                name: "John Contributor",
                email: "contributor@disaster.com",
              },
              citizen1: {
                id: "citizen1",
                role: "user",
                name: "Jane Citizen",
                email: "citizen@disaster.com",
              },
              anonymous: {
                id: "anonymous",
                role: "user",
                name: "Anonymous User",
                email: "anonymous@disaster.com",
              },
            };

            const user = mockUsers[userId] || mockUsers["anonymous"];

            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user, token },
            });
          } else {
            throw new Error("Health check failed");
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          dispatch({ type: "AUTH_ERROR" });
        }
      } else {
        dispatch({ type: "AUTH_ERROR" });
      }
    };

    initAuth();
  }, []);

  const login = async (userId, password) => {
    dispatch({ type: "AUTH_START" });

    try {
      // Validate available users from API documentation
      const validUsers = [
        "netrunnerX",
        "reliefAdmin",
        "contributor1",
        "citizen1",
        "anonymous",
      ];

      if (!validUsers.includes(userId)) {
        throw new Error("Invalid user ID");
      }

      if (password !== "password") {
        throw new Error("Invalid password");
      }

      // Test API connection
      const healthCheck = await healthAPI.check();
      if (healthCheck.data.status !== "OK") {
        throw new Error("API service unavailable");
      }

      // Mock user data based on API documentation
      const mockUsers = {
        netrunnerX: {
          id: "netrunnerX",
          role: "admin",
          name: "Net Runner",
          email: "admin@disaster.com",
        },
        reliefAdmin: {
          id: "reliefAdmin",
          role: "admin",
          name: "Relief Admin",
          email: "relief@disaster.com",
        },
        contributor1: {
          id: "contributor1",
          role: "contributor",
          name: "John Contributor",
          email: "contributor@disaster.com",
        },
        citizen1: {
          id: "citizen1",
          role: "user",
          name: "Jane Citizen",
          email: "citizen@disaster.com",
        },
        anonymous: {
          id: "anonymous",
          role: "user",
          name: "Anonymous User",
          email: "anonymous@disaster.com",
        },
      };

      const user = mockUsers[userId];
      const token = `disaster_token_${userId}_${Date.now()}`;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      api.defaults.headers.common["x-user-id"] = userId;

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      dispatch({ type: "AUTH_ERROR" });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    delete api.defaults.headers.common["x-user-id"];
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({
      type: "AUTH_SUCCESS",
      payload: { user: { ...state.user, ...userData }, token: state.token },
    });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
