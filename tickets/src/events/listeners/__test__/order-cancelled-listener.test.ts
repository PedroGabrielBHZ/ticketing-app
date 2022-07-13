import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@pepe_tickets/common";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "asdf",
  });

  ticket.set({ orderId });

  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

describe("An order cancelled event listener", () => {
  it("cancels the ticket.", async () => {
    const { msg, data, ticket, listener } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
  });
  it("publishes an event.", async () => {
    const { msg, data, listener } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
  it("acks the message.", async () => {
    const { msg, data, listener } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
  });
});
