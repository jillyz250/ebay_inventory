// localStorage wrapper for data persistence

const STORAGE_KEYS = {
  PURCHASES: 'resale_purchases',
  ITEMS: 'resale_items',
};

// Helper to generate unique IDs
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generic storage functions
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

// Purchase CRUD operations
export const getPurchases = () => {
  return getFromStorage(STORAGE_KEYS.PURCHASES);
};

export const getPurchaseById = (purchaseId) => {
  const purchases = getPurchases();
  return purchases.find(p => p.purchase_id === purchaseId);
};

export const createPurchase = (purchaseData) => {
  const purchases = getPurchases();
  const newPurchase = {
    purchase_id: generateId(),
    purchase_name: '',
    vendor: '',
    purchase_date: new Date().toISOString().split('T')[0],
    total_purchase_cost: 0,
    notes: '',
    ...purchaseData,
  };
  purchases.push(newPurchase);
  saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
  return newPurchase;
};

export const updatePurchase = (purchaseId, updates) => {
  const purchases = getPurchases();
  const index = purchases.findIndex(p => p.purchase_id === purchaseId);
  if (index !== -1) {
    purchases[index] = { ...purchases[index], ...updates };
    saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
    return purchases[index];
  }
  return null;
};

export const deletePurchase = (purchaseId) => {
  const purchases = getPurchases();
  const filtered = purchases.filter(p => p.purchase_id !== purchaseId);
  saveToStorage(STORAGE_KEYS.PURCHASES, filtered);

  // Also delete all items associated with this purchase
  const items = getItems();
  const filteredItems = items.filter(i => i.purchase_id !== purchaseId);
  saveToStorage(STORAGE_KEYS.ITEMS, filteredItems);

  return true;
};

// Item CRUD operations
export const getItems = () => {
  return getFromStorage(STORAGE_KEYS.ITEMS);
};

export const getItemById = (itemId) => {
  const items = getItems();
  return items.find(i => i.item_id === itemId);
};

export const getItemsByPurchaseId = (purchaseId) => {
  const items = getItems();
  return items.filter(i => i.purchase_id === purchaseId);
};

export const createItem = (itemData) => {
  const items = getItems();
  const newItem = {
    item_id: generateId(),
    purchase_id: '',
    item_name: '',
    category: '',
    brand: '',
    size: '',
    allocated_cost: 0,
    listing_description: '',
    condition_report: '',
    listing_date: null,
    listing_price: null,
    sale_date: null,
    sale_price: null,
    platform_fees: 0,
    net_profit: null,
    status: 'Unlisted',
    notes: '',
    ...itemData,
  };
  items.push(newItem);
  saveToStorage(STORAGE_KEYS.ITEMS, items);
  return newItem;
};

export const updateItem = (itemId, updates) => {
  const items = getItems();
  const index = items.findIndex(i => i.item_id === itemId);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };

    // Auto-calculate net profit if sale_price and platform_fees are available
    if (items[index].sale_price !== null && items[index].allocated_cost !== null) {
      const fees = items[index].platform_fees || 0;
      items[index].net_profit = items[index].sale_price - fees - items[index].allocated_cost;
    }

    saveToStorage(STORAGE_KEYS.ITEMS, items);
    return items[index];
  }
  return null;
};

export const deleteItem = (itemId) => {
  const items = getItems();
  const filtered = items.filter(i => i.item_id !== itemId);
  saveToStorage(STORAGE_KEYS.ITEMS, filtered);
  return true;
};

// Bulk operations
export const createItems = (itemsArray) => {
  const items = getItems();
  const newItems = itemsArray.map(itemData => ({
    item_id: generateId(),
    purchase_id: '',
    item_name: '',
    category: '',
    brand: '',
    size: '',
    allocated_cost: 0,
    listing_description: '',
    condition_report: '',
    listing_date: null,
    listing_price: null,
    sale_date: null,
    sale_price: null,
    platform_fees: 0,
    net_profit: null,
    status: 'Unlisted',
    notes: '',
    ...itemData,
  }));
  items.push(...newItems);
  saveToStorage(STORAGE_KEYS.ITEMS, items);
  return newItems;
};

// Import/Export functions
export const exportData = () => {
  return {
    purchases: getPurchases(),
    items: getItems(),
    exportDate: new Date().toISOString(),
  };
};

export const importData = (data) => {
  try {
    if (data.purchases && Array.isArray(data.purchases)) {
      saveToStorage(STORAGE_KEYS.PURCHASES, data.purchases);
    }
    if (data.items && Array.isArray(data.items)) {
      saveToStorage(STORAGE_KEYS.ITEMS, data.items);
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PURCHASES);
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  return true;
};
