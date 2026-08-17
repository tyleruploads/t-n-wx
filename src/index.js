const buttonGetWx = document.getElementById('button-get-wx');
const inputLocation = document.getElementById("input-location");

const tableLocation = document.getElementById("table-location");
const tableWeather = document.getElementById("table-weather");

async function getWeather(location) {
	console.log(`Location inpur by user: ${location}`);

	const geocodingApiURL = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=en&format=json`;

	try {
		const geocodingData = await getApiResponse(geocodingApiURL);
		console.log("Success, geocodingData = ", geocodingData);

		const geocodingResults = geocodingData["results"][0];
		const long = geocodingResults.longitude;
		const lat = geocodingResults.latitude;

		console.log(`The location has been located to ${lat}, ${long}`);

		setTable(geocodingResults, tableLocation.querySelector("tbody"));
		
		const weatherApiURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,weather_code,uv_index_clear_sky_max,sunrise,sunset,daylight_duration,sunshine_duration,moonrise,moonset,moon_phase,rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`;

		const weatherData = await getApiResponse(weatherApiURL);
		console.log("Success, weatherData = ", weatherData);

		setTable(weatherData["daily"], tableWeather.querySelector("tbody"));

	} catch (error) {
		console.error("Could not fetch weather data: ", error);
	}
	
}

function setTable(dict, tbody) {
	/* Ensure the table only has entries for one location */
	tbody.innerHTML = '';
	for (const [key, value] of Object.entries(dict)) {
		let tr = document.createElement('tr');
		tr.innerHTML = `
<th scope="row">${key}</th>
`;
		let th = document.createElement('th');

		if (Array.isArray(value)) {
			th.innerHTML = `<td>${value[0]}</td>`;
		} else {
			th.innerHTML = `<td>${value}</td>`;
		}

		tr.appendChild(th);

		tbody.appendChild(tr);	
	}
}


async function getApiResponse(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return  await response.json();
    
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

function saveToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function readLocalStorage(key) {
	const storedData = localStorage.getItem(key);
	if (storedData) {
		const parsedData = JSON.parse(storedData);
		return parsedData;
	}
}

function checkForLocation() {
	const location = readLocalStorage('location');

	if (location) {
		getWeather(location);
		inputLocation.value = location;
	}
}

buttonGetWx.addEventListener("click", (e) => {
	const location = inputLocation.value;
	getWeather(location);
	saveToLocalStorage('location', location);
});

document.addEventListener("DOMContentLoaded", checkForLocation());
