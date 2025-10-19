# Backend Engineer Assignment – Document & Tagging System

  - [Overview](#overview)
  - [Setup & Installation](#setup--installation)
  - [Design Decisions](#design-decisions)
    - [Data Modeling](#data-modeling)
    - [Indexes](#indexes)
    - [Transactions](#transactions)
    - [Validation & Logging](#validation--logging)
    - [Security](#security)
    - [Performance & Scalability](#performance--scalability)
  - [Tests](#tests)
  - [Future Improvements](#future-improvements)
  - [API Reference](#api-reference)
    - [Auth Routes](#auth-routes)
      - [POST /v1/auth/signup](#post-v1authsignup)
      - [POST /v1/auth/login](#post-v1authlogin)
    - [Document Routes](#document-routes)
      - [POST /v1/docs/](#post-v1docs)
      - [GET /v1/docs/:id](#get-v1docsid)
      - [DELETE /v1/docs/:id](#delete-v1docsid)
    - [Folder Routes](#folder-routes)
      - [POST /v1/folders](#post-v1folders)
      - [GET /v1/folders?ownerid=](#get-v1foldersownerid)
      - [GET /v1/folders/:id/docs?ownerid=](#get-v1foldersiddocsownerid)
    - [Scoped Actions](#scoped-actions)
      - [POST /v1/actions/run](#post-v1actionsrun)
      - [GET /v1/actions/usage/month](#get-v1actionsusagemonth)
    - [Webhook Ingestion](#webhook-ingestion)
      - [POST /v1/webhooks/ocr](#post-v1webhooksocr)
    - [Metrics Endpoint](#metrics-endpoint)
      - [GET /api/metrics](#get-apimetrics)


## Overview
This project implements a backend system that models documents organized by folders and tags, supports scoped actions, OCR ingestion webhooks, RBAC enforcement, auditing, and metrics tracking, all aligned with the given assignment’s requirements.

It’s written in TypeScript using Express and MongoDB, with strong emphasis on atomicity, modular design, and developer experience. 

Project start date: **14th Oct 2025**, finish date: **19th Oct 2025**

## Setup & Installation

1. **Clone the repo**
```
git clone <repo_url>
cd skyclad-backend-ts
```
2. **Create a .env file like this**
```
PORT=3000
ALLOWED_HEADERS=Authorization,Cookie,Content-Type,Accept,Origin,X-Requested-With,Range,If-Range,If-Modified-Since,If-None-Match,Content-Length,Content-Range
ALLOWED_ORIGINS=http://localhost:8080
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your_jwt_secret
LOG_LEVEL=info

MONGO_URI=mongodb+srv://<main-db-uri>
MONGO_AUDIT_URI=mongodb+srv://<audit-db-uri>
MONGO_AUDIT_DB=audit_logs

CEREBRAS_API_KEY=your_api_key
TASKS_DAILY_LIMIT=3
```
3. **Install dependencies**
```
npm install
```
4. **Populate Database**
Run the seed script, that will create an admin and populate the database with documents
```
npm run seed
```
  Admin default credentails: `{"Admin@example.com", "Admin@123"}`

4. **Build and run the server**
```
npm run build
npm run start
```

## Design Decisions

---

### Data Modeling

- `primaryTagId` directly referenced in `Document` for enforcing unique `(ownerId, primaryTag, filename)` constraint.

---

### Indexes

Enforced via Mongoose:

- `unique_primary_tag_per_document`
- `unique_tag_per_document`
- `unique_tag_per_owner`

Soft deletes only (flagged with `deleted` boolean).

---

### Transactions

Multi-step database operations wrapped in MongoDB transactions for atomicity.

---

### Validation & Logging

- Input validation via **Zod**.  
- Centralized error handler.  
- Logging and audit trail via **Winston** with MongoDB transport (a separate audit DB is in place for scalability).

---

### Security

- JWT-based mock authentication. 
- Centralized **RBAC**:
  - `user`: own data only.  
  - `moderator`: read-only.  
  - `admin`: full access.
- Permission format: `entity:operation:accessLevel`, for example: `documents:read:any`
- Tenant isolation: Each user is their own tenant, their data is isolated through RBAC enforecement. Only admins and moderators have read privileges.

---

### Performance & Scalability

- Prepared for integration with external storage for large files.  
- Exponential backoff for unreliable APIs (Cerebras LLM).  
- Modular structure:
  ```
  src/
  ├── controllers/
  ├── services/
  ├── middlewares/
  ├── routes/
  ├── utils/
  ├── validators/
  ```

---

## Tests

Covers:

- Folder vs file scope rule.  
- Primary tag uniqueness.  
- JWT isolation & RBAC.  
- Webhook classification & rate limiting.  
- Scoped action credit tracking.

**Run tests:**
```
npm run test
```
NOTE: A FEW TESTS MIGHT FAIL DUE TO RATE-LIMITING BY THE CEREBRAS API
---

## Future Improvements

With more time, I’d:

- Decouple file uploads to an external storage with client having the reponsibility to upload the documents using pre-signed URLs and not the servers.
- An upload pipeline with various workers doing tasks such as
  - Normalize + chunk large files using **GridFS**.  
  - Add LLM summarization worker for new documents.  
- Integrate **ELK stack** or **Loggly/Splunk** for observability.  
- Add **OAuth2 + refresh token** authentication.  
- Adopt **Permify** for scalable RBAC.  
- Introduce cleanup cron jobs for old soft-deleted records.  

## API Reference

### Auth Routes

#### POST /v1/auth/signup
Registers a new user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/auth/signup' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWY1MGRjYWY3YTIwNThmYjE2OTBjYyIsImVtYWlsIjoiaG9tZWJld3dAYXBwbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjA3MjMzMDcsImV4cCI6MTc2MTMyODEwN30.YhJfuNog3wyQerNE8Htca5mLNUOlkCh0BBVI7lmKpGs' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "malicious@mail.com",
  "password": "Pass@123"
}'
```
---

#### POST /v1/auth/login
Logs in a user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "youremail@mail.com",
    "password": "yourpassword"
}'
```
---
### Document Routes

#### POST /v1/docs/
Creates a new document.

**Request Body:**
```json
{
  "filename": "string",
  "mime": "enum[text/plain, text/csv]",
  "textContent": "string",
  "primaryTag": "string",
  "secondaryTags": ["string"]
}
```
**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/docs/' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjRlMmMxMjM2ZWQ4ZGRjZjUxNGUyZCIsImVtYWlsIjoiZGV2ZHViZXlAbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MDg3OTMxMSwiZXhwIjoxNzYxNDg0MTExfQ.6EO5JQ41Bo8i2hNnjJAFjB-e4AkHHITbTvjlrzHvTqw' \
--header 'Content-Type: application/json' \
--data '{
  "filename": "04",
  "mime": "text/plain",
  "textContent": "cost: Rs 1000",
  "primaryTag": "invoices_nov",
  "secondaryTags": ["invoices", "bills"]
}
'
```
---

#### GET /v1/docs/:id
Fetch a single document by ID.

**cURL example:**
```
curl --location --request GET 'https://skyclad-backend-ts-production.up.railway.app/v1/docs/68f4e506236ed8ddcf514e32' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjNjMmQ2MjY5ZjkwMTFmNjA2NWYyYSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA4ODA1NzEsImV4cCI6MTc2MTQ4NTM3MX0.SleVIJaiMPdQ0bYr57Vq8Nk_NFrWNz_R9Vh1AJmXfKU' \
--header 'Content-Type: application/json' \
--data '{
	"name": "Add your name in the body"
}'
```

---

#### DELETE /v1/docs/:id
Deletes a document by ID.

**cURL example:**
```
curl --location --request DELETE 'https://skyclad-backend-ts-production.up.railway.app/v1/docs/68f4e637236ed8ddcf514e43' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjNjMmQ2MjY5ZjkwMTFmNjA2NWYyYSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA4ODA1NzEsImV4cCI6MTc2MTQ4NTM3MX0.SleVIJaiMPdQ0bYr57Vq8Nk_NFrWNz_R9Vh1AJmXfKU' \
--data ''
```
---

### Folder Routes

#### POST /v1/folders
Creates a new folder.

**Request Body:**
```json
{
  "name": "string",
  "parentId": "string | null"
}
```
---

#### GET /v1/folders?ownerId=
Fetch all folders owned by the authenticated user or owned by ownerId query parameter (if necessary permission). Sending owenrId as query is optional.

**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/folders?ownerId=68f4e50677944434f73278a8' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjRlMmMxMjM2ZWQ4ZGRjZjUxNGUyZCIsImVtYWlsIjoiZGV2ZHViZXlAbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MDg3OTMxMSwiZXhwIjoxNzYxNDg0MTExfQ.6EO5JQ41Bo8i2hNnjJAFjB-e4AkHHITbTvjlrzHvTqw' \
--data ''
```
---

#### GET /v1/folders/:id/docs?ownerId=
Fetch all documents within a specific folder owner by the authenticated user or owned by ownerId. Sending ownerId as query is optional.

**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/folders/68f4e50677944434f73278a8/docs?ownerId=68f4e50677944434f73278a8' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjRlMmMxMjM2ZWQ4ZGRjZjUxNGUyZCIsImVtYWlsIjoiZGV2ZHViZXlAbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MDg3OTMxMSwiZXhwIjoxNzYxNDg0MTExfQ.6EO5JQ41Bo8i2hNnjJAFjB-e4AkHHITbTvjlrzHvTqw'
```
---

### Scoped Actions

#### POST /v1/actions/run
Perform an action based on user prompts. Cerebras API integrated.

**Request Body:**
```json
{
    "scope": { "type": "enum[folder,file]", "folder?": "stirng", "name": "string" },
    "messages": [{ "role": "string", "content": "string" }],
    "actions": ["make_document", "make_csv"]
}
```
**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/actions/run' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjRlMmMxMjM2ZWQ4ZGRjZjUxNGUyZCIsImVtYWlsIjoiZGV2ZHViZXlAbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MDg3OTMxMSwiZXhwIjoxNzYxNDg0MTExfQ.6EO5JQ41Bo8i2hNnjJAFjB-e4AkHHITbTvjlrzHvTqw' \
--header 'Content-Type: application/json' \
--data '{
    "scope": { "type": "folder", "name": "invoices_nov" },
    "messages": [{ "role": "user", "content": "make csv of vendor totals" }],
    "actions": ["make_document", "make_csv"]
}
'
```
---

#### GET /v1/actions/usage/month
Get the credits used in a month for running actions. (5 credits/action)\

**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/actions/usage/month' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjRlMmMxMjM2ZWQ4ZGRjZjUxNGUyZCIsImVtYWlsIjoiZGV2ZHViZXlAbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MDg3OTMxMSwiZXhwIjoxNzYxNDg0MTExfQ.6EO5JQ41Bo8i2hNnjJAFjB-e4AkHHITbTvjlrzHvTqw' \
--data ''
```
---

### Webhook Ingestion

#### POST /v1/webhooks/ocr
Ingests external webhook payloads from third-party OCR worker with a user's credentials.

**Request Body (example for GitHub integration):**
```json
{
  "source":"string",
  "imageId":"string",
  "text":"string",
  "meta":{"string":"string"}

}
```
**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/webhooks/ocr' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjRlMmMxMjM2ZWQ4ZGRjZjUxNGUyZCIsImVtYWlsIjoiZGV2ZHViZXlAbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MDg3OTMxMSwiZXhwIjoxNzYxNDg0MTExfQ.6EO5JQ41Bo8i2hNnjJAFjB-e4AkHHITbTvjlrzHvTqw' \
--header 'Content-Type: application/json' \
--data-raw '{
  "source":"scanner-02",
  "imageId":"img_124",
  "text":"LIMITED TIME SALE… unsubscribe: mailto:stop1@geez.com",
  "meta":{"address":"123 Main St"}

}'
```
---

### Metrics Endpoint

#### GET /api/metrics
Exports Prometheus-compatible metrics for monitoring.
**cURL example:**
```
curl --location 'https://skyclad-backend-ts-production.up.railway.app/v1/metrics/' \
--header 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjNjMmQ2MjY5ZjkwMTFmNjA2NWYyYSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA4MDY0ODEsImV4cCI6MTc2MTQxMTI4MX0.7YAEDUB_VW-rjfj1SUUkoZrYw2YpmRn5ZJ9FDVnp0SA'
```
