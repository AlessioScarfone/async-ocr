import { CustomValidator } from "express-validator";
import path from "path";
import env from "../config/env";

const acceptedFileType = ["image/png", "image/jpg", "image/jpeg", "image/bmp"];
const filetypesExtension = /bmp|jpg|png/;

const customValidatorMimeType: CustomValidator = (value, { req }) => {
    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    //check file extension
    const extnameCheck = filetypesExtension.test(fileExtension);

    if (acceptedFileType.includes(req.file.mimetype) && extnameCheck) {
        return true;
    } else {
        console.log(`Error : [${req.requestID}] - Mimetype not valid:`, {mimetype: req.file.mimetype, ext: fileExtension})
        return false;
    }
}

const customValidatorFileSize: CustomValidator = (value, { req }) => {
    const file = req.file;
    if (file.size <= env.file.sizeLimit) {
        return file.size;
    } else {
        return false;
    }
}

export { customValidatorFileSize, customValidatorMimeType }