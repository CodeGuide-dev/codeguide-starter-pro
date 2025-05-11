import { NextResponse } from "next/server";
import { POST } from "@/app/api/webhooks/route";
import { createWebhookRequest, parseResponse, resetAllMocks } from "../../helpers";

// Mock dependencies
jest.mock("@/utils/stripe/config", () => ({
  stripe: require("../../../__tests__/__mocks__/stripe").stripe,
}));

jest.mock("@/utils/supabase/admin", () => ({
  upsertProductRecord: require("../../../__tests__/__mocks__/supabase-admin").upsertProductRecord,
  upsertPriceRecord: require("../../../__tests__/__mocks__/supabase-admin").upsertPriceRecord,
  deleteProductRecord: require("../../../__tests__/__mocks__/supabase-admin").deleteProductRecord,
  deletePriceRecord: require("../../../__tests__/__mocks__/supabase-admin").deletePriceRecord,
  manageSubscriptionStatusChange: require("../../../__tests__/__mocks__/supabase-admin").manageSubscriptionStatusChange,
}));

// Import mocked functions for direct testing
import { stripe } from "../../../__tests__/__mocks__/stripe";
import {
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  manageSubscriptionStatusChange
} from "../../../__tests__/__mocks__/supabase-admin";

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, STRIPE_WEBHOOK_SECRET: "test-secret" };
});

afterEach(() => {
  process.env = originalEnv;
  resetAllMocks();
  jest.clearAllMocks();
});

describe("Webhooks API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if webhook secret is not found", async () => {
    // Setup - remove the webhook secret
    process.env.STRIPE_WEBHOOK_SECRET = "";
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      { type: "product.created" },
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("Webhook secret not found.");
  });

  it("should return 400 if signature verification fails", async () => {
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      { type: "product.created" },
      { "stripe-signature": "invalid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain("Webhook Error: Invalid signature");
  });

  it("should handle product.created event", async () => {
    const eventData = {
      type: "product.created",
      data: {
        object: {
          id: "prod_test123",
          name: "Test Product",
          active: true
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(upsertProductRecord).toHaveBeenCalledWith(eventData.data.object);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle price.created event", async () => {
    const eventData = {
      type: "price.created",
      data: {
        object: {
          id: "price_test123",
          product: "prod_test123",
          unit_amount: 1000,
          currency: "usd"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(upsertPriceRecord).toHaveBeenCalledWith(eventData.data.object);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle price.deleted event", async () => {
    const eventData = {
      type: "price.deleted",
      data: {
        object: {
          id: "price_test123",
          product: "prod_test123"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(deletePriceRecord).toHaveBeenCalledWith(eventData.data.object);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle product.deleted event", async () => {
    const eventData = {
      type: "product.deleted",
      data: {
        object: {
          id: "prod_test123"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(deleteProductRecord).toHaveBeenCalledWith(eventData.data.object);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle customer.subscription.created event", async () => {
    const eventData = {
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_test123",
          customer: "cus_test123"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(manageSubscriptionStatusChange).toHaveBeenCalledWith("sub_test123", "cus_test123", true);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle checkout.session.completed event with subscription", async () => {
    const eventData = {
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          subscription: "sub_test123",
          customer: "cus_test123"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(manageSubscriptionStatusChange).toHaveBeenCalledWith("sub_test123", "cus_test123", true);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle checkout.session.completed event without subscription", async () => {
    const eventData = {
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "payment",
          customer: "cus_test123"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(manageSubscriptionStatusChange).not.toHaveBeenCalled();
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle unrecognized event type in switch statement", async () => {
    // Setup
    const eventData = {
      type: "product.updated", // This is in relevantEvents but not handled separately in the switch
      data: {
        object: {
          id: "prod_test123",
          name: "Updated Product Name"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Spy on console.log to check for unhandled event message
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    
    // In this case, it should fall through to the default case and log the unhandled event type
    expect(console.log).toHaveBeenCalledWith(`🔔  Webhook received: ${eventData.type}`);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual({ received: true });
  });

  it("should handle unsupported event type", async () => {
    const eventData = {
      type: "unsupported.event",
      data: {
        object: {}
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    // The implementation returns 200 for all event types, even unsupported ones
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe("Unsupported event type: unsupported.event");
  });

  it("should handle errors in event processing", async () => {
    // Setup - make one of the handlers throw an error
    upsertProductRecord.mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const eventData = {
      type: "product.created",
      data: {
        object: {
          id: "prod_test123"
        }
      }
    };
    
    const req = createWebhookRequest(
      "POST",
      "https://example.com/api/webhooks",
      eventData,
      { "stripe-signature": "valid-signature" }
    );
    
    // Execute
    const response = await POST(req);
    
    // Assert
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toBe("Webhook handler failed. View your Next.js function logs.");
  });
}); 