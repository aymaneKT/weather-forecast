const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let date = new Date();
let day = days[date.getDay()];
let month = months[date.getMonth()];
let year = date.getFullYear();
let Time = date.toLocaleTimeString();
let baseUrl = "https://api.open-meteo.com/v1/forecast";

//Get Data From Extern File
async function getData() {
  let path = "./it.json";
  let data = await fetch(path);
  let dataJson = await data.json();
  return dataJson;
}

//pass the data from external another function to change it as a option in html

function addCitiesAsOption(arryOfCitiesList, cityDefault) {
  for (const item of arryOfCitiesList) {
    if (item.city == cityDefault) {
      document.querySelector(
        "select"
      ).innerHTML += `<option selected value="${item.lat},${item.lng}" style="background-color:black">${item.city}</option>`;
    } else {
      document.querySelector(
        "select"
      ).innerHTML += `<option value="${item.lat},${item.lng}" style="background-color:black">${item.city}</option>`;
    }
  }
}

//main function
async function getMeteoInfo(lat, long) {
  // sorting array and Taking The Default City in <option></option> , thakns to addCitiesAsOption() function
  let cities = await getData();
  cities.sort((a, b) => a.city.localeCompare(b.city));
  let CityFiltred = await cities.find((c) => c.lat == lat && c.lng == long);
  let city = CityFiltred.city;
  addCitiesAsOption(cities, city);
  let params = {
    params: {
      latitude: lat,
      longitude: long,
      current:
        "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m",
      hourly:
        "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m",
    },
  };
  axios.get(baseUrl, params).then((response) => {
    let data = response.data;
    let currentTemperature = data.current.temperature_2m;
    let currentUmidity = data.current.relative_humidity_2m;
    let currentPressure = data.current.surface_pressure;
    let currentWind = data.current.wind_speed_10m;
    document.getElementById("information").innerHTML = `
    <div class="flex items-center gap-4">
              <i class="fa-solid fa-cloud text-3xl"></i>
              <div>
                <p>Forecasts:</p>
                <h3 class="font-bold">${day} ${month} ${year} | ${Time}</h3>
                <p class="font-bold" id="city">${city}</p>
              </div>
            </div>
          </div>
          <div>
            <h1 class="text-5xl min-[320px]:text-xl">${currentTemperature}°C | ${(
      (currentTemperature * 9) / 5 +
      32
    ).toFixed(2)}°F</h1>
          </div>
            <div id="umidita-pressione-vento" class="flex gap-5">
              <div>
                <div id="umidita" class="flex items-center gap-8">
                  <i class="fa-solid fa-droplet text-xl"></i>
                  <p>Umidity: ${currentUmidity}%</p>
                </div>
                  <div id="pressione" class="flex items-center gap-3">
                    <div id="drows">
                      <i class="fa-solid fa-arrow-down text-xl"></i>
                      <i class="fa-solid fa-arrow-down text-xl"></i>
                    </div>
                    <p>Pressure: ${currentPressure} hPa</p>
                  </div>
              </div>
                <div id="vento" class="flex items-center gap-3 self-start grow-0">
                  <i class="fa-solid fa-wind"></i>
                  <p>Wind: ${currentWind}Km/h</p>
              </div>
            </div>
    `;
    showPreloader(false);
    let arrayOfTemp = data.hourly.temperature_2m;
    let arrayOfUmidity = data.hourly.relative_humidity_2m;
    let arrayOfWind = data.hourly.wind_speed_10m;
    createChartOfTheDay(arrayOfTemp, arrayOfUmidity, arrayOfWind);
  });
}

//create charts
function createChartOfTheDay(temperature, umidity, wind) {
  removeCanvas();
  let hours = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];
  const data = {
    labels: hours,
    datasets: [
      {
        label: "Temperature(°C)",
        data: temperature,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Wind(Km/h)",
        data: wind,
        fill: false,
        borderColor: "rgb(255, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Umididty(%)",
        data: umidity,
        fill: false,
        borderColor: "rgb(0, 20, 255)",
        tension: 0.1,
      },
    ],
  };
  const config = {
    type: "line",
    data: data,
  };

  let myChart = new Chart(document.getElementById("acquisitions"), config);
}

//Delete old canvas to replace it with the new one(chart)
function removeCanvas() {
  let parent = document.getElementById("chart");
  let oldCanvas = document.getElementById("acquisitions");
  parent.removeChild(oldCanvas);
  var canv = document.createElement("canvas");
  canv.id = "acquisitions";
  parent.appendChild(canv);
}

//event to start
document.querySelector("select").addEventListener("change", async () => {
  let citySelected = document.querySelector("select").value;
  let cordinate = citySelected.split(",");
  let latitude = cordinate[0];
  let longitude = cordinate[1];
  showPreloader(true);
  getMeteoInfo(latitude, longitude);
});

//start program with a default City : (Rome ,Italy)
showPreloader(true);
getMeteoInfo("41.8933", "12.4828");

function showPreloader(load = true) {
  if (load) {
    document.getElementById("preloader").style.visibility = "visible";
    document.querySelector("select").style.visibility = "hidden";
    document.getElementById("acquisitions").style.visibility = "hidden";
    document.getElementById("information").style.visibility = "hidden";
  } else {
    document.getElementById("preloader").style.visibility = "hidden";
    document.querySelector("select").style.visibility = "visible";
    document.getElementById("acquisitions").style.visibility = "visible";
    document.getElementById("information").style.visibility = "visible";
  }
}
