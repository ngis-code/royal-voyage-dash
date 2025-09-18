import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { login, generateDeviceId } from "@/services/authApi";
import { LogIn, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [apikeyUserId, setApikeyUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apikeyUserId.trim() || !password.trim()) {
      toast({
        title: "Missing credentials",
        description: "Please enter both user ID and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const deviceId = generateDeviceId();
      await login({
        apikeyUserId: `api_keys:${apikeyUserId.trim()}`,
        password: password.trim(),
        deviceId,
      });

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });

      // Refresh auth status and redirect to dashboard
      await checkAuth();
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please check your user ID and password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogIn className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the IPTV Control Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="your-user-id"
                value={apikeyUserId}
                onChange={(e) => setApikeyUserId(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/password-reset")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot your password? Reset it here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;