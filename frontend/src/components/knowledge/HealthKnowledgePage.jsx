import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecommendedVideos from './RecommendedVideos';

const HEALTH_CONTENT = {
  ru: {
    badge: 'Knowledge Feed',
    title: 'Полезные знания без скучных лекций',
    subtitle:
      'Короткие, понятные и визуально приятные знания про сон, энергию, питание, восстановление и повседневное состояние.',

    daily: {
      label: 'Знание дня',
      title: 'Мало сна — это не просто усталость',
      text:
        'Когда человек регулярно недосыпает, падают энергия, фокус, самоконтроль и устойчивость к стрессу. Из-за этого становится сложнее держать режим, еду и продуктивность.',
    },

    tabs: {
      lessons: 'Мини-уроки',
      myths: 'Миф / правда',
      whatIf: 'Что делать если...',
      collections: 'Видео и подборки',
    },

    lessons: [
      {
        icon: '😴',
        tag: 'Сон',
        title: 'Почему сон меняет весь день',
        text: 'Сон влияет не только на отдых, но и на настроение, аппетит, фокус и уровень энергии.',
      },
      {
        icon: '💧',
        tag: 'Энергия',
        title: 'Почему вода влияет на самочувствие',
        text: 'Даже простая нехватка воды может усиливать вялость, тяжесть и ощущение “я не в ресурсе”.',
      },
      {
        icon: '🧠',
        tag: 'Фокус',
        title: 'Плохой фокус — не всегда лень',
        text: 'Часто дело в ментальной усталости, экране, перегрузе и отсутствии восстановления.',
      },
      {
        icon: '🍽️',
        tag: 'Питание',
        title: 'Еда влияет не только на вес',
        text: 'Питание влияет на энергию, настроение, ясность головы и способность держать ритм дня.',
      },
      {
        icon: '🛌',
        tag: 'Восстановление',
        title: 'Отдых — это часть прогресса',
        text: 'Без восстановления даже хорошая тренировка или правильное питание работают слабее.',
      },
      {
        icon: '⚡',
        tag: 'Состояние',
        title: 'Нет сил — не всегда значит “слабый характер”',
        text: 'Иногда человеку нужен не жёсткий рывок, а сон, вода, еда, прогулка и снижение перегруза.',
      },
      {
        icon: '🎯',
        tag: 'Привычки',
        title: 'Маленькие привычки сильнее мотивации',
        text: 'Мотивация нестабильна, а полезные привычки постепенно меняют образ жизни.',
      },
      {
        icon: '📉',
        tag: 'Перегруз',
        title: 'Почему хаос ломает режим',
        text: 'Когда день неуправляемый, у человека быстрее падают энергия, дисциплина и концентрация.',
      },
    ],

    myths: [
      {
        myth: 'Если нет энергии, значит ты просто ленивый.',
        fact: 'Часто причина в недосыпе, перегрузе, ментальной усталости, отсутствии воды или режима.',
      },
      {
        myth: 'Чем больше тренировок без отдыха, тем лучше результат.',
        fact: 'Без восстановления тело и голова быстрее перегружаются, а прогресс становится хуже.',
      },
      {
        myth: 'Кофе решает проблему усталости.',
        fact: 'Кофе может временно помочь, но сон, вода, еда и восстановление влияют глубже.',
      },
      {
        myth: 'Чтобы стать дисциплинированным, нужно всё менять сразу.',
        fact: 'Обычно сильные изменения приходят через одну устойчивую привычку, а не через перегруз.',
      },
    ],

    scenarios: [
      {
        title: 'Что делать, если нет сил',
        short: 'Быстрый reset для состояния',
        problem:
          'Если совсем нет энергии, не надо сразу требовать от себя максимум. Сначала стабилизируй состояние.',
        actions: [
          'Выпей воды',
          'Сделай 5–10 минут спокойной ходьбы',
          'Поешь что-то нормальное, а не случайный перекус',
          'Убери экран хотя бы на несколько минут',
        ],
      },
      {
        title: 'Что делать, если не можешь собраться',
        short: 'Помощь для фокуса',
        problem:
          'Когда внимание рассыпается, важно не пытаться делать 10 дел одновременно.',
        actions: [
          'Закрой лишние вкладки и уведомления',
          'Оставь только 1 главную задачу',
          'Сделай короткий перерыв без телефона',
          'Вернись к работе небольшим блоком',
        ],
      },
      {
        title: 'Что делать, если тянет на сладкое',
        short: 'Мягкая стабилизация',
        problem:
          'Тяга к сладкому часто усиливается на фоне недосыпа, хаоса, пропусков еды и усталости.',
        actions: [
          'Сначала поешь нормальную еду',
          'Проверь, не голоден ли ты реально',
          'Выпей воды',
          'Не ругай себя — смотри на причину, а не только на симптом',
        ],
      },
      {
        title: 'Что делать, если пропала мотивация',
        short: 'Возврат через маленький шаг',
        problem:
          'Когда мотивации нет, не надо строить огромный план. Нужно вернуться через маленькое действие.',
        actions: [
          'Сделай 1 простое полезное действие',
          'Не пытайся “идеально начать новую жизнь”',
          'Снизь планку на сегодня',
          'Вернись к ритму через повторяемость',
        ],
      },
    ],

    collections: [
      {
        title: '3 продукта для энергии',
        summary:
          'Простая подборка продуктов, которые чаще помогают держать состояние стабильнее в течение дня.',
        items: ['Вода', 'Нормальный завтрак', 'Фрукты или лёгкий белковый перекус'],
        videoTitle: 'Видео по теме энергии',
        videoUrl:
          'https://www.youtube.com/results?search_query=energy+nutrition+sleep+recovery',
      },
      {
        title: '5 признаков перегруза',
        summary:
          'Если замечаешь сразу несколько признаков, скорее всего, тебе нужно не давление, а восстановление.',
        items: [
          'Шум в голове',
          'Нет сил даже на простые задачи',
          'Раздражительность',
          'Плохой сон',
          'Рассыпающийся фокус',
        ],
        videoTitle: 'Видео по теме перегруза',
        videoUrl:
          'https://www.youtube.com/results?search_query=mental+overload+recovery+tips',
      },
      {
        title: '4 привычки для лучшего утра',
        summary:
          'Не обязательно менять всё сразу — достаточно 1–2 вещей, которые помогут утру стать спокойнее.',
        items: [
          'Раньше лечь спать',
          'Не брать телефон сразу после пробуждения',
          'Выпить воды',
          'Начать день без спешки',
        ],
        videoTitle: 'Видео по теме привычек',
        videoUrl:
          'https://www.youtube.com/results?search_query=morning+habits+focus+energy',
      },
      {
        title: '3 вещи, которые мешают восстановлению',
        summary:
          'Иногда человек формально отдыхает, но не восстанавливается. Обычно мешают базовые вещи.',
        items: [
          'Экран до поздней ночи',
          'Отсутствие режима',
          'Постоянное внутреннее напряжение',
        ],
        videoTitle: 'Видео по теме восстановления',
        videoUrl:
          'https://www.youtube.com/results?search_query=recovery+sleep+stress+health',
      },
    ],
  },

  en: {
    badge: 'Knowledge Feed',
    title: 'Useful knowledge without boring lectures',
    subtitle:
      'Short, clear and visually pleasant lessons about sleep, energy, nutrition, recovery and daily state.',

    daily: {
      label: 'Knowledge of the day',
      title: 'Low sleep is not just tiredness',
      text:
        'When a person regularly lacks sleep, energy, focus, self-control and stress resistance all drop. That makes routine, food and productivity harder to manage.',
    },

    tabs: {
      lessons: 'Mini lessons',
      myths: 'Myth / Fact',
      whatIf: 'What to do if...',
      collections: 'Videos & collections',
    },

    lessons: [
      {
        icon: '😴',
        tag: 'Sleep',
        title: 'Why sleep changes the whole day',
        text: 'Sleep affects not only rest, but also mood, appetite, focus and energy.',
      },
      {
        icon: '💧',
        tag: 'Energy',
        title: 'Why water affects how you feel',
        text: 'Even simple lack of water can increase sluggishness and the feeling of being low-energy.',
      },
      {
        icon: '🧠',
        tag: 'Focus',
        title: 'Bad focus is not always laziness',
        text: 'Often the reason is mental fatigue, screens, overload and poor recovery.',
      },
      {
        icon: '🍽️',
        tag: 'Nutrition',
        title: 'Food affects more than body weight',
        text: 'Food affects energy, mood, mental clarity and the ability to keep your day stable.',
      },
      {
        icon: '🛌',
        tag: 'Recovery',
        title: 'Rest is part of progress',
        text: 'Without recovery even good workouts and healthy eating work less effectively.',
      },
      {
        icon: '⚡',
        tag: 'State',
        title: 'No energy does not always mean weak character',
        text: 'Sometimes a person needs sleep, water, food, walking and lower overload — not more pressure.',
      },
      {
        icon: '🎯',
        tag: 'Habits',
        title: 'Small habits are stronger than motivation',
        text: 'Motivation is unstable, but useful habits slowly change your lifestyle.',
      },
      {
        icon: '📉',
        tag: 'Overload',
        title: 'Why chaos breaks routine',
        text: 'When the day feels unmanaged, energy, discipline and concentration all drop faster.',
      },
    ],

    myths: [
      {
        myth: 'If you have no energy, you are just lazy.',
        fact: 'Often the reason is lack of sleep, overload, mental fatigue, lack of water or no routine.',
      },
      {
        myth: 'More workouts without rest always mean better results.',
        fact: 'Without recovery both body and mind overload faster, and progress gets worse.',
      },
      {
        myth: 'Coffee solves fatigue.',
        fact: 'Coffee may help temporarily, but sleep, water, food and recovery have a deeper effect.',
      },
      {
        myth: 'To become disciplined, you need to change everything at once.',
        fact: 'Strong change usually comes from one stable habit, not overload.',
      },
    ],

    scenarios: [
      {
        title: 'What to do if you have no energy',
        short: 'Quick reset for your state',
        problem:
          'If you feel completely drained, do not demand maximum from yourself first. Stabilize the basics.',
        actions: [
          'Drink water',
          'Take a calm 5–10 minute walk',
          'Eat something proper, not random snacks',
          'Step away from screens for a few minutes',
        ],
      },
      {
        title: 'What to do if you cannot focus',
        short: 'Support for concentration',
        problem:
          'When your attention is scattered, it is important not to start 10 tasks at once.',
        actions: [
          'Close extra tabs and notifications',
          'Leave only 1 main task',
          'Take a short break without the phone',
          'Return in a small work block',
        ],
      },
      {
        title: 'What to do if you crave sweets',
        short: 'Soft stabilization',
        problem:
          'Sugar cravings are often stronger when you are underslept, chaotic, skipping meals or exhausted.',
        actions: [
          'Eat a proper meal first',
          'Check whether you are actually hungry',
          'Drink water',
          'Do not shame yourself — look at the cause, not only the symptom',
        ],
      },
      {
        title: 'What to do if motivation is gone',
        short: 'Come back through one small step',
        problem:
          'When motivation is low, do not build a huge plan. Return through one useful action.',
        actions: [
          'Do 1 simple useful action',
          'Do not try to “restart your whole life” today',
          'Lower the bar for today',
          'Return to rhythm through repetition',
        ],
      },
    ],

    collections: [
      {
        title: '3 foods for energy',
        summary:
          'A simple set of foods and basics that often help keep your daily state more stable.',
        items: ['Water', 'A proper breakfast', 'Fruit or a light protein snack'],
        videoTitle: 'Video about energy',
        videoUrl:
          'https://www.youtube.com/results?search_query=energy+nutrition+sleep+recovery',
      },
      {
        title: '5 signs of overload',
        summary:
          'If you notice several of these together, you probably need recovery, not more pressure.',
        items: [
          'Mental noise',
          'No energy even for simple tasks',
          'Irritability',
          'Bad sleep',
          'Scattered focus',
        ],
        videoTitle: 'Video about overload',
        videoUrl:
          'https://www.youtube.com/results?search_query=mental+overload+recovery+tips',
      },
      {
        title: '4 habits for a better morning',
        summary:
          'You do not need to change everything. One or two simple habits can make the morning calmer.',
        items: [
          'Sleep earlier',
          'Do not grab the phone right away',
          'Drink water',
          'Start the day with less rush',
        ],
        videoTitle: 'Video about habits',
        videoUrl:
          'https://www.youtube.com/results?search_query=morning+habits+focus+energy',
      },
      {
        title: '3 things that block recovery',
        summary:
          'Sometimes a person formally rests but does not actually recover. Usually basic things are the reason.',
        items: [
          'Late-night screen overload',
          'No routine',
          'Constant internal tension',
        ],
        videoTitle: 'Video about recovery',
        videoUrl:
          'https://www.youtube.com/results?search_query=recovery+sleep+stress+health',
      },
    ],
  },

  kaz: {
    badge: 'Knowledge Feed',
    title: 'Жалықтырмайтын пайдалы білім',
    subtitle:
      'Ұйқы, энергия, тамақтану, қалпына келу және күнделікті жағдай туралы қысқа, түсінікті әрі жағымды білім.',

    daily: {
      label: 'Күннің білімі',
      title: 'Аз ұйқы — жай шаршау ғана емес',
      text:
        'Адам тұрақты түрде аз ұйықтаса, энергия, фокус, өзін бақылау және күйзеліске төзімділік төмендейді. Соның салдарынан режим, тамақ және өнімділік бұзылады.',
    },

    tabs: {
      lessons: 'Мини-сабақтар',
      myths: 'Миф / Шындық',
      whatIf: 'Не істеу керек егер...',
      collections: 'Видео және топтамалар',
    },

    lessons: [
      {
        icon: '😴',
        tag: 'Ұйқы',
        title: 'Неге ұйқы бүкіл күнге әсер етеді',
        text: 'Ұйқы тек демалысқа емес, көңіл күйге, тәбетке, фокусқа және энергияға әсер етеді.',
      },
      {
        icon: '💧',
        tag: 'Энергия',
        title: 'Неге су жағдайға әсер етеді',
        text: 'Қарапайым судың жетіспеуі де әлсіздік пен төмен күйді күшейтуі мүмкін.',
      },
      {
        icon: '🧠',
        tag: 'Фокус',
        title: 'Нашар фокус әрқашан жалқаулық емес',
        text: 'Көбіне себеп — менталды шаршау, экран, жүктеме және нашар қалпына келу.',
      },
      {
        icon: '🍽️',
        tag: 'Тамақ',
        title: 'Тамақ тек салмаққа әсер етпейді',
        text: 'Тамақ энергияға, көңіл күйге, ойдың анықтығына және күн тәртібін ұстауға әсер етеді.',
      },
      {
        icon: '🛌',
        tag: 'Қалпына келу',
        title: 'Демалыс — прогрестің бөлігі',
        text: 'Қалпына келусіз жақсы жаттығу мен дұрыс тамақтанудың әсері төмендейді.',
      },
      {
        icon: '⚡',
        tag: 'Жағдай',
        title: 'Күштің болмауы — әлсіз мінез емес',
        text: 'Кейде адамға қысым емес, ұйқы, су, ас, серуен және жүктемені азайту керек.',
      },
      {
        icon: '🎯',
        tag: 'Әдеттер',
        title: 'Кішкентай әдеттер мотивациядан күшті',
        text: 'Мотивация тұрақсыз, ал пайдалы әдеттер өмір салтын біртіндеп өзгертеді.',
      },
      {
        icon: '📉',
        tag: 'Артық жүктеме',
        title: 'Неге хаос режимді бұзады',
        text: 'Күн басқарылмаса, энергия, тәртіп және концентрация тезірек төмендейді.',
      },
    ],

    myths: [
      {
        myth: 'Егер энергия жоқ болса, сен жай жалқаусың.',
        fact: 'Көбіне себеп — ұйқының аздығы, артық жүктеме, менталды шаршау, судың аздығы немесе режимнің болмауы.',
      },
      {
        myth: 'Демалыссыз көп жаттығу әрқашан жақсы нәтиже береді.',
        fact: 'Қалпына келусіз дене мен ой тезірек шаршап, прогресс төмендейді.',
      },
      {
        myth: 'Кофе шаршауды толық шешеді.',
        fact: 'Кофе уақытша көмектесуі мүмкін, бірақ ұйқы, су, тамақ және қалпына келу әлдеқайда терең әсер етеді.',
      },
      {
        myth: 'Тәртіпті болу үшін бәрін бірден өзгерту керек.',
        fact: 'Күшті өзгеріс көбіне артық жүктемеден емес, бір тұрақты әдеттен басталады.',
      },
    ],

    scenarios: [
      {
        title: 'Егер күш жоқ болса не істеу керек',
        short: 'Жағдайды тез тұрақтандыру',
        problem:
          'Егер мүлде күш болмаса, бірден өзіңнен максимум талап етпе. Алдымен негізгі жағдайды тұрақтандыр.',
        actions: [
          'Су іш',
          '5–10 минут тыныш серуенде',
          'Кездейсоқ тіскебасар емес, қалыпты бірдеңе же',
          'Экраннан бірнеше минутқа алыста',
        ],
      },
      {
        title: 'Егер жинала алмасаң не істеу керек',
        short: 'Концентрацияға көмек',
        problem:
          'Назар шашырап тұрса, бір уақытта 10 істі бастауға болмайды.',
        actions: [
          'Артық вкладкалар мен хабарландыруларды жап',
          'Тек 1 негізгі тапсырманы қалдыр',
          'Телефонсыз қысқа үзіліс жаса',
          'Кішкентай жұмыс блогымен қайта орал',
        ],
      },
      {
        title: 'Егер тәттіге қатты тартса не істеу керек',
        short: 'Жағдайды жұмсақ түзету',
        problem:
          'Тәттіге тартылу көбіне ұйқы аз болғанда, хаос көп болғанда, ас өткізілгенде және шаршағанда күшейеді.',
        actions: [
          'Алдымен қалыпты ас іш',
          'Шынымен аш па, соны тексер',
          'Су іш',
          'Өзіңді сөкпе — симптомға емес, себепке қара',
        ],
      },
      {
        title: 'Егер мотивация жоғалса не істеу керек',
        short: 'Бір кішкентай қадам арқылы оралу',
        problem:
          'Мотивация жоқ кезде үлкен жоспар құрма. Бір пайдалы әрекет арқылы қайта кір.',
        actions: [
          '1 қарапайым пайдалы іс жаса',
          '“Өмірімді толық өзгертемін” деп қысым жасама',
          'Бүгінге планканы төмендет',
          'Қайталау арқылы ырғаққа қайта кір',
        ],
      },
    ],

    collections: [
      {
        title: 'Энергияға көмектесетін 3 нәрсе',
        summary:
          'Күнделікті жағдайды тұрақтырақ ұстауға жиі көмектесетін қарапайым негіздер.',
        items: ['Су', 'Қалыпты таңғы ас', 'Жеміс немесе жеңіл ақуызды тіскебасар'],
        videoTitle: 'Энергия туралы видео',
        videoUrl:
          'https://www.youtube.com/results?search_query=energy+nutrition+sleep+recovery',
      },
      {
        title: 'Артық жүктеменің 5 белгісі',
        summary:
          'Егер бірнеше белгі қатар байқалса, саған қысым емес, қалпына келу керек болуы мүмкін.',
        items: [
          'Ойдағы шу',
          'Қарапайым іске де күштің болмауы',
          'Тітіркену',
          'Нашар ұйқы',
          'Шашыраңқы фокус',
        ],
        videoTitle: 'Артық жүктеме туралы видео',
        videoUrl:
          'https://www.youtube.com/results?search_query=mental+overload+recovery+tips',
      },
      {
        title: 'Жақсы таңға арналған 4 әдет',
        summary:
          'Бәрін бірден өзгертудің қажеті жоқ — 1–2 қарапайым нәрсе таңды тыныш бастауға көмектеседі.',
        items: [
          'Ертерек ұйықтау',
          'Оянғанда бірден телефон алмау',
          'Су ішу',
          'Күнді асығыссыз бастау',
        ],
        videoTitle: 'Әдеттер туралы видео',
        videoUrl:
          'https://www.youtube.com/results?search_query=morning+habits+focus+energy',
      },
      {
        title: 'Қалпына келуге кедергі келтіретін 3 нәрсе',
        summary:
          'Кейде адам демалғандай көрінеді, бірақ шын мәнінде қалпына келмейді. Көбіне себеп қарапайым.',
        items: [
          'Түнгі экран жүктемесі',
          'Режимнің болмауы',
          'Үздіксіз ішкі кернеу',
        ],
        videoTitle: 'Қалпына келу туралы видео',
        videoUrl:
          'https://www.youtube.com/results?search_query=recovery+sleep+stress+health',
      },
    ],
  },
};

const HealthKnowledgePage = ({ onBack }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'kaz' ? 'kaz' : i18n.language === 'en' ? 'en' : 'ru';

  const content = HEALTH_CONTENT[lang];
  const [activeTab, setActiveTab] = useState('lessons');
  const [openMyth, setOpenMyth] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState(0);

  const scenario = useMemo(
    () => content.scenarios[selectedScenario] || content.scenarios[0],
    [content.scenarios, selectedScenario]
  );

  const collection = useMemo(
    () => content.collections[selectedCollection] || content.collections[0],
    [content.collections, selectedCollection]
  );

  const tabs = [
    { key: 'lessons', label: content.tabs.lessons },
    { key: 'myths', label: content.tabs.myths },
    { key: 'whatIf', label: content.tabs.whatIf },
    { key: 'collections', label: content.tabs.collections },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 rgba(97,218,251,0); }
          50% { box-shadow: 0 0 28px rgba(97,218,251,0.16); }
          100% { box-shadow: 0 0 0 rgba(97,218,251,0); }
        }
      `}</style>

      <div style={{ ...styles.heroCard, animation: 'fadeUp 0.5s ease both' }}>
        <div style={styles.heroLeft}>
          <div style={styles.badge}>{content.badge}</div>
          <h2 style={styles.title}>{content.title}</h2>
          <p style={styles.text}>{content.subtitle}</p>

          <div style={styles.switcher}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.switchButton,
                  ...(activeTab === tab.key ? styles.switchButtonActive : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.dailyCard}>
            <div style={styles.dailyLabel}>{content.daily.label}</div>
            <h3 style={styles.dailyTitle}>{content.daily.title}</h3>
            <p style={styles.dailyText}>{content.daily.text}</p>
          </div>
        </div>
      </div>

      {activeTab === 'lessons' && (
        <div style={styles.grid}>
          {content.lessons.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.lessonCard,
                animation: `fadeUp 0.45s ease both`,
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div style={styles.lessonTop}>
                <div style={styles.lessonIcon}>{item.icon}</div>
                <div style={styles.lessonTag}>{item.tag}</div>
              </div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardText}>{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'myths' && (
        <div style={styles.grid}>
          {content.myths.map((item, index) => {
            const isOpen = openMyth === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setOpenMyth(index)}
                style={{
                  ...styles.mythCard,
                  animation: `fadeUp 0.45s ease both`,
                  animationDelay: `${index * 0.05}s`,
                  ...(isOpen ? styles.mythCardActive : {}),
                }}
              >
                <div style={styles.mythBadge}>MYTH</div>
                <div style={styles.mythText}>{item.myth}</div>

                <div style={{ ...styles.factBox, maxHeight: isOpen ? '220px' : '0px' }}>
                  <div style={styles.factBadge}>FACT</div>
                  <div style={styles.factText}>{item.fact}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === 'whatIf' && (
        <div style={styles.twoCol}>
          <div style={styles.sideList}>
            {content.scenarios.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedScenario(index)}
                style={{
                  ...styles.sideButton,
                  ...(selectedScenario === index ? styles.sideButtonActive : {}),
                }}
              >
                <div style={styles.sideButtonTitle}>{item.title}</div>
                <div style={styles.sideButtonText}>{item.short}</div>
              </button>
            ))}
          </div>

          <div style={{ ...styles.detailCard, animation: 'fadeUp 0.45s ease both' }}>
            <h3 style={styles.detailTitle}>{scenario.title}</h3>
            <p style={styles.detailProblem}>{scenario.problem}</p>

            <div style={styles.actionGrid}>
              {scenario.actions.map((action, index) => (
                <div key={index} style={styles.actionCard}>
                  <div style={styles.actionNum}>{index + 1}</div>
                  <div style={styles.actionText}>{action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <>
          <div style={styles.grid}>
            {content.collections.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedCollection(index)}
                style={{
                  ...styles.collectionCard,
                  ...(selectedCollection === index ? styles.collectionCardActive : {}),
                  animation: `fadeUp 0.45s ease both`,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.summary}</p>
              </button>
            ))}
          </div>

          <div style={{ ...styles.detailCard, animation: 'fadeUp 0.45s ease both' }}>
            <div style={styles.collectionHeader}>
              <div>
                <h3 style={styles.detailTitle}>{collection.title}</h3>
                <p style={styles.detailProblem}>{collection.summary}</p>
              </div>
              <div style={styles.sparkle}>✨</div>
            </div>

            <div style={styles.bulletList}>
              {collection.items.map((item, index) => (
                <div key={index} style={styles.bulletItem}>
                  <span style={styles.bulletDot}>•</span>
                  <span style={styles.bulletText}>{item}</span>
                </div>
              ))}
            </div>

            <a
              href={collection.videoUrl}
              target="_blank"
              rel="noreferrer"
              style={styles.videoButton}
            >
              {collection.videoTitle}
            </a>
          </div>
        </>
      )}

      <div style={{ animation: 'fadeUp 0.5s ease both', animationDelay: '0.1s' }}>
        <RecommendedVideos topic="health" />
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'grid',
    gap: '16px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.85fr',
    gap: '16px',
    padding: '22px',
    borderRadius: '28px',
    background:
      'linear-gradient(135deg, rgba(97,218,251,0.10) 0%, rgba(139,123,255,0.09) 45%, rgba(53,208,127,0.08) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  heroRight: {
    display: 'flex',
    alignItems: 'stretch',
  },
  badge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(97,218,251,0.14)',
    border: '1px solid rgba(97,218,251,0.24)',
    color: '#61dafb',
    fontSize: '12px',
    fontWeight: '800',
    marginBottom: '12px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: '800',
    lineHeight: 1.15,
    color: 'var(--text-primary)',
  },
  text: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '15px',
    lineHeight: 1.75,
  },
  dailyCard: {
    width: '100%',
    padding: '18px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    animation: 'pulseGlow 3s ease-in-out infinite',
  },
  dailyLabel: {
    display: 'inline-flex',
    marginBottom: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#61dafb',
    fontSize: '12px',
    fontWeight: '800',
  },
  dailyTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  dailyText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: 1.7,
  },
  switcher: {
    display: 'inline-flex',
    marginTop: '18px',
    padding: '4px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    gap: '4px',
    flexWrap: 'wrap',
  },
  switchButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.22s ease',
  },
  switchButtonActive: {
    background: 'linear-gradient(135deg, rgba(97,218,251,0.18) 0%, rgba(97,218,251,0.08) 100%)',
    color: 'var(--text-primary)',
    boxShadow: '0 8px 20px rgba(97,218,251,0.14)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
  },
  lessonCard: {
    padding: '20px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
    cursor: 'default',
  },
  lessonTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  lessonIcon: {
    fontSize: '28px',
  },
  lessonTag: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '700',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.35,
  },
  cardText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: 1.7,
  },
  mythCard: {
    textAlign: 'left',
    padding: '20px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    overflow: 'hidden',
  },
  mythCardActive: {
    borderColor: 'rgba(97,218,251,0.22)',
    boxShadow: '0 12px 28px rgba(97,218,251,0.08)',
  },
  mythBadge: {
    display: 'inline-flex',
    marginBottom: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,123,123,0.12)',
    color: '#ff9d9d',
    fontSize: '12px',
    fontWeight: '800',
  },
  mythText: {
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontWeight: '700',
    lineHeight: 1.6,
  },
  factBox: {
    overflow: 'hidden',
    transition: 'max-height 0.28s ease, margin-top 0.28s ease',
    marginTop: '14px',
  },
  factBadge: {
    display: 'inline-flex',
    marginBottom: '8px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(53,208,127,0.12)',
    color: '#8ef0b7',
    fontSize: '12px',
    fontWeight: '800',
  },
  factText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: 1.7,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '0.82fr 1.18fr',
    gap: '16px',
  },
  sideList: {
    display: 'grid',
    gap: '12px',
  },
  sideButton: {
    textAlign: 'left',
    padding: '16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
  },
  sideButtonActive: {
    borderColor: 'rgba(97,218,251,0.20)',
    boxShadow: '0 10px 24px rgba(97,218,251,0.08)',
    background: 'linear-gradient(135deg, rgba(97,218,251,0.10) 0%, rgba(255,255,255,0.03) 100%)',
  },
  sideButtonTitle: {
    fontSize: '16px',
    fontWeight: '800',
    marginBottom: '6px',
  },
  sideButtonText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.55,
  },
  detailCard: {
    padding: '22px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 16px 34px rgba(0,0,0,0.10)',
  },
  detailTitle: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.25,
  },
  detailProblem: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '15px',
    lineHeight: 1.75,
  },
  actionGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
  },
  actionCard: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '14px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  actionNum: {
    minWidth: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'rgba(97,218,251,0.15)',
    color: '#61dafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },
  actionText: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  collectionCard: {
    textAlign: 'left',
    padding: '18px',
    borderRadius: '22px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.24s ease',
  },
  collectionCardActive: {
    borderColor: 'rgba(97,218,251,0.22)',
    boxShadow: '0 10px 24px rgba(97,218,251,0.08)',
    background: 'linear-gradient(135deg, rgba(97,218,251,0.08) 0%, rgba(255,255,255,0.03) 100%)',
  },
  collectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
  },
  sparkle: {
    fontSize: '28px',
    lineHeight: 1,
  },
  bulletList: {
    display: 'grid',
    gap: '10px',
    marginTop: '18px',
  },
  bulletItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  bulletDot: {
    color: '#61dafb',
    fontWeight: '800',
  },
  bulletText: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  videoButton: {
    marginTop: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    borderRadius: '14px',
    textDecoration: 'none',
    background:
      'linear-gradient(135deg, rgba(97,218,251,0.18) 0%, rgba(97,218,251,0.08) 100%)',
    border: '1px solid rgba(97,218,251,0.25)',
    color: '#61dafb',
    fontWeight: '800',
    fontSize: '14px',
  },
};

export default HealthKnowledgePage;