import multer from "multer";

/*
Multer is required to handle multipart/form-data like the ones we have for
startup and profile where we also upload image files. This is not supported with http by default.
This configuration saves the images directly in memory as a buffer, which we can then store in our database.
*/
const upload = multer({
  limits: {
    fieldSize: 25 * 1024 * 1024, // 25MB limit for each field
  },
});

export default upload;
