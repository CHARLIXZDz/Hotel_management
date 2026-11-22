import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Users
} from 'lucide-react';

export default function AdminRooms() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_night: '',
    capacity: 2,
    bed_type: 'King Bed',
    size_sqm: 35,
    total_rooms: 5,
    amenities: 'Free High-Speed Wi-Fi, Air Conditioning, Smart TV, Mini Bar',
    images: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms');
      if (res.data?.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      description: '',
      price_per_night: '',
      capacity: 2,
      bed_type: 'King Bed',
      size_sqm: 35,
      total_rooms: 5,
      amenities: 'Free High-Speed Wi-Fi, Air Conditioning, Smart TV, Mini Bar',
      images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      bed_type: room.bed_type || 'King Bed',
      size_sqm: room.size_sqm || 35,
      total_rooms: room.total_rooms,
      amenities: (room.amenities || []).join(', '),
      images: (room.images || []).join('\n')
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      const amenitiesArr = formData.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const imagesArr = formData.images
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        description: formData.description,
        price_per_night: parseFloat(formData.price_per_night),
        capacity: parseInt(formData.capacity, 10),
        bed_type: formData.bed_type,
        size_sqm: parseInt(formData.size_sqm, 10),
        total_rooms: parseInt(formData.total_rooms, 10),
        amenities: amenitiesArr,
        images: imagesArr
      };

      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }

      setModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error('Save room error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save room.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;

    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete room.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('adm_rooms_title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('adm_rooms_sub')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('adm_btn_add_room')}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading rooms...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between transition"
            >
              <div>
                <img
                  src={r.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                  alt={r.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{r.name}</h3>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      ฿{Number(r.price_per_night).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {r.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {r.capacity} {t('search_guests')}
                    </span>
                    <span>•</span>
                    <span>{r.bed_type}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{r.total_rooms} {t('detail_room_unit')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(r)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(r.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingRoom ? 'Edit Room Type' : t('adm_btn_add_room')}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Deluxe Ocean View Villa"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Room features, view, details..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price per night (THB) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Rooms *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.total_rooms}
                    onChange={(e) => setFormData({ ...formData, total_rooms: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Size (sq.m.)</label>
                  <input
                    type="number"
                    min={10}
                    value={formData.size_sqm}
                    onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bed Type</label>
                  <input
                    type="text"
                    value={formData.bed_type}
                    onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Free Wi-Fi, Jacuzzi, Balcony, Mini Bar"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URLs (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
