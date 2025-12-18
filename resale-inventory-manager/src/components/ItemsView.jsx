import { useState, useMemo } from 'react';
import { Table } from './Table';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import {
  formatCurrency,
  calculateDaysListed,
  getUniqueValues,
} from '../utils/helpers';
import { ConfirmDialog } from './Modal';

export const ItemsView = ({
  items,
  purchases,
  onEdit,
  onDelete,
  onAddItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    purchase: '',
    category: '',
    brand: '',
    status: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Get unique values for filters
  const categories = useMemo(() => getUniqueValues(items, 'category'), [items]);
  const brands = useMemo(() => getUniqueValues(items, 'brand'), [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
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

      return true;
    });
  }, [items, searchTerm, filters]);

  const handleDelete = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.item_id);
      setDeleteConfirm(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      purchase: '',
      category: '',
      brand: '',
      status: '',
    });
  };

  // Get purchase name by ID
  const getPurchaseName = (purchaseId) => {
    const purchase = purchases.find(p => p.purchase_id === purchaseId);
    return purchase ? purchase.purchase_name : '-';
  };

  const columns = [
    {
      key: 'item_name',
      label: 'Item Name',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: 'purchase_id',
      label: 'Purchase',
      render: (value) => (
        <span className="text-sm text-gray-600">{getPurchaseName(value)}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'brand',
      label: 'Brand',
    },
    {
      key: 'size',
      label: 'Size',
    },
    {
      key: 'allocated_cost',
      label: 'Cost',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Unlisted: 'bg-gray-100 text-gray-800',
          Listed: 'bg-blue-100 text-blue-800',
          Sold: 'bg-green-100 text-green-800',
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[value] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: 'listing_price',
      label: 'List Price',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'sale_price',
      label: 'Sale Price',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'net_profit',
      label: 'Profit',
      render: (value) => (
        <span
          className={`font-medium ${
            value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : ''
          }`}
        >
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'listing_date',
      label: 'Days Listed',
      render: (value, row) => {
        if (!value) return '-';
        const days = calculateDaysListed(value, row.sale_date);
        return days !== null ? `${days} days` : '-';
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const purchaseOptions = purchases.map(p => ({
    value: p.purchase_id,
    label: p.purchase_name,
  }));

  const categoryOptions = categories.map(c => ({
    value: c,
    label: c,
  }));

  const brandOptions = brands.map(b => ({
    value: b,
    label: b,
  }));

  const statusOptions = [
    { value: 'Unlisted', label: 'Unlisted' },
    { value: 'Listed', label: 'Listed' },
    { value: 'Sold', label: 'Sold' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-1">
            Manage your inventory items and listings
          </p>
        </div>
        <Button onClick={onAddItem}>Add Item</Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <Button size="sm" variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Select
            label="Purchase"
            value={filters.purchase}
            onChange={(e) =>
              setFilters({ ...filters, purchase: e.target.value })
            }
            options={purchaseOptions}
            placeholder="All Purchases"
          />
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            options={categoryOptions}
            placeholder="All Categories"
          />
          <Select
            label="Brand"
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            options={brandOptions}
            placeholder="All Brands"
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
            placeholder="All Statuses"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredItems.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Unlisted</p>
          <p className="text-2xl font-bold text-gray-600">
            {filteredItems.filter(i => i.status === 'Unlisted').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Listed</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredItems.filter(i => i.status === 'Listed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Sold</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredItems.filter(i => i.status === 'Sold').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredItems}
        emptyMessage="No items found. Try adjusting your filters or add a new item."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteConfirm?.item_name}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
