# Diet Manager

A web application for managing diet, fitness, and nutrition goals, powered by React and Node.js.

### 🔗 Live Deployment: [View Application](https://dietmanager.onrender.com)

---

## Overview: What It Does

The Diet Manager helps users design, monitor, and execute their nutrition plans by bridging calorie goals with intelligent automation.

### Key Features
*   **Dashboard**: Real-time calorie and macro tracking (protein, carbs, fats) with target progress bars and local-timezone water intake loggers.
*   **Meal Planner**: Plan breakfast, lunch, dinner, and snacks. Users can search for foods locally, fetch from the USDA Food Database, or add their own custom recipes.
*   **AI Meal Planner**: Generates full-day calorie-matched meal plans aligned with the user's specific health goals, dietary preferences (vegetarian, vegan, etc.), and allergies.
*   **Grocery List**: Aggregates all ingredients across a selected date range (e.g., 3, 7, 14 days, or custom start date) into shopping categories (fruits, vegetables, protein, grains, dairy, etc.) with checkboxes.
*   **Nutrition Chatbot**: An embedded, context-aware AI chatbot widget to answer dietary queries.
*   **Authentication**: JWT authentication.

---

## How to Run It: Setup and Run Steps

### 1. Prerequisites
*   **Node.js** (v18 or higher)
*   **MongoDB Atlas account**
*   **Gemini API Key** 
*   **SMTP Credentials** 

---

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` folder and populate it with:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_signing_secret
    
    # AI Integration
    GEMINI_API_KEY=your_gemini_api_key
    GEMINI_CHAT_API_KEY=your_gemini_chatbot_key
    
    # External Food Library
    USDA_API_KEY=your_usda_api_key
    
    # Mail Config
    EMAIL_USER=your_email_address
    EMAIL_PASS=your_email_password
    FRONTEND_URL=http://localhost:5173
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

---

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

---

## How It Works: Approach & Architecture

The application is built on a **MERN client-server architecture**:

```
[Frontend (React / Vite)]  <--- HTTP / JWT --->  [Backend (Express / Node.js)]
                                                         |
                                    +--------------------+-------------------+
                                    |                    |                   |
                           [(MongoDB Atlas)]    [Google Gemini AI]    [Nodemailer SMTP]
```

*   **State Management**: State is managed locally in React and synchronized via structured REST API calls using Axios.
*   **Security**: Routes are protected by a JWT-verification middleware on the Express server.

---

## Key Decisions & Trade-offs

### 1. `gemini-flash-latest` Model
*   **Why**: Offers near-instant response speeds and lightweight payloads. Crucially, it features a usage quota, which makes it ideal for running this project without API overhead.

### 2. Timezone Alignment 
*   **Why**: Avoids timezone-shifting bugs (where users saved meals that shifted to the previous day).

### 3. Local Library + USDA Hybrid Search
*   **Why**: Ensures that custom foods created by the user are prioritized and searchable, while still maintaining access to the vast USDA library.