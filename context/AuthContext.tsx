import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role, UserStatus } from '../types';
import { 
    apiLogin, 
    apiRegister, 
    apiUpdateUser, 
    apiDeleteUser, 
    apiFetchUsers,
} from '../services/geminiService';

const SESSION_KEY = 'db_session_user';

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
        // Try to load session from localStorage first
        const sessionUserJson = localStorage.getItem(SESSION_KEY);
        if (sessionUserJson && sessionUserJson !== 'undefined') {
            try {
                setUser(JSON.parse(sessionUserJson));
            } catch (e) {
                console.error("Failed to parse session, clearing.", e);
                localStorage.removeItem(SESSION_KEY);
            }
        }
        
        // Fetch all users for admin dashboard
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    return Promise.resolve();
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
        // Update user in state and session storage
        setUser(returnedUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(returnedUser));
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
