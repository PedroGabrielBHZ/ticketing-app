import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@pepe_tickets/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

const setup = async () => {
  // create instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "new concert",
    price: 999,
    userId: "notUsingThisReally",
  };

  // fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return mocked setup data
  return { msg, data, ticket, listener };
};

describe("A message of ticket updated", () => {
  it("finds, updates, and saves a ticket.", async () => {
    const { msg, data, ticket, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });

  it("is acked by the listener.", async () => {
    const { msg, data, ticket, listener } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it("does not call ack if the event has a skipped version number", async () => {
    // get setup objects
    const { msg, data, ticket, listener } = await setup();

    // set inconsistent version
    data.version = 10;

    // catch unavoidable error
    try {
      await listener.onMessage(data, msg);
    } catch (err) {}

    // :-0
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
