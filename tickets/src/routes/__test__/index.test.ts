import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "Fun",
    price: 15,
  });
};

describe("A request for fetching all tickets", () => {
  it("can fetch a list of tickets", async () => {

    // generate a big enough number
    const numberOfTickets = Math.floor(Math.random() * 10e3);

    // create arbitrary amount of tickets
    for (let step = 0; step < numberOfTickets; step++){
      await createTicket();
    }

    // fetch all tickets expecting success
    const response = await request(app).get("/api/tickets").send().expect(200);

    // all tickets generated listed?
    expect(response.body.length).toEqual(numberOfTickets);
  });
});
