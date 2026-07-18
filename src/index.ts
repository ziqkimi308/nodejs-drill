import "dotenv/config";
import app from "./app";

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📖 Health check: http://localhost:${PORT}/health`);
	console.log(`👤 Try: http://localhost:${PORT}/users/5`);
});
