const API_KEY = "e7e92760a280fdc035c9e9ae84d33f3b";
const DAY_OF_THE_WEEK = ["sun", "mon", "tue", "wed", "thr", "fri", "sat"];

// fetching the wheater data using API
const getCurrentWheatherData = async () => {
  let cityName = "Bengaluru";
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
  );
  //   console.log(response.json());
  return response.json();
};



// fetching the hourly weather data using API
const getHourlyForcast = async ({ name: city }) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );

  const hourlyForcastData = await response.json();
  return hourlyForcastData.list.map((forcast) => {
    const {
      main: { temp, temp_min, temp_max },
      dt,
      dt_txt,
      weather: [{ description, icon }],
    } = forcast;
    return { temp, temp_min, temp_max, dt, dt_txt, description, icon };
  });
};



// Temperature formater
const formateTemperature = (temp) => `${temp?.toFixed(1)}🌡`;


// wheater Icon generator using API
const createIconURL = (icon) =>
  `http://openweathermap.org/img/wn/${icon}@2x.png`;



//  Calculating Five Day Frocast data 
const calculateFiveDayForcast = (hourlyForcast) => {
  let dayWiseForcast = new Map();

  for (let forcast of hourlyForcast) {
    const [date] = forcast.dt_txt.split(" ");
    const dayOfTheWeek = DAY_OF_THE_WEEK[new Date(date).getDay()];

    if (dayWiseForcast.has(dayOfTheWeek)) {
      let forcastOfTheDay = dayWiseForcast.get(dayOfTheWeek);
      forcastOfTheDay.push(forcast);
      dayWiseForcast.set(dayOfTheWeek, forcastOfTheDay);
    } else {
      dayWiseForcast.set(dayOfTheWeek, [forcast]);
    }
  }

  for (let [key, value] of dayWiseForcast) {
    let temp_min = Math.min(...Array.from(value, (val) => val.temp_min));
    let temp_max = Math.max(...Array.from(value, (val) => val.temp_max));

    dayWiseForcast.set(key, {
      temp_min,
      temp_max,
      icon: value.find((v) => v.icon).icon,
    });
  }
  return dayWiseForcast;
};



// updating the current weather data to HTML file
const loadCurrentForcast = ({
  name,
  main: { temp, temp_min, temp_max },
  weather: [{ description }],
}) => {
  const currentForcastElement = document.querySelector("#current-forcast");
  currentForcastElement.querySelector(".city-name").textContent = name;
  currentForcastElement.querySelector(".temp").textContent =
    formateTemperature(temp);
  currentForcastElement.querySelector(".description").textContent = description;
  currentForcastElement.querySelector(
    ".min-max-temp"
  ).textContent = `H: ${formateTemperature(temp_max)} L:${formateTemperature(
    temp_min
  )}`;
};


// updating the hourly weather data to HIML Element
const loadHourlyForcast = (
  { main: { temp: tempNow }, weather:[{icon: iconNow}]  },
  hourlyForcast
) => {

  const  datetimeFormater = Intl.DateTimeFormat("en", {
    hour12:true,
    hour: "numeric"
  });

  const hourlyForcastElement = document.querySelector(".hourly-container");
  const dateFor12Hour = hourlyForcast.slice(2, 14);

  let innerHTMLString = `<article>
  <h3 class="time">Now</h3>
  <img class="icon" src="${createIconURL(iconNow)}">
  <p class="hourly-temp">${formateTemperature(tempNow)}</p>
</article>`;

  for (let { temp, icon, dt_txt } of dateFor12Hour) {
    innerHTMLString += `<article>
        <h3 class="time">${datetimeFormater.format(new Date(dt_txt))}</h3>
        <img class="icon" src="${createIconURL(icon)}">
        <p class="hourly-temp">${formateTemperature(temp)}</p>
    </article>`;
  }

  hourlyForcastElement.innerHTML = innerHTMLString;
};



// updating the five data wheater data to HIML Element
const loadFiveDayForcast = (hourlyForcast) => {
  const fiveDayForcastElement = document.querySelector(
    ".five-day-forcast-container"
  );
  const dayWiseForcast = calculateFiveDayForcast(hourlyForcast);
  let innerHTMLString = ``;

  Array.from(dayWiseForcast).map(
    ([day, { temp_max, temp_min, icon }], index) => {
      if (index < 5) {
        innerHTMLString += `<article class="day-wise-forcast">
    <h3 class="day">${index === 0 ? "Today" : day}</h3>
    <img class="icon" src="${createIconURL(icon)}" alt="icon">
    <p class="low-temp">${formateTemperature(temp_min)}</p>
    <p class="high-temp">${formateTemperature(temp_max)}</p>
    </article>`;
      }
    }
  );

  fiveDayForcastElement.innerHTML = innerHTMLString;
};



// updating the feels likes data to HTML Element
const loadFeelsLike = ({ main: { feels_like } }) => {
  const feelsLikeElement = document.querySelector("#fills-like");
  feelsLikeElement.querySelector("p").textContent =
    formateTemperature(feels_like);
};


// updating the humidity data to HTML Element
const loadHumidity = ({ main: { humidity } }) => {
  const humidityElement = document.querySelector("#humidity");
  humidityElement.querySelector("p").textContent = `${humidity} %`;
};


// loading the DOM
document.addEventListener("DOMContentLoaded", async () => {
  const currentWheatherData = await getCurrentWheatherData();
  loadCurrentForcast(currentWheatherData);

  const hourlyForcast = await getHourlyForcast(currentWheatherData);
  loadHourlyForcast(currentWheatherData, hourlyForcast);
  loadFiveDayForcast(hourlyForcast);
  loadFeelsLike(currentWheatherData);
  loadHumidity(currentWheatherData);
});
