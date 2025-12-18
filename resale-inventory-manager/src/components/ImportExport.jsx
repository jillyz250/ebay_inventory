import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { downloadJSON, parseJSONFile } from '../utils/helpers';

export const ImportExportModal = ({
  isOpen,
  onClose,
  onExport,
  onImport,
}) => {
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = () => {
    const data = onExport();
    const filename = `resale-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(data, filename);
    setSuccess('Data exported successfully!');
    setTimeout(() => {
      setSuccess('');
      onClose();
    }, 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setError('Please select a JSON file');
        return;
      }
      setImportFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const data = await parseJSONFile(importFile);

      // Validate data structure
      if (!data.purchases || !data.items) {
        throw new Error('Invalid data format. Missing purchases or items.');
      }

      if (!Array.isArray(data.purchases) || !Array.isArray(data.items)) {
        throw new Error('Invalid data format. Purchases and items must be arrays.');
      }

      // Import data
      const imported = onImport(data);
      if (imported) {
        setSuccess('Data imported successfully!');
        setTimeout(() => {
          setSuccess('');
          setImportFile(null);
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to import data');
      }
    } catch (err) {
      setError(err.message || 'Error importing data');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setImportFile(null);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import / Export Data"
      size="md"
    >
      <div className="space-y-6">
        {/* Export Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Download all your purchases and items as a JSON backup file.
          </p>
          <Button onClick={handleExport} variant="primary">
            Export to JSON
          </Button>
        </div>

        {/* Import Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Import Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import purchases and items from a previously exported JSON file.
          </p>

          <div className="mb-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            {importFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {importFile.name}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Importing will replace all existing data.
              Make sure to export your current data first if you want to keep it.
            </p>
          </div>

          <Button
            onClick={handleImport}
            variant="primary"
            disabled={!importFile || importing}
          >
            {importing ? 'Importing...' : 'Import from JSON'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
