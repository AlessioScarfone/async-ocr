import { CustomValidator } from "express-validator";
import path from "path";
import { fileSizeLimitMap } from "../config/env";
import RapidApiHeaders from "../models/RapidApiHeaders";
import { SubscriptionPlan } from "../models/SubscriptionPlan";

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
    const subscription = String(req.get(RapidApiHeaders.subscription));
    let limit = fileSizeLimitMap.get(subscription?.toUpperCase());
    if(!limit) {
        console.log(`NO LIMIT FOUND FOR SUBSCRIPTION: [${subscription}]`)
        limit = fileSizeLimitMap.get(SubscriptionPlan.BASIC);
    }
    if (file.size <= limit) {
        return file.size;
    } else {
        console.log("File too large:", file.size)
        return false;
    }
}

export { customValidatorFileSize, customValidatorMimeType }