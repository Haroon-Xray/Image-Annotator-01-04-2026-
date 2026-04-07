# Day 3: UI Implementation & Annotations

## Overview
Day 3 focused on building the React user interface, implementing the annotation canvas, and creating interactive components.

## ✅ Completed Tasks

### React Components Created

#### CanvasViewer Component
**Purpose:** Render image and handle drawing interactions

**Features:**
- Display uploaded image at full resolution
- Mouse event handling for freehand drawing
- Real-time canvas updates
- Zoom and pan capabilities
- Clear canvas functionality

**Key Methods:**
```javascript
- handleMouseDown()    // Start drawing
- handleMouseMove()    // Continue drawing
- handleMouseUp()      // Finish drawing
- clearCanvas()        // Clear all drawings
- resetCanvas()        // Reset to original
```

#### AnnotationCanvas Component
**Purpose:** Draw and manage bounding boxes

**Features:**
- Rectangular bounding box drawing
- Box editing (resize, move)
- Multi-class support with color coding
- Real-time coordinate normalization
- Box deletion and management
- Confidence score display

**Box Operations:**
```javascript
- drawBox()           // Create new bounding box
- resizeBox()         // Adjust box dimensions
- moveBox()           // Translate box position
- deleteBox()         // Remove box from canvas
- getBoxes()          // Retrieve all boxes
```

#### ImageSidebar Component
**Purpose:** Manage uploaded images

**Features:**
- List thumbnails of uploaded images
- Quick navigation between images
- Image deletion
- Image metadata display
- Active image highlighting

#### AnnotationsPanel Component
**Purpose:** Display and manage annotations

**Features:**
- List all annotations for current image
- Show bounding box coordinates
- Display class labels and IDs
- Delete annotation functionality
- Annotation statistics

#### Navbar Component
**Purpose:** Main navigation and controls

**Features:**
- Navigation buttons
- Upload image interface
- Generate YOLO dataset button
- Inference feature access
- Status messages

### Custom Hooks

#### useAnnotations Hook
**Purpose:** Manage annotation state and operations

**Features:**
```javascript
- annotations[]                    // Current annotations
- addAnnotation(box)              // Add new box
- updateAnnotation(id, updates)   // Modify annotation
- deleteAnnotation(id)            // Remove annotation
- clearAnnotations()              // Clear all boxes
- saveAnnotationToDb(imageId, annotation)  // Save to backend
```

**State Management:**
- Local state for instant UI updates
- API calls for database persistence
- Error handling and retry logic

#### useCanvas Hook
**Purpose:** Canvas drawing operations

**Features:**
```javascript
- scale                           // Zoom level
- offset                          // Pan position
- setScale()                      // Update zoom
- setOffset()                     // Update pan
- normalizeCoordinates()          // Convert to YOLO format
- denormalizeCoordinates()        // Convert from YOLO format
```

### API Integration

#### Axios Configuration
```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

#### Image Upload Process
```javascript
1. User selects image
2. File validation
3. POST to /api/images/
4. Get image_id
5. Update local state
6. Display on canvas
```

#### Annotation Saving
```javascript
1. User draws box
2. Normalize coordinates
3. POST to /api/images/{id}/annotations/
4. Receive annotation_id
5. Update local list
6. Display confirmation
```

### UI/UX Features

#### Color Coding
- Each class gets distinct color
- Helps visual differentiation
- Accessible color palette

#### Coordinate System
- Canvas coordinates (pixels)
- YOLO coordinates (normalized 0-1)
- Automatic conversion both ways

#### Responsive Design
- Works on different screen sizes
- Mobile-friendly layout
- Touch support for drawing

#### Error Handling
- User-friendly error messages
- Graceful degradation
- Retry mechanisms

## 🎨 Component Architecture

```
App
├── Navbar
├── ImageSidebar
├── CanvasViewer
│   └── AnnotationCanvas
├── AnnotationsPanel
└── InferencePanel (Day 5)
```

## 📦 Key Libraries

| Library | Purpose |
|---------|---------|
| axios | HTTP client for API calls |
| lucide-react | Icon library |
| Canvas API | Drawing annotations |
| React Hooks | State management |
| CSS Modules | Component styling |

## 🔄 Event Flow

### Box Drawing Flow
```
MouseDown on Canvas
    ↓
Capture initial position
    ↓
MouseMove (continuous)
    ↓
Update box dimensions
    ↓
MouseUp
    ↓
Normalize coordinates
    ↓
POST to /api/images/{id}/annotations/
    ↓
Display confirmation
```

### Image Update Flow
```
User select different image
    ↓
Fetch image details
    ↓
Clear canvas
    ↓
Load image
    ↓
Fetch annotations
    ↓
Draw existing boxes
    ↓
Update sidebar
```

## 🧪 Interactive Features

- [x] Image display and navigation
- [x] Real-time box drawing
- [x] Box editing (move, resize, delete)
- [x] Multi-class support
- [x] Coordinate normalization
- [x] API integration
- [x] Auto-save to database
- [x] Error handling
- [x] Responsive UI
- [x] Keyboard shortcuts

## 📊 Performance Optimizations

### Canvas Rendering
- Efficient redraw on changes only
- Debounced mouse events
- Optimized coordinate calculations

### State Management
- Memoized callbacks
- Optimized re-renders
- Lazy loading of thumbnails

### API Calls
- Debounced auto-save
- Batch updates where possible
- Caching of image data

## 🚀 Next Steps

→ **Day 4**: Security hardening and environment configuration
