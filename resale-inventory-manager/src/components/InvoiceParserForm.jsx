import { useState } from 'react';
import { Modal } from './Modal';
import { TextArea } from './Input';
import { Button } from './Button';
import { parseInvoice, getSampleInvoice } from '../utils/invoiceParser';

export const InvoiceParserForm = ({ isOpen, onClose, onSubmit }) => {
  const [invoiceText, setInvoiceText] = useState('');
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState('');

  const handleParse = () => {
    setError('');
    const result = parseInvoice(invoiceText);

    if (!result.success) {
      setError(result.error || 'Failed to parse invoice');
      setParseResult(null);
      return;
    }

    if (result.items.length === 0) {
      setError('No items found in invoice. Please check the format.');
      setParseResult(null);
      return;
    }

    setParseResult(result);
  };

  const handleSubmit = () => {
    if (parseResult && parseResult.success) {
      onSubmit(parseResult.purchase, parseResult.items);
      handleClose();
    }
  };

  const handleClose = () => {
    setInvoiceText('');
    setParseResult(null);
    setError('');
    onClose();
  };

  const loadSample = () => {
    setInvoiceText(getSampleInvoice());
    setParseResult(null);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Parse Invoice"
      size="xl"
    >
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Paste your invoice text below</li>
            <li>Include vendor name, date, total cost, and item details</li>
            <li>Click "Parse Invoice" to extract the data</li>
            <li>Review the results and submit</li>
          </ul>
          <Button
            size="sm"
            variant="outline"
            onClick={loadSample}
            className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Load Sample Invoice
          </Button>
        </div>

        {/* Input */}
        <div>
          <TextArea
            label="Invoice Text"
            value={invoiceText}
            onChange={(e) => {
              setInvoiceText(e.target.value);
              setParseResult(null);
              setError('');
            }}
            placeholder="Paste your invoice text here..."
            rows={12}
          />
        </div>

        {/* Parse Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleParse}
            disabled={!invoiceText.trim()}
            variant="primary"
          >
            Parse Invoice
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {parseResult && parseResult.success && (
          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-medium text-gray-900 mb-3">
              Parse Results
            </h4>

            {/* Purchase Info */}
            <div className="mb-4">
              <h5 className="font-medium text-sm text-gray-700 mb-2">
                Purchase Information:
              </h5>
              <div className="bg-white rounded border p-3 text-sm space-y-1">
                <div>
                  <span className="font-medium">Name:</span>{' '}
                  {parseResult.purchase.purchase_name}
                </div>
                <div>
                  <span className="font-medium">Vendor:</span>{' '}
                  {parseResult.purchase.vendor || 'Not found'}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{' '}
                  {parseResult.purchase.purchase_date}
                </div>
                <div>
                  <span className="font-medium">Total Cost:</span> $
                  {parseResult.purchase.total_purchase_cost.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h5 className="font-medium text-sm text-gray-700 mb-2">
                Items Found: {parseResult.items.length}
              </h5>
              <div className="bg-white rounded border p-3 max-h-60 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-left py-2 px-2">Brand</th>
                      <th className="text-left py-2 px-2">Size</th>
                      <th className="text-right py-2 px-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.items.map((item, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 px-2">{item.item_name}</td>
                        <td className="py-2 px-2">
                          {item.category || '-'}
                        </td>
                        <td className="py-2 px-2">{item.brand || '-'}</td>
                        <td className="py-2 px-2">{item.size || '-'}</td>
                        <td className="py-2 px-2 text-right">
                          ${item.allocated_cost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {parseResult && parseResult.success && (
            <Button variant="success" onClick={handleSubmit}>
              Import Purchase & Items
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
