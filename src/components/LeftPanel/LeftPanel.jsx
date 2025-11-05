/**
 * LeftPanel Component
 * Displays trend analysis and journal statistics
 */
import React, { useContext } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './LeftPanel.module.css';

export function LeftPanel() {
  const { trendData, journalData, filters, setFilters, setCurrentPage } = useContext(SearchContext);

  // Handle year click (from trend chart)
  const handleYearClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedYear = data.activePayload[0].payload.year;
      setFilters(prev => ({
        ...prev,
        year: prev.year === clickedYear ? null : clickedYear, // Toggle selection
      }));
      setCurrentPage(1); // Reset to first page
    }
  };

  // Handle journal click (from journal chart)
  const handleJournalClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedJournal = data.activePayload[0].payload.name;
      setFilters(prev => ({
        ...prev,
        journal: prev.journal === clickedJournal ? null : clickedJournal, // Toggle selection
      }));
      setCurrentPage(1); // Reset to first page
    }
  };

  return (
    <div className={styles.leftPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Analytics</h2>
      </div>

      <div className={styles.panelContent}>
        {/* Trend Chart */}
        {trendData && trendData.length > 0 && (
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Publication Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }} onClick={handleYearClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="year" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '4px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  cursor={{ stroke: 'var(--coral-primary)', strokeWidth: 2 }}
                />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--tiffany-primary)"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isSelected = filters.year === payload.year;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : 4}
                        fill={isSelected ? 'var(--coral-primary)' : 'var(--tiffany-primary)'}
                        stroke={isSelected ? 'var(--coral-dark)' : 'var(--tiffany-primary)'}
                        strokeWidth={isSelected ? 2 : 0}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  }}
                  activeDot={{ r: 6, cursor: 'pointer' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Journal Chart */}
        {journalData && journalData.length > 0 && (
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Top Journals</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={journalData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                onClick={handleJournalClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-secondary)" />
                <YAxis
                  dataKey="shortName" // Use shortName for display
                  type="category"
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 11 }}
                  labelFormatter={(label, payload) => payload[0]?.payload.name}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: `1px solid var(--border-color)`,
                    borderRadius: '4px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  labelFormatter={(label, payload) => payload[0]?.payload.name}
                  cursor={{ fill: 'rgba(255, 127, 80, 0.1)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  fill="var(--tiffany-primary)"
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;
                    const isSelected = filters.journal === payload.name;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={isSelected ? 'var(--coral-primary)' : 'var(--tiffany-primary)'}
                        rx={4}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {!trendData && !journalData && (
          <div className={styles.emptyState}>
            <p style={{ fontSize: '0.9rem' }}>Search for a query to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
