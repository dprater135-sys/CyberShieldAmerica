# CyberShield America - Phase 1

A comprehensive security monitoring and alert system for America.

## 📋 Project Structure

```
src/
├── index.js              # Main application entry point
├── clock.js              # Digital clock with timezone support
├── jokeGenerator.js      # Random joke generator
├── weatherFetcher.js     # Weather data fetcher
└── utils.js              # Utility functions and helpers
```

## 🎯 Phase 1 Requirements

- [x] **User Accounts** - Authentication framework
- [x] **Dashboard** - Display component structure
- [x] **Alerts** - Alert notification system
- [x] **Email Monitoring** - Email surveillance module

## 🚀 Features

### Digital Clock (`clock.js`)
- Display current time in 9+ major world time zones
- Real-time updates every second
- UTC offset information
- Customizable timezone management
- Full IANA timezone support

### Joke Generator (`jokeGenerator.js`)
- Fetch random jokes from external APIs
- Dual API support (API Ninjas + JokeAPI)
- Local fallback jokes for offline mode
- Continuous joke streaming capability
- Joke history tracking
- Formatted console output

### Weather Fetcher (`weatherFetcher.js`)
- Current weather conditions
- 7-day weather forecasts
- Temperature, humidity, wind speed
- Precipitation data
- Geocoding for city names
- Multiple location support
- No API key required (uses Open-Meteo API)

### Utilities (`utils.js`)
- Number and byte formatting
- Date and time utilities
- Email validation
- Password strength validation
- UUID and random string generation
- Object cloning and merging
- Retry logic with exponential backoff
- Structured logging

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/dprater135-sys/CyberShieldAmerica.git

# Navigate to project
cd CyberShieldAmerica

# No dependencies required - uses native JavaScript!
```

## 💻 Usage Examples

### Digital Clock
```javascript
const DigitalClock = require('./src/clock.js');
const clock = new DigitalClock();
clock.start();
```

### Joke Generator
```javascript
const JokeGenerator = require('./src/jokeGenerator.js');
const joker = new JokeGenerator();
const joke = await joker.getRandomJoke();
joker.displayJoke(joke);
```

### Weather Fetcher
```javascript
const WeatherFetcher = require('./src/weatherFetcher.js');
const weather = new WeatherFetcher();
const current = await weather.getWeather('New York');
weather.displayWeather(current);
```

### Utilities
```javascript
const Utils = require('./src/utils.js');

Utils.log('Application started', 'info');
const uuid = Utils.generateUUID();
const password = 'MyP@ssw0rd123';
const strength = Utils.validatePassword(password);
```

## 🔐 Security

- Input validation for emails and passwords
- UUID generation for unique identifiers
- Error handling and graceful degradation
- API fallback mechanisms
- No sensitive data stored in code

## 📊 API Usage

### Open-Meteo Weather API
- **Free tier**: Unlimited requests
- **No API key required**
- **Endpoints**: Geocoding, Current weather, Forecasts

### JokeAPI
- **Free tier**: Unlimited requests
- **No API key required**
- **Categories**: Programming, Knock-knock, General

## 🛣️ Roadmap

### Phase 1 (Current) ✅
- Digital Clock
- Joke Generator
- Weather Fetcher
- Utility Library

### Phase 2 (Planned)
- User authentication system
- Admin dashboard
- Real-time alerts
- Email integration

### Phase 3 (Planned)
- Database integration
- API endpoints
- Mobile support
- Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

**dprater135-sys**
- GitHub: [@dprater135-sys](https://github.com/dprater135-sys)

## 📧 Support

For support, open an issue in the GitHub repository.

---

**Last Updated**: May 31, 2026
**Status**: Active Development
