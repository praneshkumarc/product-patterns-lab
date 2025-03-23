
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <div className="mr-4 font-semibold">
          <Link to="/">Pranesh1</Link>
        </div>
        <div className="hidden md:flex items-center gap-4 md:gap-6 lg:gap-10 flex-1">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isMobile ? 'hidden' : 'inline'}`}>{user.email}</span>
              <Button size={isMobile ? "sm" : "default"} onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button size={isMobile ? "sm" : "default"} variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size={isMobile ? "sm" : "default"}>
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
