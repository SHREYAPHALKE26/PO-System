import React from 'react';

const Table = ({ data, title }) => {
  return (
    <div className="table-container">
      <h2 className="chart-title">{title}</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Department</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <tr key={order.poNumber}>
              <td>{order.poNumber}</td>
              <td>{order.vendor}</td>
              <td>{order.department}</td>
              <td>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </td>
              <td>${order.amount.toFixed(2)}</td>
              <td>{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;