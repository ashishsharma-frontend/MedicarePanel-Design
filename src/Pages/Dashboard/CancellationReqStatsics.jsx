/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  GridItem,
  Text,
  useColorModeValue,
  Grid,
} from "@chakra-ui/react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaBell, FaTimesCircle } from "react-icons/fa";
import { MdHourglassEmpty } from "react-icons/md";

function CancellationReqStatsics({ data }) {
  const reqData = [
    {
      title: "Cancellation Req Initiated",
      value: data?.total_cancel_req_initiated_appointment || 0,
      icon: <FaBell fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Cancellation Request Processing",
      value: data?.total_cancel_req_processing_appointment || 0,
      icon: <MdHourglassEmpty fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Cancellation Request Approved",
      value: data?.total_cancel_req_approved_appointment || 0,
      icon: <AiOutlineCheckCircle fontSize="32px" />,
      color: "green.500",
    },
    {
      title: "Cancellation Request Rejected",
      value: data?.total_cancel_req_rejected_appointment || 0,
      icon: <FaTimesCircle fontSize="32px" />,
      color: "red.500",
    },
  ];
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={{ base: 4, md: 6 }}
      w="100%"
    >
      {reqData.map((card, index) => (
        <GridItem key={index}>
          <Box
            bg={useColorModeValue("#fff", "gray.900")}
            boxShadow="0 4px 24px 0 rgba(33,86,244,0.10)"
            borderRadius={{ base: 10, md: 16 }}
            p={{ base: 4, md: 6 }}
            transition="all 0.3s ease"
            _hover={{ boxShadow: "0 8px 32px 0 rgba(33,86,244,0.15)", transform: "translateY(-2px) scale(1.02)" }}
            h="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Flex align="center" justify="space-between" gap={4}>
              <Box flex={1}>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight={700}
                  color="#1E40AF"
                  mb={2}
                  letterSpacing="0.01em"
                >
                  {card.title}
                </Text>
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight={800}
                  color={card.color}
                  lineHeight="1.2"
                >
                  {card.value}
                </Text>
              </Box>
              <Flex
                align="center"
                justify="center"
                w={{ base: 14, md: 16 }}
                h={{ base: 14, md: 16 }}
                borderRadius="full"
                bg={getBackgroundColor(card.color)}
                color="white"
                boxShadow="md"
                fontSize={{ base: "2xl", md: "3xl" }}
                transition="all 0.3s ease"
                _hover={{ transform: "scale(1.1)" }}
              >
                {card.icon}
              </Flex>
            </Flex>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
}

// Helper function to get background color based on text color
const getBackgroundColor = (color) => {
  switch (color) {
    case "green.500":
      return "green.500";
    case "red.500":
      return "red.500";
    default:
      return "blue.600";
  }
};

export default CancellationReqStatsics;