# YOLO Generation Feature - Quick Reference & Testing Guide

## ✅ What Was Implemented

### 1. **Database Storage** (Already Existing + Enhanced)
- Annotations stored in `Annotation` model with YOLO-compatible fields:
  - `class_id`: YOLO class identifier (0-indexed)
  - `x_center`, `y_center`: Normalized center coordinates (0-1)
  - `width`, `height`: Normalized dimensions (0-1)

### 2. **File Download Functionality** (NEW)
- **Single image**: Downloads `.txt` file with YOLO annotations
- **Multiple images**: Downloads `.zip` file containing all label files
- Automatic browser download triggered
- Filenames: `{image_id}_{image_name}.txt` or `yolo_dataset_{count}_images.zip`

### 3. **YOLO Format Output** (NEW)
```
<class_id> <x_center> <y_center> <width> <height>
```
Example:
```
0 0.45 0.52 0.35 0.48
1 0.72 0.38 0.28 0.42
```

---

## 🧪 Testing Steps

### Prerequisites
1. Backend running: `python manage.py runserver`
2. Frontend running: `npm run dev`
3. Database with migrations applied

### Test Case 1: Single Image Export
1. Upload 1 image
2. Add 2-3 annotations with different class IDs
3. Click "Generate YOLO"
4. ✅ Browser downloads `{id}_imagename.txt`
5. ✅ File contains 2-3 lines in YOLO format

### Test Case 2: Multiple Images Export
1. Upload 3 images
2. Add annotations to each (1-3 boxes per image)
3. Click "Generate YOLO"
4. ✅ Browser downloads `yolo_dataset_3_images.zip`
5. ✅ Unzip and verify 3 `.txt` files with correct content
6. ✅ Each file has correct number of annotations

### Test Case 3: Database Verification
1. After generating YOLO files
2. Check database: `python manage.py shell`
3. Verify annotations:
   ```python
   from annotator.models import Image, Annotation
   Image.objects.all()
   Annotation.objects.filter(image_id=1)
   ```
4. ✅ All annotations saved with correct normalized coordinates

---

## 📋 File Structure After Generation

### On Disk (Optional Archival)
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

### Downloaded Files
```
yolo_dataset_3_images.zip
├── 1_photo1.txt
├── 2_photo2.txt
└── 3_photo3.txt
```

---

## 🔄 API Response Headers

When generating YOLO dataset, response includes:

| Header | Example | Purpose |
|--------|---------|---------|
| `Content-Type` | `text/plain` or `application/zip` | File type |
| `Content-Disposition` | `attachment; filename="..."` | Trigger download |
| `X-Total-Annotations` | `5` | Total annotation count |
| `X-Images-Count` | `1` or `3` | Number of images |

---

## 🛠️ Troubleshooting

### Issue: File doesn't download
- **Check**: Browser console for errors
- **Solution**: Ensure `responseType: 'blob'` in axios request
- **Verify**: FileResponse header is set correctly

### Issue: Coordinates are wrong
- **Check**: Are annotations stored with normalized values (0-1)?
- **Solution**: Ensure conversion to normalized coordinates before saving
- **Verify**: `x_center`, `y_center`, `width`, `height` fields have float values 0-1

### Issue: Missing annotations in file
- **Check**: Annotations saved in database?
- **Solution**: Run bulk annotations before YOLO generation
- **Verify**: `Annotation.objects.filter(image_id=X)` returns all boxes

---

## 📊 Example YOLO Files

### Image with 2 objects (classes 0 and 1):
```
0 0.45 0.52 0.35 0.48
1 0.72 0.38 0.28 0.42
```

### Image with 5 objects (mixed classes):
```
0 0.25 0.30 0.20 0.25
1 0.65 0.45 0.25 0.40
0 0.50 0.70 0.30 0.35
2 0.15 0.15 0.10 0.12
1 0.80 0.60 0.15 0.20
```

---

## 🚀 Production Checklist

- [ ] Test single image export
- [ ] Test multiple image export (3+ images)
- [ ] Verify database storage
- [ ] Check file naming conventions
- [ ] Verify YOLO format correctness
- [ ] Test ZIP file integrity
- [ ] Verify download triggers correctly
- [ ] Check error handling for edge cases
- [ ] Test with different class IDs (0, 1, 2, etc.)
- [ ] Verify normalized coordinates are correct

---

## 📝 Notes

- Annotations are **always stored in DB** when submitted
- Files are **always stored on disk** in `dataset/` directory
- Downloads are **separate** from disk storage
- Downloaded files follow YOLO format specification
- ZIP files use DEFLATE compression
- Filenames include image ID for uniqueness
