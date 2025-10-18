import { describe, it, expect } from "vitest";
import { request, user1Token, user2Token } from "./setup.js";

describe("Primary Tag Uniqueness", () => {
  it("should create a new primary tag", async () => {
    const res = await request
      .post("/v1/folders/")
      .set("authorization", `Bearer ${user1Token}`)
      .send({ primaryTag: "invoices_2025" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("invoices_2025");
  });

  it("should NOT allow creating a duplicate primary tag for the same user", async () => {
    // first create the tag
    await request
      .post("/v1/folders/")
      .set("authorization", `Bearer ${user1Token}`)
      .send({ primaryTag: "invoices_2025" });

    // try creating it again
    const res = await request
      .post("/v1/folders/")
      .set("authorization", `Bearer ${user1Token}`)
      .send({ primaryTag: "invoices_2025" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("should allow the same tag name for a different user", async () => {
    const res = await request
      .post("/v1/folders/")
      .set("authorization", `Bearer ${user2Token}`)
      .send({ primaryTag: "invoices_2025" });
    
    console.log(res.body)

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("invoices_2025");
  });
});