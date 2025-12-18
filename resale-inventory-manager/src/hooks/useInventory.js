import { useState, useEffect, useCallback } from 'react';
import {
  getPurchases,
  getItems,
  createPurchase,
  updatePurchase,
  deletePurchase,
  createItem,
  createItems,
  updateItem,
  deleteItem,
  exportData,
  importData,
} from '../utils/storage';

/**
 * Custom hook for managing inventory data
 */
export const useInventory = () => {
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const purchasesData = getPurchases();
    const itemsData = getItems();
    setPurchases(purchasesData);
    setItems(itemsData);
    setLoading(false);
  }, []);

  const loadData = useCallback(() => {
    const purchasesData = getPurchases();
    const itemsData = getItems();
    setPurchases(purchasesData);
    setItems(itemsData);
  }, []);

  // Purchase operations
  const addPurchase = useCallback((purchaseData) => {
    const newPurchase = createPurchase(purchaseData);
    setPurchases(prev => [...prev, newPurchase]);
    return newPurchase;
  }, []);

  const modifyPurchase = useCallback((purchaseId, updates) => {
    const updated = updatePurchase(purchaseId, updates);
    if (updated) {
      setPurchases(prev =>
        prev.map(p => p.purchase_id === purchaseId ? updated : p)
      );
    }
    return updated;
  }, []);

  const removePurchase = useCallback((purchaseId) => {
    deletePurchase(purchaseId);
    setPurchases(prev => prev.filter(p => p.purchase_id !== purchaseId));
    setItems(prev => prev.filter(i => i.purchase_id !== purchaseId));
  }, []);

  // Item operations
  const addItem = useCallback((itemData) => {
    const newItem = createItem(itemData);
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const addItems = useCallback((itemsArray) => {
    const newItems = createItems(itemsArray);
    setItems(prev => [...prev, ...newItems]);
    return newItems;
  }, []);

  const modifyItem = useCallback((itemId, updates) => {
    const updated = updateItem(itemId, updates);
    if (updated) {
      setItems(prev =>
        prev.map(i => i.item_id === itemId ? updated : i)
      );
    }
    return updated;
  }, []);

  const removeItem = useCallback((itemId) => {
    deleteItem(itemId);
    setItems(prev => prev.filter(i => i.item_id !== itemId));
  }, []);

  // Import/Export
  const handleExport = useCallback(() => {
    return exportData();
  }, []);

  const handleImport = useCallback((data) => {
    const success = importData(data);
    if (success) {
      loadData();
    }
    return success;
  }, [loadData]);

  return {
    purchases,
    items,
    loading,
    addPurchase,
    modifyPurchase,
    removePurchase,
    addItem,
    addItems,
    modifyItem,
    removeItem,
    handleExport,
    handleImport,
    reload: loadData,
  };
};
