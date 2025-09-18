import { useState, useCallback } from 'react';

export type SupportedLanguage = {
  code: string;
  name: string;
  flag: string;
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  // English variants
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺' },
  { code: 'en-CA', name: 'English (Canada)', flag: '🇨🇦' },
  { code: 'en-IE', name: 'English (Ireland)', flag: '🇮🇪' },
  { code: 'en-NZ', name: 'English (New Zealand)', flag: '🇳🇿' },
  { code: 'en-ZA', name: 'English (South Africa)', flag: '🇿🇦' },
  
  // French variants
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
  { code: 'fr-CA', name: 'Français (Canada)', flag: '🇨🇦' },
  { code: 'fr-BE', name: 'Français (Belgique)', flag: '🇧🇪' },
  { code: 'fr-CH', name: 'Français (Suisse)', flag: '🇨🇭' },
  
  // Spanish variants
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'es-AR', name: 'Español (Argentina)', flag: '🇦🇷' },
  { code: 'es-CO', name: 'Español (Colombia)', flag: '🇨🇴' },
  { code: 'es-CL', name: 'Español (Chile)', flag: '🇨🇱' },
  { code: 'es-PE', name: 'Español (Perú)', flag: '🇵🇪' },
  { code: 'es-VE', name: 'Español (Venezuela)', flag: '🇻🇪' },
  { code: 'es-US', name: 'Español (Estados Unidos)', flag: '🇺🇸' },
  
  // Portuguese variants
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  
  // German variants
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
  { code: 'de-AT', name: 'Deutsch (Österreich)', flag: '🇦🇹' },
  { code: 'de-CH', name: 'Deutsch (Schweiz)', flag: '🇨🇭' },
  
  // Italian variants
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'it-IT', name: 'Italiano (Italia)', flag: '🇮🇹' },
  { code: 'it-CH', name: 'Italiano (Svizzera)', flag: '🇨🇭' },
  
  // Chinese variants
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'zh-HK', name: '中文 (香港)', flag: '🇭🇰' },
  { code: 'zh-SG', name: '中文 (新加坡)', flag: '🇸🇬' },
  
  // Japanese variants
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ja-JP', name: '日本語 (日本)', flag: '🇯🇵' },
  
  // Korean variants
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ko-KR', name: '한국어 (대한민국)', flag: '🇰🇷' },
  
  // Arabic variants
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦' },
  { code: 'ar-EG', name: 'العربية (مصر)', flag: '🇪🇬' },
  { code: 'ar-AE', name: 'العربية (الإمارات)', flag: '🇦🇪' },
  { code: 'ar-MA', name: 'العربية (المغرب)', flag: '🇲🇦' },
  { code: 'ar-DZ', name: 'العربية (الجزائر)', flag: '🇩🇿' },
  { code: 'ar-TN', name: 'العربية (تونس)', flag: '🇹🇳' },
  { code: 'ar-LY', name: 'العربية (ليبيا)', flag: '🇱🇾' },
  { code: 'ar-SD', name: 'العربية (السودان)', flag: '🇸🇩' },
  { code: 'ar-IQ', name: 'العربية (العراق)', flag: '🇮🇶' },
  { code: 'ar-SY', name: 'العربية (سوريا)', flag: '🇸🇾' },
  { code: 'ar-JO', name: 'العربية (الأردن)', flag: '🇯🇴' },
  { code: 'ar-LB', name: 'العربية (لبنان)', flag: '🇱🇧' },
  { code: 'ar-PS', name: 'العربية (فلسطين)', flag: '🇵🇸' },
  { code: 'ar-KW', name: 'العربية (الكويت)', flag: '🇰🇼' },
  { code: 'ar-BH', name: 'العربية (البحرين)', flag: '🇧🇭' },
  { code: 'ar-QA', name: 'العربية (قطر)', flag: '🇶🇦' },
  { code: 'ar-OM', name: 'العربية (عمان)', flag: '🇴🇲' },
  { code: 'ar-YE', name: 'العربية (اليمن)', flag: '🇾🇪' },
  
  // Russian variants
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ru-RU', name: 'Русский (Россия)', flag: '🇷🇺' },
  
  // Dutch variants
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'nl-NL', name: 'Nederlands (Nederland)', flag: '🇳🇱' },
  { code: 'nl-BE', name: 'Nederlands (België)', flag: '🇧🇪' },
  
  // Scandinavian languages
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'sv-SE', name: 'Svenska (Sverige)', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'nb', name: 'Norsk Bokmål', flag: '🇳🇴' },
  { code: 'nb-NO', name: 'Norsk Bokmål (Norge)', flag: '🇳🇴' },
  { code: 'nn', name: 'Norsk Nynorsk', flag: '🇳🇴' },
  { code: 'nn-NO', name: 'Norsk Nynorsk (Norge)', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'da-DK', name: 'Dansk (Danmark)', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'fi-FI', name: 'Suomi (Suomi)', flag: '🇫🇮' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'is-IS', name: 'Íslenska (Ísland)', flag: '🇮🇸' },
  
  // Eastern European languages
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pl-PL', name: 'Polski (Polska)', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'cs-CZ', name: 'Čeština (Česko)', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sk-SK', name: 'Slovenčina (Slovensko)', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'hu-HU', name: 'Magyar (Magyarország)', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'ro-RO', name: 'Română (România)', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'bg-BG', name: 'Български (България)', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'hr-HR', name: 'Hrvatski (Hrvatska)', flag: '🇭🇷' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sr-RS', name: 'Српски (Србија)', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sl-SI', name: 'Slovenščina (Slovenija)', flag: '🇸🇮' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'uk-UA', name: 'Українська (Україна)', flag: '🇺🇦' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾' },
  { code: 'be-BY', name: 'Беларуская (Беларусь)', flag: '🇧🇾' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'lt-LT', name: 'Lietuvių (Lietuva)', flag: '🇱🇹' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lv-LV', name: 'Latviešu (Latvija)', flag: '🇱🇻' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'et-EE', name: 'Eesti (Eesti)', flag: '🇪🇪' },
  
  // Other European languages
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'el-GR', name: 'Ελληνικά (Ελλάδα)', flag: '🇬🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'tr-TR', name: 'Türkçe (Türkiye)', flag: '🇹🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'he-IL', name: 'עברית (ישראל)', flag: '🇮🇱' },
  
  // South Asian languages
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'हिन्दी (भारत)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'bn-BD', name: 'বাংলা (বাংলাদেশ)', flag: '🇧🇩' },
  { code: 'bn-IN', name: 'বাংলা (ভারত)', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ur-PK', name: 'اردو (پاکستان)', flag: '🇵🇰' },
  { code: 'ur-IN', name: 'اردو (ہندوستان)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'தமிழ் (இந்தியா)', flag: '🇮🇳' },
  { code: 'ta-LK', name: 'தமிழ் (இலங்கை)', flag: '🇱🇰' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'te-IN', name: 'తెలుగు (భారత్)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'मराठी (भारत)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'ગુજરાતી (ભારત)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (ಭಾರತ)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'മലയാളം (ഇന്ത്യ)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (ਭਾਰਤ)', flag: '🇮🇳' },
  { code: 'pa-PK', name: 'ਪੰਜਾਬੀ (ਪਾਕਿਸਤਾਨ)', flag: '🇵🇰' },
  
  // Southeast Asian languages
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'th-TH', name: 'ไทย (ประเทศไทย)', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'vi-VN', name: 'Tiếng Việt (Việt Nam)', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'id-ID', name: 'Bahasa Indonesia (Indonesia)', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ms-MY', name: 'Bahasa Melayu (Malaysia)', flag: '🇲🇾' },
  { code: 'ms-SG', name: 'Bahasa Melayu (Singapura)', flag: '🇸🇬' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'tl-PH', name: 'Filipino (Pilipinas)', flag: '🇵🇭' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'fil-PH', name: 'Filipino (Pilipinas)', flag: '🇵🇭' },
  
  // African languages
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'sw-KE', name: 'Kiswahili (Kenya)', flag: '🇰🇪' },
  { code: 'sw-TZ', name: 'Kiswahili (Tanzania)', flag: '🇹🇿' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'af-ZA', name: 'Afrikaans (Suid-Afrika)', flag: '🇿🇦' },
  { code: 'zu', name: 'IsiZulu', flag: '🇿🇦' },
  { code: 'zu-ZA', name: 'IsiZulu (iNingizimu Afrika)', flag: '🇿🇦' },
  { code: 'xh', name: 'IsiXhosa', flag: '🇿🇦' },
  { code: 'xh-ZA', name: 'IsiXhosa (uMzantsi Afrika)', flag: '🇿🇦' },
  
  // Celtic and regional languages
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'mt-MT', name: 'Malti (Malta)', flag: '🇲🇹' },
  { code: 'cy', name: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'cy-GB', name: 'Cymraeg (Cymru)', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'ga-IE', name: 'Gaeilge (Éire)', flag: '🇮🇪' },
  { code: 'gd', name: 'Gàidhlig', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'gd-GB', name: 'Gàidhlig (Alba)', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'eu', name: 'Euskera', flag: '🇪🇸' },
  { code: 'eu-ES', name: 'Euskera (Espainia)', flag: '🇪🇸' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'ca-ES', name: 'Català (Espanya)', flag: '🇪🇸' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸' },
  { code: 'gl-ES', name: 'Galego (España)', flag: '🇪🇸' },
];

export const useLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const changeLanguage = useCallback((languageCode: string) => {
    setSelectedLanguage(languageCode);
  }, []);

  const getAvailableLanguages = useCallback((items: Array<{ Locale: string }>) => {
    const availableLocales = [...new Set(items.map(item => item.Locale))];
    
    // Only show languages that actually exist in the data
    const matchedLanguages = SUPPORTED_LANGUAGES.filter(lang => 
      availableLocales.includes(lang.code)
    );
    
    // Sort by locale preference
    return matchedLanguages.sort((a, b) => {
      // Prioritize base languages first (en before en-US)
      const aIsBase = !a.code.includes('-');
      const bIsBase = !b.code.includes('-');
      if (aIsBase && !bIsBase) return -1;
      if (!aIsBase && bIsBase) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const getLocalizedContent = useCallback(<T extends { Locale: string; Text: string; SourceType?: string }>(
    items: T[],
    fallbackLanguage = 'en',
    preferredSourceType?: string
  ): T | null => {
    // Filter by source type if specified
    let filteredItems = items;
    if (preferredSourceType) {
      const itemsWithSourceType = items.filter(item => item.SourceType === preferredSourceType);
      if (itemsWithSourceType.length > 0) {
        filteredItems = itemsWithSourceType;
      }
    }
    
    // Try exact match first
    let content = filteredItems.find(item => item.Locale === selectedLanguage);
    
    // Try base language (e.g., 'en' for 'en-US')
    if (!content && selectedLanguage.includes('-')) {
      const baseLanguage = selectedLanguage.split('-')[0];
      content = filteredItems.find(item => item.Locale === baseLanguage);
    }
    
    // Try fallback language
    if (!content) {
      content = filteredItems.find(item => item.Locale === fallbackLanguage || item.Locale.startsWith(fallbackLanguage));
    }
    
    // Return first available if nothing else works
    return content || filteredItems[0] || null;
  }, [selectedLanguage]);

  return {
    selectedLanguage,
    changeLanguage,
    getAvailableLanguages,
    getLocalizedContent,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};