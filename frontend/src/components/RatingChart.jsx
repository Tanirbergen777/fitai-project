import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RatingChart = ({ ratingData }) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language || 'ru';
  
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const dict = {
    kaz: { title: 'Рейтинг өсімі (7 күн)', empty: 'Рейтинг деректері жоқ' },
    ru: { title: 'Рост рейтинга (7 дней)', empty: 'Нет данных о рейтинге' },
    en: { title: 'Rating Growth (7 days)', empty: 'No rating data yet' }
  };
  const tLocal = dict[lng] || dict['ru'];

  if (!ratingData || ratingData.length === 0) {
    return (
      <div className="rating-chart-container empty-state">
        <p>{tLocal.empty}</p>
      </div>
    );
  }

  // Calculate coordinates for SVG
  const width = 500;
  const height = 180;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;

  const validRatings = ratingData.filter(d => d.rating !== null).map(d => d.rating);
  
  let maxRating = validRatings.length > 0 ? Math.max(...validRatings) : 0;
  let minRating = 0;
  
  if (maxRating === 0) {
    maxRating = 100;
  } else {
    maxRating = Math.ceil(maxRating * 1.1); // Add 10% padding top
  }
  
  const ratingRange = maxRating - minRating;
  
  // Calculate dynamic SVG height based on maxRating
  // Scale it up so it actually scrolls vertically!
  const svgHeight = Math.max(300, maxRating * 2.5); // Force scroll
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const weekdays = {
    kaz: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жк'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
  const currentWeekdays = weekdays[lng] || weekdays['ru'];

  // Map data to points
  const points = ratingData.map((item, index) => {
    const x = margin.left + (index * (chartWidth / (ratingData.length - 1)));
    
    if (item.rating === null) {
      return { x, rating: null, index };
    }
    
    const y = margin.top + chartHeight - ((item.rating - minRating) / ratingRange) * chartHeight;
    
    let trend = 'up';
    if (index > 0 && ratingData[index - 1].rating !== null) {
      trend = item.rating >= ratingData[index - 1].rating ? 'up' : 'down';
    } else if (index < ratingData.length - 1 && ratingData[index + 1].rating !== null) {
      trend = ratingData[index + 1].rating >= item.rating ? 'up' : 'down';
    }

    return {
      x, y,
      rating: item.rating,
      trend,
      index
    };
  });

  // Generate grid lines (Y axis) - fixed amount, or every 50 points
  const yTicks = [];
  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    const r = minRating + (ratingRange * (i / numTicks));
    const yPos = margin.top + chartHeight - (i / numTicks) * chartHeight;
    yTicks.push({ rating: Math.round(r), y: yPos });
  }
  
  const currentPts = validRatings.length > 0 ? validRatings[validRatings.length - 1] : 0;

  return (
    <div className="rating-chart-container">
      <div className="chart-header">
        <h4>{tLocal.title}</h4>
        <span className="current-rating">
          {currentPts} pts
        </span>
      </div>

      <div className="chart-wrapper">
        <div className="chart-scroll-area">
          <svg viewBox={`0 0 ${width} ${svgHeight}`} style={{ width: '100%', height: `${svgHeight}px`, overflow: 'visible' }}>
            {/* Y-Axis Grid & Labels */}
            {yTicks.map((tick, i) => (
              <g key={`y-${i}`}>
                <line 
                  x1={margin.left} 
                  y1={tick.y} 
                  x2={width - margin.right} 
                  y2={tick.y} 
                  stroke="var(--border-color, #3e4451)" 
                  strokeDasharray="3 3" 
                />
                <text 
                  x={margin.left - 10} 
                  y={tick.y + 5} 
                  textAnchor="end" 
                  fill="var(--text-secondary, #abb2bf)" 
                  fontSize="14"
                  fontWeight="500"
                >
                  {tick.rating}
                </text>
              </g>
            ))}

            {/* Initial Growth Line from 0 */}
            {(() => {
              const firstValidIndex = points.findIndex(pt => pt.rating !== null);
              if (firstValidIndex !== -1) {
                const firstPt = points[firstValidIndex];
                if (firstPt.rating > 0) {
                  const yForZero = margin.top + chartHeight; // y coordinate for 0
                  const step = chartWidth / 6;
                  // Start line half a step to the left, or exactly at margin.left if it's the first day
                  const startX = firstValidIndex === 0 ? firstPt.x : firstPt.x - (step / 2);
                  return (
                    <line 
                      key="start-growth-line"
                      x1={startX} 
                      y1={yForZero} 
                      x2={firstPt.x} 
                      y2={firstPt.y} 
                      stroke="#39d353" 
                      strokeWidth="3" 
                    />
                  );
                }
              }
              return null;
            })()}

            {/* Line Segments */}
            {points.map((p, i) => {
              if (i === points.length - 1) return null;
              const nextP = points[i + 1];
              if (p.rating === null || nextP.rating === null) return null;
              
              const color = nextP.rating >= p.rating ? '#39d353' : '#f85149';
              return (
                <line 
                  key={`seg-${i}`}
                  x1={p.x} 
                  y1={p.y} 
                  x2={nextP.x} 
                  y2={nextP.y} 
                  stroke={color} 
                  strokeWidth="3" 
                />
              );
            })}

            {/* Points & Interactive Areas */}
            {points.map((p, i) => {
              if (p.rating === null) return null;
              const isHovered = hoveredPoint === i;
              const color = p.trend === 'up' ? '#39d353' : '#f85149';
              return (
                <g 
                  key={`pt-${i}`}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle cx={p.x} cy={p.y} r={15} fill="transparent" style={{ cursor: 'pointer' }} />
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={isHovered ? 6 : 4} 
                    fill="#21252b" 
                    stroke={color} 
                    strokeWidth={isHovered ? 3 : 2} 
                    style={{ transition: 'all 0.2s' }}
                    pointerEvents="none"
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Custom Tooltip */}
          {hoveredPoint !== null && points[hoveredPoint] && points[hoveredPoint].rating !== null && (
            <div 
              className="custom-tooltip"
              style={{
                left: `calc(${(points[hoveredPoint].x / width) * 100}% - 30px)`,
                top: `${points[hoveredPoint].y - 35}px`
              }}
            >
              <strong>{points[hoveredPoint].rating} pts</strong>
            </div>
          )}
        </div>

        {/* Fixed X-Axis Labels outside scroll area */}
        <div className="x-axis-fixed">
          {currentWeekdays.map((day, i) => {
            // Find corresponding point to align accurately
            const p = points[i];
            return (
              <span 
                key={`x-${i}`}
                style={{ 
                  position: 'absolute',
                  left: `${(p.x / width) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      <style>{`
        .rating-chart-container {
          background: var(--card-bg, #21252b);
          border: 1px solid var(--border-color, #3e4451);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          box-sizing: border-box;
        }

        .rating-chart-container.empty-state {
          justify-content: center;
          align-items: center;
          color: var(--text-secondary, #abb2bf);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary, #fff);
        }

        .current-rating {
          font-size: 13px;
          color: #61dafb;
          background: rgba(97, 218, 251, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
        }

        .chart-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .chart-scroll-area {
          height: 180px;
          max-height: 180px;
          flex: none;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        /* Customize scrollbar */
        .chart-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .chart-scroll-area::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
        .chart-scroll-area::-webkit-scrollbar-thumb {
          background: var(--border-color, #3e4451);
          border-radius: 4px;
        }

        .x-axis-fixed {
          position: relative;
          height: 20px;
          margin-top: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary, #abb2bf);
        }

        .custom-tooltip {
          position: absolute;
          background: var(--card-bg, #21252b);
          border: 1px solid var(--border-color, #3e4451);
          color: var(--text-primary, #fff);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
          text-align: center;
          min-width: 60px;
        }
      `}</style>
    </div>
  );
};

export default RatingChart;
