// // websocketTickProvider.js
// import { historyCache } from '.';
// import { getExchangeSegment } from './utils'; // Make sure this is properly imported
// import io from 'socket.io-client'; // Import Socket.IO client
// import { convertToTradingViewTime } from './utils/stream.utils';

// const SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:8080';

// let socket = null;
// let socketReady = false;
// const subscribers = new Map();
// let lastBars = new Map(); 

// export const initWebSocket = () => {
//     console.log(`Connecting to Socket.IO server at: ${SERVER_URL}`);
//   socket = io(SERVER_URL, {
//     reconnection: true,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     reconnectionAttempts: Infinity
//   });
//   // Close existing connection if any
//   if (socket) {
//     socket.disconnect();
//   }

//   // Create new Socket.IO connection
//   socket = io('http://localhost:8080', {
//     reconnection: true,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     reconnectionAttempts: Infinity
//   });
  
//   // Connection event
//   socket.on('connect', () => {
//     console.log('Socket.IO connection established');
//     socketReady = true;
    
//     // Log socket ID for debugging
//     console.log(`Socket connected with ID: ${socket.id}`);
    
//     // Re-subscribe all active subscribers after reconnection
//     // subscribers.forEach((subInfo, subscribeUID) => {
//     //   sendSubscription(subInfo.symbolInfo, subInfo.resolution, subscribeUID);
//     // });
//   });
  
//   // Disconnection event
//   socket.on('disconnect', (reason) => {
//     console.log('Socket.IO disconnected:', reason);
//     socketReady = false;
//   });
  
//   // Connection error event
//   socket.on('connect_error', (error) => {
//     console.error('Socket.IO connection error:', error);
//     socketReady = false;
//   });
  
//   // Reconnection attempts
//   socket.on('reconnect_attempt', (attemptNumber) => {
//     console.log(`Socket.IO reconnection attempt #${attemptNumber}`);
//   });
  
//   // Successful reconnection
//   socket.on('reconnect', (attemptNumber) => {
//     console.log(`Socket.IO reconnected after ${attemptNumber} attempts`);
//     socketReady = true;
//   });
  
//   // Reconnection error
//   socket.on('reconnect_error', (error) => {
//     console.error('Socket.IO reconnection error:', error);
//   });
  
//   // Failed to reconnect after all attempts
//   socket.on('reconnect_failed', () => {
//     console.error('Socket.IO reconnection failed after all attempts');
//   });
  
//   // Ping event (heartbeat from server)
//   socket.on('ping', () => {
//     console.log('Ping received from server');
//   });
  
//   // Pong response time (latency check)
//   socket.on('pong', (latency) => {
//     console.log(`Pong response time: ${latency}ms`);
//   });
  
//   // Handle tick data from server
//   // socket.on('tick', (tickData) => {
//   //   console.log('Tick received:', tickData);
//   //   const lastBarInfo=historyCache?.[tickData?.securityId]?.lastBar
//   //   if (lastBarInfo) {
//   //     const bar={
//   //       time : convertToTradingViewTime(tickData?.ltt),
//   //       open: lastBarInfo?.open,
//   //       high: Math.max(lastBarInfo?.high, tickData?.ltp),
//   //       low: Math.min(lastBarInfo?.low, tickData?.ltp),
//   //       close: tickData?.ltp,
//   //     }
//   //   }
//   //   // processTickData(tickData);
//   // });
  
//   const updateBar = (subInfo, price, volume, timestamp) => {
//     const { symbolInfo, resolution, onRealtimeCallback } = subInfo;
//     const key = `${symbolInfo.ticker}_${resolution}`;
//     const resolutionMs = getResolutionInMs(resolution);
//     const barStartTime = Math.floor(timestamp / resolutionMs) * resolutionMs;
  
//     let bar = lastBars.get(key);
//     console.log({bar115:bar})
//   console.log({
//         key : `${symbolInfo.ticker}_${resolution}`,
//      resolutionMs : getResolutionInMs(resolution),
//      barStartTime : Math.floor(timestamp / resolutionMs) * resolutionMs,
//   })
//     if (!bar || bar.time !== barStartTime) {
//       if (bar && onRealtimeCallback) {
//         onRealtimeCallback(bar); // Finalize previous bar
//       }
  
//       bar = {
//         time: barStartTime,
//         open: price,
//         high: price,
//         low: price,
//         close: price,
//         volume: volume || 0,
//       };
//     } else {
//       bar.high = Math.max(bar.high, price);
//       bar.low = Math.min(bar.low, price);
//       bar.close = price;
//       bar.volume += volume || 0;
//     }
  
//     lastBars.set(key, bar);
//   console.log({bar141:bar})
//     // Send updated bar to TradingView
//     if (onRealtimeCallback) {
//       onRealtimeCallback(bar);
//     }
//   };
  
//   socket.on('tick', (tickData) => {
//   if(tickData?.responseCode !==2) return
//     const securityId = tickData.securityId;
//     const price = parseFloat(tickData.ltp);
//     const volume = parseFloat(tickData.ltq || 0);
//     const timestamp = convertToTradingViewTime(tickData.ltt); // milliseconds
//     console.log({tickData})
//     console.log({subscribers})
//     subscribers.forEach((subInfo, uid) => {
//       const subSecurityId = subInfo.symbolInfo?.ticker?.split(':')[1];
//       console.log({subSecurityId,securityId,cond:subSecurityId===securityId})
//       if (subSecurityId == securityId) {
//         updateBar(subInfo, price, volume, timestamp);
//       }
//     });
//   });

//   // Server status updates
//   socket.on('server_status', (status) => {
//     console.log('Server status update:', status);
//   });
  
//   // Custom error events from server
//   socket.on('error', (errorData) => {
//     console.error('Server error:', errorData);
//   });
  
//   // Subscription confirmations
//   socket.on('subscription_confirmed', (data) => {
//     console.log('Subscription confirmed:', data);
//   });
  
//   // Unsubscription confirmations
//   socket.on('unsubscription_confirmed', (data) => {
//     console.log('Unsubscription confirmed:', data);
//   });
// };

// // Process incoming tick data and update charts
// const processTick = (tickData) => {
//   // Filter ticks for this security
//   if (tickData.securityId !== securityId) return;
  
//   const tickPrice = parseFloat(tickData.lastTradePrice);
//   const tickVolume = parseFloat(tickData.lastTradeQuantity);
//   const tickTime = new Date(tickData.lastTradeTime).getTime();
  
//   // Determine bar start time based on our resolution
//   const barStartTime = getBarStartTime(tickTime, resolution);
  
//   // Check if this is the first tick or belongs to a new bar
//   if (currentBar.time === null) {
//     // First tick, initialize the bar
//     currentBar.time = barStartTime;
//     currentBar.open = tickPrice;
//     currentBar.high = tickPrice;
//     currentBar.low = tickPrice;
//     currentBar.close = tickPrice;
//     currentBar.volume = tickVolume;
//   } else if (barStartTime > currentBar.time) {
//     // This tick belongs to a new bar
    
//     // Send the completed bar
//     onRealtimeCallback(currentBar);
    
//     // Start a new bar
//     currentBar = {
//       symbol: symbolInfo.ticker,
//       resolution: resolution,
//       time: barStartTime,
//       open: tickPrice,
//       high: tickPrice,
//       low: tickPrice,
//       close: tickPrice,
//       volume: tickVolume
//     };
//   } else {
//     // Update the current bar
//     currentBar.high = Math.max(currentBar.high, tickPrice);
//     currentBar.low = Math.min(currentBar.low, tickPrice);
//     currentBar.close = tickPrice;
//     currentBar.volume += tickVolume;
    
//     // Send the updated bar
//     onRealtimeCallback(currentBar);
//   }
// };

// // Update or create a bar based on tick data
// const updateBar = (subInfo, price, volume, timestamp) => {
//   const { symbolInfo, resolution, onRealtimeCallback } = subInfo;
//   const resolutionMs = getResolutionInMs(resolution);
  
//   if (!resolutionMs) {
//     console.warn(`Invalid resolution: ${resolution}`);
//     return;
//   }
  
//   // Create a unique key for this symbol and resolution
//   const key = `${symbolInfo.ticker}_${resolution}`;
  
//   // Get the current bar period start time
//   const currentBarTime = Math.floor(timestamp / resolutionMs) * resolutionMs;
  
//   // Get or create the latest bar
//   let bar = lastBars.get(key);
  
//   // Log bar creation/update
//   if (!bar || bar.time !== currentBarTime) {
//     console.log(`Creating new bar for ${symbolInfo.ticker} @ ${resolution}, time: ${new Date(currentBarTime).toISOString()}`);
    
//     // If we have an existing bar, finalize it
//     if (bar && bar.time !== currentBarTime) {
//       console.log(`Finalizing previous bar: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}`);
//       onRealtimeCallback(bar);
//     }
    
//     // Create a new bar
//     bar = {
//       time: currentBarTime,
//       open: price,
//       high: price,
//       low: price,
//       close: price,
//       volume: volume || 0
//     };
//   } else {
//     // Update existing bar
//     console.log(`Updating bar for ${symbolInfo.ticker}: price=${price}, current OHLC=[${bar.open}, ${bar.high}, ${bar.low}, ${bar.close}]`);
//     bar.high = Math.max(bar.high, price);
//     bar.low = Math.min(bar.low, price);
//     bar.close = price;
//     bar.volume = (bar.volume || 0) + (volume || 0);
//   }
  
//   // Store the updated bar
//   lastBars.set(key, bar);
  
//   // Log final bar state
//   console.log(`Bar after update: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}`);
  
//   // Send the update to the chart
//   onRealtimeCallback(bar);
// };

// // Convert resolution string to milliseconds
// const getResolutionInMs = (resolution) => {
//   let ms;
  
//   if (resolution === 'D' || resolution === '1D') {
//     ms = 24 * 60 * 60 * 1000; // 1 day
//   } else if (resolution === 'W') {
//     ms = 7 * 24 * 60 * 60 * 1000; // 1 week
//   } else if (resolution === 'M') {
//     ms = 30 * 24 * 60 * 60 * 1000; // ~1 month (approximate)
//   } else {
//     // For minute resolutions like "1", "5", "15", etc.
//     ms = parseInt(resolution) * 60 * 1000;
//   }
  
//   console.log(`Resolution ${resolution} converted to ${ms}ms`);
//   return ms;
// };

// // Send subscription request to the server
// export const sendSubscription = ( mode, exchangeType, tokens) => {
//   if (!socketReady) {
//     console.warn('Socket not ready, deferring subscription');
//     return;
//   }
  
//   const subscriptionMessage = {
//     mode,
//     exchangeType,
//     tokens
//   };
//   console.log('Sending subscription:', subscriptionMessage);
//   socket.emit('subscribe', subscriptionMessage);
// };

// export const subscribeToTicks = (symbolInfo, resolution, subscribeUID, onRealtimeCallback) => {
//   console.log(`Subscribing to ticks for ${symbolInfo.ticker} @ ${resolution}, UID: ${subscribeUID}`);
//   const [symbol, securityId] = symbolInfo.ticker.split(':');
//   console.log({symbolInfo})
//   const exchangeSegment = getExchangeSegment(symbolInfo.exchangeId, symbolInfo.segment);
//   const exchangeType = symbolInfo.exchangeId;
//   const tokens=[securityId];
//   // Store subscription info
//   subscribers.set(securityId, {
//     symbolInfo,
//     resolution,
//     onRealtimeCallback,
//     uid: subscribeUID,
//   });
  
//   // Send subscription to server
//   sendSubscription("TICK", exchangeType, tokens);
  
//   return subscribeUID;
// };

// export const unsubscribeFromTicks = (subscribeUID) => {
//   if (!socketReady) {
//     console.warn('Socket not ready, cannot unsubscribe');
//     return;
//   }
  
//   if (!subscribers.has(subscribeUID)) {
//     console.warn(`Subscription ${subscribeUID} not found`);
//     return;
//   }
  
//   const subInfo = subscribers.get(subscribeUID);
//   console.log(`Unsubscribing from ticks for ${subInfo.symbolInfo.ticker}, UID: ${subscribeUID}`);
  
//   const unsubscribeMessage = {
//     action: 'unsubscribe_ticks',
//     subscribeUID,
//     symbol: subInfo.symbolInfo.ticker
//   };
  
//   socket.emit('unsubscribe_ticks', unsubscribeMessage);
//   subscribers.delete(subscribeUID);
// };

// // Helper to get current socket status
// export const getSocketStatus = () => {
//   if (!socket) return 'Not initialized';
  
//   return {
//     connected: socket.connected,
//     id: socket.id,
//     ready: socketReady
//   };
// };

// // Debug helper to log all subscribers
// export const logAllSubscribers = () => {
//   console.log(`Current subscribers (${subscribers.size}):`);
//   subscribers.forEach((subInfo, uid) => {
//     console.log(`- ${uid}: ${subInfo.symbolInfo.ticker} @ ${subInfo.resolution}`);
//   });
// };

// // Initialize socket on module load
// initWebSocket();

// // Handle page unload
// window.addEventListener('beforeunload', () => {
//   if (socket) {
//     console.log('Disconnecting socket due to page unload');
//     socket.disconnect();
//   }
// });


// websocketTickProvider.js
import { historyCache } from '.';
import { getExchangeSegment } from './utils';
import io from 'socket.io-client';
import { convertToTradingViewTime } from './utils/stream.utils';

const SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:8080';

let socket = null;
let socketReady = false;
export const subscribers = new Map();
let lastBars = new Map();
console.log({lastBars})

export const initWebSocket = () => {
  console.log(`Connecting to Socket.IO server at: ${SERVER_URL}`);
  
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new Socket.IO connection
  socket = io(SERVER_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });
  
  // Connection event
  socket.on('connect', () => {
    console.log('Socket.IO connection established');
    socketReady = true;
    
    console.log(`Socket connected with ID: ${socket.id}`);
    
    // Re-subscribe all active subscribers after reconnection
    subscribers.forEach((subInfo, subscribeUID) => {
      const [symbol, securityId] = subInfo.symbolInfo.ticker.split(':');
      const tokens = [securityId];
      sendSubscription("TICK", subInfo.symbolInfo.exchangeId, tokens);
    });
  });
  
  // Disconnection event
  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected:', reason);
    socketReady = false;
  });
  
  // Connection error event
  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
    socketReady = false;
  });
  
  // Reconnection attempts
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Socket.IO reconnection attempt #${attemptNumber}`);
  });
  
  // Successful reconnection
  socket.on('reconnect', (attemptNumber) => {
    console.log(`Socket.IO reconnected after ${attemptNumber} attempts`);
    socketReady = true;
  });
  
  // Handle tick data from server
  socket.on('tick', (tickData) => {
    if (tickData?.responseCode !== 2) return;
    
    const securityId = tickData.securityId;
    const price = parseFloat(tickData.ltp);
    const volume = parseFloat(tickData.ltq || 0);
    const timestamp = convertToTradingViewTime(tickData.ltt); // milliseconds
    
    console.log(`Tick received for ${securityId}: price=${price}, volume=${volume}, time=${new Date(timestamp).toISOString()}`);
    
    subscribers.forEach((subInfo, subId) => {
      const subSecurityId = subInfo.symbolInfo?.ticker?.split(':')[1];
      if (subSecurityId == securityId) {
        updateBar(subInfo, price, volume, timestamp);
      }
    });
  });

  // Server status updates
  socket.on('server_status', (status) => {
    console.log('Server status update:', status);
  });
  
  // Custom error events from server
  socket.on('error', (errorData) => {
    console.error('Server error:', errorData);
  });
  
  // Subscription confirmations
  socket.on('subscription_confirmed', (data) => {
    console.log('Subscription confirmed:', data);
  });
};

// Convert resolution string to milliseconds - FIXED
const getResolutionInMs = (resolution) => {
  let ms;
  
  if (resolution === 'D' || resolution === '1D') {
    ms = 24 * 60 * 60 * 1000; // 1 day
  } else if (resolution === 'W') {
    ms = 7 * 24 * 60 * 60 * 1000; // 1 week
  } else if (resolution === 'M') {
    ms = 30 * 24 * 60 * 60 * 1000; // ~1 month (approximate)
  } else {
    // For minute resolutions like "1", "5", "15", etc.
    const minutes = parseInt(resolution, 10);
    if (!isNaN(minutes)) {
      ms = minutes * 60 * 1000;
    } else {
      console.warn(`Invalid resolution format: ${resolution}`);
      ms = 60 * 1000; // Default to 1 minute if parsing fails
    }
  }
  
  console.log(`Resolution ${resolution} converted to ${ms}ms`);
  return ms;
};

// Updated updateBar function with fixed bar creation logic
// const updateBar = (subInfo, price, volume, timestamp) => {
//   const { symbolInfo, resolution, onRealtimeCallback } = subInfo;
//   const resolutionMs = getResolutionInMs(resolution);
  
//   // Create a unique key for this symbol and resolution
//   const key = `${symbolInfo.ticker}_${resolution}`;
  
//   // Get the current bar period start time
//   const currentBarTime = Math.floor(timestamp / resolutionMs) * resolutionMs;
  
  
//   // Get or create the latest bar
//   let bar = lastBars.get(key);
  
//   // Check if we need to create a new bar
//   const isNewBar = !bar || bar.time !== currentBarTime;
  
//   if (isNewBar) {
//     console.log(`Creating new bar for ${symbolInfo.ticker} @ ${resolution}, time: ${new Date(currentBarTime).toISOString()}`);
    
//     // If we have an existing bar, finalize it before creating a new one
//     if (bar) {
//       console.log(`Finalizing previous bar: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}`);
//       // Only send the callback if this is truly a new bar (not initialization)
//       onRealtimeCallback(bar);
//     }
    
//     // Create a new bar
//     bar = {
//       time: currentBarTime,
//       open: price,
//       high: price,
//       low: price,
//       close: price,
//       volume: volume || 0
//     };
//   } else {
//     // Update existing bar
//     console.log(`Updating bar for ${symbolInfo.ticker}: price=${price}, current OHLC=[${bar.open}, ${bar.high}, ${bar.low}, ${bar.close}]`);
    
//     // Only update high/low if price is different
//     if (price > bar.high) bar.high = price;
//     if (price < bar.low) bar.low = price;
    
//     // Always update close price
//     bar.close = price;
    
//     // Add to volume
//     bar.volume = (bar.volume || 0) + (volume || 0);
//   }
  
//   // Store the updated bar
//   lastBars.set(key, bar);
  
//   // Log final bar state
//   console.log(`Bar after update: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}, Time=${new Date(bar.time).toISOString()}`);
  
//   // Send the update to the chart - only if we're updating an existing bar (not creating a new one)
//   // This prevents premature closing of the current bar
//   if (!isNewBar) {
//     onRealtimeCallback(bar);
//   }
// };
const updateBar = (subInfo, price, volume, timestamp) => {
  const { symbolInfo, resolution, onRealtimeCallback } = subInfo;
  const resolutionMs = getResolutionInMs(resolution);

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  // Ensure timestamp is in milliseconds
  const normalizedTimestamp = timestamp < 1e12 ? timestamp * 1000 : timestamp;

  // Adjust timestamp to IST before flooring to bar interval
  const istTimestamp = normalizedTimestamp + IST_OFFSET;
  const currentBarTime = Math.floor(istTimestamp / resolutionMs) * resolutionMs - IST_OFFSET;

  const key = `${symbolInfo.ticker}_${resolution}`;
  let bar = lastBars.get(key);

  const isNewBar = !bar || bar.time !== currentBarTime;

  if (isNewBar) {
    console.log(`Creating new bar for ${symbolInfo.ticker} @ ${resolution}, time: ${new Date(currentBarTime).toISOString()}`);

    if (bar) {
      console.log(`Finalizing previous bar: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}`);
      onRealtimeCallback(bar);
    }

    bar = {
      time: currentBarTime,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: volume || 0
    };
  } else {
    console.log(`Updating bar for ${symbolInfo.ticker}: price=${price}, current OHLC=[${bar.open}, ${bar.high}, ${bar.low}, ${bar.close}]`);

    if (price > bar.high) bar.high = price;
    if (price < bar.low) bar.low = price;

    bar.close = price;
    bar.volume = (bar.volume || 0) + (volume || 0);
  }

  lastBars.set(key, bar);

  console.log(`Bar after update: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}, Time=${new Date(bar.time).toISOString()}`);

  if (!isNewBar) {
    onRealtimeCallback(bar);
  }
};

// Send subscription request to the server
export const sendSubscription = (mode, exchangeType, tokens) => {
  if (!socketReady) {
    console.warn('Socket not ready, deferring subscription');
    return false;
  }
  
  const subscriptionMessage = {
    mode,
    exchangeType,
    tokens
  };
  console.log('Sending subscription:', subscriptionMessage);
  socket.emit('subscribe', subscriptionMessage);
  return true;
};

export const subscribeToTicks = (symbolInfo, resolution, subscribeUID, onRealtimeCallback) => {
  console.log(`Subscribing to ticks for ${symbolInfo.ticker} @ ${resolution}, UID: ${subscribeUID}`);
  
  const [symbol, securityId] = symbolInfo.ticker.split(':');
  const exchangeType = symbolInfo.exchangeId;
  const tokens = [securityId];
  
  // Store subscription info - use securityId as the key for faster lookups
  subscribers.set(`${securityId}-${resolution}`, {
    symbolInfo,
    resolution,
    onRealtimeCallback,
    uid: subscribeUID,
  });
  
  // Initialize lastBars entry with data from historyCache if available
  const lastBarFromCache = historyCache[`${securityId}-${resolution}`]?.lastBar;
  if (lastBarFromCache) {
    const barKey = `${symbolInfo.ticker}_${resolution}`;
    // Make sure we don't already have this bar
    if (!lastBars.has(barKey)) {
      lastBars.set(barKey, { ...lastBarFromCache });
      console.log(`Initialized last bar from cache for ${symbolInfo.ticker}:`, lastBarFromCache);
    }
  }
  
  // Send subscription to server
  if (sendSubscription("TICK", exchangeType, tokens)) {
    return subscribeUID;
  }
  
  return null;
};

export const unsubscribeFromTicks = (securityId) => {
  if (!socketReady) {
    console.warn('Socket not ready, cannot unsubscribe');
    return;
  }
  
  if (!subscribers.has(securityId)) {
    console.warn(`Subscription for securityId ${securityId} not found`);
    return;
  }
  
  const subInfo = subscribers.get(securityId);
  console.log(`Unsubscribing from ticks for ${subInfo.symbolInfo.ticker}, UID: ${subInfo.uid}`);
  
  const [symbol, secId] = subInfo.symbolInfo.ticker.split(':');
  const tokens = [secId];
  const exchangeType = subInfo.symbolInfo.exchangeId;
  
  // Send unsubscribe message
  const unsubscribeMessage = {
    mode: "UNSUBSCRIBE_TICK",
    exchangeType,
    tokens
  };
  
  socket.emit('unsubscribe', unsubscribeMessage);
  
  // Clean up cache entries
  const barKey = `${subInfo.symbolInfo.ticker}_${subInfo.resolution}`;
  lastBars.delete(barKey);
  
  // Remove subscription
  subscribers.delete(securityId);
};

// Helper to get current socket status
export const getSocketStatus = () => {
  if (!socket) return 'Not initialized';
  
  return {
    connected: socket.connected,
    id: socket.id,
    ready: socketReady,
    subscriberCount: subscribers.size
  };
};

// Initialize socket on module load
initWebSocket();

// Handle page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (socket) {
      console.log('Disconnecting socket due to page unload');
      socket.disconnect();
    }
  });
}