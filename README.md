# 🎨 SmartPaint – Smart Wall Paint Visualizer

> A modern MEAN Stack web application that helps users visualize wall colors, explore paint shades, upload room images, preview different colors, save designs, and manage selected paints through a shopping cart.

---

## 📌 Project Overview

**SmartPaint – Smart Wall Paint Visualizer** is a web-based paint visualization and shopping platform designed to make choosing wall colors easier and more interactive.

Instead of selecting a paint color only from a traditional color chart, users can upload an image of their room, select the wall area, apply different paint colors, adjust visualization settings, and compare different designs before making a purchase decision.

The application combines **wall-color visualization with an e-commerce-style shopping experience**, allowing users to explore colors, view different shades, check prices, add products to a cart, and proceed toward purchasing.

The project is developed using the **MEAN Stack** with Angular as the frontend, Node.js and Express.js for the backend, and MongoDB for database management.

---

# 🎯 Main Objectives

The main objectives of SmartPaint are:

- Help users choose suitable wall colors digitally.
- Allow users to upload their own room images.
- Allow users to select wall areas.
- Apply different colors to selected wall areas.
- Provide real-time color visualization.
- Provide multiple shades of the selected color.
- Allow users to compare different color combinations.
- Provide color information such as name, code, category and price.
- Allow users to save their favorite colors and designs.
- Provide an interactive shopping cart.
- Allow users to view product prices and quantities.
- Provide a Buy Now / Checkout flow.
- Provide authentication and user account management.
- Provide an admin panel for managing application data.
- Create a responsive and modern user interface.

---

# ✨ Key Features

## 🏠 1. Home Page

The home page introduces users to the SmartPaint platform.

It contains:

- SmartPaint branding
- Navigation bar
- Hero section
- Call-to-action buttons
- Introduction to wall visualization
- Featured colors
- How It Works section
- Popular paint shades
- Project/design sections
- Footer

Users can explore the website without creating an account.

---

# 🔐 2. User Authentication

SmartPaint provides secure user authentication.

### Registration

Users can create an account using:

- Full Name
- Email Address
- Password
- Confirm Password

### Login

Registered users can log in using:

- Email
- Password

### Authentication Features

- JWT-based authentication
- Password validation
- Form validation
- Login/logout
- Protected routes
- User session management
- Unauthorized access handling

Users who are not logged in can browse public pages, but actions requiring an account will request authentication.

---

# 👤 3. Guest User Access

Users do not need to immediately register to explore the application.

Guest users can:

- View Home
- View How It Works
- Browse Colors
- View color details
- Explore available shades
- View general project information

However, authentication is required for protected actions such as:

- Add to Cart
- Buy Now
- Save Favorite
- Save Design
- Upload personal room for saving
- View My Projects
- Checkout
- Manage personal account

This provides a better user experience while keeping user-specific features protected.

---

# 🎨 4. Color Catalogue

The Color Catalogue is one of the main modules of SmartPaint.

Users can browse available paint colors using an interactive catalogue.

Each color can contain:

- Color Name
- Color Code
- Hex Code
- Color Category
- Temperature
- Description
- Price
- Available Shades
- Finish Type
- Suitable Room Type
- Availability

### Color Categories

Examples include:

- All Colors
- Greens
- Blues
- Browns
- Reds
- Oranges
- Yellows
- Purples
- Pinks
- Whites
- Greys
- Neutral Colors

---

# 🔎 5. Color Search & Filtering

Users can find colors using search and filters.

Possible filters include:

### Color Temperature

- Cool
- Warm
- Neutral

### Color Family

- Green
- Blue
- Red
- Yellow
- Orange
- Purple
- Brown
- Grey
- White

### Shade Intensity

- Light
- Medium
- Dark

### Room Type

- Bedroom
- Living Room
- Kitchen
- Dining Room
- Bathroom
- Balcony
- Office

### Finish

- Matte
- Satin
- Glossy

---

# 🎨 6. Color Details

When a user selects a color, a detailed color view is displayed.

The page contains:

- Color preview
- Color name
- Color code
- Hex code
- Description
- Recommended room types
- Related shades
- Color palette
- Price
- Quantity selector
- Finish selection
- Add to Cart
- Buy Now
- Try This Color

Users can explore different shades before selecting a final color.

---

# 🌈 7. Shade Palette

Each primary color can contain multiple related shades.

For example:

```text
Mint Essence
│
├── Light Mint
├── Soft Mint
├── Fresh Mint
├── Deep Mint
└── Forest Mint
