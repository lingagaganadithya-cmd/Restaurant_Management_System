import { useEffect, useState } from 'react';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
      } catch (error) {
        console.error('Unable to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="container section-spacing loading-box">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="container section-spacing empty-box">Profile not available.</div>;
  }

  return (
    <div className="container section-spacing">
      <div className="section-header">
        <span className="eyebrow">Your Account</span>
        <h2>Profile</h2>
      </div>

      <div className="profile-card">
        <h3>{profile.name}</h3>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Delivery address:</strong> {profile.address || 'Not saved yet'}</p>
        <p><strong>Role:</strong> {profile.role}</p>
      </div>
    </div>
  );
};

export default Profile;
