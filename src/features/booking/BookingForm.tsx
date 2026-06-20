
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import { 
  Button, 
  TextField, 
  MenuItem,
  InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs,{ Dayjs } from 'dayjs';
import PhoneInput from "react-phone-number-input/input";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type {TimeView} from "@mui/x-date-pickers";
import {type BookingResponse, OpenTableService} from "../../services/OpenTable_Service.ts";
import {Send_Mail_Service} from "../../services/EmailService.ts";

dayjs.extend(utc);
dayjs.extend(timezone);
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
            value: value || '',
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
    name: '',
    email: '',
    phone: '',
    date: null as Dayjs | null,
    time: null as Dayjs | null,
    guests: '2',
    specialRequest: ''
  });
  // time interval value
  const timeValue = {
    hours: 1,
    minutes: 1
  }
  const [slots, setSlots] = useState<BookingResponse[]>([]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    slots.forEach(s => {
      // Parse the custom date format: "Sat Jul 18 2026 03:25:13 GMT+0100 (British Summer Time)"
      const d = dayjs(s.booked_slot);
      if (d.isValid()) {
        dates.add(d.format('YYYY-MM-DD'));
      }
    });
    return dates;
  }, [slots]);

  const availableTimes = useMemo(() => {
    const timesMap = new Map<string, Set<string>>();
    slots.forEach(s => {
      const d = dayjs(s.booked_slot);
      if (d.isValid()) {
        const dateKey = d.format('YYYY-MM-DD');
        const timeKey = d.format('HH:mm');
        
        let set = timesMap.get(dateKey);
        if (!set) {
          set = new Set();
          timesMap.set(dateKey, set);
        }
        set.add(timeKey);
      }
    });
    return timesMap;
  }, [slots]);

  const cachedCall = useCallback(async () => {
    try {
      const response = await OpenTableService.getSlotsAvailability();
      if (!response) return;
      const parsedAPIData = JSON.parse(response);
      setSlots(parsedAPIData);
    } catch (e) {
      console.error("Failed to fetch slots", e);
    }
  }, []);

  useEffect(() => {
    cachedCall();
  }, [cachedCall]);

  const shouldDisableDate = (day: Dayjs) => {
    const dateStr = day.format('YYYY-MM-DD');
    return !availableDates.has(dateStr);
  };

  const shouldDisableTime = (value: Dayjs, view: TimeView) => {
    if (!bookingData.date) return false;
    
    const dateKey = bookingData.date.format('YYYY-MM-DD');
    const availableSet = availableTimes.get(dateKey);
    
    if (!availableSet) return true;

    const timeInLondon = value;
    
    if (view === 'hours') {
      const hourStr = timeInLondon.format('HH:');
      // Check if any available time starts with this hour
      for (const time of availableSet) {
        if (time.startsWith(hourStr)) return false;
      }
      return true;
    }
    
    if (view === 'minutes') {
      const timeStr = timeInLondon.format('HH:mm');
      return !availableSet.has(timeStr);
    }
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target) return;
    const { name, value } = e.target;
    if (!name) return;
    setBookingData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setBookingData((prev) => ({
      ...prev,
      date: newValue
    }));
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    setBookingData((prev) => ({
      ...prev,
      time: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formattedDate = bookingData.date ? bookingData.date.format('YYYY-MM-DD') : '';
    const formattedTime = bookingData.time ? bookingData.time.format('HH:mm') : '';
    const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" initial-scale=1.0">
      <title>Reservation Confirmation</title>
    </head>
    <body style="font-family: roboto; line-height: 1.6; color: #fff;">
      <h2>Reservation Confirmation</h2>
      <h4>Thank you, <b>${bookingData.name}</b>! Your reservation request for <b>${bookingData.guests}</b>
          guests on <b>${formattedDate}</b> at <b>${formattedTime}</b> has been received. 
      </h4>
      <div style="margin-top: 3px; color: #f59e0b; font-weight: bold;">
        ${bookingData.specialRequest}
      </div>
    </body>
    </html>
    `
    console.log('Booking submitted:', { ...bookingData, date: formattedDate, time: formattedTime });
    await Send_Mail_Service(bookingData.email, htmlMessage);
    alert(`Thank you, ${bookingData.name}! Your reservation request for ${bookingData.guests}
                    guests on ${formattedDate} at ${formattedTime} has been received.`);
    setBookingData({
      name: '',
      email: '',
      phone: '',
      date: null,
      time: null,
      guests: '2',
      specialRequest: ''
    });
  };
  
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
                Join us for an unforgettable seafood experience. Fill out the form below to secure your spot at Native Cave.
              </p>
              <div className="w-20 h-1.5 bg-amber-500 mx-auto mt-8 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      '&:hover fieldset': { borderColor: '#f59e0b' },
                      '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      '&:hover fieldset': { borderColor: '#f59e0b' },
                      '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      '&:hover fieldset': { borderColor: '#f59e0b' },
                      '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      '&:hover fieldset': { borderColor: '#f59e0b' },
                      '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((option) => (
                    <MenuItem key={option} value={option.toString()}>
                      {option} {option === 1 ? 'Guest' : 'Guests'}
                    </MenuItem>
                  ))}
                  <MenuItem value="9+">9+ Guests</MenuItem>
                </TextField>
              </div>

              {/* Date Picker */}
              <div className="col-span-1">
                <DatePicker
                  label="Date"
                  value={bookingData.date}
                  onChange={handleDateChange}
                  shouldDisableDate={shouldDisableDate}
                  minDate={dayjs().startOf('day')}
                  timezone={'Europe/London'}
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
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '16px',
                          '&:hover fieldset': { borderColor: '#f59e0b' },
                          '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                      }
                    }
                  }}
                />
              </div>

              {/* Time Picker */}
              <div className="col-span-1">
                <TimePicker
                  label="Time"
                  views={['hours', 'minutes']}
                  timeSteps={timeValue}
                  value={bookingData.time}
                  onChange={handleTimeChange}
                  timezone={'Europe/London'}
                  minTime={dayjs().set('hour', 1).startOf('hour')}
                  maxTime={dayjs().set('hour', 23).startOf('hour')}
                  disableIgnoringDatePartForTimeValidation = {false}
                  skipDisabled
                  shouldDisableTime={shouldDisableTime}
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
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '16px',
                          '&:hover fieldset': { borderColor: '#f59e0b' },
                          '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                      }
                    }
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
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '16px',
                      '&:hover fieldset': { borderColor: '#f59e0b' },
                      '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 mt-4">
                <Button 
                  fullWidth
                  disabled={!bookingData.specialRequest || !bookingData.name || !bookingData.date || !bookingData.time}
                  type="submit"
                  variant="contained"
                  size="large" 
                  endIcon={<SendIcon />} 
                  sx={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    py: 2,
                    borderRadius: '16px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 10px 20px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#d97706',
                      boxShadow: '0 15px 30px rgba(217, 119, 6, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    }
                  }}
                >
                  Confirm Reservation
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </LocalizationProvider>
  );
};

export { BookingForm };
