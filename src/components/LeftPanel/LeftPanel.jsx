/**
 * LeftPanel Component
 * Displays trend analysis and journal statistics
 */
import React, { useContext } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SearchContext } from '../../context/SearchContext.jsx';
import styles from './LeftPanel.module.css';

export function LeftPanel() {
  const { trendData, journalData } = useContext(SearchContext);

  return (
    <div className={styles.leftPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>📊 Analytics</h2>
      </div>

      <div className={styles.panelContent}>
        {/* Trend Chart */}
        {trendData && trendData.length > 0 && (
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Publication Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
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
                />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--tiffany-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--tiffany-primary)', r: 4 }}
                  activeDot={{ r: 6 }}
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
                />
                <Bar dataKey="count" fill="var(--tiffany-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {!trendData && !journalData && (
          <div className={styles.emptyState}>
            <p>📭 No data yet</p>
            <p style={{ fontSize: '0.9rem' }}>Search for a term to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
