import sharp from 'sharp';
import path from 'path';

export default async function (content, map, meta) {
  const callback = this.async();
  const options = this.getOptions();

  const getOptimizedFile = async (file) => {
    const fileExt = path.extname(file)
    switch (fileExt) {
      case '.jpg':
        return await sharp(content).jpeg({
          quality: 80,
          mozjpeg: true,
        }).toBuffer();
      case '.png':
        return await sharp(content).png({
          quality: 80,
          effort: 10,
        }).toBuffer();
    }
  }

  const optimized = await getOptimizedFile(this.resourcePath);
  callback(null, optimized);
};

export const raw = true;
