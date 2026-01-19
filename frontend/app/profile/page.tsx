'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/theme/ThemeProvider';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: 'Hammad Ali',
    email: 'hammad@gmail.com',
    joinDate: 'January 2024',
    taskCount: 42,
    completedTasks: 35,
    streak: 12,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(userData);
  const theme = useTheme();

  useEffect(() => {
    // Load user data from localStorage if available
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');

    if (storedName || storedEmail) {
      setUserData(prev => ({
        ...prev,
        name: storedName || prev.name,
        email: storedEmail || prev.email,
      }));
      setEditData(prev => ({
        ...prev,
        name: storedName || prev.name,
        email: storedEmail || prev.email,
      }));
    }
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Cancel edit - revert changes
      setEditData(userData);
    } else {
      // Start edit - copy current data
      setEditData(userData);
    }
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);

    // Save to localStorage
    localStorage.setItem('userName', editData.name);
    localStorage.setItem('userEmail', editData.email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>User Profile</h1>
        <p className={styles.profileSubtitle}>Manage your account settings</p>
      </div>

      <div className={styles.profileContent}>
        <Card className={styles.profileCard}>
          <div className="p-6">
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {userData.name.charAt(0)}
              </div>
              <div className={styles.userInfo}>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                ) : (
                  <h2 className={styles.userName}>{userData.name}</h2>
                )}
                <p className={styles.userEmail}>{userData.email}</p>
              </div>
            </div>

          <div className={styles.profileActions}>
            <Button
              variant={isEditing ? "secondary" : "default"}
              onClick={handleEditToggle}
              className={styles.editButton}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            {isEditing && (
              <Button
                variant="default"
                onClick={handleSave}
                className={styles.saveButton}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </Card>

        <div className={styles.profileStats}>
          <Card className={styles.statCard}>
            <div className="p-6">
              <h3 className={styles.statTitle}>Account Since</h3>
              <p className={styles.statValue}>{userData.joinDate}</p>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className="p-6">
              <h3 className={styles.statTitle}>Total Tasks</h3>
              <p className={styles.statValue}>{userData.taskCount}</p>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className="p-6">
              <h3 className={styles.statTitle}>Completed</h3>
              <p className={styles.statValue}>{userData.completedTasks}</p>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className="p-6">
              <h3 className={styles.statTitle}>Day Streak</h3>
              <p className={styles.statValue}>{userData.streak}</p>
            </div>
          </Card>
        </div>

        <Card className={styles.profileDetails}>
          <div className="p-6">
            <h3 className={styles.detailsTitle}>Account Information</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Full Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                ) : (
                  <p className={styles.detailValue}>{userData.name}</p>
                )}
              </div>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Email Address</label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                ) : (
                  <p className={styles.detailValue}>{userData.email}</p>
                )}
              </div>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Member Since</label>
                <p className={styles.detailValue}>{userData.joinDate}</p>
              </div>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Account Status</label>
                <span className={`${styles.badge} ${styles.activeBadge}`}>Active</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className={styles.securitySection}>
          <div className="p-6">
            <h3 className={styles.sectionTitle}>Security</h3>
            <div className={styles.securityOptions}>
              <div className={styles.securityOption}>
                <div>
                  <h4 className={styles.optionTitle}>Change Password</h4>
                  <p className={styles.optionDescription}>Update your account password</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
              <div className={styles.securityOption}>
                <div>
                  <h4 className={styles.optionTitle}>Two-Factor Authentication</h4>
                  <p className={styles.optionDescription}>Add extra security to your account</p>
                </div>
                <Button variant="outline">Setup</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}