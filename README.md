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

1. Clone the repo
```
git clone <repo_url>
cd skyclad-backend-ts
```
2. Create a .env file like this
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
3. Install dependencies
```
npm install
```
4. Populate Database
Run the seed script, that will create an admin and populate the database with documents
```
npm run seed
```
Admin default credentails: `{"Admin@example.com", "Admin@123"}`
4. Build and run the server
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
---
### Document Routes

#### POST /v1/docs/
Creates a new document.

**Headers:**
```
authorization: Bearer <access_token>
```

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
---

#### GET /v1/docs/:id
Fetch a single document by ID.

**Headers:**
```
authorization: Bearer <access_token>
```

---

#### DELETE /v1/docs/:id
Deletes a document by ID.

**Headers:**
```
authorization: Bearer <access_token>
```
---

### Folder Routes

#### POST /v1/folders
Creates a new folder.

**Headers:**
```
authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "string",
  "parentId": "string | null"
}
```
---

#### GET /v1/folders?ownerId=
Fetch all folders owned by the authenticated user or owned by ownerId query parameter (if necessary permission)

**Headers:**
```
authorization: Bearer <access_token>
```
---

#### GET /v1/folders/:id/docs?ownerId=
Fetch all documents within a specific folder owner by the authenticated user or owned by ownerId

**Headers:**
```
authorization: Bearer <access_token>
```
---

### Scoped Actions

#### POST /v1/actions/run
Perform an action based on user prompts. Cerebras API integrated.

**Headers:**
```
authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "scope": { "type": "enum[folder,file]", "folder"?: "stirng", "name": "string" },
    "messages": [{ "role": "string", "content": "string" }],
    "actions": ["make_document", "make_csv"]
}
```
---

#### GET /v1/actions/usage/month
Get the credits used in a month for running actions. (5 credits/action)\
**Headers:**
```
authorization: Bearer <access_token>
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
---

### Metrics Endpoint

#### GET /api/metrics
Exports Prometheus-compatible metrics for monitoring.
