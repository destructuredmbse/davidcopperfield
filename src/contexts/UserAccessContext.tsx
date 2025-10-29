"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface UserAccessContextType {
  rba: string[];
  isLoading: boolean;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

const UserAccessContext = createContext<UserAccessContextType | null>(null);

interface UserAccessProviderProps {
  children: ReactNode;
}

export function UserAccessProvider({ children }: UserAccessProviderProps) {
  const { data: session, status } = useSession();
  
  const rba = session?.user?.rba || [];
  const isLoading = status === 'loading';

  // Helper function to check if user has a specific role
  const hasRole = (role: string): boolean => {
    return rba.includes(role);
  };

  // Helper function to check if user is an admin
  const isAdmin = (): boolean => {
    return session?.user.is_admin || false;
  };

  // Helper function to check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => rba.includes(role));
  };

  // Helper function to check if user has all of the specified roles
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => rba.includes(role));
  };

  const value: UserAccessContextType = {
    rba,
    isLoading,
    isAdmin,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };

  return (
    <UserAccessContext.Provider value={value}>
      {children}
    </UserAccessContext.Provider>
  );
}

// Custom hook to use the user access context
export function useUserAccess(): UserAccessContextType {
  const context = useContext(UserAccessContext);
  
  if (!context) {
    throw new Error('useUserAccess must be used within a UserAccessProvider');
  }
  
  return context;
}

// Export the context for advanced use cases
export { UserAccessContext };