import { describe, it, expect } from "vitest";
import { request, adminToken, user1Token, user2Token } from "./setup.js";

describe("JWT Isolation & Role Enforcement", () => {
  let user1DocId: string;
  let user2DocId: string;

  it("user1 creates a document", async () => {
    const res = await request
      .post("/v1/docs/")
      .set("authorization", `Bearer ${user1Token}`)
      .send({
        filename: "User1_Doc",
        mime: "text/plain",
        textContent: "This is user1's document",
        primaryTag: "user1_tag",
        secondaryTags: []
      });
    
    expect(res.status).toBe(201);
    user1DocId = res.body.data.document._id;
    console.log(user1DocId)
  });

  it("user2 creates a document", async () => {
    const res = await request
      .post("/v1/docs/")
      .set("authorization", `Bearer ${user2Token}`)
      .send({
        filename: "User2_Doc",
        mime: "text/plain",
        textContent: "This is user2's document",
        primaryTag: "user2_tag",
        secondaryTags: []
      });
    
    expect(res.status).toBe(201);
    user2DocId = res.body.data.document._id;
  });

  it("user1 can read her own document", async () => {
    const res = await request
      .get(`/v1/docs/${user1DocId}`)
      .set("authorization", `Bearer ${user1Token}`)
      .send({
        filename: "redacted",
        textContent: "removed by admin"
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(user1DocId);
  });

  it("user1 cannot read user2's document", async () => {
    const res = await request
      .get(`/v1/docs/${user2DocId}`)
      .set("authorization", `Bearer ${user1Token}`);
    
    expect([403, 404]).toContain(res.status);
  });

  it("admin can read both user1 and user2 documents", async () => {
    const res1 = await request
      .get(`/v1/docs/${user1DocId}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(res1.status).toBe(200);

    const res2 = await request
      .get(`/v1/docs/${user2DocId}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(res2.status).toBe(200);
  });

  it("admin can edit user1's documents", async () => {
    const res1 = await request
      .put(`/v1/docs/${user1DocId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({ filename: "redacted", textContent: "admin removed"});
    console.log(res1.body)
    expect(res1.status).toBe(200);
  });

  it("request without JWT fails", async () => {
    const res = await request.get(`/v1/docs/${user1DocId}`);
    expect(res.status).toBe(401);
  });

  it("request with invalid JWT fails", async () => {
    const res = await request
      .get(`/v1/docs/${user1DocId}`)
      .set("authorization", `Bearer invalidtoken`);
    expect(res.status).toBe(401);
  });
});
