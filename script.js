import { currencies } from "./data/currencies.js";
import { units } from "./data/units.js";
import { convertUnit, formatNumber } from "./utils/convert.js";
import { fetchCurrencyRates } from "./api/currency.js";

const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("fromUnit");
const toSelect = document.getElementById("toUnit");
const categorySelect = document.getElementById("category");
const swapBtn = document.getElementById("swapBtn");
const resultEl = document.getElementById("result");
const metaEl = document.getElementById("meta");

const DATA = {
  currency: currencies,
  ...units
};

const CURRENCY_REFRESH_INTERVAL = 10 * 60 * 1000;
let currencyRefreshTimer = null;

function buildCategories() {
  categorySelect.innerHTML = "";

  Object.entries(DATA).forEach(([key, category]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = category.label;
    categorySelect.appendChild(option);
  });

  categorySelect.value = "currency";
}

function buildUnits(categoryKey) {
  const category = DATA[categoryKey];

  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  if (!category) return;

  Object.entries(category.items).forEach(([key, unit]) => {
    const optionFrom = document.createElement("option");
    optionFrom.value = key;
    optionFrom.textContent = `${unit.name} (${key})`;

    const optionTo = document.createElement("option");
    optionTo.value = key;
    optionTo.textContent = `${unit.name} (${key})`;

    fromSelect.appendChild(optionFrom);
    toSelect.appendChild(optionTo);
  });

  const keys = Object.keys(category.items);
  fromSelect.value = keys[0];
  toSelect.value = keys[1] || keys[0];
}

function convert() {
  const categoryKey = categorySelect.value;
  const category = DATA[categoryKey];
  const amount = parseFloat(amountInput.value);

  if (!category) {
    resultEl.textContent = "Kategori bulunamadı";
    metaEl.textContent = "";
    return;
  }

  if (!Number.isFinite(amount)) {
    resultEl.textContent = "0";
    metaEl.textContent = "Lütfen geçerli bir sayı gir.";
    return;
  }

  const fromUnit = category.items[fromSelect.value];
  const toUnit = category.items[toSelect.value];

  if (!fromUnit || !toUnit) {
    resultEl.textContent = "Birim bulunamadı";
    metaEl.textContent = "";
    return;
  }

  const result = convertUnit(fromUnit.rate, toUnit.rate, amount);

  resultEl.textContent = formatNumber(result);
  metaEl.textContent = `${amount} ${fromSelect.value} = ${formatNumber(result)} ${toSelect.value} • ${category.label}`;
}

function swapUnits() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convert();
}

async function updateCurrencyRates() {
  const rates = await fetchCurrencyRates();

  if (!rates) {
    metaEl.textContent = "Canlı kur alınamadı. Son kayıtlı değerler kullanılıyor.";
    return;
  }

  Object.keys(DATA.currency.items).forEach((code) => {
    if (typeof rates[code] === "number") {
      DATA.currency.items[code].rate = rates[code];
    }
  });

  if (categorySelect.value === "currency") {
    convert();
  }

  metaEl.textContent = `Döviz kurları güncellendi.`;
}

function startAutoRefresh() {
  if (currencyRefreshTimer) {
    clearInterval(currencyRefreshTimer);
  }

  currencyRefreshTimer = setInterval(() => {
    updateCurrencyRates();
  }, CURRENCY_REFRESH_INTERVAL);
}

categorySelect.addEventListener("change", () => {
  buildUnits(categorySelect.value);
  convert();
});

amountInput.addEventListener("input", convert);
fromSelect.addEventListener("change", convert);
toSelect.addEventListener("change", convert);
swapBtn.addEventListener("click", swapUnits);

async function init() {
  buildCategories();
  buildUnits("currency");
  convert();

  await updateCurrencyRates();
  startAutoRefresh();
}

init();