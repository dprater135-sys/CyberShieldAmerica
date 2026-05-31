/**
 * Random Joke Generator
 * Fetches jokes from external APIs and displays them
 */

class JokeGenerator {
  constructor() {
    this.jokes = [];
    this.currentJoke = null;
    this.apiUrl = 'https://api.api-ninjas.com/v1/jokes';
    this.fallbackApiUrl = 'https://v2.jokeapi.dev/joke/Any';
  }

  /**
   * Fetch a random joke from the primary API (API Ninjas)
   * Requires API key: https://api-ninjas.com/api/jokes
   * @param {string} apiKey - Optional API key for api-ninjas
   * @returns {Promise<object>} Joke object
   */
  async fetchFromApiNinjas(apiKey = null) {
    try {
      const headers = {};
      if (apiKey) {
        headers['X-Api-Key'] = apiKey;
      }

      const response = await fetch(this.apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`API Ninjas error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return {
          source: 'API Ninjas',
          text: data[0].joke,
          type: 'general'
        };
      }
    } catch (error) {
      console.warn('API Ninjas fetch failed:', error.message);
      return null;
    }
  }

  /**
   * Fetch a random joke from the fallback API (JokeAPI)
   * Free API - no key required
   * @returns {Promise<object>} Joke object
   */
  async fetchFromJokeAPI() {
    try {
      const response = await fetch(this.fallbackApiUrl);
      if (!response.ok) {
        throw new Error(`JokeAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.type === 'single') {
        return {
          source: 'JokeAPI',
          text: data.joke,
          type: data.category
        };
      } else if (data.type === 'twopart') {
        return {
          source: 'JokeAPI',
          text: `${data.setup}\n${data.delivery}`,
          type: data.category
        };
      }
    } catch (error) {
      console.warn('JokeAPI fetch failed:', error.message);
      return null;
    }
  }

  /**
   * Get a random joke with fallback support
   * @param {string} apiKey - Optional API key for API Ninjas
   * @returns {Promise<object>} Joke object or error
   */
  async getRandomJoke(apiKey = null) {
    try {
      // Try primary API first
      let joke = await this.fetchFromApiNinjas(apiKey);
      
      // Fall back to JokeAPI if primary fails
      if (!joke) {
        joke = await this.fetchFromJokeAPI();
      }

      if (joke) {
        this.currentJoke = joke;
        this.jokes.push(joke);
        return joke;
      } else {
        throw new Error('All joke APIs failed');
      }
    } catch (error) {
      return {
        error: true,
        message: error.message,
        fallbackJoke: this.getLocalJoke()
      };
    }
  }

  /**
   * Get a local joke (fallback when APIs are unavailable)
   * @returns {object} Local joke object
   */
  getLocalJoke() {
    const localJokes = [
      'Why don\'t scientists trust atoms? Because they make up everything!',
      'What do you call a fake noodle? An impasta!',
      'Why did the scarecrow win an award? He was outstanding in his field!',
      'What\'s the best thing about Switzerland? I don\'t know, but their flag is a big plus.',
      'Why don\'t eggs tell jokes? They\'d crack each other up!',
      'What did one ocean say to the other ocean? Nothing, they just waved.',
      'How do you organize a space party? You planet!',
      'Why can\'t you hear a pterodactyl going to the bathroom? Because the "P" is silent!',
      'What do you call a bear with no teeth? A gummy bear!',
      'Why did the math book look so sad? Because it had too many problems.'
    ];

    const randomIndex = Math.floor(Math.random() * localJokes.length);
    return {
      source: 'Local Database',
      text: localJokes[randomIndex],
      type: 'general'
    };
  }

  /**
   * Display a joke in a formatted way
   * @param {object} joke - Joke object
   */
  displayJoke(joke) {
    if (joke.error) {
      console.log('\n❌ Error fetching joke from API');
      console.log('📚 Using local joke instead:\n');
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    😂 JOKE OF THE MOMENT 😂                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📖 ${joke.text}\n`);
    console.log(`Source: ${joke.source} | Category: ${joke.type}`);
    console.log('\n╔════════════════════════════════════════════════════════════╗\n');
  }

  /**
   * Get a continuous stream of jokes
   * @param {number} interval - Time between jokes in milliseconds (default: 5000)
   * @param {string} apiKey - Optional API key
   */
  startJokeStream(interval = 5000, apiKey = null) {
    console.log('Starting joke stream... Press Ctrl+C to stop\n');

    const fetchAndDisplay = async () => {
      const joke = await this.getRandomJoke(apiKey);
      this.displayJoke(joke);
    };

    fetchAndDisplay();
    this.streamInterval = setInterval(fetchAndDisplay, interval);
  }

  /**
   * Stop the joke stream
   */
  stopJokeStream() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      console.log('\nJoke stream stopped.');
    }
  }

  /**
   * Get all fetched jokes
   * @returns {array} Array of joke objects
   */
  getJokeHistory() {
    return this.jokes;
  }

  /**
   * Clear joke history
   */
  clearHistory() {
    this.jokes = [];
    this.currentJoke = null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JokeGenerator;
}

// Example usage (uncomment to run):
/*
async function main() {
  const joker = new JokeGenerator();
  
  // Get a single joke
  const joke = await joker.getRandomJoke();
  joker.displayJoke(joke);
  
  // Or start continuous joke stream
  // joker.startJokeStream(3000);
}

main();
*/
