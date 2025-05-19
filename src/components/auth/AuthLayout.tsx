
import React from "react";
import { Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-500">EduForge AI</h1>
          <p className="text-gray-600">Transform your educational content</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
