// websocketTickProvider.js
import { getExchangeSegment } from './utils'; // Make sure this is properly imported
import io from 'socket.io-client'; // Import Socket.IO client

const SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:8080';

let socket = null;
let socketReady = false;
const subscribers = new Map();
let lastBars = new Map(); // Store the latest bar for each symbol+resolution

export const initWebSocket = () => {
    console.log(`Connecting to Socket.IO server at: ${SERVER_URL}`);
  socket = io(SERVER_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }

  // Create new Socket.IO connection
  socket = io('http://localhost:8080', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });
  
  // Connection event
  socket.on('connect', () => {
    console.log('Socket.IO connection established');
    socketReady = true;
    
    // Log socket ID for debugging
    console.log(`Socket connected with ID: ${socket.id}`);
    
    // Re-subscribe all active subscribers after reconnection
    subscribers.forEach((subInfo, subscribeUID) => {
      sendSubscription(subInfo.symbolInfo, subInfo.resolution, subscribeUID);
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
  
  // Reconnection error
  socket.on('reconnect_error', (error) => {
    console.error('Socket.IO reconnection error:', error);
  });
  
  // Failed to reconnect after all attempts
  socket.on('reconnect_failed', () => {
    console.error('Socket.IO reconnection failed after all attempts');
  });
  
  // Ping event (heartbeat from server)
  socket.on('ping', () => {
    console.log('Ping received from server');
  });
  
  // Pong response time (latency check)
  socket.on('pong', (latency) => {
    console.log(`Pong response time: ${latency}ms`);
  });
  
  // Handle tick data from server
  socket.on('tick', (tickData) => {
    console.log('Tick received:', tickData);
    // processTickData(tickData);
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
  
  // Unsubscription confirmations
  socket.on('unsubscription_confirmed', (data) => {
    console.log('Unsubscription confirmed:', data);
  });
};

// Process incoming tick data and update charts
const processTickData = (tickData) => {
  const { symbol, price, volume, timestamp } = tickData;
  console.log(`Processing tick for ${symbol}: price=${price}, volume=${volume}, time=${new Date(timestamp).toISOString()}`);
  
  // Find all subscribers for this symbol
  subscribers.forEach((subInfo, subscribeUID) => {
    if (subInfo.symbolInfo.ticker === symbol) {
      updateBar(subInfo, price, volume, timestamp);
    }
  });
};

// Update or create a bar based on tick data
const updateBar = (subInfo, price, volume, timestamp) => {
  const { symbolInfo, resolution, onRealtimeCallback } = subInfo;
  const resolutionMs = getResolutionInMs(resolution);
  
  if (!resolutionMs) {
    console.warn(`Invalid resolution: ${resolution}`);
    return;
  }
  
  // Create a unique key for this symbol and resolution
  const key = `${symbolInfo.ticker}_${resolution}`;
  
  // Get the current bar period start time
  const currentBarTime = Math.floor(timestamp / resolutionMs) * resolutionMs;
  
  // Get or create the latest bar
  let bar = lastBars.get(key);
  
  // Log bar creation/update
  if (!bar || bar.time !== currentBarTime) {
    console.log(`Creating new bar for ${symbolInfo.ticker} @ ${resolution}, time: ${new Date(currentBarTime).toISOString()}`);
    
    // If we have an existing bar, finalize it
    if (bar && bar.time !== currentBarTime) {
      console.log(`Finalizing previous bar: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}`);
      onRealtimeCallback(bar);
    }
    
    // Create a new bar
    bar = {
      time: currentBarTime,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: volume || 0
    };
  } else {
    // Update existing bar
    console.log(`Updating bar for ${symbolInfo.ticker}: price=${price}, current OHLC=[${bar.open}, ${bar.high}, ${bar.low}, ${bar.close}]`);
    bar.high = Math.max(bar.high, price);
    bar.low = Math.min(bar.low, price);
    bar.close = price;
    bar.volume = (bar.volume || 0) + (volume || 0);
  }
  
  // Store the updated bar
  lastBars.set(key, bar);
  
  // Log final bar state
  console.log(`Bar after update: O=${bar.open}, H=${bar.high}, L=${bar.low}, C=${bar.close}, V=${bar.volume}`);
  
  // Send the update to the chart
  onRealtimeCallback(bar);
};

// Convert resolution string to milliseconds
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
    ms = parseInt(resolution) * 60 * 1000;
  }
  
  console.log(`Resolution ${resolution} converted to ${ms}ms`);
  return ms;
};

// Send subscription request to the server
export const sendSubscription = ( action, mode, exchangeType, tokens) => {
  if (!socketReady) {
    console.warn('Socket not ready, deferring subscription');
    return;
  }
  
  const subscriptionMessage = {
   action,
    mode,
    exchangeType,
    tokens
  };
  
  console.log('Sending subscription:', subscriptionMessage);
  socket.emit('subscribe', subscriptionMessage);
};

export const subscribeToTicks = (symbolInfo, resolution, subscribeUID, onRealtimeCallback) => {
  console.log(`Subscribing to ticks for ${symbolInfo.ticker} @ ${resolution}, UID: ${subscribeUID}`);
  
  // Store subscription info
  subscribers.set(subscribeUID, {
    symbolInfo,
    resolution,
    onRealtimeCallback
  });
  
  // Send subscription to server
  sendSubscription(symbolInfo, resolution, subscribeUID);
  
  return subscribeUID;
};

export const unsubscribeFromTicks = (subscribeUID) => {
  if (!socketReady) {
    console.warn('Socket not ready, cannot unsubscribe');
    return;
  }
  
  if (!subscribers.has(subscribeUID)) {
    console.warn(`Subscription ${subscribeUID} not found`);
    return;
  }
  
  const subInfo = subscribers.get(subscribeUID);
  console.log(`Unsubscribing from ticks for ${subInfo.symbolInfo.ticker}, UID: ${subscribeUID}`);
  
  const unsubscribeMessage = {
    action: 'unsubscribe_ticks',
    subscribeUID,
    symbol: subInfo.symbolInfo.ticker
  };
  
  socket.emit('unsubscribe_ticks', unsubscribeMessage);
  subscribers.delete(subscribeUID);
};

// Helper to get current socket status
export const getSocketStatus = () => {
  if (!socket) return 'Not initialized';
  
  return {
    connected: socket.connected,
    id: socket.id,
    ready: socketReady
  };
};

// Debug helper to log all subscribers
export const logAllSubscribers = () => {
  console.log(`Current subscribers (${subscribers.size}):`);
  subscribers.forEach((subInfo, uid) => {
    console.log(`- ${uid}: ${subInfo.symbolInfo.ticker} @ ${subInfo.resolution}`);
  });
};

// Initialize socket on module load
initWebSocket();

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (socket) {
    console.log('Disconnecting socket due to page unload');
    socket.disconnect();
  }
});