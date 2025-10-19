process.env.NODE_ENV = "test";

import { beforeAll, afterAll, beforeEach, vitest } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet, MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import supertest from "supertest";


export const request = supertest(app);

let mongoServer: MongoMemoryReplSet;

export let adminToken: string;
export let user1Token: string;
export let user2Token: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 4 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const adminSignup = await request.post("/v1/auth/signup").send({
        email: "admin@test.com",
        password: "Admin@123",
    });

    const user1Signup = await request.post("/v1/auth/signup").send({
        email: "user1@test.com",
        password: "User1@123",
    });

    const user2Signup = await request.post("/v1/auth/signup").send({
        email: "user2@test.com",
        password: "User2@123",
    });

    const User = mongoose.model("User");
    await User.updateOne({ email: "admin@test.com" }, { $set: { role: "admin" } });

    const adminLogin = await request.post("/v1/auth/login").send({
        email: "admin@test.com",
        password: "Admin@123",
    });

    const user1Login = await request.post("/v1/auth/login").send({
        email: "user1@test.com",
        password: "User1@123",
    });

    const user2Login = await request.post("/v1/auth/login").send({
        email: "user2@test.com",
        password: "User2@123",
    });

    adminToken = adminLogin.body.data.accessToken;
    user1Token = user1Login.body.data.accessToken;
    user2Token = user2Login.body.data.accessToken;
}, 30000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
}, 30000);

/*
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]!.deleteMany({});
  }
}); 
*/
