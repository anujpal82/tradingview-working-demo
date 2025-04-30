// import * as moment from 'moment';
// import historyProvider from './historyProvider'
// import { sendSubscription, subscribeToTicks, unsubscribeFromTicks } from './stream';
// import { extractSecurityId, getExchangeSegment } from './utils';
// import axios from './utils/axios';
// import { debounce } from 'lodash';

// const supportedResolutions = ["1", "3", "5", "15", "30", "60", "120", "240", "D"]
// const symbolDataCache = {};
// export const historyCache={}
// var _subs = []


// const config =  {
//     supports_search: true,
//     supports_group_request: false,
//     supports_marks: true,
//     supports_timescale_marks: true,
//     supports_time: true,
 
//     symbols_types: [
//       {
//         name: 'All types',
//         value: '',
//       },
//       {
//         name: 'Option',
//         value: 'OPTION',
//       },
//       {
//         name: 'Index',
//         value: 'INDEX',
//       },
//     ],
//     supported_resolutions: [
//       1,
// 	  3,
// 	  5,
//       15,
//       30,
//       60,
//       120,
//       240,
//       'D',
//       '2D',
//       '3D',
//       'W',
//       '3W',
//       'M',
//       '6M',
//     ],
//   }

// const debouncedSearch = debounce((userInput, symbolType, exchange, onResultReadyCallback) => {
// 	if(userInput?.length<2) return
// 	axios
// 	  .get(`/tv/search?query=${userInput}&filterType=${symbolType}&exchange=${exchange}`)
// 	  .then((response) => {
// 		console.log({response})
// 		onResultReadyCallback(response);
// 	  })
// 	  .catch((err) => {
// 		console.error({err})
// 		onResultReadyCallback([]);
// 	  });
//   }, 500);

// export default {
// 	symbolDataCache,

// 	onReady: cb => {	
// 	console.log('=====onReady running')	
// 		setTimeout(() => cb(config), 0)
		
// 	},
// 	searchSymbols: async (
// 	userInput,
// 		exchange,
// 		symbolType,
// 		onResultReadyCallback,
// 	) => {
// 		debouncedSearch(userInput, symbolType, exchange, onResultReadyCallback);
// 	},

// 	resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
// 		console.log({symbolName,extension})
// 		const [symbol,securityId] = symbolName.split(':');
// 		axios.get(`/tv/symbol-details?id=${securityId}`).then((response) => {
			
// 			if(response?.results?.data?.INSTRUMENT){
// 				const {INSTRUMENT,DISPLAY_NAME,SECURITY_ID,EXCH_ID,INSTRUMENT_TYPE,SEGMENT,
// 				} = response?.results?.data
// 				const symbolInfo={
// 					"name": symbol.DISPLAY_NAME,
// 					"timezone": "Asia/Kolkata",
// 					"minmov": 1,
// 					"minmov2": 0,
// 					"pointvalue": 1,
// 					"session": "24x7",
// 					"has_intraday": true,
// 					"visible_plots_set": "ohlcv",
// 					"description": DISPLAY_NAME,
// 					"type": INSTRUMENT_TYPE,
// 					"supported_resolutions": [
// 						"D",
// 						"W",
// 						'M',
// 						'5',
// 						'15',
// 						'30',
// 						'60',
// 						'120',
// 						'240'
// 					],
// 					"pricescale": 100,
// 					"ticker":`${DISPLAY_NAME}:${SECURITY_ID}`,
// 					"exchange": EXCH_ID,
// 					"has_daily": true,
// 					"format": "price",
// 					instrument:INSTRUMENT,
// 					segment:SEGMENT,exchangeId:EXCH_ID,
// 					exchange_logo: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
		
		
// 				}
// 				symbolDataCache[`${DISPLAY_NAME}:${securityId}`] = symbolInfo;
// 				symbolDataCache[`${securityId}`] = symbolInfo;

			
// 				onSymbolResolvedCallback(symbolInfo);
// 			}
	
// 		}).catch((err)=>console.log({err144:err}))
		
// 	},
// 	getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
// 		console.log('=====getMarks running with time range:', startDate, endDate);
		
// 		// Create marks for horizontal price line at 22000
// 		const marks = [];
		
// 		// For a horizontal line, we'll create multiple marks across the time range
// 		// We'll create 5 evenly distributed points across the chart's time range
// 		const timeInterval = Math.floor((endDate - startDate) / 5);
		
// 		for (let i = 0; i <= 5; i++) {
// 			const time = startDate + (timeInterval * i);
			
// 			marks.push({
// 				id: `price-line-${i}`,
// 				time: time,
// 				price: 22000, // The price level where we want the horizontal line
// 				color: 'rgba(255, 0, 0, 0.8)', // Red color
// 				text: 'Support/Resistance Level',
// 				label: '22000',
// 				labelFontColor: '#ffffff', // White text
// 			minSize: 20,
// 				// This is important for horizontal price lines
// 				shape: 'price',
// 				labelBackgroundColor: '#ff0000' // Red background for label
// 			});
// 		}
		
// 		onDataCallback(marks);
// 	},
	
// 	getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
// 		setInterval(()=>{

// 		},1000)
// 		console.log({periodParams})
//     console.log(`getBars called with symbolInfo: ${JSON.stringify(symbolInfo)}`);
// 		const securityId=symbolInfo?.ticker?.split(":")[1]
// 		const exchangeSegment=getExchangeSegment(symbolInfo.exchangeId,symbolInfo.segment)
// 		console.log({securityId,exchangeSegment,symbolInfo})
// 		if(resolution!=='1D'){
// 			// const fromDate = new Date(periodParams.from * 1000).toISOString().replace('T', ' ').slice(0, 19);
// 			const toDate = new Date((periodParams.to + 2) * 1000).toISOString().replace('T', ' ').slice(0, 19);
// 			const fromDate1 = moment.unix(periodParams.from).format('YYYY-MM-DD HH:mm:ss');

// 			const toDate2 = moment.unix(periodParams.from).subtract(88, 'days').format('YYYY-MM-DD HH:mm:ss');

// 			const fromDate = moment().subtract(85, 'days').format('YYYY-MM-DD HH:mm:ss');
// 			axios.post(`/tv/intraday?symbol=${symbolInfo?.ticker}&resolution=${resolution}&from=${periodParams.from}&to=${periodParams.to}&countback=${periodParams.countBack}&instrument=${symbolInfo.instrument}&exchangeSegment=${exchangeSegment}`, {
// 				"securityId": securityId,
// 				"exchangeSegment": exchangeSegment,
// 				"instrument": symbolInfo.instrument,
// 				"interval": resolution,
// 				"oi": true,
// 				"fromDate": fromDate,
// 				"toDate": toDate
// 			}).then((response) => {
// 				if (periodParams?.firstDataRequest) {
// 					var lastBar = response[response.length - 1]
// 					historyCache[securityId] = {lastBar: lastBar}
// 				}
// 				onHistoryCallback(response, { noData: false });
// 			}).catch((err) => {
// 				onHistoryCallback([], { noData: true });
// 				console.log(`Error occurred at getBars ${err}`);
// 			});
// 		}
// 		else{
// 			axios.get(`/tv/history?symbol=${symbolInfo?.ticker}&resolution=${resolution}&from=${periodParams.from}&to=${periodParams.to}&countback=${periodParams.countBack}&instrument=${symbolInfo.instrument}&exchangeSegment=${exchangeSegment}`).then((response) => {
// 				onHistoryCallback(response, { noData: false })
// 			 }).catch((err)=>{
// 				onHistoryCallback([], { noData: true });
// 				console.log(`Error occured at getBars ${err}`)
// 					 })
	
// 		}
		
		
// 	},
		
// 	subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
// 		console.log('[subscribeBars]', { symbolInfo, resolution, subscribeUID });
	  
// 		const securityId = symbolInfo?.ticker?.split(':')[1];
	  
// 		// Save lastBar if available (used in updateBar logic)
// 		if (historyCache?.[securityId]?.lastBar) {
// 		  console.log('Caching last bar for real-time updates:', historyCache[securityId].lastBar);
// 		}
	  
// 		// Call your tick subscription function
// 		subscribeToTicks(symbolInfo, resolution, subscribeUID, onRealtimeCallback);
// 	  },
// 	  unsubscribeBars: (subscriberUID,) => {
// 		console.log('=====unsubscribeBars running',subscriberUID)
// 		console.log('[unsubscribeBars]', subscriberUID);
// 		const securityId=extractSecurityId(subscriberUID)
// 		unsubscribeFromTicks(securityId);
// 	  },
// 	calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
// 		//optional
// 		console.log('=====calculateHistoryDepth running')
// 		// while optional, this makes sure we request 24 hours of minute data at a time
// 		// CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
// 		return resolution < 60 ? {resolutionBack: 'D', intervalBack: '1'} : undefined
// 	},
// 	getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
// 		//optional
// 		console.log('=====getMarks running')
// 	},
// 	getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
// 		//optional
// 		console.log('=====getTimeScaleMarks running')
// 	},
// 	getServerTime: cb => {
// 		console.log('=====getServerTime running')
// 	}
// }


import * as moment from 'moment';
import { sendSubscription, subscribers, subscribeToTicks, unsubscribeFromTicks } from './stream';
import { extractSecurityId, getExchangeSegment } from './utils';
import axios from './utils/axios';
import { debounce } from 'lodash';

const supportedResolutions = ["1", "3", "5", "15", "30", "60", "120", "240", "D"];
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
    '3',
    '5',
    '15',
    '30',
    '60',
    '120',
    '240',
    'D',
    'W',
    'M',
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
    
    const [symbol, securityId] = symbolName.split(':');
    
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
          
          const symbolInfo = {
            "name": DISPLAY_NAME,
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
            "ticker": `${DISPLAY_NAME} ${SECURITY_ID}`,
            "exchange": EXCH_ID,
            "has_daily": true,
            "format": "price",
            instrument: INSTRUMENT,
            segment: SEGMENT,
            exchangeId: EXCH_ID,
            exchange_logo: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
          };
          
          // Cache the symbol info for future use
          symbolDataCache[`${DISPLAY_NAME}:${SECURITY_ID}`] = symbolInfo;
          symbolDataCache[`${SECURITY_ID}`] = symbolInfo;

          console.log('Symbol resolved:', symbolInfo);
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
    
    const securityId = symbolInfo?.ticker?.split(":")[1];
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
    
    const securityId = symbolInfo?.ticker?.split(':')[1];
    console.log({subscribers493:subscribers})
    // Save subscriber information and start listening for ticks
    subscribeToTicks(symbolInfo, resolution, securityId, onRealtimeCallback);
    
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