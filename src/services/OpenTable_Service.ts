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
  static getSlotsAvailability = async (): Promise<any> => {
    /** cache miss on the first attempt.* cache hit on the second attempt.**/
    if(!localStorage.getItem('data')) {
      const data = await axios.get('/.netlify/functions/SlotAvailability', {
        headers: {'Content-Type': 'application/json'},
        method: 'GET',
      });
      localStorage.setItem('data',JSON.stringify(data.data));
    }
    return localStorage.getItem('data');
  }
  /** @doc book reservation function **/
}