"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth as useOriginalAuth } from "@/components/contexts/AuthContext";
import { useTasks } from "@/components/contexts/TasksContext";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  taskCount: number;
  completedTasks: number;
  pendingTasks: number;
  importantTasks: number;
  streak: number;
}

export default function ProfilePage() {

  const { user, isLoading, error, logout } = useOriginalAuth();
  const { totalTasks, completedTasks, pendingTasks, importantTasks } = useTasks();

  const [userData, setUserData] = useState<UserData>({
    id: user?.id || "",
    name: user?.name || user?.email?.split("@")[0] || "User",
    email: user?.email || "Not available",
    joinDate: user?.createdAt
      ? (typeof user.createdAt === 'string' )
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown"
      : "Unknown",
    taskCount: totalTasks,
    completedTasks: completedTasks,
    pendingTasks: pendingTasks,
    importantTasks: importantTasks,
    streak: 0,
  });
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserData>(userData);
  const router = useRouter();
  // const theme = useTheme();

  // Update user data when user changes
  useEffect(() => {
    if (user) {
      setUserData((prev) => {
        const formattedJoinDate = user.createdAt
          ? (typeof user.createdAt === 'string' )
            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : prev.joinDate
          : prev.joinDate;

        return {
          ...prev,
          id: user.id || prev.id,
          name: user.name || user.email?.split("@")[0] || prev.name,
          email: user.email || prev.email,
          joinDate: formattedJoinDate,
          taskCount: totalTasks,
          completedTasks: completedTasks,
          pendingTasks: pendingTasks,
          importantTasks: importantTasks,
        };
      });
      setEditData((prev) => {
        const formattedJoinDate = user.createdAt
          ? (typeof user.createdAt === 'string' )
            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : prev.joinDate
          : prev.joinDate;

        return {
          ...prev,
          id: user.id || prev.id,
          name: user.name || user.email?.split("@")[0] || prev.name,
          email: user.email || prev.email,
          joinDate: formattedJoinDate,
          taskCount: totalTasks,
          completedTasks: completedTasks,
          pendingTasks: pendingTasks,
          importantTasks: importantTasks,
        };
      });
    }
  }, [user, totalTasks, completedTasks, pendingTasks, importantTasks]);

  // const handleEditToggle = () => {
  //   setIsEditing(!isEditing);
  //   if (isEditing) {
  //     // Cancel edit - revert changes
  //     setEditData(userData);
  //   } else {
  //     // Start edit - copy current data
  //     setEditData(userData);
  //   }
  // };

  // const handleSave = () => {
  //   setUserData(editData);
  //   setIsEditing(false);

  //   // Save to localStorage
  //   localStorage.setItem("userName", editData.name);
  //   localStorage.setItem("userEmail", editData.email);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Show loading state with skeletons while checking auth
  if (isLoading) {
    return (
      <div className="max-w-300 mx-auto p-6 min-h-[calc(100vh-200px)] bg-[#f8fafc] text-[#1e293b]">
        <div className="text-center mb-8 pb-6 border-b border-[#cbd5e1]">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-80" />
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-8 bg-white flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-4 w-full">
              <Skeleton className="size-20 rounded-full" />
              <div className="text-center">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>

            <div className="flex gap-4 w-full justify-center">
              <Skeleton className="h-10 w-32 mr-2" />
              <Skeleton className="h-10 w-32" />
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
              <div className="p-8">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
            <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
              <div className="p-8">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
            <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
              <div className="p-8">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
            <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
              <div className="p-8">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
            <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
              <div className="p-8">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
            <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
              <div className="p-8">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-white">
            <div className="p-8">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white">
            <div className="p-8">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center p-6 0 border-b border-[#cbd5e1]">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
                <div className="flex justify-between items-center p-6 0 border-b border-[#cbd5e1]">
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <div className="max-w-300 mx-auto p-6 min-h-[calc(100vh-200px)] bg-[#f8fafc] text-[#1e293b]">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Authentication Error
          </h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button className="mt-4 cursor-pointer" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto p-6 min-h-[calc(100vh-200px)]  text-[#1e293b]">
      <div className="text-center mb-8 pb-6 border-b border-[#cbd5e1]">
        <h1 className="text-3xl font-bold text-[#0ea5e9] m-0 mb-2">User Profile</h1>
        <p className="text-lg text-[#64748b] m-0">Manage your account settings</p>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6 sm:p-8 bg-white flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-25 h-25 rounded-full bg-linear-to-br from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center text-3xl font-bold text-white">
              {userData.name.charAt(0)}
            </div>
            <div className="text-center">
              {/* {isEditing ? (
                <Input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleChange}
                  className="p-3 border border-[#cbd5e1] rounded-md bg-[#f8fafc] text-[#1e293b] text-base"
                />
              ) : (
                <h2 className="text-2xl font-bold text-[#1e293b] m-0 mb-2">{userData.name}</h2>
              )} */}
              <h2 className="text-2xl font-bold text-[#1e293b] m-0 mb-2">{userData.name}</h2>
              <p className="text-base text-[#64748b] m-0 break-all">{userData.email}</p>
            </div>
          </div>

          <div className="flex  gap-4 w-full justify-center">
            {/* <Button
              variant={isEditing ? "secondary" : "default"}
              onClick={handleEditToggle}
              className="min-w-[120px] cursor-pointer"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button
                variant="default"
                onClick={handleSave}
                className="min-w-[120px] cursor-pointer"
              >
                Save Changes
              </Button>
            )}
            {!isEditing && (
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Logout
              </Button>
            )} */}
            <Button
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Logout
              </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
            <div className="p-8">
              <h3 className="text-sm text-[#64748b] m-0 mb-3">Account Since</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] m-0">{userData.joinDate}</p>
            </div>
          </Card>
          <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
            <div className="p-8">
              <h3 className="text-sm text-[#64748b] m-0 mb-3">Total Tasks</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] m-0">{userData.taskCount}</p>
            </div>
          </Card>
          <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
            <div className="p-8">
              <h3 className="text-sm text-[#64748b] m-0 mb-3">Completed</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] m-0">{userData.completedTasks}</p>
            </div>
          </Card>
          <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
            <div className="p-8">
              <h3 className="text-sm text-[#64748b] m-0 mb-3">Pending</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] m-0">{userData.pendingTasks}</p>
            </div>
          </Card>
          <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
            <div className="p-8">
              <h3 className="text-sm text-[#64748b] m-0 mb-3">Important</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] m-0">{userData.importantTasks}</p>
            </div>
          </Card>
          <Card className="p-6 text-center bg-linear-to-br from-white to-[#f8fafc]">
            <div className="p-8">
              <h3 className="text-sm text-[#64748b] m-0 mb-3">Day Streak</h3>
              <p className="text-2xl font-bold text-[#0ea5e9] m-0">{userData.streak}</p>
            </div>
          </Card>
        </div>

        <Card className="lg:p-8 bg-white">
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-[#1e293b] m-0 mb-6">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#64748b] font-medium">Full Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="p-3 border border-[#cbd5e1] rounded-md bg-[#f8fafc] text-[#1e293b] text-base"
                  />
                ) : (
                  <p className="text-base text-[#1e293b] m-0">{userData.name}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#64748b] font-medium">Email Address</label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    className="p-3 border border-[#cbd5e1] rounded-md bg-[#f8fafc] text-[#1e293b] text-base"
                  />
                ) : (
                  <p className="text-base text-[#1e293b] m-0 break-all">{userData.email}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#64748b] font-medium">Member Since</label>
                <p className="text-base text-[#1e293b] m-0">{userData.joinDate}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#64748b] font-medium">Account Status</label>
                <span className="inline-block px-2 py-1 rounded-lg text-sm font-medium bg-[#10b981] text-white">
                  Active
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* <Card className="p-8 bg-white">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-[#1e293b] m-0 mb-6">Security</h3>
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center p-6 0 border-b border-[#cbd5e1]">
                <div>
                  <h4 className="text-lg font-semibold text-[#1e293b] m-0 mb-1">Change Password</h4>
                  <p className="text-sm text-[#64748b] m-0">Update your account password</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
              <div className="flex justify-between items-center p-6 0 border-b border-[#cbd5e1]">
                <div>
                  <h4 className="text-lg font-semibold text-[#1e293b] m-0 mb-1">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-[#64748b] m-0">Add extra security to your account</p>
                </div>
                <Button variant="outline">Setup</Button>
              </div>
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
}
