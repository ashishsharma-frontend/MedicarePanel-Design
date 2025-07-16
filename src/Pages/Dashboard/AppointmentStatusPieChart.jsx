/* eslint-disable react/prop-types */
import { Doughnut } from "react-chartjs-2";
import { Box, Text, useTheme } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const statusColors = {
  Pending: "#f6e05e", // yellow
  Confirmed: "#48bb78", // green
  Rejected: "#f56565", // red
  Cancelled: "red", // red
  Completed: "#3182ce", // blue
  Rescheduled: "#ed8936", // orange
  Visited: "#805ad5", // purple
  Unknown: "gray", // purple
};

const getStatusCounts = (appointments) => {
  const statusCounts = {
    Pending: 0,
    Confirmed: 0,
    Rejected: 0,
    Cancelled: 0,
    Completed: 0,
    Rescheduled: 0,
    Visited: 0,
    Unknown: 0,
  };

  appointments.forEach((appointment) => {
    const status = appointment.status || "Unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return statusCounts;
};

function StatusPieChart({ appointments }) {
  const theme = useTheme();

  const statusCounts = getStatusCounts(appointments || []);
  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(
          (status) => statusColors[status] || theme.colors.gray[500]
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box
      p={{ base: 3, md: 6 }}
      borderRadius={{ base: 10, md: 16 }}
      maxW={"100%"}
      bg={theme.colors.white || "#fff"}
      boxShadow="0 4px 24px 0 rgba(33,86,244,0.10)"
      mb={4}
    >
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        color="#1E40AF"
        letterSpacing="0.01em"
        mb={6}
      >
        Appointment Status Distribution
      </Text>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="100%"
        minH={{ base: "220px", md: "300px" }}
        p={{ base: 2, md: 4 }}
        bg={theme.colors.gray[50] || "#F9FAFB"}
        borderRadius={{ base: 10, md: 16 }}
      >
        <Doughnut data={chartData} />
      </Box>
    </Box>
  );
}

export default StatusPieChart;
