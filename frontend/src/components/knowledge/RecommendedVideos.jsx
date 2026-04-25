import React from 'react';
import { useTranslation } from 'react-i18next';

const RecommendedVideos = ({ topic }) => {
  const { t, i18n } = useTranslation();

  const videos = [
    {
      id: 1,
      topic: 'habits',
      title: {
        ru: 'Как закреплять маленькие привычки',
        en: 'How to build small habits',
        kaz: 'Кішкентай әдеттерді қалай бекітуге болады',
      },
      desc: {
        ru: 'Видео о том, как начинать с маленьких действий и не перегружать себя.',
        en: 'A video about starting small and avoiding overload.',
        kaz: 'Шағын әрекеттерден бастап, өзіңді шамадан тыс жүктемеу туралы видео.',
      },
      url: 'https://www.youtube.com/results?search_query=atomic+habits',
    },
    {
      id: 2,
      topic: 'energy',
      title: {
        ru: 'Как восстановить энергию и не выгорать',
        en: 'How to restore energy and avoid burnout',
        kaz: 'Энергияны қалай қалпына келтіріп, күйіп кетпеуге болады',
      },
      desc: {
        ru: 'Полезное видео про отдых, сон, прогулки и восстановление.',
        en: 'A useful video about rest, sleep, walking and recovery.',
        kaz: 'Демалыс, ұйқы, серуен және қалпына келу туралы пайдалы видео.',
      },
      url: 'https://www.youtube.com/results?search_query=energy+recovery+burnout',
    },
    {
      id: 3,
      topic: 'focus',
      title: {
        ru: 'Как держать фокус в мире отвлечений',
        en: 'How to stay focused in a distracted world',
        kaz: 'Назарды қалай сақтауға болады',
      },
      desc: {
        ru: 'Советы по концентрации, уменьшению отвлечений и работе блоками.',
        en: 'Tips for concentration, reducing distractions and working in blocks.',
        kaz: 'Зейін қою, алаңдауды азайту және блоктармен жұмыс істеу туралы кеңестер.',
      },
      url: 'https://www.youtube.com/results?search_query=focus+concentration+tips',
    },
    {
      id: 4,
      topic: 'health',
      title: {
        ru: 'Почему здоровье — база всей жизни',
        en: 'Why health is the base of life',
        kaz: 'Неге денсаулық өмірдің негізі болып табылады',
      },
      desc: {
        ru: 'Видео о связи сна, питания, спорта, энергии и качества жизни.',
        en: 'A video about the connection between sleep, food, exercise, energy and quality of life.',
        kaz: 'Ұйқы, тамақтану, спорт, энергия және өмір сапасының байланысы туралы видео.',
      },
      url: 'https://www.youtube.com/results?search_query=health+sleep+nutrition+exercise',
    },
  ];

  const currentLang = i18n.language === 'kaz' ? 'kaz' : i18n.language === 'en' ? 'en' : 'ru';
  const filtered = videos.filter((video) => video.topic === topic);

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>{t('knowledgeModule.videos.title')}</h3>
      <p style={styles.subtitle}>{t('knowledgeModule.videos.subtitle')}</p>

      <div style={styles.grid}>
        {filtered.map((video) => (
          <div key={video.id} style={styles.card}>
            <div style={styles.icon}>🎥</div>
            <h4 style={styles.cardTitle}>{video.title[currentLang]}</h4>
            <p style={styles.cardDesc}>{video.desc[currentLang]}</p>
            <a
              href={video.url}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              {t('knowledgeModule.videos.watch')}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: '20px',
    padding: '22px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  subtitle: {
    margin: '0 0 16px 0',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
  },
  card: {
    padding: '18px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.4,
  },
  cardDesc: {
    margin: '0 0 12px 0',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontSize: '14px',
  },
  link: {
    display: 'inline-flex',
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'rgba(97,218,251,0.14)',
    color: '#61dafb',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px',
  },
};

export default RecommendedVideos;