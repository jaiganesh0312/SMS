import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is Staff/Teacher and status is PRE_BOARDING, force redirect to offer-letter
    if (user?.staffProfile?.status === 'PRE_BOARDING') {
      if (location.pathname !== '/offer-letter') {
        navigate('/offer-letter');
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-default-50 text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
