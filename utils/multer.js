import multer from "multer";
import shortid from "shortid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(
    import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

// export default multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, path.join(path.dirname(__dirname), "uploads/products"));
//     },
//     filename: function(req, file, cb) {
//         cb(null, shortid.generate() + "-" + file.originalname);
//     },
// });
const storage = (directory) => {
    multer.diskStorage(folder, {
        destination: function(req, file, cb) {
            cb(null, path.join(path.dirname(__dirname), `uploads/${directory}`));
        },
        filename: function(req, file, cb) {
            cb(null, shortid.generate() + "-" + file.originalname);
        },
    });
};
export default upload = {
    multerUpload: function(directory) {
        multer(storage(directory));
    },
};