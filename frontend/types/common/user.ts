// types/common/user.ts

export interface User {
  email: string;      // Primary key (matches backend)
  username: string;   // Display name
  createdAt: Date;    // Account creation time
  updatedAt: Date;    // Last update time
}