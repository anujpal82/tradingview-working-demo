import historyProvider from './historyProvider'
import { getExchangeSegment } from './utils';
import axios from './utils/axios';
import { debounce } from 'lodash';

const supportedResolutions = ["1", "3", "5", "15", "30", "60", "120", "240", "D"]

const config =  {
    supports_search: true,
    supports_group_request: false,
    supports_marks: true,
    supports_timescale_marks: true,
    supports_time: true,
    // exchanges: [
    //   {
    //     value: '',
    //     name: 'All Exchanges',
    //     desc: '',
    //   },
    //   {
    //     value: 'NasdaqNM',
    //     name: 'NasdaqNM',
    //     desc: 'NasdaqNM',
    //   },
    //   {
    //     value: 'NYSE',
    //     name: 'NYSE',
    //     desc: 'NYSE',
    //   },
    //   {
    //     value: 'NCM',
    //     name: 'NCM',
    //     desc: 'NCM',
    //   },
    //   {
    //     value: 'NGM',
    //     name: 'NGM',
    //     desc: 'NGM',
    //   },
    // ],
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
      1,
      15,
      30,
      60,
      120,
      240,
      'D',
      '2D',
      '3D',
      'W',
      '3W',
      'M',
      '6M',
    ],
  }

const debouncedSearch = debounce((userInput, symbolType, exchange, onResultReadyCallback) => {
	if(userInput?.length<2) return
	axios
	  .get(`/search?query=${userInput}&filterType=${symbolType}&exchange=${exchange}`)
	  .then((response) => {
		console.log({response})
		onResultReadyCallback(response);
	  })
	  .catch((err) => {
		console.error({err})
		onResultReadyCallback([]);
	  });
  }, 500);

export default {
	onReady: cb => {	
	console.log('=====onReady running')	
		setTimeout(() => cb(config), 0)
		
	},
	searchSymbols: async (
	userInput,
		exchange,
		symbolType,
		onResultReadyCallback,
	) => {
		debouncedSearch(userInput, symbolType, exchange, onResultReadyCallback);
	},

	resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
		console.log({symbolName,extension})
		const [symbol,securityId] = symbolName.split(':');
		axios.get(`/symbol-details?id=${securityId}`).then((response) => {
			if(response?.results?.INSTRUMENT){
				const {INSTRUMENT,DISPLAY_NAME,SECURITY_ID,EXCH_ID,INSTRUMENT_TYPE,SEGMENT,
				} = response?.results
				onSymbolResolvedCallback({
					"name": symbol.DISPLAY_NAME,
					"timezone": "Asia/Kolkata",
					"minmov": 1,
					"minmov2": 0,
					"pointvalue": 1,
					"session": "24x7",
					"has_intraday": true,
					"visible_plots_set": "ohlcv",
					"description": DISPLAY_NAME,
					"type": INSTRUMENT_TYPE,
					"supported_resolutions": [
						"D",
						"W",
						'M',
						'5',
						'15',
						'30',
						'60',
						'120',
						'240'
					],
					"pricescale": 100,
					"ticker":`${DISPLAY_NAME}:${SECURITY_ID}`,
					"exchange": EXCH_ID,
					"has_daily": true,
					"format": "price",
					instrument:INSTRUMENT,
					segment:SEGMENT,exchangeId:EXCH_ID,
					exchange_logo: 'https://s3-symbol-logo.tradingview.com/country/US.svg',


				});
			}
	
		}).catch((err)=>console.log({err}))
		
		// setTimeout(
		// 	() => {
		// 		// Return some simple symbol information for the TEST symbol
		// 		if (symbolName === 'TEST') {
					// onSymbolResolvedCallback({
					// 	"name": "TEST",
					// 	"timezone": "America/New_York",
					// 	"minmov": 1,
					// 	"minmov2": 0,
					// 	"pointvalue": 1,
					// 	"session": "24x7",
					// 	"has_intraday": true,
					// 	"visible_plots_set": "ohlcv",
					// 	"description": "Test Symbol",
					// 	"type": "stock",
					// 	"supported_resolutions": [
					// 		"D",
					// 		"W",
					// 		'M',
					// 		'5',
					// 		'15',
					// 		'30',
					// 		'60',
					// 		'120',
					// 		'240'
					// 	],
					// 	"pricescale": 100,
					// 	"ticker": "TEST",
					// 	"exchange": "Test Exchange",
					// 	"has_daily": true,
					// 	"format": "price"
					// });
		// 		} else {
		// 			// Ignore all other symbols
		// 			onResolveErrorCallback('unknown_symbol');
		// 		}
		// 	},
		// 	50
		// );
	},
	getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
		console.log('=====getMarks running with time range:', startDate, endDate);
		
		// Create marks for horizontal price line at 22000
		const marks = [];
		
		// For a horizontal line, we'll create multiple marks across the time range
		// We'll create 5 evenly distributed points across the chart's time range
		const timeInterval = Math.floor((endDate - startDate) / 5);
		
		for (let i = 0; i <= 5; i++) {
			const time = startDate + (timeInterval * i);
			
			marks.push({
				id: `price-line-${i}`,
				time: time,
				price: 22000, // The price level where we want the horizontal line
				color: 'rgba(255, 0, 0, 0.8)', // Red color
				text: 'Support/Resistance Level',
				label: '22000',
				labelFontColor: '#ffffff', // White text
			minSize: 20,
				// This is important for horizontal price lines
				shape: 'price',
				labelBackgroundColor: '#ff0000' // Red background for label
			});
		}
		
		onDataCallback(marks);
	},
	
	getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
		const securityId=symbolInfo?.ticker?.split(":")[1]
		const exchangeSegment=getExchangeSegment(symbolInfo.exchangeId,symbolInfo.segment)
		console.log({securityId,exchangeSegment,symbolInfo})
		if(resolution!=='1D'){
			axios.post(`/intraday?symbol=${symbolInfo?.ticker}&resolution=${resolution}&from=${periodParams.from}&to=${periodParams.to}&countback=${periodParams.countBack}&instrument=${symbolInfo.instrument}&exchangeSegment=${exchangeSegment}`,{
				"securityId": "79514",
				"exchangeSegment": "NSE_FNO",
				"instrument": "OPTIDX",
				"interval": "60",
				"oi": true,
				"fromDate": "2025-04-13 09:00:00",
				"toDate": "2025-04-22 15:30:00"
				}
				).then((response) => {
				onHistoryCallback(response, { noData: false })
			 }).catch((err)=>{
				onHistoryCallback([], { noData: true });
				console.log(`Error occured at getBars ${err}`)
					 })
		}
		else{
			axios.get(`/history?symbol=${symbolInfo?.ticker}&resolution=${resolution}&from=${periodParams.from}&to=${periodParams.to}&countback=${periodParams.countBack}&instrument=${symbolInfo.instrument}&exchangeSegment=${exchangeSegment}`).then((response) => {
				onHistoryCallback(response, { noData: false })
			 }).catch((err)=>{
				onHistoryCallback([], { noData: true });
				console.log(`Error occured at getBars ${err}`)
					 })
	
		}
		
		
	},
		
	subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
		console.log('=====subscribeBars runnning')
	},
	unsubscribeBars: subscriberUID => {
		console.log('=====unsubscribeBars running')
	},
	calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
		//optional
		console.log('=====calculateHistoryDepth running')
		// while optional, this makes sure we request 24 hours of minute data at a time
		// CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
		return resolution < 60 ? {resolutionBack: 'D', intervalBack: '1'} : undefined
	},
	getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		//optional
		console.log('=====getMarks running')
	},
	getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		//optional
		console.log('=====getTimeScaleMarks running')
	},
	getServerTime: cb => {
		console.log('=====getServerTime running')
	}
}