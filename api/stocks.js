// This is a Vercel Serverless Function. 
// Vercel automatically runs this code when you access the URL /api/stocks.

const fetch = require('node-fetch');

// --- 1. CONFIGURATION ---
// IMPORTANT: Add your API key as an "Environment Variable" in your Vercel project settings.
// Name the variable: ALPHA_VANTAGE_API_KEY
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const SYMBOLS = [
    'ABEO', 'ABVX', 'ACAD', 'ACB', 'ACHR', 'ACLX', 'ADAP', 'ADV', 'AGAE', 'AGEN', 'AGL', 
    'AGNC', 'AI', 'AIFF', 'AKO.B', 'ALAB', 'AMC', 'AMLX', 'AMPL', 'AMRN', 'AMRX', 'ANTX', 
    'APPS', 'ARM', 'ARQQ', 'ARR', 'ARTL', 'ARVN', 'ASAN', 'ASST', 'ATAT', 'ATCH', 'ATHE', 
    'AUPH', 'AUR', 'AVID', 'AVIR', 'AVXL', 'AYRWF', 'BAND', 'BCAX', 'BCS', 'BCTCF', 'BDRX', 
    'BGMS', 'BHC', 'BIOA', 'BKYI', 'BLBX', 'BMBL', 'BNXAF', 'BNZI', 'BOF', 'BPMC', 'BRPHF', 
    'BRR', 'BRT', 'BRY', 'BUD', 'CAG', 'CAKE', 'CDMO', 'CELH', 'CEP', 'CGC', 'CLBR', 'CLM', 
    'CLSK', 'CMG', 'CMPS', 'CMTL', 'CNBS', 'COEP', 'COUR', 'CPB', 'CPIX', 'CRBU', 'CRGY', 
    'CRON', 'CRSP', 'CRVS', 'CSTL', 'CTRN', 'CURLF', 'CXDO', 'CYTK', 'DARE', 'DDC', 'DFDV', 
    'DFLI', 'DFSC', 'DLMAF', 'DLTR', 'DNA', 'DRVN', 'DYN', 'EDRY', 'EFC', 'EHAB', 'EL', 
    'ELF', 'ENB', 'ENR', 'EOLS', 'EQT', 'ERNA', 'ESPR', 'ETNB', 'ETRN', 'EVVAQ', 'EXEL', 
    'EXXRF', 'EYPT', 'FA', 'FAT', 'FATBP', 'FIG', 'FIZZ', 'FMS', 'FOXX', 'FPI', 'FVRR', 
    'GALT', 'GB', 'GCT', 'GDRX', 'GETY', 'GLAD', 'GLCNF', 'GLNCY', 'GME', 'GNS', 'GRAL', 
    'HBI', 'HIMS', 'HLN', 'HOFV', 'HOLO', 'HOOD', 'HOTH', 'HRI', 'HTGC', 'HTZ', 'HUMA', 
    'HUT', 'HYPD', 'IDRSF', 'ILLR', 'IMTX', 'IMVT', 'INCY', 'INGM', 'INM', 'INMB', 'INVZ', 
    'IONQ', 'IRD', 'ITCI', 'ITOS', 'IVVD', 'JD', 'JFIN', 'JOBY', 'JSAIY', 'JTAI', 'KAPA', 
    'KHC', 'KLG', 'KNSA', 'KOSS', 'KR', 'KROS', 'KURA', 'KVSA', 'KVUE', 'KYMR', 'KYTX', 
    'KZIA', 'LAC', 'LAES', 'LAZR', 'LCID', 'LCUT', 'LEAT', 'LINE', 'LIPO', 'LITB', 'LKNCY', 
    'LMND', 'LQDA', 'LSF', 'LSXMA', 'LTH', 'MAC', 'MAIN', 'MARA', 'MB', 'MBRX', 'MDWD', 
    'MGX', 'MLGO', 'MNKD', 'MNST', 'MO', 'MSGE', 'MYNZ', 'MYSE', 'NAKA', 'NBIS', 'NERV', 
    'NEWT', 'NGENF', 'NIO', 'NKTR', 'NNE', 'NRXP', 'NTWK', 'NU', 'NURO', 'NVAX', 'NVO', 
    'NVST', 'NVTS', 'NWG', 'OGN', 'OKLO', 'OPHLY', 'OPY', 'ORC', 'ORMP', 'OUST', 'OVID', 
    'OXY', 'PASG', 'PBH', 'PFE', 'PGEN', 'PHAT', 'PHIO', 'PL', 'PLTR', 'PODD', 'POWW', 
    'PRDSF', 'PROF', 'PSEC', 'PSTV', 'PTON', 'QBTS', 'QMCO', 'QQQY', 'QSI', 'QUBT', 'RDY', 
    'REKR', 'RERE', 'RGNX', 'RGTI', 'RIOT', 'RITM', 'RIVN', 'RKLB', 'RKUNY', 'ROIV', 
    'ROKU', 'RPRX', 'RUM', 'RVPH', 'SAGE', 'SANA', 'SBEV', 'SBGI', 'SBH', 'SBUX', 'SCS', 
    'SEPN', 'SERV', 'SGMO', 'SHLS', 'SILK', 'SIRI', 'SJT', 'SKX', 'SLRX', 'SMCI', 'SMR', 
    'SOFI', 'SOLV', 'SOUN', 'SPHR', 'SRPT', 'STEC', 'STER', 'STKL', 'STLA', 'SWVL', 'SYTA', 
    'TAK', 'TALK', 'TARS', 'TCEHY', 'TCNNF', 'TCOM', 'TCPC', 'TECK', 'TERN', 'TGT', 'TLRY', 
    'TMDX', 'TME', 'TNXP', 'TOON', 'TPICQ', 'TSCDF', 'TSCDY', 'TSCO', 'TYRA', 'U', 'UDMY', 
    'ULTA', 'UTHR', 'VALE', 'VCEL', 'VERY', 'VMAR', 'VRNA', 'VTRS', 'VVV', 'WB', 'WBA', 
    'WEED:CA', 'WEN', 'WFC', 'WGHTQ', 'WMB', 'WPP', 'WRD', 'XENE', 'XERS', 'XIFR', 
    'XRP-USD', 'XXII', 'XYZ', 'YI', 'YMM', 'YSG', 'ZIM', 'ZIP', 'ZRSEF', 'ZVRA', 'ZVSA', 'ZYME'
];

// --- 2. CACHING ---
// Serverless functions can be stateless. We use a simple in-memory cache.
let cachedData = {
    timestamp: 0,
    stocks: []
};

const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// --- 3. CORE LOGIC ---
async function fetchStockData() {
    console.log("Fetching fresh stock data from API...");
    const fetchedStocks = [];
    const stockNameMap = {
        'ABEO': 'Abeona Therapeutics Inc.', 'ABVX': 'ABVC BioPharma Inc.', 'ACAD': 'ACADIA Pharmaceuticals Inc.', 'ACB': 'Aurora Cannabis Inc.',
        // In a real app, you'd fetch names too, but we'll use a map for simplicity.
        // Add more symbol-to-name mappings here if needed.
    };

    for (let i = 0; i < SYMBOLS.length; i++) {
        const symbol = SYMBOLS[i];
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            const quote = data['Global Quote'];
            if (quote && quote['01. symbol']) {
                fetchedStocks.push({
                    symbol: quote['01. symbol'],
                    name: stockNameMap[quote['01. symbol']] || `${quote['01. symbol']} Name`, // Fallback name
                    price: parseFloat(quote['05. price']),
                    change: parseFloat(quote['09. change']),
                    changePercent: quote['10. change percent'],
                    link: `https://www.tradingview.com/chart/?symbol=NASDAQ%3A${quote['01. symbol']}`
                });
            } else if (data.Note) {
                console.warn(`API limit likely reached. Pausing for 60 seconds.`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                i--; // Decrement to retry the same symbol after the pause.
            } else {
                console.warn(`No data for symbol: ${symbol}`);
            }
        } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
        }
        // Wait to respect API limits (e.g., 15 seconds between calls for a 5/min limit)
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
    
    cachedData = {
        timestamp: Date.now(),
        stocks: fetchedStocks
    };
    console.log("Finished fetching data.");
}

// --- 4. THE HANDLER ---
// This is the main function Vercel will execute.
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
    
    res.status(200).json(cachedData);
};
