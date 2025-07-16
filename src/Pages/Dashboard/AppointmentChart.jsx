import { AiOutlineDown } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useTheme,
  HStack,
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const getTransparentColor = (color, alpha) => {
  const rgb = color
    .replace(/^#/, "")
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16));
  return `rgba(${rgb.join(", ")}, ${alpha})`;
};

const getAppointmentsForLast30Days = (appointments, lastDays) => {
  const now = moment();
  const past30Days = moment().subtract(lastDays, "days");

  const appointmentsPerDay = {};

  appointments.forEach((appointment) => {
    const appointmentDate = moment(appointment.date);

    if (appointmentDate.isBetween(past30Days, now, null, "[]")) {
      const day = appointmentDate.format("YYYY-MM-DD");
      if (!appointmentsPerDay[day]) {
        appointmentsPerDay[day] = 0;
      }
      appointmentsPerDay[day]++;
    }
  });

  const dateRange = [];
  let currentDate = past30Days.clone();
  while (currentDate.isBefore(now, "day")) {
    dateRange.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "day");
  }

  const data = dateRange.map((date) => ({
    date,
    count: appointmentsPerDay[date] || 0,
  }));

  return data;
};

function AppointmentChart({
  appointments,
  cancelledAppointments,
  compleatedAppointments,
}) {
  const [lastDays, setlastDays] = useState(15);
  const theme = useTheme();

  // Filter data for the selected range
  const data = getAppointmentsForLast30Days(appointments || [], lastDays);
  const cancelledData = getAppointmentsForLast30Days(
    cancelledAppointments || [],
    lastDays
  );
  const compleatedData = getAppointmentsForLast30Days(
    compleatedAppointments || [],
    lastDays
  );

  const allDates = new Set([
    ...data.map((d) => d.date),
    ...cancelledData.map((d) => d.date),
  ]);
  const sortedDates = Array.from(allDates).sort();

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "All",
        data: sortedDates.map(
          (date) => data.find((d) => d.date === date)?.count || 0
        ),
        borderColor: theme.colors.blue[500],
        backgroundColor: getTransparentColor(theme.colors.blue[500], 0.1),
        borderWidth: 2,
        fill: "origin",
        tension: 0.4,
      },
      {
        label: "Cancelled",
        data: sortedDates.map(
          (date) => cancelledData.find((d) => d.date === date)?.count || 0
        ),
        borderColor: theme.colors.red[500],
        backgroundColor: getTransparentColor(theme.colors.red[500], 0.1),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Compleated",
        data: sortedDates.map(
          (date) => compleatedData.find((d) => d.date === date)?.count || 0
        ),
        borderColor: theme.colors.green[500],
        backgroundColor: getTransparentColor(theme.colors.green[500], 0.1),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "xy",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: useColorModeValue(theme.colors.gray[600], theme.colors.gray[400]),
          font: { size: 14 },
          boxWidth: 15,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: useColorModeValue("white", "gray.800"),
        titleColor: useColorModeValue("gray.900", "white"),
        bodyColor: useColorModeValue("gray.700", "gray.300"),
        borderColor: useColorModeValue("gray.200", "gray.700"),
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: lastDays > 179 ? "month" : lastDays > 89 ? "week" : "day",
        },
        border: { color: useColorModeValue(theme.colors.gray[300], theme.colors.gray[600]) },
        grid: {
          color: useColorModeValue(theme.colors.gray[100], theme.colors.gray[700]),
          borderDash: [5, 5],
        },
        ticks: {
          color: useColorModeValue(theme.colors.gray[600], theme.colors.gray[400]),
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        border: { color: useColorModeValue(theme.colors.gray[300], theme.colors.gray[600]) },
        grid: {
          color: useColorModeValue(theme.colors.gray[100], theme.colors.gray[700]),
          borderDash: [5, 5],
        },
        ticks: {
          color: useColorModeValue(theme.colors.gray[600], theme.colors.gray[400]),
          beginAtZero: true,
          stepSize: 1,
        },
      },
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement.length ? "pointer" : "default";
    },
  };

  return (
    <Box
      p={{ base: 3, md: 6 }}
      borderRadius={{ base: 1, md: 16 }}
      maxW={"100%"}
      bg={useColorModeValue("#fff", "gray.900")}
      mb={1}
    >
      <Flex mb={3} justify={{ base: "center", md: "space-between" }} align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="#1E40AF" letterSpacing="0.01em">
          Appointments Overview
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<AiOutlineDown />}
            colorScheme="blue"
            borderRadius="8px"
            fontWeight={500}
            fontSize="15px"
            px={5}
            py={2}
            variant="outline"
            _hover={{ bg: useColorModeValue("blue.50", "blue.800") }}
            _active={{ bg: useColorModeValue("blue.100", "blue.700") }}
          >
            {`Last ${lastDays} Days`}
          </MenuButton>
          <MenuList
            minW={{ base: "100%", md: "200px" }}
            borderRadius={{ base: 8, md: 10 }}
            boxShadow="2xl"
            bg={useColorModeValue("white", "gray.800")}
            borderColor={useColorModeValue("gray.200", "gray.700")}
            zIndex={1000}
          >
            {[15, 30, 90, 180, 365].map((item) => (
              <MenuItem
                key={item}
                bg={item === lastDays ? useColorModeValue("blue.50", "blue.900") : "transparent"}
                _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                fontSize={{ base: "md", md: "lg" }}
                px={{ base: 4, md: 6 }}
                py={{ base: 2, md: 3 }}
                onClick={() => setlastDays(item)}
              >
                Last {item} Days
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>
      <Box
        h={{ base: "250px", md: "400px" }}
        w="100%"
        overflow="hidden"
        position="relative"
        mt={5}
        pt={5}
        pb={0}
        px={2}
        borderRadius={{ base: 10, md: 16 }}
        bg={useColorModeValue("#F9FAFB", "gray.800")}
      >
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
}

export default AppointmentChart;