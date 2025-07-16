/* eslint-disable react/prop-types */
import { Box, Text, useColorModeValue } from "@chakra-ui/react"; // Added useColorModeValue import
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CancellationPieChart = ({ cancelData }) => {
  // Data structure using props
  const data = {
    labels: [
      "Cancel Request Initiated",
      "Cancel Request Rejected",
      "Cancel Request Approved",
      "Cancel Request Processing",
    ],
    datasets: [
      {
        label: "Appointment Cancellations",
        data: [
          cancelData?.total_cancel_req_initiated_appointment || 0,
          cancelData?.total_cancel_req_rejected_appointment || 0,
          cancelData?.total_cancel_req_approved_appointment || 0,
          cancelData?.total_cancel_req_processing_appointment || 0,
        ],
        backgroundColor: [
          "#f39c12", // Color for initiated
          "#e74c3c", // Color for rejected
          "#2ecc71", // Color for approved
          "#3498db", // Color for processing
        ],
        hoverBackgroundColor: [
          "#f39c12aa",
          "#e74c3caa",
          "#2ecc71aa",
          "#3498dbaa",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <Box
      p={{ base: 3, md: 5 }}
      borderRadius={{ base: 10, md: 16 }}
      boxShadow="0 4px 24px 0 rgba(33,86,244,0.10)"
      bg={useColorModeValue("#fff", "#1E293B")}
      w="100%"
      minH="unset"
      mb={4}
    >
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        color="#1E40AF"
        letterSpacing="0.01em"
        mb={4}
        textAlign="left"
      >
        Appointment Cancellation Status
      </Text>
      <Box
        h={{ base: "260px", md: "240px" }}
        w="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg={useColorModeValue("#F9FAFB", "gray.800")}
        borderRadius={{ base: 10, md: 16 }}
        p={{ base: 2, md: 4 }}
      >
        <Doughnut data={data} options={options} />
      </Box>
    </Box>
  );
};

export default CancellationPieChart;