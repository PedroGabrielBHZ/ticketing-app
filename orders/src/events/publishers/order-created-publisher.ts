import { Publisher, Subjects, OrderCreatedEvent } from "@pepe_tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
