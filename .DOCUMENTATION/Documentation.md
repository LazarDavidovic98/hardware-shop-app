# 📘 Project Documentation: Computer Hardware Sales Web App

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Frontend Features](#frontend-features)
- [Testing the API](#testing-the-api)
- [Additional Notes](#additional-notes)

---

## Project Overview

This is a full-stack eCommerce web application for selling computer hardware. It supports user authentication, product management, cart functionality, and order processing. The application was created as a final project in an academic course on web development.

---

## Technology Stack

- **Backend**: NestJS (Node.js framework)
- **Frontend**: React.js
- **Database**: MySQL
- **API testing**: Postman
- **Language**: TypeScript

---

## Project Structure

```
.
├── .DATABASE/         # MySQL schema and seed data
├── .DOCUMENTATION/    # Markdown project documentation
├── .POSTMAN/          # Postman API test collections
├── config/            # Configuration scripts and environment settings
├── src/               # TypeScript backend application code
├── package.json       # Scripts and dependencies
├── tsconfig.json      # TypeScript settings
└── README.md
```

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone git@github.com:LazarDavidovic98/hardware-shop-app.git
   cd hardware-shop-app
   ```

2. **Install all Node.js dependencies**
   ```bash
   npm install
   ```

3. **Configure the MySQL database**
   - Create a new MySQL database named `aplikacija2020`.
   - Import the schema from `.DATABASE/aplikacija.sql`.

4. **Configure environment**
   - Edit the database connection settings in `config/database.config.ts`.

5. **Run the server**
   ```bash
   npm run start
   ```

---

## Database Design

The database contains the following tables:

- `users`: Stores user credentials and roles.
- `products`: Stores product data (name, price, category, description).
- `orders`: Stores purchase orders.
- `order_items`: Tracks individual items in an order.
- `categories`: Defines categories for the products.

---

## API Endpoints

### Users

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | `/api/users/register` | Register new user       |
| POST   | `/api/users/login`    | Log in                  |
| GET    | `/api/users/profile`  | Get user profile info   |

### Products

| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| GET    | `/api/products`        | List all products       |
| GET    | `/api/products/:id`    | Product details         |
| POST   | `/api/products`        | Create a new product    |
| PUT    | `/api/products/:id`    | Update a product        |
| DELETE | `/api/products/:id`    | Delete a product        |

### Orders

| Method | Endpoint           | Description             |
|--------|--------------------|-------------------------|
| POST   | `/api/orders`      | Create new order        |
| GET    | `/api/orders/:id`  | View order details      |

---

## Frontend Features

The React frontend includes:

- User registration and login
- Responsive product listing
- Add-to-cart functionality
- Cart review and checkout
- Order tracking

---

## Testing the API

- Postman collections are available in the `.POSTMAN/` directory.
- These include preconfigured requests for all available endpoints.
- Import the collection into Postman and run each test manually or in a collection runner.

---

## Additional Notes

- **Authentication**: JWT-based user authentication is implemented.
- **Validation**: Input validation uses `class-validator` decorators.
- **Error Handling**: Centralized with NestJS exception filters.
- **Code Style**: TypeScript with modularized service and controller layers.

---
