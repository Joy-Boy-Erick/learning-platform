
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
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (name: string, email: string, role: Role, password: string) => Promise<User>;
  updateUser: (updatedUser: User) => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const sessionUser = await apiGetSession();
        if (sessionUser) {
          setUser(sessionUser);
        }
        const allUsers = await apiFetchUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to load initial auth data", error);
        // On failure, still stop loading to not block the app
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
        await apiLogout();
    } catch (error) {
        console.error("API logout failed:", error);
        // We still want to log out the user on the client side.
        // Re-throw the error so the UI can be aware of the failure.
        throw error;
    } finally {
        // This ensures the user is logged out on the client-side
        // regardless of whether the API call succeeded or failed.
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
    <AuthContext.Provider value={{ user, users, isAuthLoading, login, logout, register, updateUser, updateUserStatus, updateUserRole, deleteUser }}>
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
