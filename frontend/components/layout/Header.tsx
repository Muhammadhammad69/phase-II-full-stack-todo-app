'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/components/contexts/AuthContext';
import styles from './Header.module.css';


import { useIsLgScreen } from '@/hooks/use-lg-screen';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeftIcon } from 'lucide-react';

const Header: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  // const theme = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const isLgScreen = useIsLgScreen();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  if (!isMounted) {
    return <header className={styles.header}></header>;
  }

  // Render the responsive sidebar layout for lg screens and smaller when authenticated
  

  // Traditional header for larger screens or when not authenticated
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <h1 className={styles.title}>Tech Innovation</h1>
        </Link>

        <div className={styles.navContainer}>
          {/* Show mobile menu button on small screens for authenticated users */}
          {isLgScreen && isAuthenticated && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.mobileMenuButton}
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <PanelLeftIcon className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={styles.mobileMenuSheet} >
                <div className={styles.mobileMenuContent}>
                  <div className={styles.mobileMenuHeader}>
                    <Link href="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
                      <h1 className={styles.title}>Tech Innovation</h1>
                    </Link>
                  </div>

                  <nav className={styles.mobileNav}>
                    <div className={styles.navLinks}>
                      <Link
                        href="/"
                        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        href="/todos"
                        className={`${styles.navLink} ${isActive('/todos') ? styles.active : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        All Todos
                      </Link>
                      <Link
                        href="/dashboard"
                        className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </div>

                    <div className={styles.mobileNavActions}>
                      <span className={styles.userName}>Hi, {user?.name || user?.email?.split('@')[0]}</span>
                      <Button
                        variant="secondary"
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                      >
                        Logout
                      </Button>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <nav className={styles.nav}>
          {isAuthenticated ? (
            <div className={styles.authenticatedNav}>
              {/* Hide nav links on small screens */}
              <div className={`${styles.navLinks} ${isLgScreen ? styles.hiddenOnSmall : ''}`}>
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
              <div className={`${styles.navActions} ${isLgScreen ? styles.hiddenOnSmall : ''}`} >
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
        </div> {/* Close navContainer */}
      </div>
    </header>
  );
};

export default Header;