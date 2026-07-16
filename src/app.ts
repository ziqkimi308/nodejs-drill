import express, { NextFunction, Request, Response } from "express";
import userRoutes from "./routes/user.routes";

const app = express();

// Routes
app.use(express.json());
app.use("/", userRoutes);

// Handle other routes
app.use((req, res) => {
	res.status(404).json({
		error: 'Route not found'
	});
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error("[ERROR]", err.stack || err);

	res.status(500).json({
		error: "Internal Server Error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

export default app;