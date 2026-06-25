import assert from "node:assert/strict";
import { test } from "node:test";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";

async function request(path, options) {
  try {
    return await fetch(`${baseUrl}${path}`, options);
  } catch {
    return null;
  }
}

test("marketplace page renders products", async (t) => {
  const response = await request("/marketplace");
  if (!response) {
    t.skip("Start the app with npm run dev before running HTTP smoke tests.");
    return;
  }

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Past Perfect B1/i);
});

test("download request is blocked for unknown products", async (t) => {
  const response = await request("/api/download/request", {
    body: JSON.stringify({ productId: "missing" }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  if (!response) {
    t.skip("Start the app with npm run dev before running HTTP smoke tests.");
    return;
  }

  assert.equal(response.status, 404);
});

test("booking hold validates available slots", async (t) => {
  const response = await request("/api/bookings/hold", {
    body: JSON.stringify({
      email: "student@example.com",
      experienceId: "exp-past-perfect-b1",
      productId: "prod-past-perfect-b1",
      slotId: "slot-1",
      studentTimezone: "America/Bogota"
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  if (!response) {
    t.skip("Start the app with npm run dev before running HTTP smoke tests.");
    return;
  }

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.booking.status, "pending_payment");
});

test("checkout requires license acceptance", async (t) => {
  const response = await request("/api/checkout", {
    body: JSON.stringify({
      email: "student@example.com",
      items: [{ itemType: "digital_material", productId: "prod-past-perfect-b1", quantity: 1 }],
      licenseAccepted: false,
      paymentProvider: "demo"
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  if (!response) {
    t.skip("Start the app with npm run dev before running HTTP smoke tests.");
    return;
  }

  assert.equal(response.status, 400);
});

test("checkout creates a pending demo order and payment simulation URL", async (t) => {
  const response = await request("/api/checkout", {
    body: JSON.stringify({
      email: "student@example.com",
      items: [{ itemType: "digital_material", productId: "prod-past-perfect-b1", quantity: 1 }],
      licenseAccepted: true,
      paymentProvider: "demo"
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  if (!response) {
    t.skip("Start the app with npm run dev before running HTTP smoke tests.");
    return;
  }

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.match(payload.checkoutUrl, /\/api\/payment\/simulate/);
});
