import { useState } from 'react';
import { Modal } from './Modal';
import { Input, TextArea } from './Input';
import { Button } from './Button';

export const PurchaseForm = ({ isOpen, onClose, onSubmit, purchase = null }) => {
  const [formData, setFormData] = useState(
    purchase || {
      purchase_name: '',
      vendor: '',
      purchase_date: new Date().toISOString().split('T')[0],
      total_purchase_cost: '',
      notes: '',
    }
  );

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      total_purchase_cost: parseFloat(formData.total_purchase_cost) || 0,
    };

    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={purchase ? 'Edit Purchase' : 'Add Purchase'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Purchase Name"
          value={formData.purchase_name}
          onChange={(e) => handleChange('purchase_name', e.target.value)}
          placeholder="e.g., Estate Sale - Dec 2024"
          required
        />

        <Input
          label="Vendor"
          value={formData.vendor}
          onChange={(e) => handleChange('vendor', e.target.value)}
          placeholder="e.g., Goodwill, Estate Sale, etc."
        />

        <Input
          label="Purchase Date"
          type="date"
          value={formData.purchase_date}
          onChange={(e) => handleChange('purchase_date', e.target.value)}
          required
        />

        <Input
          label="Total Purchase Cost"
          type="number"
          step="0.01"
          min="0"
          value={formData.total_purchase_cost}
          onChange={(e) => handleChange('total_purchase_cost', e.target.value)}
          placeholder="0.00"
          required
        />

        <TextArea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any notes about this purchase..."
          rows={3}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {purchase ? 'Update' : 'Create'} Purchase
          </Button>
        </div>
      </form>
    </Modal>
  );
};
