/* eslint-disable react/prop-types */
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Box,
  Divider,
  Text,
  theme,
  Tooltip,
  useColorMode,
  useTheme,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

const AppointmentsCalendar = ({ appointmentData }) => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const selectedDate = new Date();
  const navigate = useNavigate();
  const startOfWeek = moment(selectedDate).startOf("month").toDate();

  // Convert appointment data to events format
  const events =
    appointmentData?.map((appointment) => ({
      id: appointment.id,
      title: `Dr. ${appointment.doct_f_name} ${appointment.doct_l_name}'s Appointment with - ${appointment.patient_f_name} ${appointment.patient_l_name} - ${appointment.status}`,
      start: moment(`${appointment.date} ${appointment.time_slots}`).toDate(),
      end: moment(`${appointment.date} ${appointment.time_slots}`)
        .add(30, "minutes") // Assuming each appointment is 30 minutes long
        .toDate(),
      description: `Type: ${appointment.type}, Dept: ${appointment.dept_title}`,
      status: appointment.status,
    })) || [];

  const handleEventClick = (event) => {
    navigate(`/appointment/${event.id}`);
  };

  return (
    <Box
      p={4}
      borderRadius="md"
      boxShadow="md"
      bg={colorMode === "dark" ? theme.colors.gray[900] : "#fff"}
    >
      <Text textAlign={"center"} fontSize={"lg"} fontWeight={"bold"}>
        Appointment Calendar
      </Text>
      <Divider mb={5} mt={2} />

      {appointmentData && (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: 500,
            backgroundColor:
              colorMode === "dark" ? theme.colors.gray[900] : "#fff",
            color: colorMode === "dark" ? "#fff" : "#000",
            borderRadius: "8px",
            border: "none",
          }}
          defaultView="month"
          views={["month", "week", "day", "agenda"]}
          min={
            new Date(
              startOfWeek.getFullYear(),
              startOfWeek.getMonth(),
              startOfWeek.getDate(),
              7,
              0
            )
          } // Start from 7:00 AM
          max={
            new Date(
              startOfWeek.getFullYear(),
              startOfWeek.getMonth(),
              startOfWeek.getDate(),
              18,
              0
            )
          }
          onSelectEvent={handleEventClick} // Add the onClick handler here
          components={{
            event: CustomEvent, // Use the custom event component here
          }}
          eventPropGetter={eventStyleGetter}
          popup // Enable popup for overlapping events
          step={15} // 15-minute steps for better precision
          timeslots={4} // 4 slots per hour
        />
      )}
    </Box>
  );
};
const CustomEvent = ({ event }) => {
  const start = moment(event.start).format("hh:mm A");
  const end = moment(event.end).format("hh:mm A");
  const { colorMode } = useColorMode();

  return (
    <Tooltip
      label={`${event.title} | ${start} - ${end}`}
      hasArrow
      placement="top"
      bg={colorMode === "dark" ? "gray.700" : "gray.100"}
      color={colorMode === "dark" ? "white" : "gray.800"}
      borderRadius="md"
      p={2}
    >
      <Box py={1} px={2}>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="medium"
          noOfLines={1} // Prevent text overflow
        >
          {start} - {event.title}
        </Text>
      </Box>
    </Tooltip>
  );
};

const eventStyleGetter = (event) => {
  const statusColors = {
    Cancelled: theme.colors.red[500], // e.g., "#EF4444"
    Rejected: theme.colors.red[500], // e.g., "#EF4444"
    Pending: theme.colors.orange[500], // e.g., "#F97316"
    Confirmed: theme.colors.green[500], // e.g., "#22C55E"
    Visited: theme.colors.purple[800], // e.g., "#A855F7"
    Default: theme.colors.gray[500],
  };

  const backgroundColor = statusColors[event.status] || statusColors.Default;

  return {
    style: {
      backgroundColor: backgroundColor,
      color: "white",
      borderRadius: "6px",
      border: "none",
      padding: "2px 6px",
      fontSize: "12px",
      cursor: "pointer",
      opacity: 0.9,
      transition: "opacity 0.2s", // Smooth hover effect
      "&:hover": {
        opacity: 1,
      },
    },
  };
};
export default AppointmentsCalendar;
