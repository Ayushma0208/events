"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./src/config/db"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
// Setup WebSocket
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
});
// Track connected clients
exports.io.on('connection', socket => {
    console.log(`📡 WebSocket client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`❌ WebSocket client disconnected: ${socket.id}`);
    });
});
// Start everything
(0, db_1.default)().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
