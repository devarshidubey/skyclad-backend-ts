import { User } from "../../models/User.js";

export const updateUserRole = async (userId: string, role: string)=> {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true },
    ).select("-password");

    return updatedUser;
}

export const fetchUsers = async()=> {
    const users = await User.find({}).lean();
    return users;
}