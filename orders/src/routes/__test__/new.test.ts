import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";

describe("A request for a new order", () => {
  it("returns an error if ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({
        ticketId,
      })
      .expect(404);
  });

  it("returns an error if the ticket is reserved", async () => {
    // build and persist sample ticket
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    // build and persist order from built ticket
    const order = Order.build({
      ticket,
      userId: "random-id",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });
    await order.save();

    // reserve the reserved ticket
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it("reserves a ticket", async () => {
    // build and persist sample ticket
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    // reserve ticket by its id
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.signin())
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it.todo("emits an order created event");
});
