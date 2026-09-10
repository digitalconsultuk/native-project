
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// utils/DateUtils.ts for formatting dates and times with offset for Google Calendar API
export const formatDateTimeForCalendarwithOffSet = (date: string, time: string): string => {
  const dateTimeString = `${date}T${time}`;
  const dateTimeWithOffset = dayjs.tz(dateTimeString, "Europe/London").format("YYYY-MM-DDTHH:mm:ssZ")
  return dateTimeWithOffset;
}

// split DateTime util
export const dateTimeSplitter = (dateTimeToSplit: string):Array<string> => {
  if(dateTimeToSplit != null){
    const dateValue = dateTimeToSplit.split("T")[0];
    const timeValueWithOffset = dateTimeToSplit.split("T")[1];
    const timeValue = timeValueWithOffset.split("+")[0];
    return [dateValue, timeValue ]
  }
  else{
    console.error(`dateTimeSplitter function returned: ${Array.length}`);
    return []
  }
}

// convert DateTime to Europe/London time zone with 2hours added
export const convertDateTimeToLondonWith2HoursAdded = (dateFromUser:string):string => {
  return dayjs(dateFromUser).tz("Europe/London").add(2,"hours").format("YYYY-MM-DDTHH:mm:ssZ")
}