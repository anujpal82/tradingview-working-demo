export const getExchangeSegment = (EXCH_ID, SEGMENT) => {
    if (EXCH_ID === 'BSE' && SEGMENT === 'D') {
      return 'BSE_FNO';
    }
    if (EXCH_ID === 'NSE' && SEGMENT === 'D') {
      return 'NSE_FNO';
    }
    if (EXCH_ID === 'NSE' && SEGMENT === 'C') {
      return 'NSE_EQ';
    }
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
  