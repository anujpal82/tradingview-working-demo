import axios from "./utils/axios"

export const candleDataAPI=async(payload)=>{
  axios.get(`/history?symbol=${payload.symbol}&resolution=${payload.resolution}&from=${payload.from}&to=${payload.to}&countback=${payload.countback}`)
}

export const getLevels = async (payload) => {
  console.log({payload})
  return axios.post('/store/support-resistance', payload);
};
