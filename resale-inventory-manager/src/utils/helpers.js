// Helper functions for calculations and formatting

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculate days listed
 */
export const calculateDaysListed = (listingDate, saleDate) => {
  if (!listingDate) return null;

  const endDate = saleDate ? new Date(saleDate) : new Date();
  const startDate = new Date(listingDate);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Calculate purchase statistics
 */
export const calculatePurchaseStats = (purchase, items) => {
  const purchaseItems = items.filter(item => item.purchase_id === purchase.purchase_id);

  const itemCount = purchaseItems.length;
  const soldCount = purchaseItems.filter(item => item.status === 'Sold').length;
  const listedCount = purchaseItems.filter(item => item.status === 'Listed').length;

  const revenue = purchaseItems
    .filter(item => item.sale_price !== null)
    .reduce((sum, item) => sum + (item.sale_price || 0), 0);

  const totalFees = purchaseItems
    .filter(item => item.platform_fees !== null)
    .reduce((sum, item) => sum + (item.platform_fees || 0), 0);

  const profit = revenue - totalFees - (purchase.total_purchase_cost || 0);

  let status = 'Active';
  if (soldCount === itemCount && itemCount > 0) {
    status = 'Completed';
  } else if (listedCount === 0 && soldCount === 0) {
    status = 'Not Started';
  }

  return {
    itemCount,
    soldCount,
    listedCount,
    revenue,
    profit,
    status,
  };
};

/**
 * Generate listing description from item fields
 */
export const generateListingDescription = (item) => {
  const parts = [];

  // Start with item name
  if (item.item_name) {
    parts.push(item.item_name);
  }

  // Add brand
  if (item.brand) {
    parts.push(`\n\nBrand: ${item.brand}`);
  }

  // Add category
  if (item.category) {
    parts.push(`Category: ${item.category}`);
  }

  // Add size
  if (item.size) {
    parts.push(`Size: ${item.size}`);
  }

  // Add generic description template
  parts.push('\n\nDescription:');
  parts.push('[Add detailed description here]');

  parts.push('\n\nCondition:');
  parts.push('[See condition report for details]');

  parts.push('\n\nShipping:');
  parts.push('[Add shipping information]');

  parts.push('\n\nReturns:');
  parts.push('[Add return policy]');

  return parts.join('\n');
};

/**
 * Generate condition report template
 */
export const generateConditionReport = () => {
  return `CONDITION REPORT

Overall Condition:
[ ] New with tags
[ ] New without tags
[ ] Excellent - minimal wear
[ ] Good - light wear
[ ] Fair - moderate wear
[ ] Poor - significant wear

Material & Construction:
- Material type:
- Quality:
- Construction notes:

Wear & Damage:
- Visible wear:
- Stains/marks:
- Holes/tears:
- Fading:
- Pilling:

Hardware & Closures:
- Zippers:
- Buttons:
- Snaps:
- Other hardware:

Odors:
[ ] None
[ ] Light musty smell
[ ] Smoke smell
[ ] Other:

Measurements:
(Add relevant measurements)

Additional Notes:
`;
};

/**
 * Sort items by field
 */
export const sortItems = (items, field, direction = 'asc') => {
  return [...items].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle null/undefined
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    // Numeric comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // String comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });
};

/**
 * Filter items
 */
export const filterItems = (items, filters) => {
  return items.filter(item => {
    // Purchase filter
    if (filters.purchase && item.purchase_id !== filters.purchase) {
      return false;
    }

    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Brand filter
    if (filters.brand && item.brand !== filters.brand) {
      return false;
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = [
        item.item_name,
        item.category,
        item.brand,
        item.notes,
      ];

      const matches = searchableFields.some(field =>
        field && String(field).toLowerCase().includes(searchLower)
      );

      if (!matches) return false;
    }

    return true;
  });
};

/**
 * Get unique values from items array for a specific field
 */
export const getUniqueValues = (items, field) => {
  const values = items
    .map(item => item[field])
    .filter(value => value && value !== '');

  return [...new Set(values)].sort();
};

/**
 * Export data as JSON file
 */
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parse JSON file
 */
export const parseJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
