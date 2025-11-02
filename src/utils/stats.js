/**
 * 統計工具函數
 */

/**
 * 按年份統計論文
 * @param {Array} studies - 論文列表
 * @returns {Object} { year: count }
 */
export const countByYear = (studies = []) => {
  return studies.reduce((acc, study) => {
    const year = study.year || 'Unknown';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
};

/**
 * 按期刊統計論文
 * @param {Array} studies - 論文列表
 * @returns {Object} { journal: count }
 */
export const countByJournal = (studies = []) => {
  return studies.reduce((acc, study) => {
    const journal = study.journal || 'Unknown';
    acc[journal] = (acc[journal] || 0) + 1;
    return acc;
  }, {});
};

/**
 * 獲取期刊排名 (TOP-K)
 * @param {Array} studies - 論文列表
 * @param {number} topCount - 返回最多數量
 * @returns {Array} [{ journal, count }, ...]
 */
export const getTopJournals = (studies = [], topCount = 20) => {
  const journalCounts = countByJournal(studies);
  return Object.entries(journalCounts)
    .map(([journal, count]) => ({ journal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topCount);
};

/**
 * 轉換年份數據為圖表格式 (Recharts)
 * @param {Array} studies - 論文列表
 * @returns {Array} [{ year, count }, ...]
 */
export const formatTrendData = (studies = []) => {
  const yearCounts = countByYear(studies);
  const minYear = Math.min(...Object.keys(yearCounts).map(Number));
  const maxYear = Math.max(...Object.keys(yearCounts).map(Number));
  
  // 填補缺失年份
  const result = [];
  for (let year = minYear; year <= maxYear; year++) {
    result.push({
      year,
      count: yearCounts[year] || 0
    });
  }
  
  return result;
};

/**
 * 轉換期刊數據為圖表格式 (Recharts)
 * @param {Array} studies - 論文列表
 * @param {number} topCount - 返回最多數量
 * @returns {Array} [{ name, count }, ...]
 */
export const formatJournalData = (studies = [], topCount = 20) => {
  return getTopJournals(studies, topCount)
    .map(({ journal, count }) => ({
      name: journal,
      count,
      // 限制名稱長度以適應圖表
      shortName: journal.length > 30 
        ? journal.substring(0, 27) + '...' 
        : journal
    }));
};

/**
 * 計算基本統計信息
 * @param {Array} studies - 論文列表
 * @returns {Object} 統計信息
 */
export const getBasicStats = (studies = []) => {
  if (studies.length === 0) {
    return {
      totalCount: 0,
      yearRange: 'N/A',
      journalCount: 0,
      avgPerYear: 0
    };
  }

  const years = studies
    .map(s => s.year)
    .filter(Boolean)
    .map(Number);
  
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const journalCount = new Set(studies.map(s => s.journal)).size;
  const avgPerYear = (studies.length / (maxYear - minYear + 1)).toFixed(1);

  return {
    totalCount: studies.length,
    yearRange: `${minYear} - ${maxYear}`,
    journalCount,
    avgPerYear: parseFloat(avgPerYear)
  };
};

/**
 * 按 co-occurrence 和 Jaccard 相似度篩選相關詞
 * @param {Array} relatedTerms - API 返回的相關詞列表
 * @param {number} topK - 返回最多數量
 * @param {string} method - 篩選方法 ('co_count' or 'jaccard')
 * @returns {Array} 篩選後的相關詞
 */
export const selectRelatedTerms = (relatedTerms = [], topK = 10, method = 'co_count') => {
  if (!relatedTerms || relatedTerms.length === 0) {
    return [];
  }

  const sortKey = method === 'jaccard' ? 'jaccard' : 'co_count';
  
  return relatedTerms
    .filter(term => term && term[sortKey] !== undefined)
    .sort((a, b) => b[sortKey] - a[sortKey])
    .slice(0, topK)
    .map(term => ({
      term: term.term || term.name,
      score: term[sortKey],
      method
    }));
};

/**
 * 生成 PubMed URL
 * @param {string} studyId - 論文 ID (即 PubMed ID)
 * @returns {string} PubMed URL
 */
export const getPubMedUrl = (studyId) => {
  return `https://pubmed.ncbi.nlm.nih.gov/${studyId}/`;
};

/**
 * 計算座標統計 (用於 3D 熱力圖)
 * @param {Array} locations - 座標列表 [{x, y, z}, ...]
 * @returns {Object} 座標統計
 */
export const getLocationStats = (locations = []) => {
  if (locations.length === 0) {
    return {
      count: 0,
      centroid: { x: 0, y: 0, z: 0 },
      range: { x: [0, 0], y: [0, 0], z: [0, 0] }
    };
  }

  const xs = locations.map(l => l.x || 0);
  const ys = locations.map(l => l.y || 0);
  const zs = locations.map(l => l.z || 0);

  return {
    count: locations.length,
    centroid: {
      x: (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2),
      y: (ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(2),
      z: (zs.reduce((a, b) => a + b, 0) / zs.length).toFixed(2)
    },
    range: {
      x: [Math.min(...xs).toFixed(2), Math.max(...xs).toFixed(2)],
      y: [Math.min(...ys).toFixed(2), Math.max(...ys).toFixed(2)],
      z: [Math.min(...zs).toFixed(2), Math.max(...zs).toFixed(2)]
    }
  };
};
