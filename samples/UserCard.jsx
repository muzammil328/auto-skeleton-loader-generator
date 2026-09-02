import React from 'react';

export default function UserCard({ user }) {
  return (
    <div className="user-card">
      <img className="avatar rounded-full" src={user.avatar} alt={user.name} />
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <span className="short">{user.role}</span>
      </div>
      <button>View Profile</button>
    </div>
  );
}
