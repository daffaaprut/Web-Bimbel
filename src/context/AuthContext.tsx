"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "@/lib/types";

interface AuthContextType {
  currentUser: UserSession | null;
  usersList: UserSession[];
  isLoading: boolean;
  loginAs: (user: UserSession) => void;
  logout: () => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [usersList, setUsersList] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsersList(json.data);

        // Check stored user in localStorage
        const stored = localStorage.getItem("bimbel_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const found = json.data.find((u: UserSession) => u.id === parsed.id);
            if (found) {
              setCurrentUser(found);
              setIsLoading(false);
              return;
            }
          } catch (e) {}
        }

        // Default to student Ahmad Rizky if available, otherwise first user
        const defaultStudent =
          json.data.find((u: UserSession) => u.email === "ahmad@siswa.id") ||
          json.data[0];
        if (defaultStudent) {
          setCurrentUser(defaultStudent);
          localStorage.setItem("bimbel_user", JSON.stringify(defaultStudent));
        }
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const loginAs = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem("bimbel_user", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("bimbel_user");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isLoading,
        loginAs,
        logout,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
