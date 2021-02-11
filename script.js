var APIKey = "dfacead3f9ee1cf92fb953110eeae3a1";

var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?"

var forecastURL = "https://api.openweathermap.org/data/2.5/onecall?"

var now = moment()

var currentDay = (now.format("l"));

function createWeatherDiv() {
    var weather = document.getElementById("weather")
    var weatherDiv = document.createElement("div");
    weatherDiv.className = "weatherDiv";
    weather.append(weatherDiv);
}

var searchDiv = document.getElementById("searchDiv")
var searchBtn = document.createElement("button");
searchBtn.className = "button btn btn-primary";
var searchIcon = document.createElement("i")
searchIcon.className = "fas fa-search";
searchBtn.append(searchIcon);
searchDiv.append(searchBtn);
var searchHistoryList = document.getElementById("cities");
var searchHistory = JSON.parse(localStorage.getItem("cities")) || []
var currentSearch = document.getElementById("currentSearch");

function renderSearchHistory() {
    searchHistoryList.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
        addCityDiv(searchHistory[i])
    }
}

function addCityDiv(searchText) {
    var cities = document.createElement("div");
    cities.textContent = searchText;
    cities.addEventListener("click", function () {
        getCity(this.textContent)
    })
    searchHistoryList.append(cities);
}

searchBtn.addEventListener("click", function () {
    var city = document.getElementById("searchResponse").value.trim()
    if (city == "") {
        alert("Please enter something!");
    }
    else {
        searchHistory = searchHistory.filter(elem => city !== elem)
        searchHistory.unshift(city);
        searchHistory.splice(3);
        localStorage.setItem("cities", JSON.stringify(searchHistory));
        renderSearchHistory()
    }
})
renderSearchHistory()

function createCurrentWeatherAPIParameters(city) {
    return "q=" + city + "&appid=" + APIKey;
}
function createForecastAPIParameters(coord) {
    return "lat=" + coord.lat + "&lon=" + coord.lon + "&exclude=current,minutely,hourly,alerts&appid=" + APIKey;
}

searchBtn.addEventListener("click", () => getCity(searchHistory[0]))

function getCity(cityInput) {
    $.ajax({
        url: currentWeatherURL + createCurrentWeatherAPIParameters(cityInput),
        method: "GET"
    })
        .then(function (response) {
            $("#city").empty()
            // console.log(response);
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            console.log(lat)
            console.log(lon)
            var temp = (response.main.temp - 273.15) * 1.80 + 32;
            $("#city").append(response.name + " (" + (now.format("l")) + ")");
            $("#weather").html("<br />" + "Temperature: " + temp.toFixed(1) + "&#8457;" + "<br /><br />" + "Humidity: " + response.main.humidity + "%" + "<br /><br />" + "Windspeed: " + response.wind.speed + "mph" + "<br /><br />");

            return $.ajax({
                url: forecastURL + createForecastAPIParameters(response.coord),
                method: "GET"
            })
        })

        .then(function (response) {
            $("#uvi").empty()
            var uvi = response.daily[0].uvi
            uvi.className = "uvi"
            var uviBtn = document.createElement("button");
            uviBtn.className = "button btn btn-danger";
            uviBtn.append(uvi)
            $("#uvi").append("UV Index: ")
            $("#uvi").append(uviBtn);

            var forecast = document.getElementById("forecast")
            var forecastHeader = document.getElementById("forecastHeader")
            forecastHeader.innerHTML = "5-Day Forecast:" + "<br />";
            $("#forecast").empty()
            $("#forecastHeader").empty()

            for (let a = 1; a < 6; a++) {
                function createForecastDiv(a) {
                    var forecastDiv = document.createElement("div");
                    forecastDiv.className = "forecastDiv col-sm bg-primary mb-3 mr-3 p-4";

                    var timestamp = response.daily[a].dt * 1000
                    var date = document.createElement("div");
                    date.className = "date";
                    date.textContent = Intl.DateTimeFormat("en").format(timestamp)

                    var imgDiv = document.createElement("div");
                    imgDiv.className = "imgDiv";

                    var icon = document.createElement("img");
                    icon.setAttribute("id", "image");
                    var conditions = response.daily[a].weather[0].icon
                    icon.src = "http://openweathermap.org/img/wn/" + conditions + "@2x.png"

                    var dailyStats = document.createElement("div");
                    dailyStats.className = "div dailyStats";
                    var dailyTemp = (response.daily[a].temp.day - 273.15) * 1.80 + 32;
                    var dailyHumidity = (response.daily[a].humidity);
                    dailyStats.innerHTML = "Temp: " + dailyTemp.toFixed(1) + " &#8457; " + "<br /><br />" + "Humidity: " + dailyHumidity + " % ";

                    forecastDiv.append(date, icon, dailyStats)
                    forecast.append(forecastDiv);
                }
                createForecastDiv(a)
            }
            console.log(response);
        });
}
getCity(searchHistory[0])

