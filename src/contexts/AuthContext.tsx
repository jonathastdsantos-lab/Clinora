import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { UserProfile, Clinic } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  clinic: Clinic | null;
  loading: boolean;
  login: (email: string, password: string, companyCode: string) => Promise<void>;
  logout: () => Promise<void>;
  createClinic: (name: string, companyCode: string, specialty: Clinic['specialty']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          console.log("Auth state changed. User authenticated:", u.email, u.uid);
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', u.uid));
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
            throw error; // Re-throw to be caught by outer catch
          }
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            console.log("Found user profile:", userData);
            setProfile(userData);
            
            if (userData.clinicId) {
              const clinicDoc = await getDoc(doc(db, 'clinics', userData.clinicId));
              if (clinicDoc.exists()) {
                setClinic({ id: clinicDoc.id, ...clinicDoc.data() } as Clinic);
              }
            }
          } else {
            console.log("No user profile found for", u.email);
            // Auto-setup for dev if missing
            if (u.email === 'jonathastdsantos@gmail.com' || u.email === 'jonathas.tdsantos@gmail.com') {
              console.log("Auto-setting up dev profile...");
              await setupSuperAdmin(u.uid, u.email, 'Sublime');
            } else {
              setProfile(null);
              setClinic(null);
            }
          }
        } catch (error: any) {
          console.error("Auth initialization error detail:", {
            message: error.message,
            code: error.code,
            uid: u.uid,
            email: u.email
          });
        }
      } else {
        setProfile(null);
        setClinic(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string, companyCode: string) => {
    try {
      // 1. Attempt Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const u = userCredential.user;

      // 2. Fetch User Profile to verify Company Code
      const userDoc = await getDoc(doc(db, 'users', u.uid));
      if (!userDoc.exists()) {
        // Special case for the requested Dev user if not exists
        if (email === 'jonathastdsantos@gmail.com' && companyCode === 'Sublime') {
          await setupSuperAdmin(u.uid, email, companyCode);
          return;
        }
        throw new Error('Perfil de usuário não encontrado.');
      }

      const userData = userDoc.data() as UserProfile;
      if (userData.companyCode !== companyCode && !userData.isSuperAdmin) {
        await signOut(auth);
        throw new Error('Código da empresa inválido para este usuário.');
      }

    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('O método de login com e-mail e senha está desativado no Firebase. Por favor, ative-o no Console do Firebase (Authentication > Sign-in method).');
      }
      // Auto-create the requested Dev user if it doesn't exist yet in Auth
      if (email === 'jonathastdsantos@gmail.com' && companyCode === 'Sublime' && error.code === 'auth/user-not-found') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setupSuperAdmin(userCredential.user.uid, email, companyCode);
        return;
      }
      throw error;
    }
  };

  const setupSuperAdmin = async (uid: string, email: string, companyCode: string) => {
    const profileData: UserProfile = {
      uid,
      email,
      clinicId: 'system-admin',
      companyCode: 'Sublime',
      role: 'super-admin',
      isSuperAdmin: true,
      name: 'Desenvolvedor Master',
    };
    await setDoc(doc(db, 'users', uid), profileData);
    setProfile(profileData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const createClinic = async (name: string, companyCode: string, specialty: Clinic['specialty']) => {
    if (!user) return;
    
    // Check if company code is unique
    const q = query(collection(db, 'clinics'), where('companyCode', '==', companyCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error('Este código de empresa já está em uso.');
    }

    // 1. Create Clinic
    const clinicId = `clinic-${Date.now()}`;
    const clinicData: Omit<Clinic, 'id'> = {
      name,
      companyCode,
      ownerId: user.uid,
      specialty,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'clinics', clinicId), clinicData);
    
    // 2. Create User Profile
    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email!,
      clinicId,
      companyCode,
      role: 'admin',
      name: user.displayName || 'Usuário',
    };
    
    await setDoc(doc(db, 'users', user.uid), profileData);
    
    setClinic({ id: clinicId, ...clinicData } as Clinic);
    setProfile(profileData);
  };

  return (
    <AuthContext.Provider value={{ user, profile, clinic, loading, login, logout, createClinic }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
