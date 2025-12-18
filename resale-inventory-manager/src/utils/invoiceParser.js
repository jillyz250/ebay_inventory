// Invoice parser utility
// Parses invoice text and extracts purchase and item information

/**
 * Main parser function
 * @param {string} invoiceText - Raw invoice text
 * @returns {object} - Parsed purchase and items data
 */
export const parseInvoice = (invoiceText) => {
  if (!invoiceText || typeof invoiceText !== 'string') {
    return {
      success: false,
      error: 'Invalid invoice text',
      purchase: null,
      items: [],
    };
  }

  try {
    const lines = invoiceText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract purchase metadata
    const purchase = extractPurchaseInfo(lines, invoiceText);

    // Extract items
    const items = extractItems(lines);

    // Allocate costs
    if (items.length > 0 && purchase.total_purchase_cost > 0) {
      allocateCosts(items, purchase.total_purchase_cost);
    }

    return {
      success: true,
      purchase,
      items,
    };
  } catch (error) {
    console.error('Error parsing invoice:', error);
    return {
      success: false,
      error: error.message,
      purchase: null,
      items: [],
    };
  }
};

/**
 * Extract purchase-level information
 */
const extractPurchaseInfo = (lines, fullText) => {
  const purchase = {
    purchase_name: '',
    vendor: '',
    purchase_date: new Date().toISOString().split('T')[0],
    total_purchase_cost: 0,
    notes: '',
  };

  // Look for vendor name (usually at the top or has keywords like "from", "vendor", "seller")
  const vendorPatterns = [
    /(?:from|vendor|seller|sold by)[:\s]+(.+)/i,
    /^([A-Z][A-Za-z\s&]+(?:Inc|LLC|Ltd|Store|Shop))/,
  ];

  for (const pattern of vendorPatterns) {
    for (const line of lines.slice(0, 10)) {
      const match = line.match(pattern);
      if (match && match[1]) {
        purchase.vendor = match[1].trim();
        break;
      }
    }
    if (purchase.vendor) break;
  }

  // Look for date
  const datePatterns = [
    /(?:date|invoice date|purchase date)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
  ];

  for (const pattern of datePatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const parsedDate = parseDate(match[1]);
      if (parsedDate) {
        purchase.purchase_date = parsedDate;
        break;
      }
    }
  }

  // Look for total cost
  const totalPatterns = [
    /(?:total|grand total|amount due|balance)[:\s]*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:total|grand total)[:\s]*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
  ];

  for (const pattern of totalPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      purchase.total_purchase_cost = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Generate purchase name from vendor and date
  if (purchase.vendor) {
    purchase.purchase_name = `${purchase.vendor} - ${purchase.purchase_date}`;
  } else {
    purchase.purchase_name = `Purchase - ${purchase.purchase_date}`;
  }

  return purchase;
};

/**
 * Extract items from invoice
 */
const extractItems = (lines) => {
  const items = [];

  // Common item line patterns
  const itemPatterns = [
    // Pattern: Description/Name   $Price
    /^(.+?)\s+\$?\s*(\d+(?:\.\d{2})?)$/,
    // Pattern: Quantity x Item Name - $Price
    /^(\d+)\s*x\s+(.+?)\s+[-–]\s*\$?\s*(\d+(?:\.\d{2})?)$/,
    // Pattern: Item Name | Category | Brand | $Price
    /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*\$?\s*(\d+(?:\.\d{2})?)$/,
  ];

  for (const line of lines) {
    // Skip lines that look like headers, totals, or metadata
    if (
      /(?:invoice|receipt|total|subtotal|tax|shipping|date|from|vendor)/i.test(line) ||
      line.length < 3
    ) {
      continue;
    }

    // Try each pattern
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        let item = null;

        if (pattern === itemPatterns[0]) {
          // Simple name and price
          item = {
            item_name: match[1].trim(),
            category: '',
            brand: '',
            size: '',
            allocated_cost: parseFloat(match[2]),
            status: 'Unlisted',
          };
        } else if (pattern === itemPatterns[1]) {
          // Quantity x Name - Price
          const quantity = parseInt(match[1]);
          const name = match[2].trim();
          const price = parseFloat(match[3]);

          // If quantity > 1, create multiple items
          for (let i = 0; i < quantity; i++) {
            items.push({
              item_name: name,
              category: '',
              brand: '',
              size: '',
              allocated_cost: price / quantity,
              status: 'Unlisted',
            });
          }
          continue; // Skip adding item below
        } else if (pattern === itemPatterns[2]) {
          // Name | Category | Brand | Price
          item = {
            item_name: match[1].trim(),
            category: match[2].trim(),
            brand: match[3].trim(),
            size: '',
            allocated_cost: parseFloat(match[4]),
            status: 'Unlisted',
          };
        }

        if (item) {
          // Try to extract additional info from item name
          item = enrichItemData(item);
          items.push(item);
          break;
        }
      }
    }
  }

  return items;
};

/**
 * Enrich item data by extracting brand, size from item name
 */
const enrichItemData = (item) => {
  const name = item.item_name;

  // Common size patterns
  const sizePatterns = [
    /\b(XXS|XS|S|M|L|XL|XXL|XXXL)\b/i,
    /\b(Small|Medium|Large)\b/i,
    /\b(\d+(?:\.\d+)?)\s*(oz|lb|kg|g|ml|L)\b/i,
    /\b(?:Size|sz)[:\s]+(\d+(?:[A-Z])?)\b/i,
  ];

  for (const pattern of sizePatterns) {
    const match = name.match(pattern);
    if (match && !item.size) {
      item.size = match[1] || match[0];
      break;
    }
  }

  // Common brand patterns (this is very basic, could be expanded)
  const brandKeywords = ['Nike', 'Adidas', 'Puma', 'Gucci', 'Prada', 'Louis Vuitton', 'Chanel', 'Zara', 'H&M'];
  for (const brand of brandKeywords) {
    if (name.match(new RegExp(`\\b${brand}\\b`, 'i')) && !item.brand) {
      item.brand = brand;
      break;
    }
  }

  // Try to determine category from keywords
  const categoryKeywords = {
    'Clothing': ['shirt', 'pants', 'dress', 'jacket', 'coat', 'sweater', 'jeans', 'shorts'],
    'Shoes': ['shoes', 'boots', 'sneakers', 'sandals', 'heels'],
    'Accessories': ['bag', 'purse', 'wallet', 'belt', 'scarf', 'hat'],
    'Electronics': ['phone', 'laptop', 'tablet', 'camera', 'headphones'],
    'Home': ['lamp', 'chair', 'table', 'decor', 'art'],
  };

  if (!item.category) {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (name.match(new RegExp(`\\b${keyword}\\b`, 'i'))) {
          item.category = category;
          break;
        }
      }
      if (item.category) break;
    }
  }

  return item;
};

/**
 * Allocate costs proportionally across items
 * Distributes the total cost based on item base costs
 */
const allocateCosts = (items, totalCost) => {
  // Calculate base total
  const baseTotal = items.reduce((sum, item) => sum + (item.allocated_cost || 0), 0);

  if (baseTotal === 0) {
    // Equal distribution if no costs specified
    const costPerItem = totalCost / items.length;
    items.forEach(item => {
      item.allocated_cost = parseFloat(costPerItem.toFixed(2));
    });
  } else if (baseTotal !== totalCost) {
    // Proportional distribution
    const ratio = totalCost / baseTotal;
    items.forEach(item => {
      item.allocated_cost = parseFloat((item.allocated_cost * ratio).toFixed(2));
    });

    // Adjust for rounding errors
    const allocatedTotal = items.reduce((sum, item) => sum + item.allocated_cost, 0);
    const diff = totalCost - allocatedTotal;
    if (diff !== 0 && items.length > 0) {
      items[0].allocated_cost = parseFloat((items[0].allocated_cost + diff).toFixed(2));
    }
  }
};

/**
 * Parse date string to YYYY-MM-DD format
 */
const parseDate = (dateString) => {
  try {
    const parts = dateString.split(/[-/]/);
    if (parts.length !== 3) return null;

    let month, day, year;

    // Try MM/DD/YYYY or MM-DD-YYYY
    if (parseInt(parts[0]) <= 12) {
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
      year = parseInt(parts[2]);
    }
    // Try DD/MM/YYYY or DD-MM-YYYY
    else if (parseInt(parts[1]) <= 12) {
      day = parseInt(parts[0]);
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else {
      return null;
    }

    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    // Validate
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
      return null;
    }

    // Format as YYYY-MM-DD
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch {
    return null;
  }
};

/**
 * Generate a sample invoice for testing
 */
export const getSampleInvoice = () => {
  return `Invoice from Vintage Clothing Store

Date: 12/15/2024
Vendor: Vintage Threads LLC

Items:
Nike Air Max Sneakers Size 10 - $45.00
Levi's Denim Jacket Medium - $35.00
Vintage Band T-Shirt Large - $15.00
Adidas Track Pants Size M - $25.00

Subtotal: $120.00
Tax: $10.80
Total: $130.80`;
};
