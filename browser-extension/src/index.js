import axios from "axios";

// form fields
const form = document.querySelector(".form-data");
const regions = document.querySelectorAll(".region-name");
const apiKey = document.querySelector(".api-key");

// results
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const resultsContainer = document.querySelector(".results-container");
const clearBtn = document.querySelector(".clear-btn");

form.addEventListener("submit", (e) => handleSubmit(e));
clearBtn.addEventListener("click", (e) => reset(e));
init();

function reset(e) {
  e.preventDefault();
  localStorage.removeItem("apiKey");
  localStorage.removeItem("regionNames");
  init();
}

function init() {
  const storedApiKey = localStorage.getItem("apiKey");
  const storedRegions = JSON.parse(localStorage.getItem("regionNames"));
  if (storedApiKey === null || storedRegions === null) {
    form.style.display = "block";
    resultsContainer.style.display = "none";
    loading.style.display = "none";
    clearBtn.style.display = "none";
    errors.textContent = "";
  } else {
    displayCarbonUsage(storedApiKey, storedRegions);
    resultsContainer.style.display = "none";
    form.style.display = "none";
    clearBtn.style.display = "block";
  }

  chrome.runtime.sendMessage({
    action: "updateIcon",
    value: {
      color: "green",
    },
  });
}

function handleSubmit(e) {
  e.preventDefault();
  const regionValues = Array.from(regions)
    .map((region) => region.value)
    .filter((value) => value !== "");
  setUpUser(apiKey.value, regionValues);
}

async function displayCarbonUsage(apiKey, regions) {
  try {
    resultsContainer.innerHTML = "";
    loading.style.display = "block";
    form.style.display = "none";
    let validResults = 0;
    for (const region of regions) {
      try {
        const response = await axios.get(
          "https://api.co2signal.com/v1/latest",
          {
            params: {
              countryCode: region,
            },
            headers: {
              "auth-token": apiKey,
            },
          }
        );
        const CO2 = Math.floor(response.data.data.carbonIntensity);
        const resultDiv = document.createElement("div");
        resultDiv.className = "result";
        resultDiv.innerHTML = `
          <p><strong>Region: </strong><span class="my-region">${region}</span></p>
          <p><strong>Carbon Usage: </strong><span class="carbon-usage">${Math.round(
            response.data.data.carbonIntensity
          )} grams (grams CO2 emitted per kilowatt hour)</span></p>
          <p><strong>Fossil Fuel Percentage: </strong><span class="fossil-fuel">${response.data.data.fossilFuelPercentage.toFixed(
            2
          )}% (percentage of fossil fuels used to generate electricity)</span></p>
        `;
        resultsContainer.appendChild(resultDiv);
        validResults++;
      } catch (regionError) {
        console.log(`Error fetching data for region ${region}:`, regionError);
      }
    }
    loading.style.display = "none";
    if (validResults > 0) {
      resultsContainer.style.display = "block";
    } else {
      resultsContainer.style.display = "none";
      errors.textContent =
        "Sorry, we have no data for the regions you have requested.";
    }
  } catch (error) {
    console.log(error);
    loading.style.display = "none";
    resultsContainer.style.display = "none";
    errors.textContent =
      "Sorry, we have no data for the regions you have requested.";
  }
}

function setUpUser(apiKey, regionNames) {
  localStorage.setItem("apiKey", apiKey);
  localStorage.setItem("regionNames", JSON.stringify(regionNames));
  loading.style.display = "block";
  errors.textContent = "";
  clearBtn.style.display = "block";
  displayCarbonUsage(apiKey, regionNames);
}

const calculateColor = async (value) => {
  let co2Scale = [0, 150, 600, 750, 800];
  let colors = ["#2AA364", "#F5EB4D", "#9E4229", "#381D02", "#381D02"];
  let closestNum = co2Scale.sort((a, b) => {
    return Math.abs(a - value) - Math.abs(b - value);
  })[0];
  console.log(value + " is closest to " + closestNum);
  let num = (element) => element > closestNum;
  let scaleIndex = co2Scale.findIndex(num);
  let closestColor = colors[scaleIndex];
  console.log(scaleIndex, closestColor);
  chrome.runtime.sendMessage({
    action: "updateIcon",
    value: { color: closestColor },
  });
};
