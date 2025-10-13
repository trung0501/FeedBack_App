// import { useContext } from 'react';
// import { AuthContext } from '@/context/AuthContext';

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === null) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// src/hooks/useAuth.ts

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@/context/AuthContext';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}