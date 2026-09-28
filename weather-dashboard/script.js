const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const statusMessage = document.getElementById("status");
const weatherCard = document.getElementById("weatherCard");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  await getWeather(city);
});

async function getWeather(city) {
  try {
    statusMessage.textContent = "Loading weather data...";
    statusMessage.style.color = "#2563eb";
    weatherCard.classList.add("hidden");

    const geoURL =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error(`Location request failed (${geoResponse.status}).`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please try another city.");
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, country } = location;

    const weatherURL =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&wind_speed_unit=kmh`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error(`Weather request failed (${weatherResponse.status}).`);
    }

    const weatherData = await weatherResponse.json();

    if (!weatherData.current) {
      throw new Error("Weather information is currently unavailable.");
    }

    const current = weatherData.current;
    const units = weatherData.current_units;

    cityName.textContent = `${name}, ${country}`;
    temperature.textContent =
      `${current.temperature_2m} ${units.temperature_2m}`;
    humidity.textContent =
      `${current.relative_humidity_2m} ${units.relative_humidity_2m}`;
    windSpeed.textContent =
      `${current.wind_speed_10m} ${units.wind_speed_10m}`;
    weatherDescription.textContent =
      getWeatherDescription(current.weather_code);

    statusMessage.textContent = "";
    weatherCard.classList.remove("hidden");

  } catch (error) {
    console.error("Weather error:", error);
    showError(
      error.message || "Something went wrong while retrieving weather data."
    );
  }
}

function showError(message) {
  statusMessage.textContent = message;
  statusMessage.style.color = "#dc2626";
  weatherCard.classList.add("hidden");
}

function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return descriptions[code] || "Current weather";
}
