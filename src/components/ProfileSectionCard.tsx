// ProfileSectionCard.tsx
import React from 'react';
import './ProfileSectionCard.css';

const ProfileSectionCard = ({ title, children }) => {
  return (
    <div className="profile-section-card">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default ProfileSectionCard;
