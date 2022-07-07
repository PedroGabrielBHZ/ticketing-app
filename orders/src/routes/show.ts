import express, { Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@pepe_tickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    // fetch order with populated ticket property
    const order = await Order.findById(req.params.orderId).populate("ticket");

    // order does not exist: throw not found error
    if (!order) {
      throw new NotFoundError();
    }

    // user does not own order: throw auth error
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // send found order as response
    res.send(order);
  }
);

export { router as showOrderRouter };
