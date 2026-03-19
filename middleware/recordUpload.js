const multer = require('multer');
const fs = require('fs');

const dir = 'public/lab_reports/';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dir)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
});

const uploadRecord = multer({ storage: storage });

module.exports={
    uploadRecord
}
