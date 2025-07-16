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
import currency from "../../Controllers/currency";

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const transactionColors = {
  Credited: "#48bb78", // green
  Debited: "#f56565", // red (for debited transactions)
};

const getTransactionTotals = (transactions) => {
  const transactionTotals = {
    Credited: 0,
    Debited: 0, // Changed from Debited to Refunded
  };

  transactions.forEach((transaction) => {
    const type = transaction.transaction_type || "Unknown";
    

    if (type === "Credited" || type === "Debited") {
      // Map Debited to Refunded
      const mappedType = type === "Debited" ? "Debited" : type;
      transactionTotals[mappedType] += transaction.amount;
    }
  });

  return transactionTotals;
};

function TransactionPieChart({ transactions }) {
  const theme = useTheme();

  const transactionTotals = getTransactionTotals(transactions || []);
  

  const chartData = {
    labels: Object.keys(transactionTotals),
    datasets: [
      {
        data: Object.values(transactionTotals),
        backgroundColor: Object.keys(transactionTotals).map(
          (type) => transactionColors[type] || theme.colors.gray[500]
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "50%", // Adjust the cutout for doughnut thickness (half-doughnut)
    rotation: -90, // Start angle (beginning of half-doughnut)
    circumference: 180, // Half circle (180 degrees)
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            return `${currency} ${value.toLocaleString()}`; // Format value as currency
          },
        },
      },
    },
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
        Transaction Total Amount Distribution
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
        <Doughnut data={chartData} options={options} width={50} />
      </Box>
    </Box>
  );
}

export default TransactionPieChart;
