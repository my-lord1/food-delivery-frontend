# FlavorFleet - Multi-Vendor Food Delivery Platform

**FlavorFleet** is a fully functional, production-ready food delivery marketplace connecting hungry customers with local restaurants. Built with the MERN stack, it features secure Google OAuth authentication, real-time order tracking, a dynamic restaurant dashboard, and a seamless checkout experience.


## Features Breakdown

### For Customers
* **Smart Authentication:** Sign up/Login via Email & Password or **One-Click Google OAuth**.
* **Restaurant Discovery:** Search by cuisine, rating, price range, and dietary preferences.
* **Dynamic Cart:** Add/remove items, customize orders, and view real-time totals.
* **Checkout & Payment:** Integrated secure payment gateway (Razorpay) simulation.
* **Order Tracking:** Visual timeline of order status (Received → Preparing → Out for Delivery → Delivered).
* **Profile Management:** Manage saved addresses and view order history.

### For Restaurants
* **Vendor Dashboard:** A dedicated portal to manage restaurant details and operational hours.
* **Menu Management:** CRUD operations for menu categories and items.
* **Order Control:** Accept or reject incoming orders in real-time.

### Security & Architecture
* **JWT Authorization:** Secure, stateless authentication using JSON Web Tokens.
* **Password Encryption:** BCrypt hashing for user passwords.
* **Role-Based Access Control (RBAC):** Middleware ensures Users cannot access Admin routes.
* **Input Validation:** Server-side validation to prevent injection attacks.

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Redux 
- React Router DOM
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- Passport.js (Google OAuth 2.0)
- JWT Authentication
- bcrypt
- CORS


---

