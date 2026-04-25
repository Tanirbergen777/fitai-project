import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируй файлы (убедись, что пути верные)
import translationEN from './locales/en.json';
import translationRU from './locales/ru.json';
import translationKK from './locales/kaz.json';

const resources = {
  en: { translation: translationEN },
  ru: { translation: translationRU },
  kaz: { translation: translationKK }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru', // Если что-то пойдет не так, покажет на русском
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;