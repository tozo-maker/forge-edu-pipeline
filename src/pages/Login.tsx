
import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import Header from "@/components/navigation/Header";
import { Card, CardContent } from "@/components/ui/card";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-primary-500">EduForge AI</h1>
              <p className="text-gray-600">Transform your educational content</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
