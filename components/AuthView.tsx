
import React, { useState } from 'react';
import { Card, Button } from './ui';
import { User } from '../types';
import { db } from '../database';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const action = isLogin
      ? db.loginUser(email, password)
      : db.registerUser(name, email, password);

    action
      .then(user => {
        onLoginSuccess(user);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const toggleMode = () => {
      setIsLogin(!isLogin);
      setError(null);
      setEmail('');
      setPassword('');
      setName('');
  }

  return (
    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-400 mb-8">
          {isLogin ? 'Log in to continue to RoninRide' : 'Get started with a new account'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
           {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full text-lg" disabled={isLoading}>
            {isLoading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleMode} className="font-semibold text-green-400 hover:text-green-300 ml-2">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </Card>
    </div>
  );
};
