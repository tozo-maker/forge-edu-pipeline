
import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import Header from "@/components/navigation/Header";

const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AuthLayout />
      </main>
    </div>
  );
};

export default Register;
