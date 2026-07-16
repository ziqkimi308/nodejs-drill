import { NextFunction, Request, Response } from "express";

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

		// Validation
		if (isNaN(id) || id < 1) {
			return res.status(400).json({ error: "ID must be a positive integer" });
		}

		// Simulate database lookup
		if (id > 10) {
			return res.status(404).json({ error: "User not found" });
		}

		// Success
		res.json({
			success: true,
			data: { id, name: `User ${id}` },
		});
	} catch (error) {
		next(error);
	}
};
