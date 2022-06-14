const multer = require('multer');
const path = require('path');
const fs = require('fs');

const multerConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        const dir = path.join(__dirname, '../../public/uploads/');
        fs.mkdirSync(dir, {recursive: true});
        callback(null, dir);
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split('/')[1];
        callback(null, `lobo-image-${Date.now()}.${ext}`);
    }
})

const uploadMulter = multer({
    storage: multerConfig,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('File type not accepted (.png, .jpg, .jpeg)'));
        }
    }
});

module.exports = uploadMulter;