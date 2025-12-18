import { useState } from 'react';
import { Modal } from './Modal';
import { Input, TextArea } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { generateListingDescription, generateConditionReport } from '../utils/helpers';

export const ItemForm = ({
  isOpen,
  onClose,
  onSubmit,
  item = null,
  purchases = [],
  selectedPurchaseId = null,
}) => {
  const [formData, setFormData] = useState(
    item || {
      purchase_id: selectedPurchaseId || '',
      item_name: '',
      category: '',
      brand: '',
      size: '',
      allocated_cost: '',
      listing_description: '',
      condition_report: '',
      listing_date: '',
      listing_price: '',
      sale_date: '',
      sale_price: '',
      platform_fees: '',
      status: 'Unlisted',
      notes: '',
    }
  );

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGenerateDescription = () => {
    const description = generateListingDescription(formData);
    setFormData({ ...formData, listing_description: description });
  };

  const handleGenerateConditionReport = () => {
    const report = generateConditionReport();
    setFormData({ ...formData, condition_report: report });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      allocated_cost: parseFloat(formData.allocated_cost) || 0,
      listing_price: formData.listing_price ? parseFloat(formData.listing_price) : null,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      platform_fees: parseFloat(formData.platform_fees) || 0,
      listing_date: formData.listing_date || null,
      sale_date: formData.sale_date || null,
    };

    onSubmit(data);
    onClose();
  };

  const purchaseOptions = purchases.map(p => ({
    value: p.purchase_id,
    label: p.purchase_name,
  }));

  const statusOptions = [
    { value: 'Unlisted', label: 'Unlisted' },
    { value: 'Listed', label: 'Listed' },
    { value: 'Sold', label: 'Sold' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Item' : 'Add Item'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Basic Information
            </h3>
          </div>

          <div className="col-span-2">
            <Select
              label="Purchase"
              value={formData.purchase_id}
              onChange={(e) => handleChange('purchase_id', e.target.value)}
              options={purchaseOptions}
              placeholder="Select purchase"
              required
            />
          </div>

          <div className="col-span-2">
            <Input
              label="Item Name"
              value={formData.item_name}
              onChange={(e) => handleChange('item_name', e.target.value)}
              placeholder="e.g., Nike Air Max Sneakers"
              required
            />
          </div>

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="e.g., Shoes"
          />

          <Input
            label="Brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g., Nike"
          />

          <Input
            label="Size"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="e.g., M, 10, etc."
          />

          <Input
            label="Allocated Cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.allocated_cost}
            onChange={(e) => handleChange('allocated_cost', e.target.value)}
            placeholder="0.00"
            required
          />

          {/* Listing Info */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Listing Information
            </h3>
          </div>

          <div className="col-span-2">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={statusOptions}
              required
            />
          </div>

          <Input
            label="Listing Date"
            type="date"
            value={formData.listing_date}
            onChange={(e) => handleChange('listing_date', e.target.value)}
          />

          <Input
            label="Listing Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.listing_price}
            onChange={(e) => handleChange('listing_price', e.target.value)}
            placeholder="0.00"
          />

          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Listing Description
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGenerateDescription}
              >
                Generate Template
              </Button>
            </div>
            <TextArea
              value={formData.listing_description}
              onChange={(e) => handleChange('listing_description', e.target.value)}
              placeholder="Enter listing description..."
              rows={4}
            />
          </div>

          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Condition Report
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGenerateConditionReport}
              >
                Insert Template
              </Button>
            </div>
            <TextArea
              value={formData.condition_report}
              onChange={(e) => handleChange('condition_report', e.target.value)}
              placeholder="Enter condition report..."
              rows={6}
            />
          </div>

          {/* Sale Info */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Sale Information
            </h3>
          </div>

          <Input
            label="Sale Date"
            type="date"
            value={formData.sale_date}
            onChange={(e) => handleChange('sale_date', e.target.value)}
          />

          <Input
            label="Sale Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.sale_price}
            onChange={(e) => handleChange('sale_price', e.target.value)}
            placeholder="0.00"
          />

          <div className="col-span-2">
            <Input
              label="Platform Fees"
              type="number"
              step="0.01"
              min="0"
              value={formData.platform_fees}
              onChange={(e) => handleChange('platform_fees', e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any notes..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {item ? 'Update' : 'Create'} Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};
