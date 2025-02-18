const modal = document.getElementById('inputModal');
const imageGrid = document.getElementById('imageGrid');
const weatherInfo = document.getElementById('weatherInfo');
const locationForm = document.getElementById('locationForm');
const locationInput = document.getElementById('locationInput');

const WEATHER_API_KEY = '0cce000925c64e970c43e77a71e46b47';
const UNSPLASH_API_KEY = 'jFn-0MU23UEHBSD7SaFSVYj3fbYPEGlQh_YKptdotZ0';

// DOM Elements
const locationName = document.getElementById('locationName');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const humidity = document.getElementById('humidity');

let isLoading = false;

async function fetchWeatherData(location) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`
        );

        console.log(`Weather API Response Status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Weather Data Received:', data);
        return data;
    } catch (error) {
        console.error('Weather Fetch Error:', error);
        alert(`Weather data error: ${error.message}`);
        return null;
    }
}

async function fetchLocationImages(location) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?page=1&query=${location}&client_id=${UNSPLASH_API_KEY}&per_page=12`
        );

        console.log(`Unsplash API Response Status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Unsplash API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Unsplash Images Received:', data.results);
        return data.results;
    } catch (error) {
        console.error('Image Fetch Error:', error);
        alert(`Image fetch error: ${error.message}`);
        return [];
    }
}

function updateWeatherUI(weatherData) {
    if (!weatherData || weatherData.cod !== 200) {
        alert('Invalid weather data received');
        return;
    }

    locationName.textContent = `${weatherData.name}, ${weatherData.sys.country}`;
    temperature.textContent = `🌡 ${weatherData.main.temp}°C`;
    weatherDescription.textContent = `☁️ ${weatherData.weather[0].description}`;
    humidity.textContent = `💧 Humidity: ${weatherData.main.humidity}%`;
    weatherInfo.style.display = 'block';
}

function updateImageGrid(images) {
    imageGrid.innerHTML = '';
    images.forEach((image) => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.style.backgroundImage = `url(${image.urls.regular}?w=800&h=600&fit=crop)`;
        div.title = image.description || image.alt_description || 'Location image';
        imageGrid.appendChild(div);
    });
}

async function handleLocationSearch(location) {
    if (isLoading) return;
    
    const submitButton = locationForm.querySelector('button');
    try {
        isLoading = true;
        submitButton.disabled = true;
        submitButton.textContent = 'Searching...';

        const [weatherData, images] = await Promise.all([
            fetchWeatherData(location),
            fetchLocationImages(location)
        ]);

        if (weatherData?.cod === 200 && images?.length > 0) {
            modal.style.display = 'none';
            updateWeatherUI(weatherData);
            updateImageGrid(images);
        } else {
            if (!weatherData) {
                alert('Invalid city/country name. Please try again.');
            } else if (images.length === 0) {
                alert('Found weather data but no images available for this location.');
            }
        }
    } catch (error) {
        console.error('Main Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        isLoading = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Get Info';
    }
}

// Event Listeners
locationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    
    if (!location) {
        alert('Please enter a location');
        return;
    }

    await handleLocationSearch(location);
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
    }
});

// Initialize modal
modal.style.display = 'flex';
locationInput.focus();