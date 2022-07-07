import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

describe("A request for deleting an order", () => {
  it("marks an order as cancelled", async () => {
    // create a ticket with Ticket model
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    // authenticate an user
    const user = global.signin();

    // make a request to create an order
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make a request to cancel the order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(204);

    // fetch updated order
    const updatedOrder = await Order.findById(order.id);

    // is order cancelled?
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it("emits a order cancelled event", async () => {
    // create a ticket with Ticket model
    const ticket = Ticket.build({
      title: "concert",
      price: 20,
    });
    await ticket.save();

    // authenticate an user
    const user = global.signin();

    // make a request to create an order
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);

    // make a request to cancel the order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set("Cookie", user)
      .send()
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
