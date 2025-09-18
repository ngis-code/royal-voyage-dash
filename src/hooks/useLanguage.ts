import { useState, useCallback } from 'react';

export type SupportedLanguage = {
  code: string;
  name: string;
  flag: string;
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'fr-FR', name: 'Français (FR)', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'es-ES', name: 'Español (ES)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Español (MX)', flag: '🇲🇽' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'de-DE', name: 'Deutsch (DE)', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'it-IT', name: 'Italiano (IT)', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'pt-PT', name: 'Português (PT)', flag: '🇵🇹' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
];

export const useLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const changeLanguage = useCallback((languageCode: string) => {
    setSelectedLanguage(languageCode);
  }, []);

  const getAvailableLanguages = useCallback((items: Array<{ Locale: string }>) => {
    const availableLocales = [...new Set(items.map(item => item.Locale))];
    return SUPPORTED_LANGUAGES.filter(lang => availableLocales.includes(lang.code));
  }, []);

  const getLocalizedContent = useCallback(<T extends { Locale: string; Text: string }>(
    items: T[],
    fallbackLanguage = 'en'
  ): T | null => {
    // Try exact match first
    let content = items.find(item => item.Locale === selectedLanguage);
    
    // Try base language (e.g., 'en' for 'en-US')
    if (!content && selectedLanguage.includes('-')) {
      const baseLanguage = selectedLanguage.split('-')[0];
      content = items.find(item => item.Locale === baseLanguage);
    }
    
    // Try fallback language
    if (!content) {
      content = items.find(item => item.Locale === fallbackLanguage || item.Locale.startsWith(fallbackLanguage));
    }
    
    // Return first available if nothing else works
    return content || items[0] || null;
  }, [selectedLanguage]);

  return {
    selectedLanguage,
    changeLanguage,
    getAvailableLanguages,
    getLocalizedContent,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};