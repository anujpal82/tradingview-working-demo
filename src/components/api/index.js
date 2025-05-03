


import * as moment from 'moment';
import { sendSubscription, subscribers, subscribeToTicks, unsubscribeFromTicks } from './stream';
import { extractSecurityId, getExchangeSegment } from './utils';
import axios from './utils/axios';
import { debounce } from 'lodash';

const supportedResolutions = ["1", "5", "15", "25", "60"];
const symbolDataCache = {};
export const historyCache = {};
console.log({historyCache265:historyCache})

const config = {
  supports_search: true,
  supports_group_request: false,
  supports_marks: true,
  supports_timescale_marks: true,
  supports_time: true,
 
  symbols_types: [
    {
      name: 'All types',
      value: '',
    },
    {
      name: 'Option',
      value: 'OPTION',
    },
    {
      name: 'Index',
      value: 'INDEX',
    },
  ],
  supported_resolutions: [
    '1',
    '5',
    '15',
    '25',
    '60',
  
  ],
};

const debouncedSearch = debounce((userInput, symbolType, exchange, onResultReadyCallback) => {
  if (userInput?.length < 2) return;
  
  axios
    .get(`/tv/search?query=${userInput}&filterType=${symbolType}&exchange=${exchange}`)
    .then((response) => {
      console.log('Search results:', { response });
      onResultReadyCallback(response);
    })
    .catch((err) => {
      console.error('Search error:', err);
      onResultReadyCallback([]);
    });
}, 500);

export default {
  symbolDataCache,

  onReady: cb => {    
    console.log('DataFeed: onReady');    
    setTimeout(() => cb(config), 0);
  },
  
  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    console.log('DataFeed: searchSymbols', { userInput, exchange, symbolType });
    debouncedSearch(userInput, symbolType, exchange, onResultReadyCallback);
  },

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
    console.log('DataFeed: resolveSymbol', { symbolName, extension });
    
    const [symbol, securityId] = symbolName.split('$');
    
    // Check if we already have this symbol in cache
    if (symbolDataCache[symbolName]) {
      console.log('Symbol found in cache:', symbolDataCache[symbolName]);
      onSymbolResolvedCallback(symbolDataCache[symbolName]);
      return;
    }
    
    axios.get(`/tv/symbol-details?id=${securityId}`)
      .then((response) => {
        if (response?.results?.data?.INSTRUMENT) {
          const {
            INSTRUMENT,
            DISPLAY_NAME,
            SECURITY_ID,
            EXCH_ID,
            INSTRUMENT_TYPE,
            SEGMENT,
          } = response?.results?.data;
          const fullSymbol = `${DISPLAY_NAME}:${SECURITY_ID}`;

          const symbolInfo = {
            "name":fullSymbol,
            "timezone": "Asia/Kolkata",
            "minmov": 1,
            "minmov2": 0,
            "pointvalue": 1,
            "session": "24x7",
            "has_intraday": true,
            "visible_plots_set": "ohlcv",
            "description": DISPLAY_NAME,
            "type": INSTRUMENT_TYPE,
            "supported_resolutions": supportedResolutions,
            "pricescale": 100,
            "ticker": `${DISPLAY_NAME}$${SECURITY_ID}`,
            "exchange": EXCH_ID,
            "has_daily": true,
            "format": "price",
            instrument: INSTRUMENT,
            segment: SEGMENT,
            exchangeId: EXCH_ID,
            exchange_logo: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
          };
          
          // Cache the symbol info for future use
          symbolDataCache[`${DISPLAY_NAME}$${SECURITY_ID}`] = symbolInfo;
          symbolDataCache[`${SECURITY_ID}`] = symbolInfo;

          const mode='TICK';
          const exchangeType=getExchangeSegment(symbolInfo.exchangeId,symbolInfo.segment);
          const tokens=[SECURITY_ID];
        console.log({exchangeType129:exchangeType})
          sendSubscription(mode,exchangeType,tokens)
          onSymbolResolvedCallback(symbolInfo);
        } else {
          console.error('Invalid symbol data received:', response);
          onResolveErrorCallback('Invalid symbol');
        }
      })
      .catch((err) => {
        console.error('Error resolving symbol:', err);
        onResolveErrorCallback('Failed to resolve symbol');
      });
  },
  
  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    console.log('DataFeed: getBars', { 
      symbol: symbolInfo?.ticker,
      resolution,
      from: new Date(periodParams.from * 1000).toISOString(),
      to: new Date(periodParams.to * 1000).toISOString(),
      countBack: periodParams.countBack
    });
    
    const securityId = symbolInfo?.ticker?.split("$")[1];
    const exchangeSegment = getExchangeSegment(symbolInfo.exchangeId, symbolInfo.segment);
    
    // Handle intraday data
    if (resolution !== 'D' && resolution !== 'W' && resolution !== 'M') {
      // Calculate proper date ranges for API call
      const toDate = moment.unix(periodParams.to).format('YYYY-MM-DD HH:mm:ss');
      
      // For intraday data, limit history request to a reasonable time period
      // (we'll use 90 days max to avoid excessive data transfer)

      const fromMoment = moment().subtract(90, 'days');
      const toMoment = moment()
      console.log({ fromMoment, toMoment, periodParams, resolution });
      let fromDate;
      if (toMoment.diff(fromMoment, 'days') > 90) {
        fromDate = moment(fromMoment).subtract(90, 'days').format('YYYY-MM-DD HH:mm:ss');
        console.log('Limiting intraday request to 90 days:', { fromDate, toDate });
      } else {
        fromDate = fromMoment.format('YYYY-MM-DD HH:mm:ss');
      }
      
      // Make the API request
      axios.post(`/tv/intraday`, {
        "securityId": securityId,
        "exchangeSegment": exchangeSegment,
        "instrument": symbolInfo.instrument,
        "interval": resolution,
        "oi": true,
        "fromDate": fromDate,
        "toDate": toDate
      })
      .then((response) => {
        if (Array.isArray(response) && response.length > 0) {
          // Store the last bar in cache for real-time updates
          if (periodParams?.firstDataRequest) {
            const lastBar = response[response.length - 1];
            historyCache[`${securityId}-${resolution}`] = { lastBar: lastBar };
            console.log('Stored last bar in cache:', lastBar);
          }
          
          // Log the data we're sending to TradingView
          console.log(`Got ${response.length} bars for ${symbolInfo.ticker} @ ${resolution}`);
          console.log('First bar:', response[0]);
          console.log('Last bar:', response[response.length - 1]);
          
          onHistoryCallback(response, { noData: false });
        } else {
          console.log('No data received for intraday request');
          onHistoryCallback([], { noData: true });
        }
      })
      .catch((err) => {
        console.error('Error fetching intraday data:', err);
        onHistoryCallback([], { noData: true });
      });
    }
    // Handle daily/weekly/monthly data
    else {
      axios.get(`/tv/history?symbol=${symbolInfo?.ticker}&resolution=${resolution}&from=${periodParams.from}&to=${periodParams.to}&countback=${periodParams.countBack}&instrument=${symbolInfo.instrument}&exchangeSegment=${exchangeSegment}`)
        .then((response) => {
          if (Array.isArray(response) && response.length > 0) {
            // Store the last bar in cache for real-time updates
            if (periodParams?.firstDataRequest) {
              const lastBar = response[response.length - 1];
              historyCache[securityId] = { lastBar: lastBar };
              console.log('Stored last bar in cache:', lastBar);
            }
            
            console.log(`Got ${response.length} daily/weekly bars for ${symbolInfo.ticker}`);
            onHistoryCallback(response, { noData: false });
          } else {
            console.log('No data received for daily/weekly request');
            onHistoryCallback([], { noData: true });
          }
        })
        .catch((err) => {
          console.error('Error fetching daily/weekly data:', err);
          onHistoryCallback([], { noData: true });
        });
    }
  },
    
  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
    console.log('DataFeed: subscribeBars', { 
      symbol: symbolInfo?.ticker, 
      resolution, 
      subscribeUID 
    });
    
    const securityId = symbolInfo?.ticker?.split('$')[1];
    console.log({subscribers493:subscribers})
    // Save subscriber information and start listening for ticks
    // subscribeToTicks(symbolInfo, resolution, securityId, onRealtimeCallback);
    
    return;
  },
  
  unsubscribeBars: (subscriberUID) => {
    console.log('DataFeed: unsubscribeBars', { subscriberUID });
    
    // Extract security ID from subscriber UID if needed
    const securityId = extractSecurityId(subscriberUID) || subscriberUID;
    
    // Unsubscribe from ticks for this security
    unsubscribeFromTicks(securityId);
  },
  
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    console.log('DataFeed: calculateHistoryDepth', { resolution, resolutionBack, intervalBack });
    
    // Calculate appropriate history depth based on resolution
    if (resolution === '1') {
      return { resolutionBack: 'D', intervalBack: '1' }; // 1 day of 1-minute data
    } else if (resolution < 60) {
      return { resolutionBack: 'D', intervalBack: '7' }; // 7 days of short-term data
    } else if (resolution < 1440) {
      return { resolutionBack: 'M', intervalBack: '1' }; // 1 month of hourly data
    }
    
    // For daily/weekly/monthly, use default behavior
    return undefined;
  },
  
  getServerTime: cb => {
    console.log('DataFeed: getServerTime');
    // Return current server time in seconds
    const now = Math.floor(Date.now() / 1000);
    cb(now);
  }
}