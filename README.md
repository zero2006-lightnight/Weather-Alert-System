# 🌤️ Weather Alert System for Farmers

A modern, production-ready web application that provides real-time weather forecasts and automatically alerts farmers about dangerous weather conditions such as heavy rain, thunderstorms, cyclones, extreme heat, frost, high wind speed, and drought conditions.

## 🚀 Features

### Core Features
- **Real-time Weather Dashboard** - Current temperature, humidity, wind speed, UV index, and more
- **Smart Weather Alerts** - Automatic detection of dangerous weather conditions
- **Hourly & 7-Day Forecast** - Detailed weather predictions with interactive charts
- **Crop Recommendations** - AI-powered advice based on weather conditions
- **Interactive Weather Map** - Multiple layers (standard, satellite, rain, wind, clouds)
- **Multi-channel Notifications** - Email, SMS, browser notifications
- **Location Search** - Search weather by village, city, district, or state

### User Features
- Farmer Registration with GPS location
- JWT Authentication
- Profile Management
- Dark/Light Mode
- Multi-language Support (English, Hindi, Telugu)
- Favorite Locations
- Notification History
- Export Reports (PDF/CSV - coming soon)

### Admin Features
- User Management
- Broadcast Alert System
- System Statistics & Analytics
- Alert Distribution Charts

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Chart.js** - Data visualization
- **Leaflet.js** - Interactive maps
- **React Icons** - Icon library
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Helmet** - Security headers
- **Rate Limiting** - API protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- OpenWeatherMap API key
- Nodemailer email credentials (optional)
- Twilio account for SMS (optional)

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/weather-alert-system.git
cd weather-alert-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your credentials:

```bash
# Backend
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
WEATHER_API_KEY=your_openweathermap_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from client directory, in a new terminal)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🏗️ Project Structure

```
weather-alert-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── alertController.js
│   │   ├── authController.js
│   │   └── weatherController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── Alert.js
│   │   ├── CropRecommendation.js
│   │   ├── Notification.js
│   │   ├── User.js
│   │   └── WeatherHistory.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   └── weatherRoutes.js
│   ├── utils/
│   │   ├── emailService.js
│   │   └── weatherUtils.js
│   ├── server.js
│   └── package.json
├── client/
│   ├── public/
│   │   ├── manifest.json
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   └── StatsCards.jsx
│   │   │   ├── alerts/
│   │   │   │   └── AlertList.jsx
│   │   │   ├── charts/
│   │   │   │   ├── HumidityChart.jsx
│   │   │   │   ├── RainChart.jsx
│   │   │   │   ├── TemperatureChart.jsx
│   │   │   │   └── WindChart.jsx
│   │   │   ├── common/
│   │   │   │   ├── AnimatedBackground.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── WeatherCard.jsx
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx
│   │   │   └── weather/
│   │   │       └── WeatherForecast.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useWeather.js
│   │   ├── pages/
│   │   │   ├── About.jsx
│   │   │   ├── Admin.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Help.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── WeatherMap.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── .env.example (root)
└── README.md
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new farmer |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| DELETE | `/api/auth/account` | Delete account |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current` | Current weather |
| GET | `/api/weather/forecast` | Weather forecast |
| GET | `/api/weather/crop-recommendations` | AI crop advice |
| GET | `/api/weather/history` | Weather history |
| GET | `/api/weather/search` | Search locations |

### Alerts & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get alerts |
| GET | `/api/alerts/unread-count` | Unread count |
| PUT | `/api/alerts/:id/read` | Mark as read |
| DELETE | `/api/alerts/:id` | Delete alert |
| GET | `/api/alerts/notifications` | Get notifications |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List farmers |
| GET | `/api/admin/stats` | System statistics |
| DELETE | `/api/admin/users/:id` | Delete farmer |
| POST | `/api/admin/broadcast-alert` | Send broadcast |

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy the 'dist' folder to Vercel
```

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables

### Database (MongoDB Atlas)
1. Create free cluster on MongoDB Atlas
2. Get connection string
3. Add to environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data API
- Leaflet.js for interactive maps
- Chart.js for data visualization
- All farmers who work tirelessly to feed the world 🌾

## 📞 Support

For support, email support@weatheralert.com or visit our Help Center.

---

Built with ❤️ for the farming community
