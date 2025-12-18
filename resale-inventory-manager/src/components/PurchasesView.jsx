import { useState, useMemo } from 'react';
import { Table } from './Table';
import { Button } from './Button';
import { Input } from './Input';
import { formatCurrency, formatDate, calculatePurchaseStats } from '../utils/helpers';
import { ConfirmDialog } from './Modal';

export const PurchasesView = ({
  purchases,
  items,
  onEdit,
  onDelete,
  onAddPurchase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Calculate stats for each purchase
  const purchasesWithStats = useMemo(() => {
    return purchases.map(purchase => {
      const stats = calculatePurchaseStats(purchase, items);
      return {
        ...purchase,
        ...stats,
      };
    });
  }, [purchases, items]);

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    if (!searchTerm) return purchasesWithStats;

    const searchLower = searchTerm.toLowerCase();
    return purchasesWithStats.filter(purchase =>
      purchase.purchase_name.toLowerCase().includes(searchLower) ||
      purchase.vendor.toLowerCase().includes(searchLower) ||
      purchase.notes.toLowerCase().includes(searchLower)
    );
  }, [purchasesWithStats, searchTerm]);

  const handleDelete = (purchase) => {
    setDeleteConfirm(purchase);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.purchase_id);
      setDeleteConfirm(null);
    }
  };

  const columns = [
    {
      key: 'purchase_name',
      label: 'Purchase Name',
      render: (value) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor',
    },
    {
      key: 'purchase_date',
      label: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'total_purchase_cost',
      label: 'Total Cost',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'itemCount',
      label: 'Items',
      render: (value) => (
        <span className="text-center block">{value}</span>
      ),
    },
    {
      key: 'soldCount',
      label: 'Sold',
      render: (value, row) => (
        <span className="text-center block">
          {value} / {row.itemCount}
        </span>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (value) => (
        <span className={value > 0 ? 'text-green-600 font-medium' : ''}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'profit',
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
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Completed: 'bg-green-100 text-green-800',
          Active: 'bg-blue-100 text-blue-800',
          'Not Started': 'bg-gray-100 text-gray-800',
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600 mt-1">
            Manage your inventory purchases and lots
          </p>
        </div>
        <Button onClick={onAddPurchase}>Add Purchase</Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search purchases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900">
            {purchases.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">
            {purchasesWithStats.reduce((sum, p) => sum + p.itemCount, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(
              purchasesWithStats.reduce((sum, p) => sum + p.revenue, 0)
            )}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Profit</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              purchasesWithStats.reduce((sum, p) => sum + p.profit, 0)
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredPurchases}
        emptyMessage="No purchases found. Click 'Add Purchase' to get started."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Purchase"
        message={`Are you sure you want to delete "${deleteConfirm?.purchase_name}"? This will also delete all associated items.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
