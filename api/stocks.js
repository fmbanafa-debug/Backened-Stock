// This is a Vercel Serverless Function.

// Use the compatible 'require' syntax for node-fetch
const fetch = require('node-fetch');

// --- 1. CONFIGURATION ---
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// REDUCED LIST FOR TESTING
const SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SBUX', 'NKE', 'DIS'
];

// --- 2. CACHING ---
let cachedData = {
    timestamp: 0,
    stocks: []
};
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000;

// --- 3. CORE LOGIC ---
async function fetchStockData() {
    console.log("Attempting to fetch fresh stock data...");
    if (!API_KEY) {
        console.error("CRITICAL: ALPHA_VANTAGE_API_KEY environment variable is NOT SET.");
        return; 
    }
    console.log("API Key is present.");

    const fetchedStocks = [];
    const stockNameMap = {
        'AAPL': 'Apple Inc.', 'MSFT': 'Microsoft Corp.', 'GOOGL': 'Alphabet Inc.', 
        'AMZN': 'Amazon.com, Inc.', 'TSLA': 'Tesla, Inc.', 'NVDA': 'NVIDIA Corporation',
        'META': 'Meta Platforms, Inc.', 'SBUX': 'Starbucks Corporation', 'NKE': 'NIKE, Inc.', 'DIS': 'The Walt Disney Company'
    };

    for (const symbol of SYMBOLS) {
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            const quote = data['Global Quote'];
            if (quote && quote['01. symbol']) {
                console.log(`Successfully fetched ${symbol}`);
                fetchedStocks.push({
                    symbol: quote['01. symbol'], name: stockNameMap[quote['01. symbol']] || `${quote['01. symbol']} Name`,
                    price: parseFloat(quote['05. price']), change: parseFloat(quote['09. change']),
                    changePercent: quote['10. change percent'], link: `https://www.tradingview.com/chart/?symbol=NASDAQ%3A${quote['01. symbol']}`
                });
            } else {
                console.warn(`Could not get quote for ${symbol}. API Response:`, JSON.stringify(data));
                if (data.Note) { console.warn("This may be an API rate limit issue."); }
                if (data["Error Message"]) { console.warn("This may be an invalid API key or symbol issue."); }
            }
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec between calls
    }
    
    if (fetchedStocks.length === 0) {
        console.error("Warning: Finished fetching, but the stock list is empty. Check API key or rate limits.");
    }

    cachedData = {
        timestamp: Date.now(),
        stocks: fetchedStocks
    };
    console.log(`Finished fetching. Found ${fetchedStocks.length} stocks.`);
}

// --- 4. THE HANDLER ---
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const now = Date.now();
    if (now - cachedData.timestamp > CACHE_DURATION_MS || cachedData.stocks.length === 0) {
        await fetchStockData();
    } else {
        console.log("Serving data from cache.");
    }
    
    res.status(200).json(cachedData);
};

