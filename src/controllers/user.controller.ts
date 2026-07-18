import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import prisma from "../lib/prisma";

export const healthCheck = (req: Request, res: Response) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
	});
};

export const getUserById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		/**
		 * @types/express defines req.params as ParamsDictionary which is { [key: string]: string | string[] }
		 *
		 * But parseInt function signature only accepts string like shown here
		 * parseInt(string: string, radix?: number): number
		 *
		 * That's why we convert to String first, then parseInt
		 */

		const id = parseInt(String(req.params.id));

		// Handle invalid id
		if (isNaN(id) || id < 1) {
			return res.status(400).json({ error: "ID must be a positive integer" });
		}

		// const user = users.find((usr) => usr.id === id);
		const user = await prisma.user.findUnique({
			where: { id },
		});
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Success
		res.json({
			success: true,
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		/**
		 * - 'validationResult' checks if request is in the expected format.
		 * - This is like Laravel's request validation.
		 *
		 * - validationResult() returns object.
		 * - that is why we convert using '.array()'
		 */

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: "Validation failed",
				details: errors.array().map((e) => ({
					field: (e as any).path,
					message: e.msg,
				})),
			});
		}

		/**
		 * - Sanitization of req is not needed here.
		 * - It happened in routing.
		 */

		const { name, email, age } = req.body;
		const newUser = await prisma.user.create({
			data: {
				name: name,
				email: email,
				...(age !== undefined && { age }),
			},
		});

		res.status(201).json({
			success: true,
			data: newUser,
		});
	} catch (error: any) {
		/**
		 * Handle prisma error for duplicate email
		 * P2002 is built in error code for indicates violation of '@unique' field
		 */

		if (error.code === "P2002") {
			return res.status(409).json({
				error: "Email already exists",
				details: [
					{ field: "email", message: "This email is already registered" },
				],
			});
		}
		next(error);
	}
};
