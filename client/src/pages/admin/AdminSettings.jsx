import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import Swal from 'sweetalert2';
import {
  Settings,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function AdminSettings() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    messenger_url: 'https://m.me/grandhorizonresort',
    zalo_phone: '0901234567',
    zalo_url: 'https://zalo.me/0901234567',
    whatsapp_phone: '+84901234567',
    whatsapp_url: 'https://wa.me/84901234567',
    hotline: '+84 90 123 4567',
    email: 'concierge@grandhorizonresort.com',
    address: '128 Beachfront Blvd, Ao Nang, Krabi, Thailand'
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/contact');
      if (res.data?.success && res.data?.data) {
        setFormData((prev) => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      console.error('Failed to load contact settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto update zalo_url if zalo_phone is typed
      if (name === 'zalo_phone' && value) {
        const cleaned = value.replace(/\D/g, '');
        updated.zalo_url = `https://zalo.me/${cleaned}`;
      }

      // Auto update whatsapp_url if whatsapp_phone is typed
      if (name === 'whatsapp_phone' && value) {
        const cleaned = value.replace(/\D/g, '');
        updated.whatsapp_url = `https://wa.me/${cleaned}`;
      }

      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put('/settings/contact', formData);
      if (res.data?.success) {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
          icon: 'success',
          title: t('adm_set_saved_success') || 'Settings saved successfully!',
          text: t('adm_settings_sub') || 'All contact links and hotel details have been updated.',
          timer: 2200,
          timerProgressBar: true,
          showConfirmButton: false,
          background: isDark ? '#0b1329' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          iconColor: '#10b981',
          customClass: {
            popup: 'rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl font-sans'
          }
        });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.response?.data?.message || 'Could not save settings. Please try again.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">{t('adm_set_saving')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Settings className="w-6 h-6" />
            </span>
            <span>{t('adm_settings_title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t('adm_settings_sub')}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? t('adm_set_saving') : t('adm_set_save_btn')}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Online Chat Channels (Messenger, Zalo, WhatsApp) */}
        <div className="bg-white dark:bg-[#0c1322] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('adm_set_section_chat')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chỉnh sửa link Messenger, Zalo và WhatsApp hiển thị ở nút liên hệ nổi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook Messenger */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>{t('adm_set_messenger')}</span>
                <span className="text-[11px] font-normal text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> https://m.me/yourpage
                </span>
              </label>
              <input
                type="url"
                name="messenger_url"
                value={formData.messenger_url}
                onChange={handleChange}
                placeholder="https://m.me/grandhorizonresort"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Zalo Phone / ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_zalo_phone')}
              </label>
              <input
                type="text"
                name="zalo_phone"
                value={formData.zalo_phone}
                onChange={handleChange}
                placeholder="0901234567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Zalo URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_zalo_url')}
              </label>
              <input
                type="url"
                name="zalo_url"
                value={formData.zalo_url}
                onChange={handleChange}
                placeholder="https://zalo.me/0901234567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* WhatsApp Phone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_whatsapp_phone')}
              </label>
              <input
                type="text"
                name="whatsapp_phone"
                value={formData.whatsapp_phone}
                onChange={handleChange}
                placeholder="+84 90 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* WhatsApp URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('adm_set_whatsapp_url')}
              </label>
              <input
                type="url"
                name="whatsapp_url"
                value={formData.whatsapp_url}
                onChange={handleChange}
                placeholder="https://wa.me/84901234567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Direct Contact & Hotel Info */}
        <div className="bg-white dark:bg-[#0c1322] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('adm_set_section_direct')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hotline, Email và địa chỉ resort hiển thị ở chân trang (Footer)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotline 24/7 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('adm_set_hotline')}</span>
              </label>
              <input
                type="text"
                name="hotline"
                value={formData.hotline}
                onChange={handleChange}
                placeholder="+84 90 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('adm_set_email')}</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="concierge@grandhorizonresort.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('adm_set_address')}</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="128 Beachfront Blvd, Ao Nang, Krabi, Thailand"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? t('adm_set_saving') : t('adm_set_save_btn')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
