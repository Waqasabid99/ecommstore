import cloudinary from "../config/cloudinary.js";

export const uploadBuffer = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const { resourceType = "image", publicId, format } = options;

    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        format,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// delete image
export const deleteImage = (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};
