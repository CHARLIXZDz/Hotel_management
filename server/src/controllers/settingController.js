const { supabase } = require('../services/supabase');
const fs = require('fs');
const path = require('path');

const FALLBACK_FILE = path.join(__dirname, '../../data/settings.json');

const DEFAULT_CONTACT_SETTINGS = {
  messenger_url: 'https://m.me/grandhorizonresort',
  zalo_phone: '0901234567',
  zalo_url: 'https://zalo.me/0901234567',
  whatsapp_phone: '+84901234567',
  whatsapp_url: 'https://wa.me/84901234567',
  hotline: '+84 90 123 4567',
  email: 'concierge@grandhorizonresort.com',
  address: '128 Beachfront Blvd, Ao Nang, Krabi, Thailand'
};

// Helper to read local fallback
const readLocalFallback = () => {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local settings fallback:', err);
  }
  return DEFAULT_CONTACT_SETTINGS;
};

// Helper to write local fallback
const writeLocalFallback = (settings) => {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local settings fallback:', err);
  }
};

// 1. Get contact settings
exports.getContactSettings = async (req, res) => {
  try {
    // Attempt to query Supabase hotel_settings table
    const { data, error } = await supabase
      .from('hotel_settings')
      .select('value')
      .eq('key', 'contact_info')
      .single();

    if (!error && data?.value) {
      return res.json({
        success: true,
        data: { ...DEFAULT_CONTACT_SETTINGS, ...data.value }
      });
    }

    // Fallback if table doesn't exist or row empty
    const localData = readLocalFallback();
    return res.json({
      success: true,
      data: { ...DEFAULT_CONTACT_SETTINGS, ...localData }
    });
  } catch (err) {
    console.error('getContactSettings error:', err);
    return res.json({
      success: true,
      data: DEFAULT_CONTACT_SETTINGS
    });
  }
};

// 2. Update contact settings (Admin only)
exports.updateContactSettings = async (req, res) => {
  try {
    const {
      messenger_url,
      zalo_phone,
      zalo_url,
      whatsapp_phone,
      whatsapp_url,
      hotline,
      email,
      address
    } = req.body;

    const updatedSettings = {
      messenger_url: messenger_url || DEFAULT_CONTACT_SETTINGS.messenger_url,
      zalo_phone: zalo_phone || '',
      zalo_url: zalo_url || (zalo_phone ? `https://zalo.me/${zalo_phone.replace(/\D/g, '')}` : DEFAULT_CONTACT_SETTINGS.zalo_url),
      whatsapp_phone: whatsapp_phone || '',
      whatsapp_url: whatsapp_url || (whatsapp_phone ? `https://wa.me/${whatsapp_phone.replace(/\D/g, '')}` : DEFAULT_CONTACT_SETTINGS.whatsapp_url),
      hotline: hotline || DEFAULT_CONTACT_SETTINGS.hotline,
      email: email || DEFAULT_CONTACT_SETTINGS.email,
      address: address || DEFAULT_CONTACT_SETTINGS.address
    };

    // Save to local file as immediate persistence
    writeLocalFallback(updatedSettings);

    // Try upserting to Supabase hotel_settings table
    try {
      await supabase
        .from('hotel_settings')
        .upsert(
          { key: 'contact_info', value: updatedSettings, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
    } catch (dbErr) {
      console.warn('Could not upsert to Supabase hotel_settings (using local storage):', dbErr.message);
    }

    return res.json({
      success: true,
      message: 'Contact settings updated successfully',
      data: updatedSettings
    });
  } catch (err) {
    console.error('updateContactSettings error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact settings'
    });
  }
};
