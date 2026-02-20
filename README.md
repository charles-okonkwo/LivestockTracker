# Livestock Health & Vaccination Tracker

A full-stack web application for tracking livestock health records and vaccination schedules. Built with Node.js, Express, MongoDB, and a modern Tailwind CSS frontend.

## Project Information

**Course:** SEN 201 Software Engineering  
**Group:** Group 3  
**Group Lead:** Chukwuemeka Okonkwo

### Group Members
- Chukwuemeka Okonkwo (Group Lead)
- [Placeholder for Group Member 2]
- [Placeholder for Group Member 3]
- [Placeholder for Group Member 4]

## System Architecture

Based on Swimlane Diagrams, the system supports three main roles:

### 1. Farmer Role
- Register animals with Unique Tag ID, Breed, and Species
- Access dashboard showing 'Due for Vaccination' flags
- View health history for all registered animals
- Create vaccination records

### 2. Vet Role
- Secure portal to view pending treatments
- Sign off/verify vaccination records as official
- View all verified records

### 3. System (Backend)
- Automatically calculates vaccination schedules
- Stores permanent Health History for every animal
- Manages authentication and authorization

## Project Structure

```
livestock/
├── app.js                 # Entry point
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── README.md             # This file
├── models/               # Database schemas
│   ├── Animal.js
│   ├── User.js
│   └── Record.js
├── routes/               # API endpoints
│   ├── auth.js
│   ├── livestock.js
│   └── vaccination.js
├── middleware/           # Custom middleware
│   └── auth.js
└── public/               # Frontend files
    ├── index.html
    ├── dashboard.html
    ├── vet-portal.html
    ├── css/
    │   └── style.css
    └── js/
        ├── auth.js
        ├── dashboard.js
        └── vet.js
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values as needed.

4. Database Setup:
   - **No database installation needed!** This project uses LowDB, which is a simple JSON file-based database.
   - The database file (`livestock.json`) will be automatically created in the `data/` folder when you first run the application.
   - No compilation, no build tools, no configuration - just works!

5. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Features

- **User Authentication**: Secure registration and login for Farmers and Veterinarians
- **Animal Registration**: Farmers can register animals with unique tag IDs
- **Vaccination Tracking**: Automatic calculation of next due dates
- **Due Vaccination Alerts**: Dashboard flags animals due for vaccination
- **Vet Verification**: Veterinarians can verify and sign off on vaccination records
- **Health History**: Permanent record of all vaccinations for each animal
- **Modern UI**: Clean, green-themed agricultural dashboard using Tailwind CSS

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Livestock
- `POST /api/livestock/register` - Register new animal (Farmer only)
- `GET /api/livestock/animals` - Get all animals (Farmer only)
- `GET /api/livestock/animals/:id` - Get single animal
- `GET /api/livestock/due-vaccination` - Get animals due for vaccination
- `GET /api/livestock/animals/:id/history` - Get health history

### Vaccination
- `POST /api/vaccination/record` - Create vaccination record (Farmer)
- `GET /api/vaccination/pending` - Get pending treatments (Vet only)
- `POST /api/vaccination/verify/:id` - Verify record (Vet only)
- `GET /api/vaccination/verified` - Get all verified records

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: LowDB (JSON file-based, no installation or compilation required)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Frontend**: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript
- **Validation**: express-validator

## Development Notes

- The system uses JWT tokens for authentication
- Passwords are hashed using bcryptjs
- LowDB database is automatically initialized in `config/database.js`
- Database file is stored in `data/livestock.json` (created automatically)
- All API routes are prefixed with `/api`
- Frontend uses localStorage to store authentication tokens

## Future Enhancements

- Email notifications for due vaccinations
- PDF report generation
- Mobile app support
- Advanced analytics and reporting
- Multi-farm support

## License

MIT

## Deadline

Mid-February 2024

