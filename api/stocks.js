// This is a Vercel Serverless Function. 
// Vercel automatically runs this code when you access the URL /api/stocks.

const fetch = require('node-fetch');

// --- 1. CONFIGURATION ---
// IMPORTANT: Add your API key as an "Environment Variable" in your Vercel project settings.
// Name the variable: ALPHA_VANTAGE_API_KEY
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// REDUCED LIST FOR TESTING - This will run much faster and avoid timeouts.
const SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SBUX', 'NKE', 'DIS'
];

// --- 2. CACHING ---
let cachedData = {
    timestamp: 0,
    stocks: []
};

const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// --- 3. CORE LOGIC ---
async function fetchStockData() {
    console.log("Fetching fresh stock data from API for the reduced list...");
    if (!API_KEY) {
        console.error("API Key is not configured in Vercel Environment Variables.");
        return; // Stop execution if key is missing
    }
    
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
                    symbol: quote['01. symbol'],
                    name: stockNameMap[quote['01. symbol']] || `${quote['01. symbol']} Name`,
                    price: parseFloat(quote['05. price']),
                    change: parseFloat(quote['09. change']),
                    changePercent: quote['10. change percent'],
                    link: `https://www.tradingview.com/chart/?symbol=NASDAQ%3A${quote['01. symbol']}`
                });
            } else if (data.Note) {
                console.warn(`API limit likely reached. Pausing for 60 seconds.`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                // In a short list, we can just log and continue.
            } else {
                console.warn(`No data for symbol: ${symbol}. Response: `, data);
            }
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
        }
        // Wait a bit to be kind to the API, but not as long as before.
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    cachedData = {
        timestamp: Date.now(),
        stocks: fetchedStocks
    };
    console.log("Finished fetching data for the reduced list.");
}

// --- 4. THE HANDLER ---
module.exports = async (req, res) => {
    // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const now = Date.now();
    if (now - cachedData.timestamp > CACHE_DURATION_MS || cachedData.stocks.length === 0) {
        await fetchStockData();
    } else {
        console.log("Serving data from cache.");
    }
    
    if (cachedData.stocks.length > 0) {
        res.status(200).json(cachedData);
    } else {
        res.status(503).json({ error: "Could not retrieve stock data. Check the server logs in Vercel.", stocks: [] });
    }
};

