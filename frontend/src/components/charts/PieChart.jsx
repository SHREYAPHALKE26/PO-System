import React from 'react';

const PieChart = ({ data, title }) => {
  const totalSpend = data.reduce((sum, item) => sum + item.spend, 0);
  let gradientStops = [];
  let currentAngle = 0;

  data.forEach((item, index) => {
    const angle = (item.spend / totalSpend) * 360;
    const color = `hsl(${index * 60}, 70%, 50%)`;
    gradientStops.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
    item.color = color;
    currentAngle += angle;
  });

  const chartStyle = {
    background: `conic-gradient(${gradientStops.join(', ')})`,
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">{title}</h2>
      <div className="pie-chart-container">
        <div className="pie-chart" style={chartStyle}></div>
        <ul className="pie-legend">
          {data.map((item, index) => (
            <li key={index}>
              <span className="pie-legend-color" style={{ backgroundColor: item.color }}></span>
              {item.department} (${(item.spend / 1000).toFixed(1)}k)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PieChart;