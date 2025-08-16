# Ecommerce API Project

POST-Man Documentation Link: https://documenter.getpostman.com/view/26793257/2sA3BkcYeH


This is a backend API project for a typical ecommerce website, built using Node.js, Express, and MongoDB following the MVC (Model-View-Controller) architecture.

## Features

- Implements CRUD operations for categories, products, users, and orders.
- Handles error gracefully using custom error handling middleware.
- Supports logging endpoint access history.
- Provides CORS (Cross-Origin Resource Sharing) support for cross-origin platform access.
- Utilizes Express middleware for request body parsing and logging.
- Allows serving static files like uploaded images.
- Implements authorization, role handling, and input validation.

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js
- MongoDB
- npm (Node Package Manager)

## Installation

1. Clone the repository:

    ```
    git clone https://github.com/AsifIqbalSekh/Ecommerce-Dummy.git
    ```

2. Navigate into the project directory:

    ```
    cd Ecommerce-Dummy
    ```

3. Install dependencies:

    ```
    npm install
    ```

4. Set up environment variables:

   Modify `.env` file in the root directory and add the following variables:

    ```
    PORT=8080
    DB_URI=your_mongodb_uri
    DB_URI_LOGS=your_mongodb_uri
    ```

5. Run the server:

    ```
    npm start
    ```

6. The server should now be running at `http://localhost:8080`.

## Usage

- Access the API endpoints using tools like Postman or curl.
- The available endpoints are:

    - `/category`
    - `/product`
    - `/user`
    - `/order`

- Use appropriate HTTP methods (GET, POST, PUT, DELETE) to interact with the endpoints.

## Authentication and Authorization

- To create a new user, use the `/user` POST endpoint.
- To log in, use the `/user/login` POST endpoint with valid credentials.
- Access to certain endpoints requires authentication and specific roles.
- Roles include `Admin`, `User`, etc., defined in the `ROLE_LIST` constant.

## Endpoint Details

### User Routes

- `POST /user`: Create a new user.
- `GET /user`: Get all users (requires Admin role).
- `POST /user/login`: User login.
- `PUT /user/promoteToAdmin`: Promote a user to Admin role (requires Admin role).
- `PUT /user/changeRole`: Change user role (requires Admin role).
- `PUT /user/:id`: Update user details.
- `DELETE /user/:id`: Delete a user.

### Product Routes

- `GET /product`: Get all products.
- `POST /product`: Create a new product (requires Admin role).
- `GET /product/:id`: Get a specific product.
- `DELETE /product/:id`: Delete a product (requires Admin role).
- `PUT /product/:id`: Update product details (requires Admin role).
- `GET /product/get/count`: Get the total count of products (requires Admin role).
- `GET /product/get/featured`: Get featured products.
- `GET /product/get/selected`: Get products by selected category.
- `PUT /product/galleryUpload/:id`: Update product gallery images (requires Admin role).

### Order Routes

- `GET /order`: Get all orders (requires Admin role).
- `POST /order`: Place a new order.
- `PUT /order/placeOrder`: Update order status.
- `DELETE /order/cancelOrder`: Cancel an order.
- `GET /order/allPlacedOrder`: Get all placed orders (requires Admin role).
- `GET /order/get/totalEarning`: Get total earning (requires Admin role).
- `GET /order/get/history`: Get order history.

### Category Routes

- `GET /category`: Get all categories.
- `POST /category`: Create a new category (requires Admin role).
- `GET /category/:id`: Get a specific category.
- `DELETE /category/:id`: Delete a category (requires Admin role).
- `PUT /category/:id`: Update category details (requires Admin role).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

