export class VisionService {
  static async processImage(_imageFile: File): Promise<string> {
    throw new Error('Vision OCR service is in feature preview mode.');
  }
}
