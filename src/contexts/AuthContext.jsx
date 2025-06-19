import React, { createContext, useContext, useReducer, useEffect } from "react";
import api from "../services/api";

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
        // Set the token in API headers
        api.defaults.headers.common["x-user-id"] = userId;

        // Mock user data based on stored userId
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
        };

        const user = mockUsers[userId] || mockUsers["citizen1"];

        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user, token },
        });
      } else {
        dispatch({ type: "AUTH_ERROR" });
      }
    };

    initAuth();
  }, []);

  const login = async (userId, password) => {
    dispatch({ type: "AUTH_START" });

    try {
      // Mock authentication
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
      };

      if (mockUsers[userId] && password === "password") {
        const user = mockUsers[userId];
        const token = `mock_token_${userId}`;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        api.defaults.headers.common["x-user-id"] = userId;

        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user, token },
        });

        return { success: true };
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
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
