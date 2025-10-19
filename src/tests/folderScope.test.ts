import { describe, it, expect } from "vitest";
import { request, adminToken, user1Token } from "./setup.js";

describe("Folder vs File Scope Rules", () => {
  it("should create a folder", async () => {
    const res = await request
      .post("/v1/folders/")
      .set("authorization", `Bearer ${user1Token}`)
      .send({ primaryTag: "myspace" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("myspace");
  });

  it("should fail if scoped action uses non-existent folder", async () => {
    const res = await request
      .post("/v1/actions/run")
      .set("authorization", `Bearer ${user1Token}`)
      .send({
        scope: { type: "folder", name: "nonexistent" },
        messages: [{ role: "user", content: "do something" }],
        actions: ["make_document"],
      });

    expect(res.status).toBe(400);
  }, 30000);

  it("should succeed if scoped action uses valid folder", async () => {
    const tag = await request
      .post("/v1/docs/")
      .set("authorization", `Bearer ${user1Token}`)
      .send({
        filename: "05 Jan 2025",
        mime: "text/plain",
        textContent: "Date: 17 October 2025\n\nDear Diary,\n\nToday started off quietly. I woke up around 7:30 AM, had a cup of tea. \n\nFeeling grateful,\nDave",
        primaryTag: "diary_2000",
        secondaryTags: ["Journal", "Covid"]
      });
    
    const res = await request
      .post("/v1/actions/run")
      .set("authorization", `Bearer ${user1Token}`)
      .send({
        scope: { type: "folder", name: "diary_2000" },
        messages: [{ role: "user", content: "make CSV" }],
        actions: ["make_document", "make_csv"],
      }).timeout({
            response: 30000,
            deadline: 60000
      });

    expect([200, 429]).toContain(res.status);
  });
});
