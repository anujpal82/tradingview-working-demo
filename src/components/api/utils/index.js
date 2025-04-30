export const getExchangeSegment = (EXCH_ID, SEGMENT,INSTRUMENT) => {
    if (EXCH_ID === 'BSE' && SEGMENT === 'D') {
      return 'BSE_FNO';
    }
    if (EXCH_ID === 'NSE' && SEGMENT === 'D') {
      return 'NSE_FNO';
    }
    if(EXCH_ID==="NSE" && SEGMENT==="I" && INSTRUMENT==="INDEX"){
      return 'IDX_I';
    }
    // if (EXCH_ID === 'NSE' && SEGMENT === 'C' &&INSTRUMENT==="INDEX" ) {
    //   return 'IDX_I';
    // }
    if(SEGMENT==="I"){
        return "IDX_I"
    }
    if(SEGMENT="E" && EXCH_ID==="BSE"){
        return "BSE_EQ"
    }
    if(SEGMENT="E" && EXCH_ID==="NSE"){
        return "NSE_EQ"
    }
    if(EXCH_ID==="MCX"){
      return "MCX_COMM"
    }
  };
  
  export const transformLevels = (data) => {
    const levels = [];
  
    // Add resistance levels
    data.resistance?.forEach((item, index) => {
      levels.push({
        price: item.level,
        text: `R${index + 1}`,
        color: "#FF0000",
      });
    });
  
    // Add bottom level
    if (data.bottom) {
      levels.push({
        price: data.bottom.level,
        text: "Bottom",
        color: "#0000FF",
      });
    }
  
    // Add support levels
    data.support?.forEach((item, index) => {
      levels.push({
        price: item.level,
        text: `S${index + 1}`,
        color: "#00FF00",
      });
    });

    console.log({levels})
  
    return levels;
  };
  
  export function extractSecurityId(inputStr) {
    const parts = inputStr.split(':');
    if (parts.length < 2) return null;
  
    const afterColon = parts[1]; // "13_#_60"
    const securityId = afterColon.split('_')[0]; // "13"
  
    return securityId;
  }
  