# SnapToFrame

A client-side web tool for framing images with custom sizes, styling, and effects. All image processing happens locally in your browser - your files never leave your device.

Preview: [SnapToFrame](https://framesnap.hasim.me/)

## Features

- 🖼️ **Image Upload**: Drag and drop or select multiple images
- 📐 **Custom Frame Sizes**: Choose from presets (Square, Portrait, Landscape) or set custom dimensions
- 🎨 **Styling Options**:
  - Background color customization
  - Padding control
  - Border radius for rounded corners
  - Shadow effects with adjustable spread
  - Border styling (solid, dashed, dotted) with customizable color and width
- 🔄 **Fit Modes**: Contain (fit within frame) or Cover (fill entire frame)
- 📤 **Export Options**:
  - Single image export (PNG or JPG)
  - Bulk export as ZIP archive
- 🌓 **Dark Mode**: Toggle between light and dark themes
- ⚡ **Performance**: Web Workers for bulk processing to keep UI responsive
- 🔒 **Privacy**: All processing happens client-side - no server uploads

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Image Processing**: HTML Canvas 2D API
- **Bulk Processing**: Web Workers with OffscreenCanvas
- **Export**: JSZip for bulk downloads

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd snap-to-frame
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage

1. **Upload Images**: Drag and drop images or click to select files
2. **Configure Frame**: Adjust frame size, background, padding, border radius, shadow, and border settings
3. **Preview**: See a live preview of your framed image
4. **Export**: 
   - Click "Export Single Image" for the first uploaded image
   - Click "Export All as ZIP" to download all images as a ZIP archive

### Tips

- **Image Quality**: The quality of exported images depends on the quality of uploaded images. Use high-resolution source images for best results.
- **Fit Modes**: 
  - **Contain**: Image fits within the frame, maintaining aspect ratio (may have empty space)
  - **Cover**: Image fills the entire frame, maintaining aspect ratio (may crop edges)
- **Shadow**: Shadow effects extend beyond the image bounds but are cropped to the frame size in the final export

## Project Structure

```
snap-to-frame/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme support
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ImageUploader.tsx  # Drag & drop image upload
│   ├── PreviewCanvas.tsx # Live preview component
│   ├── FrameControls.tsx # Frame settings controls
│   ├── ExportBar.tsx      # Export buttons and progress
│   ├── ThemeToggle.tsx    # Dark mode toggle
│   └── ui/               # shadcn/ui components
├── lib/                   # Core logic
│   ├── frameEngine.ts    # Main image processing (Canvas 2D)
│   ├── exportEngine.ts   # Export utilities
│   └── workerUtils.ts    # Web Worker helpers
├── workers/               # Web Worker scripts
│   └── bulkWorker.ts     # Bulk image processing worker
└── types/                 # TypeScript types
    └── frame.ts          # Frame configuration types
```

## Privacy & Security

- ✅ All image processing happens in your browser
- ✅ No server uploads or external API calls
- ✅ Files never leave your device
- ✅ No tracking or analytics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires support for:
- HTML Canvas 2D API
- Web Workers
- OffscreenCanvas
- File API

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
