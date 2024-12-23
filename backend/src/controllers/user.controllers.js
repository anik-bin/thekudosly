import { User } from "../models/user.models.js";
const registerUser = async (req, res) => {
    try {
        // get the details of the user from the frontend

        const {username, email, password} = req.body;

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
            $or: [{username: username.toLowerCase()}, {email}]
        }).catch((error) => {
            throw new Error("Database error: ", error);
        });

        if(userExists){
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

        if(!createdUser){
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
        res.status(500).json({message: 'Server Error'});
    }
}

export {registerUser};