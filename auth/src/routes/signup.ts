import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { validateRequest, BadRequestError } from "@pepe_tickets/common";
import { User } from "../models/user";

const router = express.Router();

/**
 * Sign a new user up.
 */
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // fetch user credentials
    const { email, password } = req.body;

    // fetch user with same mail in DB
    const existingUser = await User.findOne({ email });

    // user already exists: throw error
    if (existingUser) {
      throw new BadRequestError("Email in use.");
    }

    // register a new user from credentials
    const user = User.build({ email, password });

    // persist user object
    await user.save();

    // generate JWT
    const userJwt = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    // store it on session object
    req.session = {
      jwt: userJwt,
    };

    // respond created
    res.status(201).send(user);
  }
);

export { router as signupRouter };
