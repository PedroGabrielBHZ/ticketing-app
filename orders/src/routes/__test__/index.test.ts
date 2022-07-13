import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  return ticket;
};

describe("A request for orders", () => {
  it("fetches orders for an particular user", async () => {
    // create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    // authenticate users
    const userOne = global.signin();
    const userTwo = global.signin();

    // create one order as user #1
    await request(app)
      .post("/api/orders")
      .set("Cookie", userOne)
      .send({ ticketId: ticketOne.id })
      .expect(201);

    // create two orders as user #2
    const { body: orderOne } = await request(app)
      .post("/api/orders")
      .set("Cookie", userTwo)
      .send({ ticketId: ticketTwo.id })
      .expect(201);

    const { body: orderTwo } = await request(app)
      .post("/api/orders")
      .set("Cookie", userTwo)
      .send({ ticketId: ticketThree.id })
      .expect(201);

    // make request to get orders for user #2
    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", userTwo)
      .expect(200);

    // make sure we only got the orders for user #2
    expect(response.body.orders.length).toEqual(2);

    // check stuff up
    expect(response.body.orders[0].id).toEqual(orderOne.id);
    expect(response.body.orders[1].id).toEqual(orderTwo.id);

    // check stuff down
    expect(response.body.orders[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body.orders[1].ticket.id).toEqual(ticketThree.id);
  });
});
