import express from "express";

import { currentUser } from "@pepe_tickets/common";

const router = express.Router();

/**
 * Fetch current authenticated user.
 */
router.get("/api/users/currentuser", currentUser, (req, res) => {
  res.send({
    currentUser: req.currentUser || null,
  });
});

export { router as currentUserRouter };
