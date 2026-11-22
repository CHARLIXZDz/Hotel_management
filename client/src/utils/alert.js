import Swal from 'sweetalert2';

// Helper to determine if dark mode is active
const isDarkMode = () => {
  return document.documentElement.classList.contains('dark');
};

// 1. Toast Notification for Login Success (or standard sleek popup)
export const notifyLoginSuccess = (t, userName = '') => {
  const isDark = isDarkMode();
  const title = t ? t('swal_login_success_title') : 'Login Successful!';
  const message = userName
    ? `${userName} - ${t ? t('swal_login_success_text') : 'Welcome back to Grand Horizon'}`
    : (t ? t('swal_login_success_text') : 'Welcome back to Grand Horizon Resort');

  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    timer: 2200,
    timerProgressBar: true,
    showConfirmButton: false,
    background: isDark ? '#0b1329' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    iconColor: '#10b981',
    customClass: {
      popup: 'rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl font-sans',
      timerProgressBar: 'bg-emerald-500'
    }
  });
};

// 2. Confirm Logout Dialog (Returns boolean: true if confirmed, false if cancelled)
export const confirmLogout = async (t) => {
  const isDark = isDarkMode();
  const title = t ? t('swal_logout_confirm_title') : 'Confirm Logout?';
  const text = t ? t('swal_logout_confirm_text') : 'Are you sure you want to sign out?';
  const confirmText = t ? t('swal_logout_confirm_btn') : 'Yes, Sign Out';
  const cancelText = t ? t('swal_logout_cancel_btn') : 'Cancel';

  const result = await Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonColor: '#e11d48', // rose-600
    cancelButtonColor: '#64748b',  // slate-500
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    background: isDark ? '#0b1329' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    iconColor: '#f59e0b',
    customClass: {
      popup: 'rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm shadow-md transition hover:scale-105',
      cancelButton: 'rounded-xl px-5 py-2.5 font-semibold text-sm shadow-md transition hover:scale-105'
    }
  });

  return result.isConfirmed;
};

// 3. Notification for Logout Success
export const notifyLogoutSuccess = (t) => {
  const isDark = isDarkMode();
  const title = t ? t('swal_logout_success_title') : 'Logged Out';
  const text = t ? t('swal_logout_success_text') : 'See you next time!';

  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
    background: isDark ? '#0b1329' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    iconColor: '#0ea5e9',
    customClass: {
      popup: 'rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl font-sans',
      timerProgressBar: 'bg-sky-500'
    }
  });
};

// 4. Notification for Registration Success
export const notifyRegisterSuccess = (t) => {
  const isDark = isDarkMode();
  return Swal.fire({
    icon: 'success',
    title: t ? t('swal_register_success_title') : 'Registration Successful!',
    text: t ? t('swal_register_success_text') : 'Account created successfully. Please sign in.',
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    background: isDark ? '#0b1329' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    iconColor: '#10b981',
    customClass: {
      popup: 'rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl font-sans'
    }
  });
};

export default {
  notifyLoginSuccess,
  confirmLogout,
  notifyLogoutSuccess,
  notifyRegisterSuccess
};
