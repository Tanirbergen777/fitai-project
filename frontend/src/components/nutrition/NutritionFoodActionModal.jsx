import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FOOD_PREP_LIBRARY = {
  oatmeal_banana_nuts: {
    ingredients: [
      'Овсяные хлопья — 80 г',
      'Банан — 1 шт',
      'Орехи — 20–30 г',
      'Мёд — 1 ч.л.',
      'Молоко или вода — 250 мл',
    ],
    steps: [
      'Свари овсяные хлопья на воде или молоке.',
      'Нарежь банан кружочками.',
      'Добавь орехи и немного мёда.',
      'Подавай в тёплом виде.',
    ],
    youtubeQuery: 'овсянка с бананом и орехами рецепт',
  },
  rice_chicken: {
    ingredients: [
      'Рис — 100 г',
      'Куриное филе — 150–200 г',
      'Овощи — по вкусу',
      'Соль и специи',
    ],
    steps: [
      'Отвари рис до готовности.',
      'Куриное филе обжарь или запеки.',
      'Добавь овощи отдельно или на гарнир.',
      'Подавай вместе в одной тарелке.',
    ],
    youtubeQuery: 'рис с курицей рецепт',
  },
  pasta_beef: {
    ingredients: [
      'Макароны — 100 г',
      'Говядина — 150–200 г',
      'Лук — 1 шт',
      'Специи — по вкусу',
    ],
    steps: [
      'Отвари макароны.',
      'Обжарь говядину с луком.',
      'Смешай или подай отдельно.',
      'Добавь специи по вкусу.',
    ],
    youtubeQuery: 'макароны с говядиной рецепт',
  },
  buckwheat_eggs: {
    ingredients: [
      'Гречка — 100 г',
      'Яйца — 2–3 шт',
      'Соль — по вкусу',
      'Зелень — по желанию',
    ],
    steps: [
      'Отвари гречку.',
      'Свари или пожарь яйца.',
      'Соедини всё в тарелке.',
      'Добавь зелень для вкуса.',
    ],
    youtubeQuery: 'гречка с яйцами рецепт',
  },
  cottage_cheese_banana: {
    ingredients: [
      'Творог — 200 г',
      'Банан — 1 шт',
      'Мёд — 1 ч.л.',
    ],
    steps: [
      'Положи творог в миску.',
      'Нарежь банан.',
      'Добавь мёд и перемешай.',
    ],
    youtubeQuery: 'творог с бананом рецепт',
  },
  potato_turkey: {
    ingredients: [
      'Картофель — 250 г',
      'Филе индейки — 150–200 г',
      'Соль, перец, специи',
      'Зелень',
    ],
    steps: [
      'Нарежь картофель и индейку.',
      'Запеки их в духовке до готовности.',
      'Добавь специи и зелень.',
      'Подавай горячим.',
    ],
    youtubeQuery: 'картофель с индейкой рецепт',
  },
  omelet_vegetables: {
    ingredients: [
      'Яйца — 2 шт',
      'Помидор — 1 шт',
      'Шпинат — немного',
      'Перец — по вкусу',
    ],
    steps: [
      'Взбей яйца.',
      'Добавь нарезанные овощи.',
      'Обжарь на сковороде под крышкой.',
      'Подавай тёплым.',
    ],
    youtubeQuery: 'омлет с овощами рецепт',
  },
  chicken_salad: {
    ingredients: [
      'Курица — 150 г',
      'Листья салата',
      'Огурец',
      'Помидор',
      'Оливковое масло',
    ],
    steps: [
      'Приготовь курицу.',
      'Нарежь овощи и салат.',
      'Смешай всё в миске.',
      'Добавь немного масла.',
    ],
    youtubeQuery: 'курица с салатом рецепт',
  },
  cottage_cheese_berries: {
    ingredients: [
      'Творог — 200 г',
      'Ягоды — 80–100 г',
    ],
    steps: [
      'Выложи творог в миску.',
      'Добавь ягоды.',
      'Перемешай и подавай.',
    ],
    youtubeQuery: 'творог с ягодами рецепт',
  },
  buckwheat_turkey: {
    ingredients: [
      'Гречка — 100 г',
      'Индейка — 150 г',
      'Соль и специи',
    ],
    steps: [
      'Отвари гречку.',
      'Приготовь кусочки индейки.',
      'Соедини всё вместе и подавай.',
    ],
    youtubeQuery: 'гречка с индейкой рецепт',
  },
  fish_vegetables: {
    ingredients: [
      'Рыба — 180–200 г',
      'Овощи — 150 г',
      'Соль, специи',
    ],
    steps: [
      'Запеки или обжарь рыбу.',
      'Подготовь овощи отдельно.',
      'Подавай вместе.',
    ],
    youtubeQuery: 'рыба с овощами рецепт',
  },
  yogurt_apple: {
    ingredients: [
      'Натуральный йогурт — 150–200 г',
      'Яблоко — 1 шт',
    ],
    steps: [
      'Нарежь яблоко.',
      'Добавь к йогурту.',
      'Подавай сразу.',
    ],
    youtubeQuery: 'йогурт с яблоком рецепт',
  },
};

const NutritionFoodActionModal = ({ open, food, onClose }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('choice');

  useEffect(() => {
    if (open) {
      setMode('choice');
    }
  }, [open, food?.foodKey, food?.name]);

  const details = useMemo(() => {
    if (!food) return null;

    const mapped = FOOD_PREP_LIBRARY[food.foodKey];
    if (mapped) return mapped;

    return {
      ingredients: [
        t('nutrition.foodAction.fallback.ingredients.main', {
          defaultValue: 'Основной продукт блюда',
        }),
        t('nutrition.foodAction.fallback.ingredients.extra1', {
          defaultValue: 'Дополнительные ингредиенты по вкусу',
        }),
        t('nutrition.foodAction.fallback.ingredients.extra2', {
          defaultValue: 'Специи и добавки',
        }),
      ],
      steps: [
        food.recipe ||
          t('nutrition.foodAction.fallback.recipe', {
            defaultValue: 'Используй описание блюда как основу приготовления.',
          }),
        t('nutrition.foodAction.fallback.step2', {
          defaultValue: 'Подготовь ингредиенты и собери блюдо пошагово.',
        }),
      ],
      youtubeQuery: `${food.name} рецепт`,
    };
  }, [food, t]);

  if (!open || !food || !details) return null;

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    details.youtubeQuery
  )}`;

  const yandexUrl = `https://yandex.kz/maps/?text=${encodeURIComponent(
    `${food.name} кафе рядом`
  )}`;

  const openExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="nutrition-modal-overlay" onClick={onClose}>
      <div
        className="nutrition-food-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="nutrition-food-modal-close" onClick={onClose}>
          ×
        </button>

        {mode === 'choice' && (
          <>
            <div className="nutrition-food-modal-icon">🍽️</div>

            <h3 className="nutrition-food-modal-title">{food.name}</h3>
            <p className="nutrition-food-modal-subtitle">
              {t('nutrition.foodAction.chooseTitle', {
                defaultValue: 'Что вы хотите сделать с этим блюдом?',
              })}
            </p>

            <div className="nutrition-food-meta-row">
              <div className="nutrition-food-meta-chip">
                {food.calories} {t('nutrition.labels.kcal')}
              </div>
              <div className="nutrition-food-meta-chip">
                {food.protein} {t('nutrition.labels.grams')} {t('nutrition.labels.protein')}
              </div>
              <div className="nutrition-food-meta-chip">
                {food.carbs} {t('nutrition.labels.grams')} {t('nutrition.labels.carbs')}
              </div>
            </div>

            <div className="nutrition-food-choice-grid">
              <button
                className="nutrition-food-choice-card"
                onClick={() => setMode('buy')}
              >
                <div className="nutrition-food-choice-emoji">📍</div>
                <h4>
                  {t('nutrition.foodAction.goCafe', {
                    defaultValue: 'Пойти в ближайшую кафешку',
                  })}
                </h4>
                <p>
                  {t('nutrition.foodAction.goCafeText', {
                    defaultValue: 'Откроем поиск этого блюда в Яндекс Картах.',
                  })}
                </p>
              </button>

              <button
                className="nutrition-food-choice-card"
                onClick={() => setMode('cook')}
              >
                <div className="nutrition-food-choice-emoji">👨‍🍳</div>
                <h4>
                  {t('nutrition.foodAction.cookMyself', {
                    defaultValue: 'Приготовить сам',
                  })}
                </h4>
                <p>
                  {t('nutrition.foodAction.cookMyselfText', {
                    defaultValue: 'Покажем рецепт, продукты и YouTube-видео.',
                  })}
                </p>
              </button>
            </div>
          </>
        )}

        {mode === 'cook' && (
          <div className="nutrition-food-panel">
            <div className="nutrition-food-modal-icon">👨‍🍳</div>
            <h3 className="nutrition-food-modal-title">{food.name}</h3>
            <p className="nutrition-food-modal-subtitle">
              {t('nutrition.foodAction.cookSubtitle', {
                defaultValue: 'Рецепт, продукты и шаги приготовления',
              })}
            </p>

            {food.recipe && (
              <div className="nutrition-empty-box" style={{ marginTop: 0 }}>
                {food.recipe}
              </div>
            )}

            <h4 className="nutrition-food-panel-title">
              {t('nutrition.foodAction.ingredients', {
                defaultValue: 'Продукты',
              })}
            </h4>
            <ul className="nutrition-food-list">
              {details.ingredients.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>

            <h4 className="nutrition-food-panel-title">
              {t('nutrition.foodAction.steps', {
                defaultValue: 'Как готовить',
              })}
            </h4>
            <ol className="nutrition-food-step-list">
              {details.steps.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ol>

            <div className="nutrition-food-modal-actions">
              <button
                className="nutrition-primary-btn"
                onClick={() => openExternal(youtubeUrl)}
              >
                {t('nutrition.foodAction.openYoutube', {
                  defaultValue: 'Открыть YouTube',
                })}
              </button>

              <button
                className="nutrition-secondary-btn"
                onClick={() => setMode('choice')}
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        )}

        {mode === 'buy' && (
          <div className="nutrition-food-panel">
            <div className="nutrition-food-modal-icon">📍</div>
            <h3 className="nutrition-food-modal-title">{food.name}</h3>
            <p className="nutrition-food-modal-subtitle">
              {t('nutrition.foodAction.buySubtitle', {
                defaultValue:
                  'Откроем Яндекс Карты с поиском ближайших мест по этому блюду',
              })}
            </p>

            <div className="nutrition-empty-box" style={{ marginTop: 0 }}>
              {t('nutrition.foodAction.buyText', {
                defaultValue:
                  'Сейчас откроется поиск по Яндекс Картам. Дальше пользователь сможет выбрать удобную точку, посмотреть варианты и маршрут.',
              })}
            </div>

            <div className="nutrition-food-modal-actions">
              <button
                className="nutrition-primary-btn"
                onClick={() => openExternal(yandexUrl)}
              >
                {t('nutrition.foodAction.openYandex', {
                  defaultValue: 'Открыть Яндекс Карты',
                })}
              </button>

              <button
                className="nutrition-secondary-btn"
                onClick={() => setMode('choice')}
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        )}

        <style>{`
          .nutrition-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 2000;
            background: rgba(4, 8, 14, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: nutritionModalFade 0.25s ease;
          }

          .nutrition-food-modal {
            position: relative;
            width: min(760px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 28px;
            background: linear-gradient(180deg, #232833 0%, #171c24 100%);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 30px 70px rgba(0,0,0,0.45);
            padding: 28px;
            color: #fff;
            animation: nutritionModalUp 0.3s ease;
          }

          .nutrition-food-modal-close {
            position: absolute;
            top: 14px;
            right: 16px;
            border: none;
            background: transparent;
            color: #b8c3d6;
            font-size: 28px;
            cursor: pointer;
          }

          .nutrition-food-modal-icon {
            font-size: 42px;
            margin-bottom: 14px;
          }

          .nutrition-food-modal-title {
            margin: 0 0 10px 0;
            font-size: clamp(28px, 4vw, 36px);
            font-weight: 900;
          }

          .nutrition-food-modal-subtitle {
            margin: 0 0 18px 0;
            color: #aab3c2;
            line-height: 1.7;
            font-size: 15px;
          }

          .nutrition-food-meta-row {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }

          .nutrition-food-meta-chip {
            padding: 8px 14px;
            border-radius: 999px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            color: #dce4f2;
            font-size: 13px;
            font-weight: 700;
          }

          .nutrition-food-choice-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 10px;
          }

          .nutrition-food-choice-card {
            text-align: left;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(255,255,255,0.03);
            border-radius: 22px;
            padding: 22px;
            cursor: pointer;
            transition: all 0.25s ease;
            color: white;
          }

          .nutrition-food-choice-card:hover {
            transform: translateY(-4px);
            background: rgba(255,255,255,0.06);
            border-color: rgba(97,218,251,0.35);
            box-shadow: 0 18px 40px rgba(0,0,0,0.3);
          }

          .nutrition-food-choice-card h4 {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 800;
          }

          .nutrition-food-choice-card p {
            margin: 0;
            color: #b5bfd0;
            line-height: 1.6;
            font-size: 14px;
          }

          .nutrition-food-choice-emoji {
            font-size: 30px;
            margin-bottom: 12px;
          }

          .nutrition-food-panel-title {
            margin: 18px 0 12px;
            font-size: 18px;
            font-weight: 800;
          }

          .nutrition-food-list,
          .nutrition-food-step-list {
            margin: 0;
            padding-left: 22px;
            color: #d8e0ee;
            line-height: 1.8;
          }

          .nutrition-food-modal-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 22px;
          }

          @keyframes nutritionModalFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes nutritionModalUp {
            from {
              opacity: 0;
              transform: translateY(24px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 768px) {
            .nutrition-food-modal {
              padding: 22px;
            }

            .nutrition-food-choice-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default NutritionFoodActionModal;