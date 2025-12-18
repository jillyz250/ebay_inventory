# Resale Inventory Manager

A comprehensive React-based web application for managing resale inventory, tracking purchases, items, and sales. Built for individual resellers who need a simple, efficient way to manage their business without complex database systems.

## Features

### 📦 Purchase Management
- Track purchase lots with vendor, date, cost, and notes
- View purchase statistics (items, sold count, revenue, profit)
- Calculate ROI and profit margins automatically

### 🏷️ Item Management
- Detailed item tracking with category, brand, size, and cost allocation
- Item status workflow: Unlisted → Listed → Sold
- Advanced filtering by purchase, category, brand, and status
- Sortable columns for easy data analysis

### 💰 Sales Tracking
- Dedicated sold items view with profit analysis
- Track sale price, platform fees, and net profit
- Calculate days to sell for each item
- Summary statistics for total revenue and profit

### 📄 Invoice Parser
- Automatically extract purchase and item data from invoice text
- Smart cost allocation across items
- Conservative parsing that doesn't guess missing data
- Sample invoice included for testing

### 🤖 AI-Assisted Features
- Auto-generate listing descriptions from item fields
- Insert condition report templates with structured sections
- Neutral, professional listing copy

### 💾 Data Management
- Browser localStorage for instant data persistence
- Export all data to JSON for backup
- Import data from previously exported files
- No server or database required

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **localStorage** - Client-side data persistence

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
cd resale-inventory-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` directory to Netlify:
   - Via Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

   - Via Netlify UI:
     - Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

   - Via Git:
     - Connect your repository to Netlify
     - Set build command: `npm run build`
     - Set publish directory: `dist`

### Other Static Hosts

The app is a static site and can be deployed to any static hosting service:
- Vercel
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## Usage Guide

### Adding Data

There are three ways to add data:

1. **Parse Invoice** - Paste invoice text to automatically extract purchase and items
2. **Add Purchase** - Manually create a purchase lot (add items later)
3. **Add Single Item** - Add a single item to an existing purchase

### Managing Purchases

- View all purchases with statistics in the Purchases view
- Edit purchase details (name, vendor, date, cost)
- Delete purchases (removes all associated items)
- Track total items, sold count, revenue, and profit

### Managing Items

- View all items with detailed information
- Filter by purchase, category, brand, or status
- Sort by any column
- Edit item details, update status, add listing/sale information
- Use AI-assisted features to generate descriptions and condition reports

### Tracking Sales

- View sold items history in the Sold view
- See sale date, price, fees, and profit for each item
- Track days to sell
- View summary statistics

### Data Backup

- Export your data regularly using Import/Export
- Save JSON backup files to your computer
- Import data to restore or transfer to another device

## Project Structure

```
src/
├── components/        # React components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Modal.jsx
│   ├── Table.jsx
│   ├── PurchasesView.jsx
│   ├── ItemsView.jsx
│   ├── SoldItemsView.jsx
│   ├── PurchaseForm.jsx
│   ├── ItemForm.jsx
│   ├── InvoiceParserForm.jsx
│   └── ImportExport.jsx
├── utils/            # Utility functions
│   ├── storage.js    # localStorage wrapper
│   ├── invoiceParser.js  # Invoice parsing logic
│   └── helpers.js    # Helper functions
├── hooks/            # Custom React hooks
│   └── useInventory.js
├── App.jsx           # Main application component
├── main.jsx          # Application entry point
└── index.css         # Global styles
```

## Data Model

### Purchase
```javascript
{
  purchase_id: string,
  purchase_name: string,
  vendor: string,
  purchase_date: string (YYYY-MM-DD),
  total_purchase_cost: number,
  notes: string
}
```

### Item
```javascript
{
  item_id: string,
  purchase_id: string,
  item_name: string,
  category: string,
  brand: string,
  size: string,
  allocated_cost: number,
  listing_description: string,
  condition_report: string,
  listing_date: string (YYYY-MM-DD) | null,
  listing_price: number | null,
  sale_date: string (YYYY-MM-DD) | null,
  sale_price: number | null,
  platform_fees: number,
  net_profit: number | null,
  status: "Unlisted" | "Listed" | "Sold",
  notes: string
}
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires localStorage support.

## License

MIT License - feel free to use this for your resale business!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

Built with ❤️ for resellers
