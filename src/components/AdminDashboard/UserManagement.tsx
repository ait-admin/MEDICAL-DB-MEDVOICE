
import React, { useState, useEffect } from 'react';
import './AdminSubComponents.css';

interface User {
  id: number;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/users');
      const data = await response.json();
      if (data.message === 'success') {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (data.message === 'success') {
        alert('User created successfully!');
        setNewUser({ username: '', password: '', role: '' });
        fetchUsers();
      } else {
        alert('Failed to create user: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('An error occurred while creating user.');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch(`https://gangaram-backend.onrender.com/users/${selectedUser.id}` , {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedUser),
      });
      const data = await response.json();
      if (data.message === 'success') {
        alert('User updated successfully!');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert('Failed to update user: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating user.');
    }
  };

  return (
    <div className="sub-component-container">
      <h2>User Management</h2>
      
      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="form-container">
        <h3>Create New User</h3>
        <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
        <input type="text" placeholder="Role" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} required />
        <button type="submit">Create User</button>
      </form>

      {/* Update User Form */}
      {selectedUser && (
        <form onSubmit={handleUpdateUser} className="form-container">
          <h3>Edit User</h3>
          <input type="text" value={selectedUser.username} onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })} required />
          <input type="text" value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })} required />
          <button type="submit">Update User</button>
          <button type="button" onClick={() => setSelectedUser(null)} className="cancel-button">Cancel</button>
        </form>
      )}

      {/* Users Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => setSelectedUser(user)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
