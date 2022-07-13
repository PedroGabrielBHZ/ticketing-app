import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@pepe_tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("A message of ticket created", () => {
  it("creates and saves a ticket.", async () => {
    // fetch mock objects
    const { listener, data, msg } = await setup();

    // call the onMessage function with data + message objects
    await listener.onMessage(data, msg);

    // assert ticket was created
    const ticket = await Ticket.findById(data.id);

    // why keep so high expectations
    expect(ticket).not.toBeNull();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });

  it("is acked by the listener.", async () => {
    // fetch mock objects
    const { listener, data, msg } = await setup();

    // call the onMessage function with data + message objects
    await listener.onMessage(data, msg);

    // assert ack function is called
    expect(msg.ack).toHaveBeenCalled();
  });
});
