import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AppointmentPage from './pages/Appointment';
import AIAnalysisPage from './pages/AIAnalysis';
import PricingPage from './pages/Pricing';
import BlogPage from './pages/Blog';
import LoginPage from './pages/Login';
import AdminPage from './pages/Admin';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/ai-checkup" element={<AIAnalysisPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;