// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-auto bg-gray-900 text-white relative w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
