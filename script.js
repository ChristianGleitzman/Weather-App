const API_KEY = "55cde0b191764a2fa88162155232002";
const form = document.getElementById("location-form");
const city = document.getElementById("city")
const country = document.getElementById("country")
const errorMessage = document.getElementById('error-message')

const currentWeather = document.getElementById("current-weather");
const forecastSection = document.getElementById("forecast-section");
const forecastDaysContainer = document.getElementById("forecast-days-container");
const forecastDays = [];

function getRandomLocation() {
  const cities = [
    "New York",
    "London",
    "Paris",
    "Tokyo",
    "Sydney",
    "Los Angeles",
    "Dubai",
    "Rio de Janeiro",
    "Moscow",
    "Cape Town",
    "Beijing",
    "Mumbai",
    "Singapore",
    "Toronto",
    "Amsterdam",
    "Berlin",
    "Istanbul",
    "Bangkok",
    "Seoul",
    "San Francisco"
  ];
  const randomIndex = Math.floor(Math.random() * cities.length);
  return cities[randomIndex];
}

// Handle form submission
form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.textContent = '';
  getCurrentWeatherData(city.value, country.value);
  getForecastData(city.value, country.value);
  city.value = "";
  country.value = "";
});

// Function to make API request for weather data
async function getWeatherData(location) {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`);
      const data = await response.json();
      if (!data.coord) {
        // Handle the case where the API response doesn't contain the coord object
        console.log("Error: Could not get weather data for the location.");
        return;
      }
      
      getForecastData(lat, lon);
    } catch (error) {
      console.log(error);
    }
  }

async function getCurrentWeatherData(city, country) {
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city},${country}&aqi=no`;
  
    try {
      const response = await fetch(currentUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const weatherInfo = document.querySelector("#current-weather");
      await fadeOut(weatherInfo);
      updateCurrentWeather(data); // Update the UI with the current weather data
      await fadeIn(weatherInfo);
    } catch (error) {
      console.error(`Error fetching current weather data: ${error}`);
      errorMessage.textContent = 'Error occured while fetching weather data!';
    }
  }
  
async function getForecastData(city, country) {
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city},${country}&days=5&aqi=no&alerts=no`;
  
    //try {
      const response = await fetch(forecastUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)

      const forecastInfo = document.querySelector("#forecast-section");
      await fadeOut(forecastInfo);
      updateForecast(data.forecast.forecastday, data.location.name); // Update the UI with the forecast data
      await fadeIn(forecastInfo);
    //} catch (error) {
      //console.error(`Error fetching forecast data: ${error}`);
    //}
  }

async function updateCurrentWeather (currentWeatherData) {
    if (!currentWeatherData.location) {
        // Handle the case where the API response doesn't contain the coord object
        console.log("Error: Could not get weather data for the location.");
        return;
    }
    const currentName = currentWeatherData.location.name
    const currentCountry = currentWeatherData.location.country
    const currentTemp = Math.round(currentWeatherData.current.temp_c);
    const currentDescription = currentWeatherData.current.condition.text
    const currentIcon = currentWeatherData.current.condition.icon

    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${getRandomLocation()}&aqi=no&alerts=no`);
    const randomLocationData = await response.json()
    const randomName = randomLocationData.location.name
    const randomCountry = randomLocationData.location.country
    const randomTemp = Math.round(randomLocationData.current.temp_c);
    const randomDescription = randomLocationData.current.condition.text
    const randomIcon = randomLocationData.current.condition.icon

    const weatherHTML = `
    <h2>Current weather in ${currentName}</h2>
    <div>
        ${currentTemp}&deg;C
        <img src="https:${currentIcon}" alt="${currentDescription}">
    </div>
    <div id="current-location">${currentName}, ${currentCountry}</div>
    <div id="current-description">${currentDescription}</div>
    <h2>Don't like where you are? Imagine you're in ${randomName}</h2>
    <div>
        ${randomTemp}&deg;C
        <img src="https:${randomIcon}" alt="${randomDescription}">
    </div>
    <div id="current-location">${randomName}, ${randomCountry}</div>
    <div id="current-description">${randomDescription}</div>`;
    currentWeather.innerHTML = weatherHTML;
    currentWeather.style.padding = '2em';
}

function updateForecast (forecastData, locationName) {
    while (forecastDaysContainer.hasChildNodes()) {
      forecastDaysContainer.removeChild(forecastDaysContainer.firstChild);
      forecastDays.pop()
    }
    if (forecastSection.firstChild !== forecastDaysContainer) {
      forecastSection.removeChild(forecastSection.firstChild);
    }
    const forecastTitle = document.createElement("h1");
    forecastTitle.textContent = `Forecast for ${locationName}`;
    forecastSection.prepend(forecastTitle);

    forecastData.forEach((forecastday) => {
      const dayName = new Date(forecastday.date_epoch * 1000).toLocaleDateString("en-US", { weekday: "short" });
      const tempMin = Math.round(forecastday.day.mintemp_c);
      const tempMax = Math.round(forecastday.day.maxtemp_c);
      const iconUrl = `https:${forecastday.day.condition.icon}`
      addForecastDay(dayName, iconUrl, tempMax, tempMin, forecastday.hour)
    });
}

// create a function to add a forecast day element
function addForecastDay(date, iconUrl, highTemp, lowTemp, hourlyData) {
  // create the HTML elements for the forecast day
  const forecastDay = document.createElement("div");
  forecastDay.classList.add("forecast-day");

  const forecastDate = document.createElement("h3");
  forecastDate.textContent = date;
  forecastDay.appendChild(forecastDate);

  const forecastSummary = document.createElement("div");
  forecastSummary.classList.add("forecast-summary");
  forecastDay.appendChild(forecastSummary);

  const forecastIcon = document.createElement("img");
  forecastIcon.setAttribute("src", iconUrl);
  forecastIcon.setAttribute("alt", "weather icon");
  forecastSummary.appendChild(forecastIcon);

  const forecastTemps = document.createElement("div");
  forecastTemps.classList.add("forecast-temps");

  const forecastHigh = document.createElement("span");
  forecastHigh.classList.add("forecast-high");
  forecastHigh.textContent = `${highTemp}°C / `;
  forecastTemps.appendChild(forecastHigh);

  const forecastLow = document.createElement("span");
  forecastLow.classList.add("forecast-low");
  forecastLow.textContent = `${lowTemp}°C`;
  forecastTemps.appendChild(forecastLow);

  forecastSummary.appendChild(forecastTemps);

  // add the hourly forecast element
  const hourlyForecast = document.createElement("div");
  hourlyForecast.classList.add("hourly-forecast");

  // add 6 hourly forecast elements with placeholder data
  for (let i = 6; i <= 23; i++) {
    const hour = document.createElement("div");
    hour.classList.add("hour");

    const time = document.createElement("div");
    time.classList.add("time");
    time.textContent = new Date(hourlyData[i].time_epoch * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    hour.appendChild(time);

    const icon = document.createElement("img");
    icon.setAttribute("src", `https:${hourlyData[i].condition.icon}`);
    icon.setAttribute("alt", "hourly weather icon");
    icon.classList.add("icon");
    hour.appendChild(icon);

    const temperature = document.createElement("div");
    temperature.classList.add("temperature");
    temperature.textContent = `${hourlyData[i].temp_c}°C`;
    hour.appendChild(temperature);

    hourlyForecast.appendChild(hour);
  }

  forecastDay.appendChild(hourlyForecast);

  // add the forecast day element to the array and the forecast section
  forecastDays.push(forecastDay);
  forecastDaysContainer.appendChild(forecastDay);

  // add a click event listener to the forecast day element to expand/collapse it
  forecastDay.addEventListener("click", () => {
    // hide all other forecast day elements
    forecastDays.forEach((day) => {
      if (day !== forecastDay && !forecastDay.classList.contains("expanded-day")) {
        day.style.display = "none";
      } else {
        day.style.display = "block";
      }
    });

    // expand/collapse the clicked forecast day element
    if (forecastDay.classList.contains("expanded-day")) {
      forecastDay.classList.remove("expanded-day");
    } else {
      forecastDay.classList.add("expanded-day");
    }
  });
}

async function fadeOut (info) {
  info.classList.add("fade-out"); // Add a fade-out animation to the weather information
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for the animation to complete
}

async function fadeIn (info) {
  info.classList.remove("fade-out"); // Remove the fade-out animation
  info.classList.add("fade-in"); // Add a fade-in animation to the forecast information
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for the animation to complete
  info.classList.remove("fade-in"); // Remove the fade-in animation
}
