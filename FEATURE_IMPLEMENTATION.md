# Example Photo Feature Implementation

## Overview
This implementation adds the ability for admins to upload example photos when creating photo upload questions in the dental tourism platform. Users will see these example photos as references when uploading their own dental photos.

## Features Added

### 1. Storage Service (`src/lib/storage.ts`)
- `StorageService` class for handling file uploads to Supabase storage
- Methods for uploading, deleting, and managing example photos
- File validation for image uploads
- Organized storage structure with dedicated path for question examples

### 2. Example Photo Upload Component (`src/components/ui/photo-example-upload.tsx`)
- `PhotoExampleUpload` component for admin interface
- Drag & drop file upload with validation
- Image preview and instructions field
- Integration with question configuration

### 3. Updated Question Configuration
- Enhanced `FileUploadConfig` and `DentalPhotoUploadConfiguration` components
- Added example photo section to photo upload question configuration
- Support for both file upload and photo upload question types

### 4. User-Facing Display
- Updated `PhotoUploadQuestion` and `FileUploadQuestion` components
- Display example photos to users with instructions
- Styled example photo section with green highlight

### 5. API Integration (`src/app/api/upload/route.ts`)
- RESTful API for file upload and deletion
- Support for different upload types (example photos, general uploads)
- Proper error handling and validation

### 6. Admin Interface Integration
- Updated question editor in admin panel
- Passes question ID to configuration components for file uploads
- Support for both creating new questions and editing existing ones

## Database Schema Changes Required

The feature uses the existing `options` field in the `questionnaire_questions` table to store example photo data:

```json
{
  "example_photo": {
    "url": "https://storage.url/path/to/image.jpg",
    "path": "question-examples/question-id-example.jpg",
    "instructions": "Optional instructions for users"
  }
}
```

## Supabase Storage Setup Required

1. Create a storage bucket named `uploads`
2. Set up appropriate RLS policies for the bucket
3. Configure public access for example photos

## Usage Flow

### Admin Flow:
1. Admin creates/edits a photo upload question
2. In the question configuration, admin can upload an example photo
3. Admin can add instructions explaining what the photo should show
4. Example photo is uploaded to Supabase storage
5. Photo URL and metadata are saved in question options

### User Flow:
1. User sees the question with example photo displayed
2. User can view the example photo as reference
3. User uploads their own photo following the example
4. Example photo helps ensure consistent photo quality and angle

## Technical Details

### File Upload Process:
1. Client validates file (type, size)
2. File is uploaded via `/api/upload` endpoint
3. Server validates and processes file
4. File is stored in Supabase storage
5. Public URL is returned and saved in question configuration

### Storage Organization:
- Example photos: `question-examples/{questionId}-example.{ext}`
- General uploads: `uploads/{timestamp}-{filename}`

## Future Enhancements
- Multiple example photos per question
- Different examples for different dental photo types
- Image compression and optimization
- Batch upload for multiple questions
- Example photo templates/library 