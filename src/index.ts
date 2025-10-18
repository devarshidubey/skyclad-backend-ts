import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const PORT: number = Number(process.env.PORT);

await connectDb();

app.listen(PORT, () => {
    //console.log(`App listening on port ${PORT}`);
});
