function createChannelString(symbolInfo) {
    var channel = symbolInfo.name.split(/[:/]/)
    const exchange = channel[0] === 'GDAX' ? 'Coinbase' : channel[0]
    const to = channel[2]
    const from = channel[1]
   // subscribe to the CryptoCompare trade channel for the pair and exchange
    return `0~${exchange}~${from}~${to}`
  }