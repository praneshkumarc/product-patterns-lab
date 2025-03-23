
import { useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import CollaborationPanel from "@/components/CollaborationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  const { user, isLoading } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      {!isLoading && !user ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Pranesh1</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Please sign in or create an account to access all features.
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="lg">Create Account</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Dashboard />
          <div className="mt-8">
            <CollaborationPanel />
          </div>
        </>
      )}
    </div>
  );
}
