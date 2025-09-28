
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role, UserStatus } from '../types';
import { 
    apiLogin, 
    apiLogout, 
    apiRegister, 
    apiUpdateUser, 
    apiDeleteUser, 
    apiFetchUsers,
    apiGetSession
} from '../services/geminiService';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, email: string, role: Role, password: string) => Promise<User>;
  updateUser: (updatedUser: User) => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'db_session_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const sessionUser = await apiGetSession(); // Reads from localStorage
        if (sessionUser) {
          setUser(sessionUser);
        }
        const allUsers = await apiFetchUsers();
        setUsers(allUsers);
      } catch (error: any) {
        console.error("Failed to load initial auth data", error);
        setAuthError(error.message || "An unknown error occurred while loading user data.");
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await apiLogin(email, password);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
        await apiLogout();
    } catch (error) {
        console.error("API logout failed:", error);
        throw error;
    } finally {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setUser(null);
    }
  };
  
  const register = async (name: string, email: string, role: Role, password: string) => {
    const newUser = await apiRegister(name, email, role, password);
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };
  
  const updateUser = async (updatedUser: User) => {
    const returnedUser = await apiUpdateUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === returnedUser.id ? returnedUser : u));
    if (user && user.id === returnedUser.id) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(returnedUser));
        setUser(returnedUser);
    }
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
        await updateUser({ ...userToUpdate, status });
    } else {
        throw new Error("User not found to update status.");
    }
  };

  const updateUserRole = async (userId: string, role: Role) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate) {
        await updateUser({ ...userToUpdate, role });
    } else {
        throw new Error("User not found to update role.");
    }
  };

  const deleteUser = async (userId: string) => {
    await apiDeleteUser(userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };


  return (
    <AuthContext.Provider value={{ user, users, isAuthLoading, authError, login, logout, register, updateUser, updateUserStatus, updateUserRole, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};