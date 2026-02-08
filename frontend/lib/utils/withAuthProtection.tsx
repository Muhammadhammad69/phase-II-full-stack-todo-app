// // frontend/lib/utils/withAuthProtection.tsx

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { cookieUtils } from './cookieUtils';

// /**
//  * Higher-order component that protects a component by checking authentication
//  * If user is not authenticated, redirects to login page
//  */
// export function withAuthProtection<T extends Record<string, unknown>>(
//   WrappedComponent: React.ComponentType<T>,
//   redirectPath: string = '/login'
// ) {
//   return function AuthenticatedComponent(props: T) {
//     const router = useRouter();
//     const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

//     useEffect(() => {
//       const checkAuth = async () => {
//         const isAuthenticated = await cookieUtils.verifyAuthToken();
//         if (!isAuthenticated) {
//           router.push(redirectPath);
//         } else {
//           setIsAuthorized(true);
//         }
//       };

//       checkAuth();
//     }, [router]);

//     if (isAuthorized === null) {
//       // Show loading state while checking authentication
//       return (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       );
//     }

//     if (isAuthorized) {
//       return <WrappedComponent {...props} />;
//     }

//     // Return null while redirecting
//     return null;
//   };
// }

// /**
//  * Custom hook to check authentication status
//  * Can be used in individual components to verify authentication
//  */
// export const useAuthCheck = (redirectPath: string = '/login') => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [authenticated, setAuthenticated] = useState(false);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const isAuthenticated = await cookieUtils.verifyAuthToken();
//         if (isAuthenticated) {
//           setAuthenticated(true);
//         } else {
//           router.push(redirectPath);
//         }
//       } catch (error) {
//         console.error('Authentication check failed:', error);
//         router.push(redirectPath);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [router, redirectPath]);

//   return { loading, authenticated };
// };