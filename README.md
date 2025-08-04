# Event Analytics Platform

A real-time event analytics platform built with Node.js, TypeScript, Express, MongoDB, and Redis. This platform provides comprehensive event tracking, analytics, and visualization capabilities with support for funnel analysis, user journey tracking, retention analysis, and real-time metrics.

## 🚀 Features

- **Real-time Event Ingestion**: High-performance event ingestion with queue-based processing
- **Advanced Analytics**: Funnel analysis, user journey tracking, retention analysis
- **API Key Authentication**: Secure API access with organization and project isolation
- **Rate Limiting**: Built-in rate limiting for API protection
- **Swagger Documentation**: Interactive API documentation
- **Scalable Architecture**: Microservices-ready with Redis queues and MongoDB

## 🏗️ Architecture & Design Decisions

### Technology Stack

- **Backend**: Node.js with TypeScript and Express
- **Database**: MongoDB for event storage and analytics
- **Cache/Queue**: Redis with BullMQ for job processing
- **Real-time**: Socket.IO for live updates
- **Validation**: Zod for schema validation
- **Documentation**: Swagger/OpenAPI for API docs

### Architecture Overview

```
                        ┌─────────────────┐
                        │   API Clients   │
                        └─────────┬───────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Express Server       │
                    │      (Rate Limiting)      │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    API Routes & Auth      │
                    │   (API Key Validation)    │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Event Queue (BullMQ)   │
                    │      (Redis Backend)      │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Event Worker Process    │
                    │   (MongoDB Insertion)     │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      MongoDB Atlas        │
                    │     (Event Storage)       │
                    └───────────────────────────┘
```

### Key Design Decisions

1. **Queue-Based Processing**: Events are queued using BullMQ to handle high-volume ingestion without blocking the API
2. **Multi-Tenant Architecture**: API keys are tied to organizations and projects for data isolation
3. **Real-time Updates**: Socket.IO provides live event count updates
4. **Schema Validation**: Zod ensures data integrity at the API level
5. **Rate Limiting**: Express rate limiter protects against abuse
6. **CORS Configuration**: Proper CORS setup for cross-origin requests
7. **Error Handling**: Centralized error handling middleware

### Data Model

#### Event Schema
```typescript
{
  userId: string,        
  eventName: string,     
  properties: object,    
  timestamp: Date,       
  orgId: string,        
  projectId: string     
}
```

#### API Key Schema
```typescript
{
  key: string,          
  orgId: string,        
  projectId: string     
}
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Redis (local or cloud instance)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd events
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/events_analytics
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/events_analytics

# Redis Configuration
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud:
# REDIS_URL=redis://username:password@host:port

# Socket Server (for worker)
SOCKET_SERVER=http://localhost:5000
```

### 4. Database Setup

#### MongoDB Setup
1. Install MongoDB locally or create a MongoDB Atlas cluster
2. Ensure the connection string is correct in your `.env` file

#### Redis Setup
1. Install Redis locally or use a cloud Redis service
2. Ensure the Redis URL is correct in your `.env` file

### 5. Create API Keys

You'll need to manually create API keys in your MongoDB database. You can use MongoDB Compass or the MongoDB shell:

```javascript
// Connect to your MongoDB database and run
db.apikeys.insertOne({
  key: "your-api-key-here",
  orgId: "org123",
  projectId: "proj123"
})
```

### 6. Start the Application

#### Development Mode
```bash
# Start the main server
npm run dev

# In a separate terminal, start the worker process
node dist/workers/event.worker.js
```

#### Production Mode
```bash
# Build the project
npm run build

# Start the server
npm start

# Start the worker process
node dist/workers/event.worker.js
```

### 7. Seed Demo Data (Optional)

```bash
npm run seed
```

This will create sample events for testing the analytics features.

## 🚀 Usage

### API Documentation

Access the interactive API documentation at `http://localhost:5000/api-docs`

## 📚 API Usage Examples

### Authentication

All API requests require an API key in the header:

```bash
X-API-Key: your-api-key-here
```

### 1. Event Ingestion

**Endpoint**: `POST /api/events`

**Request Body**:
```json
[
  {
    "userId": "user123",
    "eventName": "page_view",
    "properties": {
      "page": "/home",
      "referrer": "google.com"
    },
    "orgId": "org123",
    "projectId": "proj123"
  },
  {
    "userId": "user456",
    "eventName": "purchase",
    "properties": {
      "product_id": "prod_789",
      "amount": 99.99
    },
    "orgId": "org123",
    "projectId": "proj123"
  }
]
```

**Response**:
```json
{
  "message": "Events queued for ingestion"
}
```

### 2. Funnel Analysis

**Endpoint**: `POST /api/funnels`

**Request Body**:
```json
{
  "steps": ["signup", "page_view", "purchase"],
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

**Response**:
```json
{
  "funnel": [
    { "step": "signup", "users": 1000 },
    { "step": "page_view", "users": 750 },
    { "step": "purchase", "users": 150 }
  ]
}
```

### 3. User Journey

**Endpoint**: `GET /api/users/{userId}/journey`

**Response**:
```json
{
  "userId": "user123",
  "events": [
    {
      "eventName": "signup",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "eventName": "page_view",
      "timestamp": "2024-01-15T10:35:00Z"
    },
    {
      "eventName": "purchase",
      "timestamp": "2024-01-15T10:45:00Z"
    }
  ]
}
```

### 4. Retention Analysis

**Endpoint**: `GET /api/retention?cohort=signup&days=7`

**Response**:
```json
{
  "cohortEvent": "signup",
  "retention": [
    { "day": 0, "users": 100 },
    { "day": 1, "users": 45 },
    { "day": 2, "users": 32 },
    { "day": 3, "users": 28 },
    { "day": 4, "users": 25 },
    { "day": 5, "users": 22 },
    { "day": 6, "users": 20 },
    { "day": 7, "users": 18 }
  ]
}
```

### 5. Event Metrics

**Endpoint**: `GET /api/metrics?event=page_view&interval=daily&from=2024-01-01&to=2024-01-31`

**Response**:
```json
{
  "event": "page_view",
  "interval": "daily",
  "buckets": [
    { "date": "2024-01-01", "count": 1250 },
    { "date": "2024-01-02", "count": 1380 },
    { "date": "2024-01-03", "count": 1420 }
  ]
}
```

## 🔧 Development

### Project Structure

```
events/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Request handlers
│   ├── docs/           # Swagger documentation
│   ├── middlewares/    # Express middlewares
│   ├── models/         # MongoDB schemas
│   ├── queues/         # BullMQ queue definitions
│   ├── routes/         # Express routes
│   ├── scripts/        # Database seeding scripts
│   ├── validators/     # Zod validation schemas
│   └── workers/        # Background job processors
├── public/             # Static files
├── server.ts           # Main server entry point
├── app.ts             # Express app configuration
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with demo data

### Adding New Features

1. **New API Endpoints**: Add routes in `src/routes/`
2. **New Controllers**: Create handlers in `src/controllers/`
3. **New Models**: Define schemas in `src/models/`
4. **New Validators**: Add Zod schemas in `src/validators/`

## 🚀 Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/events_analytics
REDIS_URL=redis://username:password@host:port
SOCKET_SERVER=https://your-domain.com
```

## 🔒 Security Considerations

- API keys are required for all endpoints
- Rate limiting prevents abuse
- CORS is properly configured
- Input validation with Zod
- Helmet.js for security headers

## 📊 Monitoring & Logging

- Morgan for HTTP request logging
- Console logging for worker processes
- MongoDB connection monitoring
- Redis connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Check the console logs for debugging information

---

**Note**: This is a production-ready event analytics platform with real-time capabilities and comprehensive analytics. The architecture is designed for scalability and can handle high-volume event ingestion with proper queue management and data isolation. 