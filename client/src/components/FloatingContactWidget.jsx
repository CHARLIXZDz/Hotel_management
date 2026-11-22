import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function FloatingContactWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);

  // Dynamic contact configuration loaded from Admin Settings
  const [contactSettings, setContactSettings] = useState({
    messenger_url: 'https://m.me/grandhorizonresort',
    zalo_url: 'https://zalo.me/0901234567',
    whatsapp_url: 'https://wa.me/84901234567?text=Hello%20Grand%20Horizon%20Resort,%20I%20would%20like%20to%20inquire%20about%20booking.',
    hotline: '+84 90 123 4567'
  });

  // Fetch dynamic settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/contact');
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setContactSettings({
            messenger_url: d.messenger_url || 'https://m.me/grandhorizonresort',
            zalo_url: d.zalo_url || (d.zalo_phone ? `https://zalo.me/${d.zalo_phone.replace(/\D/g, '')}` : 'https://zalo.me/0901234567'),
            whatsapp_url: d.whatsapp_url || (d.whatsapp_phone ? `https://wa.me/${d.whatsapp_phone.replace(/\D/g, '')}` : 'https://wa.me/84901234567'),
            hotline: d.hotline || '+84 90 123 4567'
          });
        }
      } catch (err) {
        // Silently use defaults if offline or loading
      }
    };
    fetchSettings();
  }, []);

  // Close widget when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Contact Channels Configuration
  const channels = [
    {
      id: 'messenger',
      name: 'Messenger',
      label: t('contact_messenger'),
      href: contactSettings.messenger_url,
      bgClass: 'bg-gradient-to-tr from-[#0084FF] via-[#0099FF] to-[#00C6FF]',
      shadowClass: 'shadow-[#0084FF]/40',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 28 28">
          <path d="M14 2C7.373 2 2 7.042 2 13.26c0 3.541 1.742 6.697 4.464 8.761V26l3.865-2.124c1.144.316 2.378.484 3.671.484 6.627 0 12-5.042 12-11.26S20.627 2 14 2zm1.436 15.195l-3.08-3.284-6.012 3.284 6.613-7.02 3.15 3.284 5.942-3.284-6.613 7.02z" />
        </svg>
      )
    },
    {
      id: 'zalo',
      name: 'Zalo',
      label: t('contact_zalo'),
      href: contactSettings.zalo_url,
      bgClass: 'bg-[#0068FF]',
      shadowClass: 'shadow-[#0068FF]/40',
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
          {/* White rounded speech bubble with tail */}
          <path
            d="M18 4C9.716 4 3 9.82 3 17c0 4.14 2.213 7.828 5.679 10.26-.25 1.822-1.17 4.402-2.73 6.204a.2.2 0 00.16.336c3.46 0 6.622-1.934 8.41-3.177 1.115.309 2.3.477 3.481.477 8.284 0 15-5.82 15-13S26.284 4 18 4z"
            fill="#FFFFFF"
          />
          {/* Authentic Official Vector Wordmark for Zalo */}
          <g transform="translate(6.5, 4.2) scale(0.96)">
            <path
              fill="#0068FF"
              d="M12.49 10.272v-.45h1.347v6.322h-.77a.576.576 0 0 1-.577-.573v.001a3.27 3.27 0 0 1-1.938.632a3.284 3.284 0 0 1-3.284-3.282a3.284 3.284 0 0 1 3.284-3.282a3.27 3.27 0 0 1 1.937.632zM6.919 7.79v.205c0 .382-.051.694-.3 1.06l-.03.034a8 8 0 0 0-.242.285L2.024 14.8h4.895v.768a.576.576 0 0 1-.577.576H0v-.362c0-.443.11-.641.25-.847L4.858 9.23H.192V7.79zm8.551 8.354a.48.48 0 0 1-.48-.48V7.79h1.441v8.354zM20.693 9.6a3.306 3.306 0 1 1 .002 6.612a3.306 3.306 0 0 1-.002-6.612m-10.14 5.253a1.932 1.932 0 1 0 0-3.863a1.932 1.932 0 0 0 0 3.863m10.14-.003a1.945 1.945 0 1 0 0-3.89a1.945 1.945 0 0 0 0 3.89"
            />
          </g>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      label: t('contact_whatsapp'),
      href: contactSettings.whatsapp_url,
      bgClass: 'bg-[#25D366]',
      shadowClass: 'shadow-[#25D366]/40',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      )
    },
    {
      id: 'hotline',
      name: 'Hotline',
      label: t('contact_hotline'),
      href: `tel:${contactSettings.hotline.replace(/\s+/g, '')}`,
      bgClass: 'bg-amber-500 hover:bg-amber-600',
      shadowClass: 'shadow-amber-500/40',
      icon: <Phone className="w-5 h-5 text-white" />
    }
  ];

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* 1. Expandable Floating Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex flex-col items-end gap-3.5 mb-3.5 pointer-events-auto"
          >
            {channels.map((ch, idx) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 group"
              >
                {/* Tooltip Label */}
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/10 dark:border-slate-800">
                  {ch.label}
                </span>

                {/* Channel Circular Button */}
                <a
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ch.name}
                  className={`w-12 h-12 rounded-full ${ch.bgClass} flex items-center justify-center text-white shadow-lg ${ch.shadowClass} hover:scale-110 active:scale-95 transition-transform duration-200`}
                >
                  {ch.icon}
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Trigger Floating Button with Pulse Effect */}
      <div className="relative pointer-events-auto">
        {!isOpen && (
          <>
            <span className="absolute -inset-1 rounded-full bg-primary-500/40 animate-ping opacity-75"></span>
            <span className="absolute -inset-2 rounded-full bg-primary-400/20 animate-pulse"></span>
          </>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('contact_widget_title')}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-slate-800 text-white rotate-90 scale-100'
              : 'bg-gradient-to-tr from-primary-700 via-primary-600 to-sky-500 text-white hover:scale-105 active:scale-95 shadow-primary-600/50'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white animate-spin-slow" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
