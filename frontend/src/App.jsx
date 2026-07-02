import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';

import ChatbotWidget from './components/ChatbotWidget';

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user } = useAuth();

  if (user) return <Dashboard />;

  if (showForgotPassword)
    return <ForgotPassword switchToLogin={() => setShowForgotPassword(false)} />;

  return isLogin ? (
    <Login
      switchToRegister={() => setIsLogin(false)}
      switchToForgotPassword={() => setShowForgotPassword(true)}
    />
  ) : (
    <Register switchToLogin={() => setIsLogin(true)} />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>

        {/* Custom AI Chatbot Widget */}
        <ChatbotWidget />

        <Routes>
          <Route path="/" element={<AuthApp />} />
          <Route path="/login" element={<AuthApp />} />
          <Route path="/register" element={<AuthApp />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword switchToLogin={() => (window.location.href = '/login')} />}
          />

          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

      </AuthProvider>
    </Router>
  );
}

export default App;
