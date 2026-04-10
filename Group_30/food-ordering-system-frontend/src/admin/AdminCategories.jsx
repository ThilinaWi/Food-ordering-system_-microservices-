import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Edit } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, { name, description });
        setEditId(null);
      } else {
        await api.post('/categories', { name, description });
      }
      setName(''); setDescription('');
      fetchCategories();
    } catch (err) { alert('Failed to save category'); }
    finally { setLoading(false); }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Manage Categories</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-800">{editId ? 'Edit Category' : 'Add New Category'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder="Category Name (e.g., Pizza)" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200" />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200" />
        </div>
        <div className="flex space-x-2">
          <button disabled={loading} type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700">
            {editId ? 'Update Category' : 'Add Category'}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-400">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xl text-gray-800">{cat.name}</h4>
              <p className="text-gray-500 text-sm mt-1">{cat.description || 'No description'}</p>
            </div>
            <div className="mt-4 flex space-x-2 self-start">
              <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:text-blue-700 font-medium flex items-center p-2 hover:bg-blue-50 rounded">
                <Edit className="w-4 h-4 mr-1" /> Edit
              </button>
              <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 font-medium flex items-center p-2 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500">No categories found.</p>}
      </div>
    </div>
  );
};

export default AdminCategories;
