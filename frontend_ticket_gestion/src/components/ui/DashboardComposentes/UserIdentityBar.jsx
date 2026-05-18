'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './UserIdentityBar.css';

export default function UserIdentityBar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'User';
  
  const [currentUser, setCurrentUser] = useState({
    name: username,
    email: '',
    role: '',
    avatar: username[0]?.toUpperCase() || 'U',
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!token) return;

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:2300/api/employees/GetAllEmps`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.data) {
          const user = data.data.find(u => u.id === parseInt(userId) || u.userName === username);
          if (user) {
            setCurrentUser({
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
              avatar: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase(),
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, [username]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
        return;
    }
    
    try {
        const response = await fetch("http://localhost:2300/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        // Clear localStorage regardless of response
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        
        if (response.ok) {
            toast.success('Logged out successfully');
        }
        
        navigate('/');
    } catch (error) {
        localStorage.clear();
        toast.error('Logout failed, but you have been redirected',error);
        navigate('/');
    }
};

  return (
    <div className="user-identity-bar">
      <div
        ref={buttonRef}
        className="user-identity-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-avatar">
          {currentUser.avatar}
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser.name}</div>
          <div className="user-email">{currentUser.email}</div>
        </div>
        {currentUser.role && (
          <div className="role-badge">
            <span className="role-dot"></span>
            <span className="role-text">{currentUser.role}</span>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="dropdown-menu" ref={dropdownRef}>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={() => navigate('/ProfilePage')}>
            <User size={16} />
            Profile
          </button>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item logout" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}