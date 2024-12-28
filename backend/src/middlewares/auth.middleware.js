import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';

export const verifyJWT = async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Autho   rization")?.replace("Bearer ", "");
    
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access'
            });
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid Access Token'
            });
        }
    
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(403).json({
            success: false,
            message: "Session expired or invalid token. Please log in again.",
        });   
    }
}