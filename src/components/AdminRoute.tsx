import React from 'react';
import { Navigate } from 'react-router-dom';
import { getClient } from '../services/authService';

export const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const client = getClient();
  if (!client || client.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default AdminRoute;
