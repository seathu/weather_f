// API key for OpenWeatherMap (User's API key)
const API_KEY = '11758109b8dec46abe63c95192191d85';

// DOM elements for interacting with the page
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const tempElement = document.getElementById('temp');
const weatherIcon = document.getElementById('weather-icon');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const forecastContainer = document.getElementById('forecast-container');
const recentSearches = document.getElementById('recent-searches');

// Fetch current weather by city name
function getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            getFiveDayForecast(city);
            addCityToRecentSearches(city);
        })
        .catch(error => alert('Error: City not found.'));
}

// Fetch 5-day weather forecast by city name
function getFiveDayForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayFiveDayForecast(data);
        })
        .catch(error => console.log(error));
}

// Display current weather information on the page
function displayWeather(data) {
    cityName.textContent = `${data.name} (${new Date().toLocaleDateString()})`;
    tempElement.textContent = `Temperature: ${data.main.temp}°C`;
    windElement.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    humidityElement.textContent = `Humidity: ${data.main.humidity}%`;

    const weather = data.weather[0].main;
    weatherIcon.textContent = weather === 'Clear' ? '☀️' : weather === 'Clouds' ? '☁️' : '🌧️';
}

// Display 5-day forecast on the page
function displayFiveDayForecast(data) {
    forecastContainer.innerHTML = ''; // Clear previous forecast

    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
        const forecastTemp = forecast.main.temp;
        const forecastWind = forecast.wind.speed;
        const forecastHumidity = forecast.main.humidity;
        const weatherIcon = forecast.weather[0].main === 'Clear' ? '☀️' : forecast.weather[0].main === 'Clouds' ? '☁️' : '🌧️';

        forecastContainer.innerHTML += `
            <div class="forecast-info">
                <p><strong>${forecastDate}</strong></p>
                <p>Temp: ${forecastTemp}°C</p>
                <p>${weatherIcon}</p>
                <p>Wind: ${forecastWind} m/s</p>
                <p>Humidity: ${forecastHumidity}%</p>
            </div>
        `;
    }
}

// Add a city to localStorage and update the dropdown menu
function addCityToRecentSearches(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    updateRecentSearchesDropdown(recentCities);
}

// Update the dropdown menu with recent cities
function updateRecentSearchesDropdown(cities) {
    recentSearches.innerHTML = '';
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentSearches.appendChild(option);
    });
}

// Fetch the selected city from the dropdown when the user selects it
recentSearches.addEventListener('change', (event) => {
    const selectedCity = event.target.value;
    getWeatherByCity(selectedCity);
});

// Load recent cities from localStorage when the page loads
window.onload = function() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    updateRecentSearchesDropdown(recentCities);
};

// Search for weather by city name
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
        cityInput.value = '';
    }
});

// Fetch weather by current location
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    displayWeather(data);
                    getFiveDayForecast(data.name);
                })
                .catch(error => alert('Error fetching weather for current location.'));
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
