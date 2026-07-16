import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import { error } from "node:console";

// Non-persistent user data
type User = {
	id: number;
	name: string;
	email: string;
	age?: number;
};

let users: User[] = [];
let nextId = 1;

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

		const user = users.find((usr) => usr.id === id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
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
		const newUser: User = {
			id: nextId++,
			name: name,
			email: email,
			...(age !== undefined && { age })
		};

		users.push(newUser);

		res.status(201).json({
			success: true,
			data: newUser,
		});

	} catch (error) {
		next(error);
	}
};
