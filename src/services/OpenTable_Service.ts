/**
 * @doc booking service with OpenTable API
**/
import axios from 'axios';

export interface BookingResponse {
  "id": string,
  "bookingId": number,
  "number_guests": number,
  "booked_slot": string,
  "price": number,
  "isBooked": boolean
}
export class OpenTableService {
  /**@doc get slot availability for booking*/
    // TODO: temp cache logic
  static getSlotsAvailability = async (): Promise<any> => {
    /** cache miss on the first attempt.* cache hit on the second attempt.**/
    const cachedData = localStorage.getItem("data");
    if(!cachedData) {
      const  data  = await axios.get('/.netlify/functions/SlotAvailability', {
        headers: {'Content-Type': 'application/json'}
      });
      const dataStr = JSON.stringify(data.data);
      localStorage.setItem('data', dataStr);
      return dataStr;
    }
    return cachedData;
  }
}