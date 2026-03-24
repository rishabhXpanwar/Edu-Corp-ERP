import React from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';
import './DataTable.css';

const DataTable = ({ columns, data, loading = false, emptyText = 'No records found', onRowClick }) => {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead className="data-table__head">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="data-table__th" style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="data-table__body">
          {loading ? (
            <tr><td colSpan={columns.length} className="data-table__loading-cell">
              <Spinner />
            </td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length}>
              <EmptyState title={emptyText} />
            </td></tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || idx}
                  className={`data-table__row${idx % 2 === 0 ? '' : ' data-table__row--striped'}${onRowClick ? ' data-table__row--clickable' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}>
                {columns.map(col => (
                  <td key={col.key} className="data-table__td">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
