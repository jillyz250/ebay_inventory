import { useState } from 'react';
import { useInventory } from './hooks/useInventory';
import { PurchasesView } from './components/PurchasesView';
import { ItemsView } from './components/ItemsView';
import { SoldItemsView } from './components/SoldItemsView';
import { PurchaseForm } from './components/PurchaseForm';
import { ItemForm } from './components/ItemForm';
import { InvoiceParserForm } from './components/InvoiceParserForm';
import { ImportExportModal } from './components/ImportExport';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

function App() {
  const {
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
  } = useInventory();

  const [activeView, setActiveView] = useState('purchases');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showInvoiceParser, setShowInvoiceParser] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Handle adding purchase
  const handleAddPurchase = (purchaseData) => {
    if (editingPurchase) {
      modifyPurchase(editingPurchase.purchase_id, purchaseData);
      setEditingPurchase(null);
    } else {
      addPurchase(purchaseData);
    }
  };

  // Handle adding item
  const handleAddItem = (itemData) => {
    if (editingItem) {
      modifyItem(editingItem.item_id, itemData);
      setEditingItem(null);
    } else {
      addItem(itemData);
    }
  };

  // Handle invoice parsing
  const handleInvoiceSubmit = (purchase, items) => {
    // Create purchase
    const newPurchase = addPurchase(purchase);

    // Create items with purchase_id
    const itemsWithPurchaseId = items.map(item => ({
      ...item,
      purchase_id: newPurchase.purchase_id,
    }));
    addItems(itemsWithPurchaseId);
  };

  // Handle edit purchase
  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setShowPurchaseForm(true);
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  // Navigation items
  const navItems = [
    { id: 'purchases', label: 'Purchases', icon: '📦' },
    { id: 'items', label: 'Items', icon: '🏷️' },
    { id: 'sold', label: 'Sold', icon: '💰' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resale Inventory Manager
              </h1>
              <p className="text-sm text-gray-600">
                Manage your resale business inventory
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowImportExport(true)}
              >
                Import / Export
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowAddOptions(true)}
              >
                + Add New
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeView === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'purchases' && (
          <PurchasesView
            purchases={purchases}
            items={items}
            onEdit={handleEditPurchase}
            onDelete={removePurchase}
            onAddPurchase={() => setShowPurchaseForm(true)}
          />
        )}

        {activeView === 'items' && (
          <ItemsView
            items={items}
            purchases={purchases}
            onEdit={handleEditItem}
            onDelete={removeItem}
            onAddItem={() => setShowItemForm(true)}
          />
        )}

        {activeView === 'sold' && (
          <SoldItemsView items={items} purchases={purchases} />
        )}
      </main>

      {/* Add Options Modal */}
      <Modal
        isOpen={showAddOptions}
        onClose={() => setShowAddOptions(false)}
        title="Add New Data"
        size="md"
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowAddOptions(false);
              setShowInvoiceParser(true);
            }}
            className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900 mb-1">
              📄 Parse Invoice
            </div>
            <div className="text-sm text-gray-600">
              Paste invoice text to automatically extract purchase and items
            </div>
          </button>

          <button
            onClick={() => {
              setShowAddOptions(false);
              setShowPurchaseForm(true);
            }}
            className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900 mb-1">
              📦 Add Purchase
            </div>
            <div className="text-sm text-gray-600">
              Manually create a new purchase/lot (you can add items later)
            </div>
          </button>

          <button
            onClick={() => {
              setShowAddOptions(false);
              setShowItemForm(true);
            }}
            className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900 mb-1">
              🏷️ Add Single Item
            </div>
            <div className="text-sm text-gray-600">
              Add a single item to an existing purchase
            </div>
          </button>
        </div>
      </Modal>

      {/* Forms and Modals */}
      <PurchaseForm
        isOpen={showPurchaseForm}
        onClose={() => {
          setShowPurchaseForm(false);
          setEditingPurchase(null);
        }}
        onSubmit={handleAddPurchase}
        purchase={editingPurchase}
      />

      <ItemForm
        isOpen={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        onSubmit={handleAddItem}
        item={editingItem}
        purchases={purchases}
      />

      <InvoiceParserForm
        isOpen={showInvoiceParser}
        onClose={() => setShowInvoiceParser(false)}
        onSubmit={handleInvoiceSubmit}
      />

      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
}

export default App;
