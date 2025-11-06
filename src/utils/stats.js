/**
 * Statistics utility functions
 */

/**
 * Count studies by year
 * @param {Array} studies - The list of studies
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
 * Count studies by journal
 * @param {Array} studies - The list of studies
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
 * Get top-K journals
 * @param {Array} studies - The list of studies
 * @param {number} topCount - The maximum number of journals to return
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
 * Convert year data to chart format (Recharts)
 * @param {Array} studies - The list of studies
 * @returns {Array} [{ year, count }, ...]
 */
export const formatTrendData = (studies = []) => {
  const yearCounts = countByYear(studies);
  const minYear = Math.min(...Object.keys(yearCounts).map(Number));
  const maxYear = Math.max(...Object.keys(yearCounts).map(Number));
  
  // Fill in missing years
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
 * Abbreviate journal names according to specific rules
 * @param {string} name - The full journal name
 * @returns {string} The abbreviated name
 */
const abbreviateJournalName = (name) => {
  // Special handling rules
  if (name.startsWith('The Journal of neuroscience:')) {
    return 'J.N.';
  }
  if (name === 'Cortex; a journal devoted to the study of the nervous system and behavior') {
    return 'Cortex';
  }

  // Remove punctuation
  const cleanedName = name.replace(/[^a-zA-Z\s]/g, '');
  const words = cleanedName.split(' ').filter(w => w.length > 0);

  // If there is only one word, return it directly
  if (words.length <= 1) {
    return cleanedName;
  }

  // Filter stop words and generate acronym
  const stopWords = ['the', 'of', 'and', 'a', 'to', 'for', 'in'];
  const acronym = words
    .filter(word => !stopWords.includes(word.toLowerCase()))
    .map(word => word[0].toUpperCase())
    .join('.');

  // If it is an acronym, add a period at the end
  if (acronym.includes('.')) {
    return acronym + '.';
  }

  return acronym || cleanedName; // If the result is empty, return the cleaned name
};

/**
 * Convert journal data to chart format (Recharts)
 * @param {Array} studies - The list of studies
 * @param {number} topCount - The maximum number of journals to return
 * @returns {Array} [{ name, count }, ...]
 */
export const formatJournalData = (studies = [], topCount = 20) => {
  return getTopJournals(studies, topCount)
    .map(({ journal, count }) => ({
      name: journal,
      count,
      shortName: abbreviateJournalName(journal), // Use the new abbreviation function
    }));
};

/**
 * Calculate basic statistics
 * @param {Array} studies - The list of studies
 * @returns {Object} The statistics
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
 * Filter related terms by co-occurrence and Jaccard similarity
 * @param {Array} relatedTerms - The list of related terms from the API
 * @param {number} topK - The maximum number of terms to return
 * @param {string} method - The filtering method ('co_count' or 'jaccard')
 * @returns {Array} The filtered related terms
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
 * Generate a PubMed URL
 * @param {string} studyId - The study ID (i.e., PubMed ID)
 * @returns {string} The PubMed URL
 */
export const getPubMedUrl = (studyId) => {
  return `https://pubmed.ncbi.nlm.nih.gov/${studyId}/`;
};

/**
 * Calculate coordinate statistics (for 3D heatmap)
 * @param {Array} locations - The list of coordinates [{x, y, z}, ...]
 * @returns {Object} The coordinate statistics
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

/**
 * Sort a list of studies
 * @param {Array} studies - The list of studies
 * @param {string} sortField - The field to sort by (year, journal, title, authors)
 * @param {string} sortDirection - The sort direction (asc, desc)
 * @returns {Array} The sorted list of studies
 */
export const sortStudies = (studies = [], sortField = 'year', sortDirection = 'desc') => {
  if (!studies || studies.length === 0) return [];

  const sorted = [...studies];

  sorted.sort((a, b) => {
    let valueA, valueB;

    // Get the values of the sort field
    switch (sortField) {
      case 'year':
        valueA = (a.year || 0);
        valueB = (b.year || 0);
        break;
      case 'journal':
        valueA = (a.journal || '').toLowerCase();
        valueB = (b.journal || '').toLowerCase();
        break;
      case 'title':
        valueA = (a.title || '').toLowerCase();
        valueB = (b.title || '').toLowerCase();
        break;
      case 'authors':
        valueA = (a.authors || '').toLowerCase();
        valueB = (b.authors || '').toLowerCase();
        break;
      default:
        valueA = (a.year || 0);
        valueB = (b.year || 0);
    }

    // Compare
    let comparison = 0;
    if (typeof valueA === 'number') {
      comparison = valueA - valueB;
    } else {
      comparison = valueA.localeCompare(valueB);
    }

    // Reverse based on direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return sorted;
};
