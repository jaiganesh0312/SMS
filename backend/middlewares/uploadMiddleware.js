const multer = require("multer");
const path = require("path");

// Use memory storage to process files directly from buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /xlsx|xls|csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Mimetype check can be tricky for excel, sticking to extension for simplicity or broad types
  // const mimetype = ...

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Excel or CSV files only!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
