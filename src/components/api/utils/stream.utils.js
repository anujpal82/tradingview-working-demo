function createChannelString(symbolInfo) {
    var channel = symbolInfo.name.split(/[:/]/)
    const exchange = channel[0] === 'GDAX' ? 'Coinbase' : channel[0]
    const to = channel[2]
    const from = channel[1]
   // subscribe to the CryptoCompare trade channel for the pair and exchange
    return `0~${exchange}~${from}~${to}`
  }

  export function convertToTradingViewTime(isoTimestamp) {
    // Handle edge cases
    if (!isoTimestamp) {
      console.log({isoTimestamp})
      console.error("Invalid timestamp provided");
      return null;
    }
    
    try {
      // Parse the ISO string to Date object and convert to milliseconds
      const unixTimestamp = new Date(isoTimestamp).getTime();
      
      // Validate the result (will be NaN if parsing failed)
      if (isNaN(unixTimestamp)) {
        throw new Error("Failed to parse timestamp");
      }
      
      return unixTimestamp;
    } catch (error) {
      console.error("Error converting timestamp:", error.message);
      return null;
    }
  }