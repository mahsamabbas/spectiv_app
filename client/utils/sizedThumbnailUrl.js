import path from 'path';

const sizedThumbnailUrl = (originalUrl, size) => {
  if (!originalUrl || originalUrl.length == 0) {
    throw new Error('No originalUrl passed to sizedThumbnailUrl')
  }
  const baseName = path.basename(originalUrl);
  const dirName = path.dirname(originalUrl);
  const delimiter = '/';
  return `${dirName}${delimiter}${size}${delimiter}${baseName}`;
}; 

export default sizedThumbnailUrl;