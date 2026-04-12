# ShopNest

## 1. Project Overview
ShopNest is a full-stack e-commerce application built with React + TypeScript on the frontend and Spring Boot microservices on the backend, using MongoDB Atlas for data storage.

Special Features:
- Personalized Recommendations using collaborative filtering (co-occurrence matrix)
- Bundle Deals — curated product combos with automatic discount detection in cart

## 2. Architecture Diagram (text-based)
```text
[React Frontend (Vercel)]
↓ HTTP
[API Gateway :8080]
↙    ↓    ↘    ↓      ↓
[Users] [Products] [Cart] [Orders] [Recommendations]
:8081   :8082    :8083   :8084    :8085
↓       ↓        ↓       ↓         ↓
[MongoDB Atlas — separate DB per service]
```

## 3. Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+
- MongoDB Atlas account (free tier works)

## 4. Local Setup

### Step 1: Clone and set up MongoDB Atlas
- Create a free cluster at mongodb.com/atlas
- Create a database user with readWrite permissions
- Whitelist IP `0.0.0.0/0` (for development)
- Copy the connection string

### Step 2: Configure each Spring Boot service
In each of the 6 service folders, open `src/main/resources/application.properties` and set:

```properties
spring.data.mongodb.uri=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.mongodb.net/DATABASE_NAME
```

### Step 3: Start all backend services
Run these in separate terminals. Start `product-service` first because `cart-service` and `recommendation-service` call it on startup.

```bash
cd backend/api-gateway && mvn spring-boot:run
cd backend/user-service && mvn spring-boot:run
cd backend/product-service && mvn spring-boot:run
cd backend/cart-service && mvn spring-boot:run
cd backend/payment-service && mvn spring-boot:run
cd backend/recommendation-service && mvn spring-boot:run
```

### Step 4: Start frontend
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local: VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

Open `http://localhost:5173`

## 5. Deploy Frontend to Vercel
```bash
npm install -g vercel
cd frontend
vercel deploy
```

In the Vercel dashboard, add this environment variable:

`VITE_API_BASE_URL = https://your-backend-gateway-url.com`

Redeploy after adding the environment variable.

## 6. Deploy Backend Services (Railway)
For each Spring Boot service:

1. Create a new project on `railway.app`
2. Connect your GitHub repo and select the service subfolder
3. Add environment variable: `SPRING_DATA_MONGODB_URI=your-atlas-uri`
4. Deploy — Railway auto-detects the Maven project
5. After all 6 services are deployed, update `api-gateway/application.yml` with the live Railway URLs for each service and redeploy the gateway

## 7. Environment Variables Reference

| Variable | Service | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Frontend | API Gateway public URL |
| `spring.data.mongodb.uri` | All services | MongoDB Atlas connection string |
| `jwt.secret` | user-service | JWT signing secret (min 32 chars) |
| `services.recommendation.url` | payment-service | Recommendation service URL |
| `services.product.url` | recommendation-service, cart-service | Product service URL |
