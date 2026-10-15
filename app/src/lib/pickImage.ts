import * as ImagePicker from 'expo-image-picker';

export type PickedImage = { uri: string };
export type PickResult = { image?: PickedImage; error?: string };

/**
 * Opens the photo library and checks type and size.
 * maxMb: 10 for chat photos, 5 for WhatsApp broadcasts (WhatsApp's image limit).
 */
export async function pickImage(maxMb: number): Promise<PickResult> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8 });
  if (result.canceled || !result.assets?.length) return {};
  const asset = result.assets[0];
  const type = asset.mimeType ?? '';
  if (type && !/^image\/(jpeg|png|webp)$/.test(type)) return { error: 'Please choose a JPG, PNG or WebP photo.' };
  if (asset.fileSize && asset.fileSize > maxMb * 1024 * 1024) return { error: `That photo is over ${maxMb} MB. Try a smaller one.` };
  return { image: { uri: asset.uri } };
}
