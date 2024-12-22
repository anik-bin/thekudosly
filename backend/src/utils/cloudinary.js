import {v2 as cloudinary} from "cloudinary"; // Importing the v2 module from the cloudinary package
import fs from "fs"; // Importing the fs module from the Node.js standard library

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            throw new Error("Please provide a file path");
        }
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
        console.log("File uploaded successfully: ", response.url);
        return response.url;
        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary };