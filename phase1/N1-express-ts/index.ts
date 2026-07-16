import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = 3000;

/**
 * 'express.json' is the middleware parse incoming JSON requests to javascript object.
 * We use '.json()' method to stringify javascript object to JSON string for response.
 * Path Parameters aka Route Params, Dynamic Params, URL Params indicates by ':paramName' accessed by 'req.params.paramName'
 * Query Parameters aka Query String are after '?', separated by '&' indicates by 'key=value' pairs accessed by 'req.query.key'
 */

app.use(express.json());

app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
	});
});

app.get('/users/:id', async (req, res, next) => {
	try {
		const id = parseInt(req.params.id);

		/**
		 * isNaN = is Not a Number
		 * 400 = Bad Request
		 * 404 = Not Found
		 * Both if statement are training block to practice error handling.
		 */

		if (isNaN(id) || id < 1) {
			return res.status(400).json({
				error: 'ID must be a positive integer' 
			});
		}

		if (id > 10) {
			return res.status(404).json({
				error: 'User not found'
			});
		}

		res.json({
			success: true,
			data: {
				id, name: `User ${id}`
			}
		});
	} catch (error) {
		/**
		 * 'next(error)' pass control to error-handling middleware
		 */

		next(error);
	}
});

/**
 * The catch-all route is middleware put at last order.
 */

app.use((req, res) => {
	res.status(404).json({
		error: "Route not found",
	});
});

/**
 * Global Error Handler
 * err.stack is string property of Error object that contain stack trace
 * - it shows sequence of function calls that led to the error.
 */

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error('[ERROR]', err.stack || err);

	res.status(500).json({
		error: 'Internal Server Error',
		...(process.env.NODE_ENV === 'development' && {stack: err.stack})
	});
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`📖 Health check: http://localhost:${PORT}/health`);
	console.log(`👤 Try: http://localhost:${PORT}/users/5`);
});
