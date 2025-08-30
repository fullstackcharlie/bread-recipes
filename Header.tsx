import React from 'react';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md border-b-2 border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-800 tracking-tight">
          Bread Calculator
        </h1>
        <div>
           {user ? (
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-3">
                 <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                 <div>
                   <p className="text-sm font-medium text-gray-900">{user.name}</p>
                   <p className="text-xs text-gray-500">{user.email}</p>
                 </div>
               </div>
               <button 
                 onClick={onLogout}
                 className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
               >
                 Logout
               </button>
             </div>
           ) : (
            <div id="google-signin-button"></div>
           )}
        </div>
      </div>
    </header>
  );
};