/**
 * File Upload Utilities
 *
 * Cross-platform utilities for handling file uploads in Expo/React Native
 * Supports both Web (File objects) and Mobile (expo-image-picker format)
 */

import { Platform } from 'react-native';

/**
 * Image data that can be either:
 * - Web: File object
 * - Mobile: { uri, type, name } from expo-image-picker
 */
export type ImageData =
  | File
  | { uri: string; type?: string; name?: string };

/**
 * Append an image to FormData, handling both Web and React Native formats
 * AUTOMATICALLY converts URIs to File objects on Web platform
 *
 * @param formData - The FormData to append to
 * @param fieldName - The field name (e.g., 'photo[image]', 'avatar', 'file')
 * @param image - Image data from File input or expo-image-picker
 * @param defaultFilename - Default filename if not provided (default: 'upload.jpg')
 *
 * @example
 * ```typescript
 * // Works on ALL platforms (Web + iOS + Android)
 * const result = await ImagePicker.launchImageLibraryAsync(...);
 * const formData = new FormData();
 *
 * await appendImageToFormData(formData, 'photo[image]', {
 *   uri: result.assets[0].uri,
 *   type: result.assets[0].mimeType,
 * }, 'photo.jpg');
 * ```
 */
export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  image: ImageData,
  defaultFilename: string = 'upload.jpg'
): Promise<void> {
  // Check if it's React Native format (has uri property)
  if (typeof image === 'object' && 'uri' in image && image.uri) {
    if (Platform.OS === 'web') {
      // Web: Convert URI to File object (expo-image-picker returns blob: URIs)
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const file = new File([blob], defaultFilename, {
        type: image.type || blob.type || 'image/jpeg'
      });
      formData.append(fieldName, file);
    } else {
      // Mobile: Use React Native format { uri, type, name }
      formData.append(fieldName, {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name || defaultFilename,
      } as any);
    }
  } else {
    // Direct File object (Web file input)
    formData.append(fieldName, image as File);
  }
}

/**
 * Create a File object from a URI (Web only)
 * Useful for converting blob URLs to File objects
 *
 * @param uri - The blob URL or data URI
 * @param filename - The filename for the File object
 * @param mimeType - The MIME type (default: 'image/jpeg')
 * @returns Promise<File>
 *
 * @example
 * ```typescript
 * const blob = await fetch(imageUri).then(r => r.blob());
 * const file = await createFileFromUri(URL.createObjectURL(blob), 'photo.jpg');
 * ```
 */
export async function createFileFromUri(
  uri: string,
  filename: string,
  mimeType: string = 'image/jpeg'
): Promise<File> {
  if (Platform.OS !== 'web') {
    throw new Error('createFileFromUri is only available on web platform');
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}

/**
 * Check if the platform supports File objects
 *
 * @returns true if running on web, false if on mobile
 */
export function supportsFileObject(): boolean {
  return Platform.OS === 'web';
}

/**
 * Validate image data before upload
 *
 * @param image - Image data to validate
 * @returns Object with isValid and error message
 *
 * @example
 * ```typescript
 * const validation = validateImageData(imageData);
 * if (!validation.isValid) {
 *   Alert.alert('Error', validation.error);
 *   return;
 * }
 * ```
 */
export function validateImageData(image: ImageData): {
  isValid: boolean;
  error?: string;
} {
  if (!image) {
    return { isValid: false, error: 'No image provided' };
  }

  // Check React Native format
  if (typeof image === 'object' && 'uri' in image) {
    if (!image.uri) {
      return { isValid: false, error: 'Image URI is empty' };
    }
    return { isValid: true };
  }

  // Check Web File format
  if (image instanceof File) {
    if (image.size === 0) {
      return { isValid: false, error: 'Image file is empty' };
    }
    if (!image.type.startsWith('image/')) {
      return { isValid: false, error: 'File is not an image' };
    }
    return { isValid: true };
  }

  return { isValid: false, error: 'Invalid image format' };
}

