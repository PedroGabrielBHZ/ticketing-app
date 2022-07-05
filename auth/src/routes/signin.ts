import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { Password } from "../services/password";
import { User } from "../models/user";
import { validateRequest, BadRequestError } from "@pepe_tickets/common";

const router = express.Router();

/**
 * Sign in as an existing user.
 */
router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must enter a password."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    // user does not exist: throw generic error
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials.");
    }

    // verify user password
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    // password does not match: throw generic error
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials.");
    }

    // generate JWT
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    // store JWT on session object
    req.session = {
      jwt: userJwt,
    };

    // respond success
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
