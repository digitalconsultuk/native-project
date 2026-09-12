import React,{ useEffect, useState, useCallback } from "react";
import { Button, TextField, MenuItem, InputAdornment } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import PhoneInput from "react-phone-number-input/input";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { TimeView } from "@mui/x-date-pickers";

import { Send_Mail_Service } from "@/services/EmailService";
import { createCalendarBookingEvent, fetchBookedEventSlots, type AvailableTimeSlot, type CreateEventRequest } from "@/services/CalendarService";
import { formatDateTimeForCalendarwithOffSet } from "@/utils/DateUtils";
import { ToastContainer, toast } from 'react-toastify';
import { LoadingComponent } from "./components/LoadingComponent";

dayjs.extend(utc);
dayjs.extend(timezone);

// Bookable window in Europe/London: first selectable hour and last selectable hour.
// These must stay in sync with the TimePicker minTime/maxTime below, otherwise a date
// can look available because of a free slot the TimePicker never offers.

const FIRST_BOOKABLE_HOUR = 13;
const LAST_BOOKABLE_HOUR = 20;

const CustomPhoneInput = React.forwardRef((props: any, ref) => {
  const { onChange, name, ...other } = props;
  return (
    <PhoneInput
      {...other}
      ref={ref}
      defaultCountry="GB"
      onChange={(value) =>
        onChange({
          target: {
            name: name,
            value: value || "",
          },
        })
      }
    />
  );
});

/**
 * BookingForm - A restaurant reservation form using Tailwind CSS for layout
 * and MUI for interactive form components.
 */
const BookingForm = () => {
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    date: null as Dayjs | null,
    time: null as Dayjs | null,
    guests: "2",
    specialRequest: "",
  });
  // time interval value
  const timeValue = {
    hours: 1,
    minutes: 15,
  };

  // Booked slots fetched from Google Calendar freeBusy API
  const [bookedSlots, setBookedSlots] = useState<Array<AvailableTimeSlot>>([]);
  // Until the busy slots are known every date would look available, so the date picker stays disabled
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  // Bumped after every successful booking so the freeBusy effect re-runs each time
  const [slotsRefreshKey, setSlotsRefreshKey] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      // Re-disable the date picker on every run, not just the first, so the post-booking
      // refetch cannot leave a just-booked slot selectable against the stale bookedSlots
      setIsLoadingSlots(true);
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
      if (!apiKey || !calendarId) {
        console.error("Could not read Google API key or calendarID");
        if (isMounted) {
          setIsLoadingSlots(false);
        }
        return;
      }

      try {
        // events, not freeBusy: freeBusy merges overlapping reservations into one block, which
        // hides every booked start but the first and puts those slots back on the TimePicker
        const slots: Array<AvailableTimeSlot> = await fetchBookedEventSlots(calendarId, apiKey);
        if (isMounted) {
          setBookedSlots(slots || []);
        }
      } catch (e) {
        console.error("Failed to fetch available booked slots", e);
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [slotsRefreshKey]);

  // Availability is decided from the busy block's start only, never its end. A reservation
  // runs for two hours on the calendar, but the restaurant seats other parties during that
  // window, so the rest of the 15 minute slots must stay selectable - only the exact slot
  // already taken is blocked. Whole-day closures are handled by the all-day check in
  // shouldDisableDate below, which is the one place that does need the end.
  const isTimeBooked = useCallback(
    (target: Dayjs) => {
      return bookedSlots.some((slot) => target.isSame(dayjs(slot.start).tz("Europe/London"), "minute"));
    },
    [bookedSlots]
  );

  // The slots the TimePicker can actually offer for a given day: inside the bookable
  // window, on the picker's step granularity, and in the future when the day is today.
  const getSelectableSlots = useCallback(
    (day: Dayjs) => {
      const londonDay = day.tz("Europe/London");
      const now = dayjs().tz("Europe/London");
      const isToday = londonDay.isSame(now, "day");
      const step = timeValue.minutes || 30;
      const slots: Array<Dayjs> = [];

      for (let h = FIRST_BOOKABLE_HOUR; h <= LAST_BOOKABLE_HOUR; h++) {
        for (let m = 0; m < 60; m += step) {
          // the closing hour only offers the slot on the hour (see maxTime on the TimePicker)
          if (h === LAST_BOOKABLE_HOUR && m > 0) {
            break;
          }
          const candidate = londonDay.hour(h).minute(m).second(0).millisecond(0);
          if (isToday && candidate.isBefore(now)) {
            continue;
          }
          slots.push(candidate);
        }
      }

      return slots;
    },
    [timeValue.minutes]
  );

  const shouldDisableDate = useCallback(
    (day: Dayjs) => {
      const londonDay = day.tz("Europe/London");
      const now = dayjs().tz("Europe/London");

      if (londonDay.isBefore(now.startOf("day"))) {
        return true;
      }

      // Check if the entire day is covered by an all-day busy event
      const dayStart = londonDay.startOf("day");
      const dayEnd = londonDay.endOf("day");

      const isAllDayBooked = bookedSlots.some((slot) => {
        const start = dayjs(slot.start).tz("Europe/London");
        const end = dayjs(slot.end).tz("Europe/London");
        return (start.isSame(dayStart) || start.isBefore(dayStart)) && (end.isSame(dayEnd) || end.isAfter(dayEnd));
      });

      if (isAllDayBooked) {
        return true;
      }

      // Disable the date when the bookable window has already passed (today) or when
      // every slot the TimePicker would offer on it is already booked.
      const selectableSlots = getSelectableSlots(londonDay);

      return selectableSlots.length === 0 || selectableSlots.every((candidate) => isTimeBooked(candidate));
    },
    [bookedSlots, getSelectableSlots, isTimeBooked]
  );

  const shouldDisableTime = (value: Dayjs, view: TimeView) => {
    if (!bookingData.date) return false;

    const selectedDate = bookingData.date.tz("Europe/London");
    const now = dayjs().tz("Europe/London");
    const isToday = selectedDate.isSame(now, "day");

    if (view === "hours") {
      const hour = value.tz("Europe/London").hour();
      const slotsInHour = getSelectableSlots(selectedDate).filter((candidate) => candidate.hour() === hour);

      return slotsInHour.length === 0 || slotsInHour.every((candidate) => isTimeBooked(candidate));
    }

    if (view === "minutes") {
      const candidate = selectedDate
        .hour(value.tz("Europe/London").hour())
        .minute(value.tz("Europe/London").minute())
        .second(0)
        .millisecond(0);

      if (isToday && candidate.isBefore(now)) {
        return true;
      }

      return isTimeBooked(candidate);
    }

    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    if (!name) return;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setBookingData((prev) => ({
      ...prev,
      date: newValue,
    }));
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    setBookingData((prev) => ({
      ...prev,
      time: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true) // to show loading component
    const formattedDate = bookingData.date
      ? bookingData.date.format("YYYY-MM-DD")
      : "";
    const formattedTime = bookingData.time
      ? bookingData.time.format("HH:mm")
      : "";
    const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reservation Confirmation</title>
    </head>
    <body style="font-family: roboto; line-height: 1.6;">
      <h2>Reservation Confirmation</h2>
      <h4>Thank you, <b>${bookingData.name}</b>! Your reservation request for <b>${bookingData.guests}</b>
          guests on <b>${formattedDate}</b> at <b>${formattedTime}</b> has been received.<br>
          NOTE: <b style="color: #f59e0b; text-decoration: underline; font-weight: bold; font-family: roboto;">This is a reservation request and not a confirmation. You will receive a confirmation email once your reservation is approved.</b>
      </h4>
      <div style="margin-top: 3px; color: #f59e0b; font-weight: bold;">
        ${bookingData.specialRequest}
      </div>
    </body>
    </html>
    `;
    console.log("Booking submitted:", {
      ...bookingData,
      date: formattedDate,
      time: formattedTime,
    });
      try {
        // send the booking data to the netlify serverless function to create a Google Calendar event
          const eventPayload: CreateEventRequest = {
            summary: `Reservation for ${bookingData.name} (${bookingData.guests} guests)`,
            description: `Reservation Details:\nName: ${bookingData.name}\nEmail: ${bookingData.email}\nPhone: ${bookingData.phone}\nGuests: ${bookingData.guests}\nSpecial Requests: ${bookingData.specialRequest}`,
            start: {
              dateTime: formatDateTimeForCalendarwithOffSet(formattedDate, formattedTime),
              timeZone: "Europe/London",
            },
          };
        const calendarEventResponse = await createCalendarBookingEvent(eventPayload);
          if(calendarEventResponse.ok) {
            const mailResponse = await Send_Mail_Service(bookingData.email, htmlMessage);
            if (mailResponse.ok || mailResponse.status === 200) {
              toast.success(
                `Thank you, ${bookingData.name}! Your reservation request for ${bookingData.guests} guests on ${formattedDate} at ${formattedTime} has been received.`,
                {
                  position: "bottom-center",
                  autoClose: 5000,
                  closeOnClick: true,
                  pauseOnHover: true,
                }
              );
              setBookingData({
                name: "",
                email: "",
                phone: "",
                date: null,
                time: null,
                guests: "2",
                specialRequest: "",
              });
              // to re-request google free/busy endpoint
              setSlotsRefreshKey((key) => key + 1)
            }
            // to cover negative scenarios where the email service fails but the calendar event is created successfully, we can still show a success message for the booking and log the email failure for further investigation.
            else {
              console.error("Email service failed:", mailResponse.status, mailResponse.statusText);
            } 
          } 
          else {
          toast.error(
            `Sorry, ${bookingData.name}. Your reservation request for ${bookingData.guests} guests on ${formattedDate} at ${formattedTime} could not be processed due to Network Issues or bad data entered.`,
            {
              position: "bottom-center",
              autoClose: 5000,
              closeOnClick: true,
              pauseOnHover: true,
            }
          ); 
        }
      } 
      catch (error) {
        console.error("Booking submit error:", error);
        toast.error(
          `Sorry, ${bookingData.name}. Your reservation request for ${bookingData.guests} guests on ${formattedDate} at ${formattedTime} could not be processed due to an unexpected error.`,
          {
            position: "bottom-center",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
          }
        );
      }
      finally {
        // hide the loading component whatever the outcome; the freeBusy refetch is driven by
        // slotsRefreshKey above and is unaffected by this
        setIsLoading(false)
      }
  }

  return (
   
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      
      <section className=" mt-9 md:-mt-5 py-5 md:py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 md:py-8 lg:py-15">
          <div className="p-6 md:p-16 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-gray-100">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Reserve Your <span className="text-amber-500">Table</span>
              </h2>
              <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join us for an unforgettable seafood experience. Fill out the
                form below to secure your spot at Native Cave.
              </p>
              <div className="w-20 h-1.5 bg-amber-500 mx-auto mt-8 rounded-full" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name */}
              <div className="col-span-1">
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={bookingData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon className="text-amber-500" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      "&:hover fieldset": { borderColor: "#f59e0b" },
                      "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f59e0b" },
                  }}
                />
              </div>

              {/* Email */}
              <div className="col-span-1">
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={bookingData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon className="text-amber-500" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      "&:hover fieldset": { borderColor: "#f59e0b" },
                      "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f59e0b" },
                  }}
                />
              </div>

              {/* Phone */}
              <div className="col-span-1">
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleChange}
                  required
                  placeholder="019XXXXXXXX"
                  slotProps={{
                    input: {
                      inputComponent: CustomPhoneInput as any,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon className="text-amber-500" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      "&:hover fieldset": { borderColor: "#f59e0b" },
                      "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f59e0b" },
                  }}
                />
              </div>

              {/* Guests */}
              <div className="col-span-1">
                <TextField
                  fullWidth
                  select
                  label="Number of Guests"
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleChange}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon className="text-amber-500" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      "&:hover fieldset": { borderColor: "#f59e0b" },
                      "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f59e0b" },
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((option) => (
                    <MenuItem key={option} value={option.toString()}>
                      {option} {option === 1 ? "Guest" : "Guests"}
                    </MenuItem>
                  ))}
                  <MenuItem value="9+">9+ Guests</MenuItem>
                </TextField>
              </div>

              {/* Date Picker */}
              <div className="col-span-1">
                <DatePicker
                  label="Europe/London"
                  defaultValue={dayjs().tz("Europe/London")}
                  value={bookingData.date}
                  onChange={handleDateChange}
                  shouldDisableDate={shouldDisableDate}
                  disabled={isLoadingSlots}
                  minDate={dayjs().tz("Europe/London").startOf("day")}
                  timezone={"Europe/London"}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      slotProps: {
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon className="text-amber-500" />
                            </InputAdornment>
                          ),
                        },
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          "&:hover fieldset": { borderColor: "#f59e0b" },
                          "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#f59e0b",
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Time Picker */}
              <div className="col-span-1">
                <TimePicker
                  label="Time"
                  views={["hours", "minutes"]}
                  timeSteps={timeValue}
                  value={bookingData.time}
                  onChange={handleTimeChange}
                  timezone={"Europe/London"}
                  minTime={dayjs().tz("Europe/London").hour(FIRST_BOOKABLE_HOUR).startOf("hour")}
                  maxTime={dayjs().tz("Europe/London").hour(LAST_BOOKABLE_HOUR).startOf("hour")}
                  disableIgnoringDatePartForTimeValidation={false}
                  skipDisabled
                  shouldDisableTime={shouldDisableTime}
                  defaultValue={dayjs().tz("Europe/London")}
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      slotProps: {
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon className="text-amber-500" />
                            </InputAdornment>
                          ),
                        },
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          "&:hover fieldset": { borderColor: "#f59e0b" },
                          "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#f59e0b",
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Special Request */}
              <div className="col-span-1 md:col-span-2">
                <TextField
                  fullWidth
                  label="Special Requests"
                  name="specialRequest"
                  multiline
                  rows={4}
                  value={bookingData.specialRequest}
                  onChange={handleChange}
                  placeholder="Any allergies, special occasions, or seating preferences?"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      "&:hover fieldset": { borderColor: "#f59e0b" },
                      "&.Mui-focused fieldset": { borderColor: "#f59e0b" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#f59e0b" },
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 mt-4">
                <Button
                  fullWidth
                  disabled={
                    !bookingData.specialRequest ||
                    !bookingData.name ||
                    !bookingData.date ||
                    !bookingData.time
                  }
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  sx={{
                    backgroundColor: "#f59e0b",
                    color: "white",
                    py: 2,
                    borderRadius: "16px",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 10px 20px rgba(245, 158, 11, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#d97706",
                      boxShadow: "0 15px 30px rgba(217, 119, 6, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Confirm Reservation
                </Button>
              </div>
              <ToastContainer />
            </form>
          </div>
        </div>
      </section>
      {isLoading && <LoadingComponent isLoading={isLoading} dataValue="Request is loading...." />}
    </LocalizationProvider> 
 );
};
export { BookingForm };