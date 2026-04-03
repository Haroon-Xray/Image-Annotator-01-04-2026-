# Quick Start: Multi-Image Annotation & YOLO Export

## 🚀 New Features in One Minute

### Upload Multiple Images
1. Click the upload area or drag-drop images
2. Add 10+ images at once
3. See them in the sidebar with annotation counters

### Annotate All Images
1. Click an image to select it
2. Draw boxes using the canvas
3. Repeat for other images
4. Annotations tracked separately per image

### Export to YOLO Format
**Option 1: Submit Annotations to Backend**
```
Click "📤 Submit" button
→ All annotations sent to /api/images/bulk/annotations/
→ See confirmation message
```

**Option 2: Generate YOLO Dataset**
```
Click "🚀 Generate YOLO" button
→ Creates dataset/images/ and dataset/labels/
→ Each box becomes a .txt file with YOLO format
→ Ready for YOLOv8, YOLOv5, etc.
```

---

## 📦 Generated Dataset Format

```
dataset/
├── images/
│   ├── 1_photo1.jpg
│   ├── 2_photo2.jpg
│   └── 3_photo3.jpg
└── labels/
    ├── 1_photo1.txt
    ├── 2_photo2.txt
    └── 3_photo3.txt
```

**Each .txt file contains:**
```
0 0.5 0.5 0.3 0.4
1 0.2 0.8 0.1 0.2
0 0.7 0.3 0.25 0.35
```

Format: `<class_id> <x_center> <y_center> <width> <height>`
- All coordinates normalized (0-1)
- One box per line
- Ready for YOLO training

---

## 🔧 Backend API Endpoints

### Bulk Submit Annotations
```http
POST /api/images/bulk/annotations/
Content-Type: application/json

{
  "images": [
    {
      "image_id": 1,
      "annotations": [
        {
          "label": "person",
          "class_id": 0,
          "x_center": 0.5,
          "y_center": 0.5,
          "width": 0.3,
          "height": 0.4
        }
      ]
    }
  ]
}
```

### Generate YOLO Dataset
```http
POST /api/images/yolo/generate/
Content-Type: application/json

{
  "image_ids": [1, 2, 3, 4, 5],
  "output_dir": "dataset"
}
```

---

## ✅ Validation Rules

All annotations must have:
- ✓ `label` - String description (e.g., "person", "car")
- ✓ `class_id` - Integer ≥ 0 (e.g., 0, 1, 2)
- ✓ `x_center` - Float 0.0 to 1.0
- ✓ `y_center` - Float 0.0 to 1.0
- ✓ `width` - Float 0.0 to 1.0
- ✓ `height` - Float 0.0 to 1.0

Frontend canvas **automatically converts pixel coordinates to normalized format** ✨

---

## 📊 Testing

Run YOLO conversion tests:
```bash
python manage.py test annotator.tests.YOLOConverterTestCase -v 2
```

Expected: **9/9 tests passing ✅**

---

## 💾 Database

Migration applied automatically. Annotation model now supports:
- Normalized coordinates (YOLO format)
- Class IDs
- Backward compatible with old pixel coordinates

---

## 🎨 UI Updates

### Navbar Changes
- **New "📤 Submit" button** - Submit all annotations
- **New "🚀 Generate YOLO" button** - Create dataset
- **Status messages** - Real-time feedback
- **Disabled when** - No annotations or no images

### Sidebar Changes
- Annotation count badge on thumbnails
- Multi-image fully supported
- Seamless image switching

---

## 🔄 Workflow Examples

### Example 1: Annotate and Download
```
1. Upload 5 images
   ↓
2. Annotate each with 10-20 boxes
   ↓
3. Click "🚀 Generate YOLO"
   ↓
4. Use dataset/ folder for training
```

### Example 2: Backend Submission
```
1. Upload 10 images
   ↓
2. Annotate all of them
   ↓
3. Click "📤 Submit"
   ↓
4. Backend saves to database
   ↓
5. Later: Generate YOLO dataset from database
```

---

## 📚 Full Documentation

See `MULTI_IMAGE_YOLO_README.md` for:
- Complete API reference
- Request/response examples
- Validation details
- Error handling
- Architecture explanation
- Next steps

See `DAY4_COMPLETION_REPORT.md` for:
- Implementation summary
- File changes list
- Test results
- Quality metrics
- Future enhancements

---

## 🐛 Troubleshooting

**"Coordinates not normalized"**
→ Frontend automatically normalizes; check class_id, width, height

**"Image not found"**
→ Verify image was uploaded before submitting annotations

**"YOLO not generating"**
→ Check that images have annotations; empty images are skipped

**Test failures**
→ Run `python manage.py migrate` first to ensure schema is up-to-date

---

✨ **That's it! You can now annotate 10+ images and export to YOLO format!** ✨
