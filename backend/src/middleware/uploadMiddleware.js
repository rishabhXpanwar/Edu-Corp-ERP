import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v4 as uuidv4 } from 'uuid';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'educore',
    format: file.mimetype.split('/')[1],
    public_id: uuidv4(),
  }),
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

export const uploadSingle = (fieldName) =>
  multer({ storage, fileFilter }).single(fieldName);

export const uploadArray = (fieldName, max = 5) =>
  multer({ storage, fileFilter }).array(fieldName, max);