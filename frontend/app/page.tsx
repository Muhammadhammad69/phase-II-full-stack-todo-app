"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthContext";
import { TasksProvider } from "@/components/features/todo/TasksContext";
import LoggedInHomeView from "@/components/features/todo/LoggedInHomeView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/theme/ThemeProvider";

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900"></div>

      {/* Animated floating shapes */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: Math.random() * 100 + 40,
            height: Math.random() * 100 + 40,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor:
              i % 3 === 0 ? "#0066ff" : i % 3 === 1 ? "#00ffff" : "#8b5cf6",
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 12 + 12,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

// Feature card component with enhanced styling
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="w-full"
    >
      <Card
        className="h-full group hover:transform hover:scale-105 transition-all duration-300 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/30"
      >
        <div className="p-8 flex flex-col items-center text-center h-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-r from-blue-600 to-cyan-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4 bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-slate-300 group-hover:text-white transition-colors duration-300 grow text-lg">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

// Icon components
const SmartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const SyncIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v4" />
    <path d="M12 22v-4" />
    <path d="m4.93 4.93 2.83 2.83" />
    <path d="m16.24 16.24 2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M20 12h-4" />
    <path d="m6.34 17.66-2.83 2.83" />
    <path d="m17.66 6.34-2.83 2.83" />
  </svg>
);

const CollaborationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AuthenticatedHomeContent = () => (
  <TasksProvider>
    <LoggedInHomeView />
  </TasksProvider>
);

export default function HomePage() {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  console.log("HomePage rendered. isAuthenticated:", isAuthenticated);
  if (isAuthenticated) {
    return <AuthenticatedHomeContent />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground />

      {/* Subtle particle effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: Math.random() * 5 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 md:py-24 max-w-7xl relative z-10">
        <div className="min-h-screen flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center space-y-16 md:space-y-20"
          >
            {/* Hero Section - Perfectly Centered */}
            <div className="text-center space-y-8 md:space-y-10 max-w-5xl w-full">
              <motion.div
                className="relative inline-block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight">
                  <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    Tech Innovation
                  </span>
                  <br />
                  <span className="text-white">Todo</span>
                </h1>
                <div className="absolute -top-4 -right-4 w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xl sm:text-2xl">⚡</span>
                </div>
              </motion.div>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your productivity partner for managing tasks efficiently.
                Organize, prioritize, and achieve your goals with our intuitive
                todo application.
              </motion.p>
            </div>

            {/* Stats Section */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex flex-col items-center text-center p-6 md:p-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 hover:border-cyan-500/30 transition-colors duration-300">
                <div className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-3">10K+</div>
                <div className="text-slate-300 text-lg sm:text-xl">Active Users</div>
              </div>
              <div className="flex flex-col items-center text-center p-6 md:p-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 hover:border-cyan-500/30 transition-colors duration-300">
                <div className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-3">500K+</div>
                <div className="text-slate-300 text-lg sm:text-xl">Tasks Completed</div>
              </div>
              <div className="flex flex-col items-center text-center p-6 md:p-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 hover:border-cyan-500/30 transition-colors duration-300">
                <div className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-3">99.9%</div>
                <div className="text-slate-300 text-lg sm:text-xl">Uptime</div>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-7xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <FeatureCard
                icon={<SmartIcon />}
                title="Smart Organization"
                description="Organize your tasks with priorities and categories"
                delay={0.8}
              />
              <FeatureCard
                icon={<SyncIcon />}
                title="Real-time Sync"
                description="Access your tasks from anywhere, anytime"
                delay={0.9}
              />
              <FeatureCard
                icon={<CollaborationIcon />}
                title="Team Collaboration"
                description="Share tasks with your team members"
                delay={1.0}
              />
            </motion.div>

            {/* CTA Section - with proper separation */}
            <motion.div
              className="flex flex-col sm:flex-row gap-8 md:gap-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Link href="/login">
                <Button
                  variant="default"
                  size="lg"
                  className="px-12 sm:px-16 py-4 md:py-5 text-lg sm:text-xl font-semibold bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 border border-blue-500/30 min-w-60"
                >
                  Sign In to Your Account
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-12 sm:px-16 py-4 md:py-5 text-lg sm:text-xl font-semibold border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:text-white transition-all duration-300 transform hover:-translate-y-1 min-w-60"
                >
                  Create New Account
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-slate-900/90 to-transparent pointer-events-none"></div>
    </div>
  );
}
