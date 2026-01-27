'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/components/auth/AuthContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => pathname === path;

  if (!isMounted) {
    return <header className={styles.header}></header>;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <h1 className={styles.title}>Tech Innovation</h1>
        </Link>

        <nav className={styles.nav}>
          {isAuthenticated ? (
            <div className={styles.authenticatedNav}>
              <div className={styles.navLinks}>
                <Link
                  href="/"
                  className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                >
                  Home
                </Link>
                <Link
                  href="/todos"
                  className={`${styles.navLink} ${isActive('/todos') ? styles.active : ''}`}
                >
                  All Todos
                </Link>
                <Link
                  href="/dashboard"
                  className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}
                >
                  Profile
                </Link>
              </div>
              <div className={styles.navActions}>
                <span className={styles.userName}>Hi, {user?.name || user?.email?.split('@')[0]}</span>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.unauthenticatedNav}>
              <Link
                href="/login"
                className={`${styles.navLink} ${isActive('/login') ? styles.active : ''}`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${styles.navLink} ${isActive('/signup') ? styles.active : ''}`}
              >
                Signup
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;