const API_KEY = "46b00bbb0476862ae22d76ad";

export async function fetchCurrencyRates() {
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP hatası: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error(data["error-type"] || "Kur verisi alınamadı.");
    }

    return data.conversion_rates;
  } catch (error) {
    console.error("Döviz API hatası:", error);
    return null;
  }
}