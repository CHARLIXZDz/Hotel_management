import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  BedDouble,
  Users
} from 'lucide-react';

export default function AdminRooms() {
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
      setErrorMsg(err.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('คุณต้องการลบประเภทห้องพักนี้ใช่หรือไม่?')) return;

    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'ไม่สามารถลบห้องพักได้');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            จัดการประเภทห้องพัก
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม ลบ แก้ไขห้องพัก กำหนดราคา ความจุ และจำนวนห้องว่าง
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มประเภทห้องพักใหม่</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">กำลังโหลดรายการห้องพัก...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <img
                  src={r.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                  alt={r.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900">{r.name}</h3>
                    <span className="text-sm font-extrabold text-amber-700 whitespace-nowrap">
                      ฿{Number(r.price_per_night).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {r.description}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {r.capacity} ท่าน
                    </span>
                    <span>•</span>
                    <span>{r.bed_type}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">มีทั้งหมด {r.total_rooms} ห้อง</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(r)}
                  className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition"
                  title="แก้ไข"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(r.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="ลบ"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingRoom ? 'แก้ไขประเภทห้องพัก' : 'เพิ่มประเภทห้องพักใหม่'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อประเภทห้องพัก *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Deluxe Ocean View Villa"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบายห้องพัก</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="รายละเอียดความพิเศษ วิว หรือรูปแบบห้อง..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ราคาต่อคืน (บาท) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนห้องทั้งหมดในโรงแรม *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.total_rooms}
                    onChange={(e) => setFormData({ ...formData, total_rooms: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รองรับ (ท่าน)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ขนาด (ตร.ม.)</label>
                  <input
                    type="number"
                    min={10}
                    value={formData.size_sqm}
                    onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รูปแบบเตียง</label>
                  <input
                    type="text"
                    value={formData.bed_type}
                    onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สิ่งอำนวยความสะดวก (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Free Wi-Fi, Jacuzzi, Balcony, Mini Bar"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ลิงก์รูปภาพห้องพัก (1 บรรทัดต่อ 1 URL)
                </label>
                <textarea
                  rows={3}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
