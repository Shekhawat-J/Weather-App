const API_KEY = "e7e92760a280fdc035c9e9ae84d33f3b";

const getCurrentWheatherData = async () => {
  let cityName = "Bengaluru";
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
  );
  //   console.log(response.json());
  return response.json();
};

const getHourlyForcast = async({name:city}) =>{
    const response = await fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    
    const hourlyForcastData = await response.json();
    return hourlyForcastData.list.map( (forcast) =>{
        const {main:{temp, temp_min, temp_max}, dt, dt_txt, weather:[{description, icon}]} = forcast;
        return {temp, temp_min, temp_max, dt, dt_txt, description, icon};
    })
}

const formateTemperature = (temp) =>`${temp?.toFixed(1)}🌡`;
const createIconURL = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`

const loadCurrentForcast = ({
  name,
  main: { temp, temp_min, temp_max },
  weather: [{ description }],
}) => {
  const currentForcastElement = document.querySelector("#current-forcast");
  currentForcastElement.querySelector(".city-name").textContent = name;
  currentForcastElement.querySelector(".temp").textContent = formateTemperature(temp);
  currentForcastElement.querySelector(".description").textContent = description;
  currentForcastElement.querySelector(
    ".min-max-temp"
  ).textContent = `H: ${formateTemperature(temp_max)} L:${formateTemperature(temp_min)}`;
};

const loadHourlyForcast = (hourlyForcast) =>{
    const hourlyForcastElement = document.querySelector('.hourly-container');
    const dateFor12Hour = hourlyForcast.slice(1, 13);
    let innerHTMLString = ``;
    for(let {temp, icon, dt_txt} of dateFor12Hour){
        innerHTMLString += `<article>
        <h3 class="time">${dt_txt.split(" ")[1]}</h3>
        <img class="icon" src="${createIconURL(icon)}">
        <p class="hourly-temp">${formateTemperature(temp)}</p>
    </article>`
    }

    hourlyForcastElement.innerHTML = innerHTMLString;
}

const loadFeelsLike = ({main:{feels_like}}) =>{
    const feelsLikeElement = document.querySelector('#fills-like');
    feelsLikeElement.querySelector('p').textContent = formateTemperature(feels_like);
}

const loadHumidity = ({main:{humidity}}) =>{
    const humidityElement = document.querySelector('#humidity');
    humidityElement.querySelector('p').textContent = `${humidity} %`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentWheatherData = await getCurrentWheatherData();
  loadCurrentForcast(currentWheatherData);

  const hourlyForcast = await getHourlyForcast(currentWheatherData);
  loadHourlyForcast(hourlyForcast)
  
  loadFeelsLike(currentWheatherData);
  loadHumidity(currentWheatherData);
});
