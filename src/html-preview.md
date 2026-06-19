# HTML Email Preview Component - Architecture Documentation

## Overview

A React component for previewing HTML email content across different devices and email clients. Built with React,
TypeScript, Tailwind CSS, and shadcn/ui.

## File Structure

```
components/
├── html-preview.tsx              # Main orchestrator component
├── device-mockup.tsx             # Physical device frame wrapper
├── email-client-mockup.tsx       # Email client UI router
├── preview-controls.tsx          # Control bars and buttons
├── device-elements/
│   ├── index.ts
│   ├── phone-status-bar.tsx      # iPhone status bar (time, signal, battery)
│   ├── dynamic-island.tsx        # iPhone Dynamic Island
│   ├── notch.tsx                 # MacBook/iPhone notch
│   └── home-indicator.tsx        # iPhone home indicator bar
├── email-client-uis/
│   ├── index.ts
│   ├── apple-mail.tsx            # Apple Mail UI (macOS/iOS style)
│   ├── gmail.tsx                 # Gmail UI (Material Design)
│   ├── outlook.tsx               # Outlook UI (Ribbon interface)
│   ├── yahoo-mail.tsx            # Yahoo Mail UI
│   ├── hey.tsx                   # HEY Email UI (minimalist)
│   └── email-content-iframe.tsx  # Shared iframe for HTML content
data/
├── devices.ts                    # Device configurations (40+ devices)
└── email-clients.ts             # Email client configurations
types/
└── html-preview.ts              # Shared TypeScript types
```

## Architecture

### Component Hierarchy

```
HTMLPreview (Main Component)
├── PreviewControls (Toolbar)
│   ├── DeviceSelector (Dropdown)
│   │   └── DeviceGroup (Category sections)
│   ├── EmailClientSelector (Select)
│   ├── ZoomControls (Slider + buttons)
│   └── ActionButtons (Copy, Download, Open, Theme, Fullscreen)
├── DeviceMockup (Physical device frame)
│   ├── PhoneStatusBar (Conditional)
│   ├── DynamicIsland (Conditional)
│   ├── Notch (Conditional)
│   ├── HomeIndicator (Conditional)
│   └── EmailClientMockup (Screen content)
│       ├── AppleMailUI / GmailUI / OutlookUI / YahooMailUI / HeyUI
│       └── EmailContentIframe (HTML content)
└── DeviceLabel (Footer with specs)
```

### Data Flow

```
User Input (HTML) 
  → HTMLPreview (state management)
    → EmailClientMockup (generates email HTML with styles)
      → EmailClientUI (renders email client chrome)
        → EmailContentIframe (displays user's HTML)
          → iframe (sandboxed rendering)
```

## Key Components

### 1. HTMLPreview (`components/html-preview.tsx`)

**Purpose**: Main orchestrator component. Manages all state and passes it down.

**State Management**:

- `isFullscreen` - Toggle fullscreen preview mode
- `device` - Currently selected device (iphone-15-pro, pixel-8-pro, etc.)
- `emailClient` - Email client UI to render (apple-mail, gmail, outlook, etc.)
- `theme` - Light/dark mode
- `zoom` - Zoom level (25-200%)
- `localZoom` - Real-time zoom for smooth slider updates
- `showFrame` - Show/hide device frame
- `orientation` - Portrait/landscape mode
- `iframeKey` - Key to force iframe remount on fullscreen toggle

**Key Features**:

- Handles fullscreen toggle with iframe remount to fix content loading issue
- Calculates display dimensions based on orientation
- Provides copy, download, and open-in-browser functionality

**Props**:

```typescript
interface HTMLPreviewProps {
    htmlContent: string;
    className?: string;
    onFullscreenChange?: (isFullscreen: boolean) => void;
}
```

### 2. DeviceMockup (`components/device-mockup.tsx`)

**Purpose**: Renders the physical device frame around the email client.

**Calculations**:

- Display dimensions based on orientation
- Frame dimensions with padding for device bezels
- Screen offsets for proper positioning
- Border radius adjustments for screen vs frame

**Props**:

```typescript
interface DeviceMockupProps {
    deviceConfig: DeviceConfig;
    clientConfig: EmailClientConfig;
    htmlContent: string;
    theme: ThemeMode;
    emailClient: EmailClient;
    showFrame: boolean;
    orientation: "portrait" | "landscape";
    scale: number;
    iframeKey: number;
    className?: string;
}
```

### 3. EmailClientMockup (`components/email-client-mockup.tsx`)

**Purpose**: Routes to the appropriate email client UI and generates the HTML content for the iframe.

**HTML Generation**:

- Wraps user's HTML with email-appropriate styles
- Applies theme-aware colors
- Adds responsive image handling
- Styles typography, links, tables, etc.

**Props**:

```typescript
interface EmailClientMockupProps {
    clientConfig: EmailClientConfig;
    htmlContent: string;
    theme: ThemeMode;
    emailClient: string;
    iframeKey: number;
}
```

### 4. Email Client UIs

Each email client UI is a separate component with its own realistic design:

#### AppleMailUI (`components/email-client-uis/apple-mail.tsx`)

- Sidebar with mailboxes (Inbox, VIP, Sent, Drafts, Trash, Archive)
- Toolbar with action buttons (Back, Archive, Delete, Reply, Forward, Flag)
- Sender avatar, name, email, and date display
- Apple-style typography and spacing
- Light/dark mode support matching macOS

#### GmailUI (`components/email-client-uis/gmail.tsx`)

- Material Design header with Gmail logo
- Action icons (Archive, Delete, Mark unread, More)
- Sender info with star and reply buttons
- Google Sans font styling
- Compact layout with proper spacing

#### OutlookUI (`components/email-client-uis/outlook.tsx`)

- Left sidebar with app icons (Mail, Calendar, People, Tasks)
- Folder list panel (Inbox, Drafts, Sent Items, etc.)
- Ribbon toolbar (Reply, Reply All, Forward, Delete, Archive, Flag)
- Blue header matching Office 365 design
- Segoe UI font styling

#### YahooMailUI (`components/email-client-uis/yahoo-mail.tsx`)

- Purple branded header
- Simple reply button
- Clean layout with sender info
- Yahoo Sans font

#### HeyUI (`components/email-client-uis/hey.tsx`)

- Minimalist design with blue accent
- Large sender avatar
- Centered content layout
- Avenir Next font

### 5. EmailContentIframe (`components/email-client-uis/email-content-iframe.tsx`)

**Purpose**: Shared iframe component that renders the user's HTML content.

**Key Features**:

- Uses `srcdoc` attribute for content (not `document.write`)
- Force content load on mount with `setTimeout`
- Updates when `emailHTML` changes
- Remounts when `iframeKey` changes

**Props**:

```typescript
interface EmailContentIframeProps {
    emailHTML: string;
    iframeKey: number;
}
```

### 6. PreviewControls (`components/preview-controls.tsx`)

**Purpose**: Control bar with all user interaction elements.

**Sub-components**:

- `DeviceSelector` - Dropdown menu with categorized devices
- `DeviceGroup` - Category section in device dropdown
- `ZoomControls` - Slider and zoom in/out buttons
- `ControlButton` - Reusable button with tooltip

**Props**:

```typescript
interface PreviewControlsProps {
    device: DeviceType;
    emailClient: EmailClient;
    theme: ThemeMode;
    zoom: number;
    localZoom: number;
    showFrame: boolean;
    orientation: "portrait" | "landscape";
    displayWidth: number;
    displayHeight: number;
    isFullscreen: boolean;
    onDeviceChange: (device: DeviceType) => void;
    onEmailClientChange: (client: EmailClient) => void;
    onThemeToggle: () => void;
    onZoomChange: (values: number[]) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFrameToggle: () => void;
    onOrientationToggle: () => void;
    onCopy: () => void;
    onDownload: () => void;
    onOpenInBrowser: () => void;
    onFullscreenToggle: () => void;
}
```

## Device Configurations (`data/devices.ts`)

**Categories**: phone, tablet, laptop, desktop

**Device Properties**:

```typescript
interface DeviceConfig {
    name: string;           // Display name
    brand: string;          // Manufacturer
    width: number;          // Viewport width in CSS pixels
    height: number;         // Viewport height in CSS pixels
    frameColor: string;     // Device frame color
    borderRadius: number;   // Frame border radius
    hasNotch: boolean;      // Has notch (MacBooks, iPhone 14)
    hasDynamicIsland: boolean; // Has Dynamic Island (iPhone 15 Pro)
    hasHomeBar: boolean;    // Has home indicator bar
    category: "phone" | "tablet" | "laptop" | "desktop";
    dpi: number;           // Device pixel density
}
```

**Supported Devices** (40+):

- **iPhones**: 15 Pro, 15, 14 Pro, 14, SE (3rd gen)
- **Pixels**: 8 Pro, 8, 7a
- **Samsung**: S24 Ultra, S24, A54
- **iPads**: Pro 11", Pro 12.9", Air (5th gen), Mini (6th gen)
- **MacBooks**: Pro 14", Pro 16", Air 15"
- **Desktops**: 1080p, 1440p, 4K

## Email Client Configurations (`data/email-clients.ts`)

```typescript
interface EmailClientConfig {
    name: string;              // Display name
    icon: React.ReactNode;     // SVG icon
    headerBg: string;          // Header background (light mode)
    headerBgDark: string;      // Header background (dark mode)
    headerText: string;        // Header text color (light mode)
    headerTextDark: string;    // Header text color (dark mode)
    accentColor: string;       // Brand accent color
    fontFamily: string;        // Primary font stack
    avatarBg: string;         // Avatar background color
}
```

**Supported Clients**:

- Apple Mail
- Gmail
- Outlook
- Yahoo Mail
- HEY

## Types (`types/html-preview.ts`)

```typescript
type DeviceType = "iphone-15-pro" | "iphone-15" |
...
;
type EmailClient = "apple-mail" | "gmail" | "outlook" | "yahoo-mail" | "hey";
type ThemeMode = "light" | "dark";

interface DeviceConfig {
    ...
}

interface EmailClientConfig {
    ...
}

interface HTMLPreviewProps {
    htmlContent: string;
    className?: string;
    onFullscreenChange?: (isFullscreen: boolean) => void;
}
```

## Known Issues & Fixes Applied

### Issue 1: HTML Content Not Visible on Load

**Symptom**: Content not showing until theme toggle clicked
**Fix**:

- Added `iframeKey` state to force iframe remount
- Increment key when entering fullscreen
- Use `setTimeout` in mount effect to ensure content loads
- Added `srcDoc` prop directly on iframe element

### Issue 2: Fullscreen Not Resetting Zoom

**Symptom**: Device size from non-fullscreen persists in fullscreen
**Fix**: Reset `zoom` and `localZoom` to 100 when entering fullscreen mode

### Issue 3: Slider Not Updating in Real-Time

**Symptom**: Size only updates when slider stops moving
**Fix**: Added `localZoom` state for immediate visual feedback while `zoom` tracks final value

### Issue 4: Deprecated `document.write`

**Symptom**: Linter warning about deprecated API
**Fix**: Replaced with `srcdoc` attribute on iframe element

## Usage

```tsx
import {HTMLPreview} from "@/components/html-preview";

function MyComponent() {
    const [htmlContent, setHtmlContent] = useState("<h1>Hello World</h1>");

    return (
        <HTMLPreview
            htmlContent={htmlContent}
            onFullscreenChange={(isFullscreen) => {
                console.log("Fullscreen:", isFullscreen);
            }}
        />
    );
}
```

## Adding a New Email Client UI

1. Create new file in `components/email-client-uis/`
2. Export component following `EmailClientUIProps` interface
3. Import and add to `components/email-client-uis/index.ts`
4. Add case in `EmailClientMockup` component
5. Add configuration in `data/email-clients.ts`

## Adding a New Device

1. Add device config to `data/devices.ts`
2. Add type to `DeviceType` in `types/html-preview.ts`

## Styling Notes

- Uses Tailwind CSS with shadcn/ui components
- Custom styles via inline `style` prop for dynamic colors
- Device frames use absolute positioning
- Email client UIs use flexbox layouts
- Slider uses Tailwind v4 `**` descendant selector syntax for custom styling

## Performance Considerations

- `useMemo` for expensive calculations (display dimensions, scale, HTML generation)
- `useCallback` for event handlers passed to child components
- Iframe `sandbox` attribute for security
- `srcdoc` instead of `document.write` for better performance

## Future Improvements

- [ ] Add email client UI for Thunderbird, Spark, Canary
- [ ] Add more Android devices (OnePlus, Xiaomi, etc.)
- [ ] Add tablet landscape-specific layouts
- [ ] Add email thread/conversation view
- [ ] Add attachment preview in email clients
- [ ] Add keyboard shortcuts
- [ ] Add screenshot/export functionality
- [ ] Add responsive email testing mode
- [ ] Add accessibility testing features
- [ ] Add print preview mode