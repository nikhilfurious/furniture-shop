import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../FirebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { sendAuthRequest } from "../services/authService";


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if(currentUser) {
        await sendAuthRequest();
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
