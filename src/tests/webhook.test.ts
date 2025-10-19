import { describe, it, expect } from "vitest";
import { request } from "./setup.js"; // supertest + app
import { user1Token } from "./setup.js";

describe("Webhook Classification & Rate-Limiting", () => {

  it("should classify a valid webhook payload", async () => {
    const res = await request
      .post("/v1/webhooks/ocr")
      .set("authorization", `Bearer ${user1Token}`)
      .send({
        source: "scannerA",
        imageId: "image_1",
        text: "Office timing has changed",
        meta: {address: "123 Main St"}
      });

    expect(res.status).toBe(200);
  });

  it("should reject malformed payloads", async () => {
    const res = await request
      .post("/v1/webhooks/ocr")
      .set("authorization", `Bearer ${user1Token}`)
      .send({ invalid: "data" });

    expect(res.status).toBe(400);
  });

  it("should enforce rate-limiting", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request
        .post("/v1/webhooks/ocr")
        .set("authorization", `Bearer ${user1Token}`)
        .send({
            source: "scannerA",
            imageId: "image_1",
            text: `LIMITED TIME SALE… unsubscribe: mailto:stop${i}@brand.com`,
            meta: {address: "123 Main St"}
        });

      expect(res.status).toBe(200);
    }

    const res = await request
      .post("/v1/webhooks/ocr")
      .set("authorization", `Bearer ${user1Token}`)
      .send({
            source: "scannerA",
            imageId: "image_1",
            text: `LIMITED TIME SALE… unsubscribe: mailto:finalstop@brand.com`,
            meta: {address: "123 Main St"}
        });

    expect(res.status).toBe(429);
  });

});
