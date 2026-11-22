import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext({});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'lo'; // Default to Lao
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key, params = {}) => {
    const langDict = translations[language] || translations.lo || translations.en;
    let text = langDict[key] || translations.en?.[key] || key;

    // Replace dynamic placeholders like {count}, {size}, etc.
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
