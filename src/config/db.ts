import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDb = async function() {
    try{
        mongoose.connect(process.env.MONGO_URI!, {})
        //logger.info("DB connected");
    } catch(error) {
        if(error instanceof Error) {
            logger.error({
                message: error.message,
                stack: error.stack,
            })
        } else {
            logger.error({ message: String(error) })
        }
        
        process.exit(1);
    }
    mongoose.connection.on('disconnected', ()=> {
        logger.error({
            message: "DB disconnected",
        });
        process.exit(1);
    })
};
