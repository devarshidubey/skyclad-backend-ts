import mongoose from "mongoose";

export async function runInTransaction<T>(
    fn: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const result = await fn(session);
        await session.commitTransaction();
        return result;
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}
