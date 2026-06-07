import React from 'react';

const BarChart = ({ data, title }) => {
  const maxSpend = Math.max(...data.map(item => item.spend));

  return (
    <div className="chart-container">
      <h2 className="chart-title">{title}</h2>
      <div className="bar-chart">
        {data.map((item) => (
          <div
            key={item.month}
            className="bar"
            style={{ height: `${(item.spend / maxSpend) * 100}%` }}
            title={`$${item.spend.toFixed(2)}`}
          >
            <span className="bar-label">${(item.spend / 1000).toFixed(0)}k</span>
            <span className="bar-x-axis">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;