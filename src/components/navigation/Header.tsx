
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn = false }) => {
  return (
    <header className="border-b border-gray-200 bg-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-primary-500">EduForge AI</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            {!isLoggedIn ? (
              <>
                <Link to="/about" className="text-gray-600 hover:text-primary-500">
                  About
                </Link>
                <Link to="/features" className="text-gray-600 hover:text-primary-500">
                  Features
                </Link>
                <Link to="/pricing" className="text-gray-600 hover:text-primary-500">
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-500">
                  Dashboard
                </Link>
                <Link to="/projects" className="text-gray-600 hover:text-primary-500">
                  Projects
                </Link>
                <Link to="/help" className="text-gray-600 hover:text-primary-500">
                  Help
                </Link>
              </>
            )}
          </nav>
          
          {!isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <Button asChild variant="ghost">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <Link to="/profile">
              <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                U
              </div>
            </Link>
          )}
        </div>
        
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {!isLoggedIn ? (
                  <>
                    <Link to="/about" className="text-lg font-medium">
                      About
                    </Link>
                    <Link to="/features" className="text-lg font-medium">
                      Features
                    </Link>
                    <Link to="/pricing" className="text-lg font-medium">
                      Pricing
                    </Link>
                    <Link to="/login" className="text-lg font-medium">
                      Log In
                    </Link>
                    <Link to="/register" className="text-lg font-medium">
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="text-lg font-medium">
                      Dashboard
                    </Link>
                    <Link to="/projects" className="text-lg font-medium">
                      Projects
                    </Link>
                    <Link to="/help" className="text-lg font-medium">
                      Help
                    </Link>
                    <Link to="/profile" className="text-lg font-medium">
                      Profile
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
