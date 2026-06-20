import React from 'react';
import { useTranslation } from 'react-i18next';

const ActivityHeatmap = ({ heatmapData }) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language || 'ru';

  const months = {
    kaz: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const weekdays = {
    kaz: ['Дс', 'Ср', 'Жм'],
    ru: ['Пн', 'Ср', 'Пт'],
    en: ['Mon', 'Wed', 'Fri']
  };

  const dict = {
    kaz: { title: 'Белсенділік', days: 'күн', active: '(Белсенді)' },
    ru: { title: 'Активность', days: 'дней', active: '(Активно)' },
    en: { title: 'Activity', days: 'days', active: '(Active)' }
  };

  const currentMonths = months[lng] || months['ru'];
  const currentWeekdays = weekdays[lng] || weekdays['ru'];
  const tLocal = dict[lng] || dict['ru'];

  const today = new Date();
  const currentMonthStr = `${currentMonths[today.getMonth()]} ${today.getFullYear()}`;

  const activeDates = new Set(
    heatmapData?.filter(d => d.active).map(d => d.date) || []
  );

  const numWeeks = 25; 
  let dayOfWeek = today.getDay();
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Mon, 6 = Sun
  
  const daysToGenerate = (numWeeks - 1) * 7 + (dayOfWeek + 1);
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToGenerate + 1);
  
  const weeks = [];
  let currentWeek = [];
  
  for (let i = 0; i < daysToGenerate; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    currentWeek.push({
      date: dateStr,
      active: activeDates.has(dateStr),
      isToday: i === daysToGenerate - 1,
      month: d.getMonth()
    });
    
    const isSunday = d.getDay() === 0;
    if (isSunday || i === daysToGenerate - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (weeks.length > 0 && weeks[0].length < 7) {
    const padding = 7 - weeks[0].length;
    const paddedWeek = Array(padding).fill(null).concat(weeks[0]);
    weeks[0] = paddedWeek;
  }
  
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay && firstDay.month !== lastMonth) {
      if (i > 1 && i < weeks.length - 2) {
        monthLabels.push({ index: i, text: currentMonths[firstDay.month].substring(0, 3) });
      }
      lastMonth = firstDay.month;
    }
  });

  return (
    <div className="activity-heatmap">
      <div className="heatmap-header">
        <h4>{tLocal.title}: {currentMonthStr}</h4>
        <span className="heatmap-count">
          {activeDates.size} {tLocal.days}
        </span>
      </div>
      
      <div className="heatmap-scroll-area">
        <div className="heatmap-months-row">
          <div className="heatmap-y-axis-placeholder"></div>
          <div className="heatmap-months-labels">
            {monthLabels.map((lbl, idx) => (
              <span 
                key={idx} 
                className="heatmap-month-label"
                style={{ left: `${lbl.index * 18}px` }} 
              >
                {lbl.text}
              </span>
            ))}
          </div>
        </div>
        
        <div className="heatmap-body">
          <div className="heatmap-y-axis">
            <span style={{ top: '0px' }}>{currentWeekdays[0]}</span>
            <span style={{ top: '36px' }}>{currentWeekdays[1]}</span>
            <span style={{ top: '72px' }}>{currentWeekdays[2]}</span>
          </div>
          
          <div className="heatmap-grid">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="heatmap-col">
                {week.map((day, dIndex) => {
                  if (!day) return <div key={`empty-${dIndex}`} className="heatmap-cell empty" />;
                  return (
                    <div
                      key={day.date}
                      className={`heatmap-cell ${day.active ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                      title={`${day.date} ${day.active ? tLocal.active : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .activity-heatmap {
          background: var(--card-bg, #21252b);
          border: 1px solid var(--border-color, #3e4451);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
        }
        
        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .heatmap-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary, #fff);
        }
        
        .heatmap-count {
          font-size: 13px;
          color: var(--text-secondary, #abb2bf);
          background: rgba(97, 218, 251, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
        }

        .heatmap-scroll-area {
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .heatmap-months-row {
          display: flex;
          height: 20px;
          margin-bottom: 4px;
        }

        .heatmap-y-axis-placeholder {
          width: 30px;
          flex-shrink: 0;
        }

        .heatmap-months-labels {
          position: relative;
          flex-grow: 1;
        }

        .heatmap-month-label {
          position: absolute;
          font-size: 11px;
          color: var(--text-secondary, #abb2bf);
          top: 0;
        }

        .heatmap-body {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .heatmap-y-axis {
          width: 22px;
          position: relative;
          height: 122px; /* 7 * 14 + 6 * 4 */
          flex-shrink: 0;
        }

        .heatmap-y-axis span {
          position: absolute;
          font-size: 11px;
          color: var(--text-secondary, #abb2bf);
          line-height: 14px;
          right: 0;
        }

        .heatmap-grid {
          display: flex;
          gap: 4px;
        }

        .heatmap-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .heatmap-cell {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        
        .heatmap-cell.empty {
          background: transparent !important;
          border-color: transparent !important;
        }

        .heatmap-cell.active {
          background: #39d353;
          border-color: #39d353;
          box-shadow: 0 0 8px rgba(57, 211, 83, 0.4);
        }
        
        .heatmap-cell.today {
          border: 1px solid var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default ActivityHeatmap;
