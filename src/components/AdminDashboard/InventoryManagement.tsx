import React, { useState, useEffect } from 'react';
import './AdminSubComponents.css';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  location: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', location: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/inventory');
      const data = await response.json();
      if (data.message === 'success') {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const data = await response.json();
      if (data.message === 'success') {
        alert('Item added successfully!');
        setNewItem({ name: '', quantity: '', location: '' });
        fetchInventory();
      } else {
        alert('Failed to add item: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('An error occurred while adding item.');
    }
  };

  return (
    <div className="sub-component-container">
      <h2>Inventory Management</h2>

      {/* Create Item Form */}
      <form onSubmit={handleCreateItem} className="form-container">
        <h3>Add New Item</h3>
        <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
        <input type="number" placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} required />
        <input type="text" placeholder="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} required />
        <button type="submit">Add Item</button>
      </form>

      {/* Inventory Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryManagement;