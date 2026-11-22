const { supabaseAdmin } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

const FALLBACK_FILE = path.join(__dirname, '../../data/settings.json');
const BANNERS_FALLBACK_FILE = path.join(__dirname, '../../data/hero_banners.json');

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

const DEFAULT_HERO_BANNERS = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85'
];

// Helper to find the primary admin user ID in Supabase
const getAdminUserId = async () => {
  try {
    const { data: adminProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (adminProfiles && adminProfiles.length > 0) {
      return adminProfiles[0].id;
    }
  } catch (err) {
    console.warn('Could not query admin profile ID:', err.message);
  }
  return null;
};

// Helper to read local fallback
const readLocalFallback = (file, defaultVal) => {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultVal;
};

// Helper to write local fallback
const writeLocalFallback = (file, data) => {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
};

// 1. Get contact settings
exports.getContactSettings = async (req, res) => {
  try {
    // 1. Check Supabase hotel_settings table
    try {
      const { data, error } = await supabaseAdmin
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
    } catch (e) {
      // Table doesn't exist yet, proceed to user metadata
    }

    // 2. Check Supabase Auth user metadata
    const adminId = await getAdminUserId();
    if (adminId) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(adminId);
        if (user?.user_metadata?.contact_info) {
          return res.json({
            success: true,
            data: { ...DEFAULT_CONTACT_SETTINGS, ...user.user_metadata.contact_info }
          });
        }
      } catch (authErr) {
        console.warn('Could not read contact_info from admin user_metadata:', authErr.message);
      }
    }

    // 3. Fallback to local file
    const localData = readLocalFallback(FALLBACK_FILE, DEFAULT_CONTACT_SETTINGS);
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

// 2. Update contact settings
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

    // A. Always save to local file
    writeLocalFallback(FALLBACK_FILE, updatedSettings);

    // B. Save to Supabase Auth metadata for persistent database cloud storage
    const adminId = (req.user && req.user.id) || (await getAdminUserId());
    if (adminId) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(adminId);
        const existingMeta = user?.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(adminId, {
          user_metadata: {
            ...existingMeta,
            contact_info: updatedSettings
          }
        });
      } catch (authErr) {
        console.warn('Could not save to Supabase user_metadata:', authErr.message);
      }
    }

    // C. Try upserting to hotel_settings table if it exists
    try {
      await supabaseAdmin
        .from('hotel_settings')
        .upsert(
          { key: 'contact_info', value: updatedSettings, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
    } catch (dbErr) {
      // Ignore if table does not exist
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

// 3. Get Hero Banners
exports.getHeroBanners = async (req, res) => {
  try {
    // 1. Check Supabase hotel_settings table
    try {
      const { data, error } = await supabaseAdmin
        .from('hotel_settings')
        .select('value')
        .eq('key', 'hero_banners')
        .single();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        return res.json({
          success: true,
          data: data.value
        });
      }
    } catch (e) {
      // Table doesn't exist yet
    }

    // 2. Check Supabase Auth admin user metadata
    const adminId = await getAdminUserId();
    if (adminId) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(adminId);
        if (user?.user_metadata?.hero_banners && Array.isArray(user.user_metadata.hero_banners)) {
          return res.json({
            success: true,
            data: user.user_metadata.hero_banners
          });
        }
      } catch (authErr) {
        console.warn('Could not read hero_banners from admin user_metadata:', authErr.message);
      }
    }

    // 3. Fallback to local file
    const localBanners = readLocalFallback(BANNERS_FALLBACK_FILE, DEFAULT_HERO_BANNERS);
    return res.json({
      success: true,
      data: localBanners
    });
  } catch (err) {
    console.error('getHeroBanners error:', err);
    return res.json({
      success: true,
      data: DEFAULT_HERO_BANNERS
    });
  }
};

// 4. Update Hero Banners
exports.updateHeroBanners = async (req, res) => {
  try {
    const { banners } = req.body;
    if (!banners || !Array.isArray(banners) || banners.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Banners array cannot be empty'
      });
    }

    // A. Save to local file
    writeLocalFallback(BANNERS_FALLBACK_FILE, banners);

    // B. Save to Supabase Auth metadata for persistent database cloud storage
    const adminId = (req.user && req.user.id) || (await getAdminUserId());
    if (adminId) {
      try {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(adminId);
        const existingMeta = user?.user_metadata || {};
        await supabaseAdmin.auth.admin.updateUserById(adminId, {
          user_metadata: {
            ...existingMeta,
            hero_banners: banners
          }
        });
      } catch (authErr) {
        console.warn('Could not save banners to Supabase user_metadata:', authErr.message);
      }
    }

    // C. Try upserting to hotel_settings table if it exists
    try {
      await supabaseAdmin
        .from('hotel_settings')
        .upsert(
          { key: 'hero_banners', value: banners, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
    } catch (dbErr) {
      // Ignore if table does not exist
    }

    return res.json({
      success: true,
      message: 'Hero banners updated successfully',
      data: banners
    });
  } catch (err) {
    console.error('updateHeroBanners error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update hero banners'
    });
  }
};
