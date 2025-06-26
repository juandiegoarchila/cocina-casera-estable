import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', user ? user.email : 'No user');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (process.env.NODE_ENV === 'development') {
        console.log('Login successful:', userCredential.user.email);
      }
      return userCredential;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login failed:', error.message);
      } else {
        console.error('Login failed: An error occurred during authentication');
      }
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};