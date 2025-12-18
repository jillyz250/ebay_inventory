import { useMemo } from 'react';
import { Table } from './Table';
import { formatCurrency, formatDate, calculateDaysListed } from '../utils/helpers';

export const SoldItemsView = ({ items, purchases }) => {
  // Filter only sold items
  const soldItems = useMemo(() => {
    return items
      .filter(item => item.status === 'Sold')
      .sort((a, b) => {
        // Sort by sale_date descending (most recent first)
        if (!a.sale_date) return 1;
        if (!b.sale_date) return -1;
        return new Date(b.sale_date) - new Date(a.sale_date);
      });
  }, [items]);

  // Calculate total stats
  const stats = useMemo(() => {
    const totalRevenue = soldItems.reduce(
      (sum, item) => sum + (item.sale_price || 0),
      0
    );
    const totalCost = soldItems.reduce(
      (sum, item) => sum + (item.allocated_cost || 0),
      0
    );
    const totalFees = soldItems.reduce(
      (sum, item) => sum + (item.platform_fees || 0),
      0
    );
    const totalProfit = totalRevenue - totalCost - totalFees;

    return {
      totalRevenue,
      totalCost,
      totalFees,
      totalProfit,
    };
  }, [soldItems]);

  // Get purchase name by ID
  const getPurchaseName = (purchaseId) => {
    const purchase = purchases.find(p => p.purchase_id === purchaseId);
    return purchase ? purchase.purchase_name : '-';
  };

  const columns = [
    {
      key: 'sale_date',
      label: 'Sale Date',
      render: (value) => (
        <span className="font-medium">{formatDate(value)}</span>
      ),
    },
    {
      key: 'item_name',
      label: 'Item Name',
      render: (value) => (
        <span className="text-blue-600">{value}</span>
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
      key: 'allocated_cost',
      label: 'Cost',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'sale_price',
      label: 'Sale Price',
      render: (value) => (
        <span className="font-medium text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'platform_fees',
      label: 'Fees',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'net_profit',
      label: 'Net Profit',
      render: (value) => (
        <span
          className={`font-bold ${
            value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : ''
          }`}
        >
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'listing_date',
      label: 'Days to Sell',
      render: (value, row) => {
        if (!value || !row.sale_date) return '-';
        const days = calculateDaysListed(value, row.sale_date);
        return days !== null ? `${days} days` : '-';
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sold Items</h1>
        <p className="text-gray-600 mt-1">
          View your sales history and performance
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Items Sold</p>
          <p className="text-2xl font-bold text-gray-900">
            {soldItems.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalCost)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Fees</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalFees)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Net Profit</p>
          <p
            className={`text-2xl font-bold ${
              stats.totalProfit > 0
                ? 'text-green-600'
                : stats.totalProfit < 0
                ? 'text-red-600'
                : 'text-gray-900'
            }`}
          >
            {formatCurrency(stats.totalProfit)}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={soldItems}
        emptyMessage="No sold items yet. Start listing and selling items to see them here!"
      />
    </div>
  );
};
