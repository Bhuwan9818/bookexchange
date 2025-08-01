import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditProfileModal from './EditProfileModal';

export default function Profile({ token }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();
    const fetchAllData = useCallback(async () => {
        if (!token) return;
        try {
            const [profileRes] = await Promise.all([
                fetch('http://localhost:5000/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!profileRes.ok ) throw new Error('Failed to fetch profile data');
            const profileData = await profileRes.json();
            setProfile(profileData);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false); 
        }
    }, [token]);

    useEffect(() => {
        if (!token) navigate('/login');
        else fetchAllData();
    }, [token, navigate, fetchAllData]);

    useEffect(() => {
        const handleFocus = () => {
            console.log("Window focused, re-fetching profile data...");
            fetchAllData();
        };

        // Add the event listener
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchAllData]); 
    const handleProfileUpdate = async (updatedData) => {
        try {
            await fetch('http://localhost:5000/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedData)
            });
            toast.success("Profile updated successfully!");
            setIsEditModalOpen(false);
            fetchAllData(); // Re-fetch after an edit
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (loading) return <div className="text-center p-5"><h4>Loading Profile...</h4></div>;
    if (!profile) return <div className="text-center p-5"><h4>Could not load profile.</h4></div>;

    return (
        <>
            <EditProfileModal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={profile}
                onUpdate={handleProfileUpdate}
            />
            <div className="container py-4">
                {/* Profile Info Card */}
                <div className="card card-ui mb-5">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <h2 className="mb-0">My Profile</h2>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsEditModalOpen(true)}>
                                <i className="bi bi-pencil-square me-1"></i> Edit Profile
                            </button>
                        </div>
                        <div className="text-center">
                            <i className="bi bi-person-circle" style={{ fontSize: '6rem', color: '#6c757d' }}></i>
                            <h3 className="card-title mt-3">{profile.username}</h3>
                            <p className="text-muted mb-1">{profile.email}</p>
                            <p className="text-muted">{profile.phone ? `${profile.phone} | ` : ''}{profile.city}, {profile.state}</p>
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}