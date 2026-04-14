import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Login: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="max-w-md w-full shadow-xl border-none">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-8 shadow-lg shadow-blue-200">
            B
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">BitrixClone</h1>
          <p className="text-slate-500 mb-10">The all-in-one collaborative CRM for modern teams.</p>
          
          <div className="space-y-4">
            <Button 
              onClick={signIn} 
              className="w-full h-12 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 font-semibold shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </Button>
            <p className="text-xs text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
