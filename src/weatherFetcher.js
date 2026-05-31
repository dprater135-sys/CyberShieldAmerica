/**
 * Weather Data Fetcher
 * Fetches current weather information and forecasts
 */

class WeatherFetcher {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';
    this.geoApiUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    this.currentWeather = null;
  }

  /**
   * Geocode city name to coordinates
   * @param {string} cityName - Name of the city
   * @returns {Promise<object>} Location coordinates
   */
  async getCoordinates(cityName) {
    try {
      const response = await fetch(`${this.geoApiUrl}?name=${encodeURIComponent(cityName)}&count=1`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          name: result.name,
          country: result.country,
          timezone: result.timezone
        };
      }
      throw new Error('City not found');
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Fetch current weather for a location
   * @param {string} cityName - Name of the city
   * @returns {Promise<object>} Weather data
   */
  async getWeather(cityName) {
    try {
      const location = await this.getCoordinates(cityName);
      if (!location) {
        return { error: true, message: 'Location not found' };
      }

      const response = await fetch(
        `${this.weatherApiUrl}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m,humidity&temperature_unit=fahrenheit&timezone=${location.timezone}`
      );
      const data = await response.json();

      if (data.current) {
        this.currentWeather = {
          location: location.name,
          country: location.country,
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          weatherDescription: this.getWeatherDescription(data.current.weather_code),
          windSpeed: data.current.wind_speed_10m,
          humidity: data.current.humidity,
          timezone: location.timezone,
          timestamp: data.current.time
        };
        return this.currentWeather;
      }
    } catch (error) {
      console.error('Weather fetch error:', error.message);
      return { error: true, message: error.message };
    }
  }

  /**
   * Get weather forecast for a location
   * @param {string} cityName - Name of the city
   * @param {number} days - Number of days for forecast (default: 7)
   * @returns {Promise<array>} Forecast data
   */
  async getForecast(cityName, days = 7) {
    try {
      const location = await this.getCoordinates(cityName);
      if (!location) {
        return { error: true, message: 'Location not found' };
      }

      const response = await fetch(
        `${this.weatherApiUrl}?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&timezone=${location.timezone}&forecast_days=${days}`
      );
      const data = await response.json();

      if (data.daily) {
        return {
          location: location.name,
          country: location.country,
          forecast: data.daily.time.map((date, index) => ({
            date: date,
            maxTemp: data.daily.temperature_2m_max[index],
            minTemp: data.daily.temperature_2m_min[index],
            weatherCode: data.daily.weather_code[index],
            weatherDescription: this.getWeatherDescription(data.daily.weather_code[index]),
            precipitation: data.daily.precipitation_sum[index]
          }))
        };
      }
    } catch (error) {
      console.error('Forecast fetch error:', error.message);
      return { error: true, message: error.message };
    }
  }

  /**
   * Convert WMO weather codes to descriptions
   * @param {number} code - WMO weather code
   * @returns {string} Weather description
   */
  getWeatherDescription(code) {
    const descriptions = {
      0: '☀️ Clear sky',
      1: '🌤️ Mainly clear',
      2: '⛅ Partly cloudy',
      3: '☁️ Overcast',
      45: '🌫️ Foggy',
      48: '🌫️ Depositing rime fog',
      51: '🌧️ Light drizzle',
      53: '🌧️ Moderate drizzle',
      55: '🌧️ Dense drizzle',
      61: '🌧️ Slight rain',
      63: '🌧️ Moderate rain',
      65: '🌧️ Heavy rain',
      71: '❄️ Slight snow',
      73: '❄️ Moderate snow',
      75: '❄️ Heavy snow',
      77: '❄️ Snow grains',
      80: '🌧️ Slight rain showers',
      81: '🌧️ Moderate rain showers',
      82: '🌧️ Violent rain showers',
      85: '❄️ Slight snow showers',
      86: '❄️ Heavy snow showers',
      95: '⛈️ Thunderstorm',
      96: '⛈️ Thunderstorm with hail',
      99: '⛈️ Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  }

  /**
   * Display current weather
   * @param {object} weather - Weather object
   */
  displayWeather(weather) {
    if (weather.error) {
      console.log(`\n❌ Error: ${weather.message}\n`);
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    CURRENT WEATHER                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📍 Location: ${weather.location}, ${weather.country}`);
    console.log(`🌡️  Temperature: ${weather.temperature}°F`);
    console.log(`${weather.weatherDescription}`);
    console.log(`💨 Wind Speed: ${weather.windSpeed} km/h`);
    console.log(`💧 Humidity: ${weather.humidity}%`);
    console.log(`⏰ Time: ${weather.timestamp}`);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗\n');
  }

  /**
   * Display weather forecast
   * @param {object} forecast - Forecast object
   */
  displayForecast(forecast) {
    if (forecast.error) {
      console.log(`\n❌ Error: ${forecast.message}\n`);
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║              7-DAY FORECAST - ${forecast.location.toUpperCase()}                 ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    forecast.forecast.forEach(day => {
      console.log(`📅 ${day.date}`);
      console.log(`   ${day.weatherDescription}`);
      console.log(`   High: ${day.maxTemp}°F | Low: ${day.minTemp}°F | Precipitation: ${day.precipitation}mm`);
      console.log();
    });

    console.log('╔════════════════════════════════════════════════════════════╗\n');
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherFetcher;
}

// Example usage (uncomment to run):
/*
async function main() {
  const weather = new WeatherFetcher();
  
  // Get current weather
  const currentWeather = await weather.getWeather('New York');
  weather.displayWeather(currentWeather);
  
  // Get forecast
  const forecast = await weather.getForecast('London', 7);
  weather.displayForecast(forecast);
}

main();
*/
