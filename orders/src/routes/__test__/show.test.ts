import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

describe("A request for showing a order by id", () => {
  it("fetches the order", async () => {
    // create a ticket
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 20,
    });
    await ticket.save();

    // create an authenticated user
    const user = global.signin();

    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make request to fetch the order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(200);

    // fetched order has the same id as created order?
    expect(fetchedOrder.id).toEqual(order.id);
  });

  it("returns an error if user tries to fetch another users order", async () => {
    // create a ticket
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 20,
    });
    await ticket.save();

    // create an authenticated user
    const user = global.signin();

    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make request to fetch the order
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", global.signin())
      .send()
      .expect(401);
  });
});
