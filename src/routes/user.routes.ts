import { Router } from "express";
import {
	createUser,
	getUserById,
	healthCheck,
} from "../controllers/user.controller";
import { body } from "express-validator";

const router = Router();

router.get("/health", healthCheck);
router.get("/users/:id", getUserById);

/**
 * Add POST request - create user
 *
 * - Defining the formats is part of validationResult()!
 */

router.post(
	"/users",
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ min: 3 })
		.withMessage("Name must be at least 3 characters"),

	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Must be a valid email address")
		.normalizeEmail(),

	body("age")
		.optional()
		.isInt({ min: 18 })
		.withMessage("Age must be a number and at least 18"),

	createUser,
);

export default router;
