
import { Handler } from '@netlify/functions';

declare const process: any;
declare const Netlify: any;
import axios from 'axios';
import { filter, pipe } from 'remeda'
import type {BookingResponse} from "../../src/services/OpenTable_Service";

export const handler: Handler = async (event) => {
  const API_KEY = Netlify.env.get("OPENTABLE_API_KEY"); // Managed in Netlify Dashboard
  try {
    // @ts-ignore
    const response = await axios(process.env.VITE_API_URL || '', {
      method:'GET',
      headers:{Accept: '*'}
    });
    const unBookedSlotResponse= pipe(response.data,filter((availableSlot:BookingResponse)=>!availableSlot.isBooked))
    return {
      statusCode: 200,
      success: true,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(unBookedSlotResponse)
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        error: 'Failed to fetch data',
        success: false
      }),
    };
  }
};