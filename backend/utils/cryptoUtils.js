import axios from "axios";
import cache from "./cache.js";

const PRICE_URL = "https://api.coingecko.com/api/v3/simple/price";

// Map symbols to CoinGecko IDs
const COIN_SYMBOLS = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

export const getCryptoPrice = async (symbol) => {
  const coinId = COIN_SYMBOLS[symbol.toUpperCase()];
  if (!coinId) throw new Error("Unsupported currency");

  // Use cached price if available
  const cachedPrice = cache.get(coinId);
  if (cachedPrice) return cachedPrice;

  try {
    const response = await axios.get(PRICE_URL, {
      params: {
        ids: coinId,
        vs_currencies: "usd",
      },
    });

    const price = response.data[coinId]?.usd;
    if (!price) throw new Error("Price not available");

    cache.set(coinId, price, 10000); // 10s cache
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    throw new Error("Failed to fetch crypto price");
  }
};

export const convertUsdToCrypto = async (usd, currency) => {
  const price = await getCryptoPrice(currency);
  return usd / price;
};

export const convertCryptoToUsd = async (amount, currency) => {
  const price = await getCryptoPrice(currency);
  return amount * price;
};