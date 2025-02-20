import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const generateUserAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };


    } catch (error) {
        console.error("Error in generateUserAccessAndRefreshToken:", error.message);
        throw new Error('Error generating access and refresh token');
    }
}
const registerUser = async (req, res) => {
    try {
        // get the details of the user from the frontend

        const { username, email, password } = req.body;

        // validate input ( if the user has entered all the required fields)

        if ([username, email, password].some((field) => field?.trim() === "")) {
            return res.status(400).json(
                {
                    success: false,
                    message: 'Please enter all fields'
                });
        }

        // check if the user already exists

        const userExists = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email }]
        })

        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            })
        }

        const user = await User.create({
            username: username.toLowerCase(),
            email,
            password,
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if (!createdUser) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong while creating the user'
            })
        }

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: createdUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

const loginUser = async (req, res) => {

    // fetch the user details from the frontend
    try {
        const { email, username, password } = req.body;

        if (!email && !username) {
            return res.status(400).json({
                success: false,
                message: 'Please enter email or username'
            });
        }

        // login from username or email
        const user = await User.findOne({
            $or: [{ email }, { username }]
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // password check
        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email, username or password'
            });
        }

        // generate access and refresh token

        const { accessToken, refreshToken } = await generateUserAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // send cookies to the frontend

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User logged in successfully",
                data: loggedInUser
            })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

const logoutUser = async (req, res)=>{
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true,
            }
        )
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: true,
            message: "User logged out successfully"
        })
        
    } catch (error) {
        console.error("Error during logout:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error during logout",
        });
        
    }
}

const refreshAccessToken = async (req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new Error('Unauthorized access');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user) {
            throw new Error('Invalid refresh token');
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new Error('Refresh token is expired or used');
        }
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }
    
        const {accessToken, newRefreshToken} = await generateUserAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken
            },
            message: "Access token refreshed successfully"
        })
    } catch (error) {
        console.error("Error during token refresh:", error.message);
        return res.status(403).json({
            success: false,
            message: "Session expired or invalid token. Please log in again."
        })
        
    }

    
}
export { registerUser, loginUser, logoutUser, refreshAccessToken };