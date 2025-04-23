const weatherApiKey = "xnapHwl1YjexKFVA9C39hPbfMj0TrtDt";
const reverseGeoCodingApiKey = "f27b73ea42b74540b5b0d3c9ac65e3b9";
const citySearchUrl =
  "https://dataservice.accuweather.com/locations/v1/cities/search";

const currentCondtions =
  "https://dataservice.accuweather.com/currentconditions/v1/";

const twelveHourForecast =
  "https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/";

const fiveDayForecast =
  "https://dataservice.accuweather.com/forecasts/v1/daily/5day/";

const reverseGeoCodingApi = "https://api.geoapify.com/v1/geocode/reverse";

const searchBar = document.querySelector(".search-button");

let twHourData = [];
let fiveDayData = [];
let currentData = [];

function decideImage(partOfDay, imgStr) {
  if (partOfDay === "Day") {
    if (
      imgStr.toLowerCase().includes("sunny") ||
      imgStr.toLowerCase().includes("clear")
    )
      return "sun";
    else if (
      imgStr.toLowerCase().includes("partly") ||
      imgStr.toLowerCase().includes("cloud")
    )
      return "partly-cloudy";
    else if (imgStr.toLowerCase().includes("rain")) return "rainy-day";
    else return "partly-cloudy";
  } else {
    if (
      imgStr.toLowerCase().includes("sunny") ||
      imgStr.toLowerCase().includes("clear")
    )
      return "moon-and-stars";
    else if (
      imgStr.toLowerCase().includes("partly") ||
      imgStr.toLowerCase().includes("cloud")
    )
      return "cloudy-night";
    else if (imgStr.toLowerCase().includes("rain")) return "rain";
    else return "cloudy-night";
  }
}

function convertTime(dateTime) {
  let time = dateTime.slice(11, 16);
  let hour = Number(time.slice(0, 2));

  if (hour > 12) {
    hour = hour % 12;
    time = hour + ":00PM";
  } else time = hour + ":00AM";

  return time;
}

function FtoC(F) {
  return Math.floor((F - 32) * 0.55);
}

function decidePartOfDay(DateTime) {
  const time = Number(DateTime.slice(11, 13));
  if (time > 4 && time < 18) return "Day";
  else return "Night";
}

function updateDOM(cityName, currentData, twHourData, fiveDayData) {
  // updating main-city dom
  document.querySelector(".main-city div h1").textContent =
    cityName.toUpperCase();
  document.querySelector(".main-city div h2").textContent =
    Math.floor(currentData[0].Temperature.Metric.Value) + "°C";
  document.querySelector(".main-city img").src =
    "./images/" +
    decideImage(
      decidePartOfDay(currentData[0].LocalObservationDateTime),
      currentData[0].WeatherText
    ) +
    ".png";

  //updating hourly dom
  let timesArr = document.querySelectorAll(".time");
  for (let i = 0; i < timesArr.length; i++) {
    timesArr[i].textContent = convertTime(twHourData[i].DateTime);
  }

  let imgArray = document.querySelectorAll(".left-icon");
  for (let i = 0; i < imgArray.length; i++) {
    imgArray[i].src =
      "./images/" +
      decideImage(
        decidePartOfDay(twHourData[i].DateTime),
        twHourData[i].IconPhrase
      ) +
      ".png";
  }

  let tempArray = document.querySelectorAll(".temp");
  for (let i = 0; i < tempArray.length; i++) {
    tempArray[i].textContent = FtoC(twHourData[i].Temperature.Value) + "°C";
  }

  //updating 5 day forecast

  let dateArray = document.querySelectorAll(".date");
  for (let i = 0; i < dateArray.length; i++) {
    dateArray[i].textContent = fiveDayData.DailyForecasts[i].Date.slice(5, 10);
  }

  let iconArray = document.querySelectorAll(".right-icon");
  for (let i = 0; i < iconArray.length; i++) {
    iconArray[i].src =
      "./images/" +
      decideImage("Day", fiveDayData.DailyForecasts[i].Day.IconPhrase) +
      ".png";
  }

  let minMaxArr = document.querySelectorAll(".min-max");
  for (let i = 0; i < minMaxArr.length; i++) {
    minMaxArr[i].textContent =
      FtoC(fiveDayData.DailyForecasts[i].Temperature.Minimum.Value) +
      "-" +
      FtoC(fiveDayData.DailyForecasts[i].Temperature.Maximum.Value) +
      "°C";
  }
}

const getCityData = async function (cityName) {
  const respose = await fetch(
    `${citySearchUrl}?apikey=${weatherApiKey}&q=${cityName}`
  );
  const data = await respose.json();
  const cityKey = data[0].Key;
  const city = data[0].LocalizedName;

  const respose1 = await fetch(
    `${currentCondtions}${cityKey}?apikey=${weatherApiKey}`
  );
  currentData = await respose1.json();

  const respose2 = await fetch(
    `${fiveDayForecast}${cityKey}?apikey=${weatherApiKey}`
  );
  fiveDayData = await respose2.json();

  const respose3 = await fetch(
    `${twelveHourForecast}${cityKey}?apikey=${weatherApiKey}`
  );
  twHourData = await respose3.json();

  console.log(currentData, twHourData, fiveDayData);

  updateDOM(city, currentData, twHourData, fiveDayData);
};

const getCityName = async function (latitude, longitude) {
  try {
    const respose = await fetch(
      `${reverseGeoCodingApi}?lat=${latitude}&lon=${longitude}&apiKey=${reverseGeoCodingApiKey}`
    );
    const data = await respose.json();
    getCityData(data.features[0].properties.city);
  } catch (error) {
    console.log(error);
  }
};

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    getCityData(searchBar.value);
    searchBar.value = "";
  }
});

window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        getCityName(latitude, longitude);
      },
      function (error) {
        console.log("Error getting location", error);
      }
    );
  }
};
