/* eslint-disable react/prop-types */
import {
  Box, Flex,
  Text, useColorModeValue,
  Skeleton,
  Badge,
  IconButton,
  theme,
  Button,
  HStack,
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import DynamicTable from "../../Components/DataTable";
import ReactPaginate from 'react-paginate';
import getStatusBadge from "../../Hooks/StatusBadge";
import { HiDownload } from "react-icons/hi";
import { FiEdit, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { daysBack } from "../../Controllers/dateConfig";

const filterRecentData = (data, lastDays) => {
  const lastDay = moment().subtract(lastDays, "days").startOf("day");
  const filterData = data.filter((item) => {
    const createdAt = moment(item.created_at);
    return createdAt.isAfter(lastDay);
  });
  const rearrangedArray = filterData?.map((item) => {
    const {
      id,
      status,
      date,
      time_slots,
      type,
      payment_status,
      patient_f_name,
      patient_l_name,
      doct_f_name,
      doct_l_name,
      doct_image,
    } = item;

    return {
      id: id,
      image: doct_image,
      Doctor: `${doct_f_name} ${doct_l_name}`,
      Patient: `${patient_f_name} ${patient_l_name}`,
      Status: getStatusBadge(status),
      Date: date,
      "Time Slots": time_slots,
      Type:
        type === "Emergency" ? (
          <Badge colorScheme="red">{type}</Badge>
        ) : (
          <Badge colorScheme="green">{type}</Badge>
        ),
      "Payment Status":
        payment_status === "Paid" ? (
          <Badge colorScheme="green">{payment_status}</Badge>
        ) : payment_status === "Refunded" ? (
          <Badge colorScheme="blue">{payment_status}</Badge>
        ) : (
          <Badge colorScheme="red">{"Not Paid"}</Badge>
        ),
    };
  });
  return rearrangedArray.sort((a, b) => b.id - a.id);
};

const sevenDaysBack = moment().subtract(daysBack, "days").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

function AppointmentReg({ Appointments }) {
  const [lastDays, setlastDays] = useState(daysBack);
  const [dateRange, setdateRange] = useState({
    startDate: sevenDaysBack,
    endDate: today,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Filtered and paginated data
  const filteredData = filterRecentData(Appointments || [], lastDays);
  const pageCount = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Custom pagination controls
  const PaginationControls = () => (
    <HStack spacing={3} justify="center" mt={4}>
      <IconButton
        aria-label="Previous"
        icon={<FiChevronLeft />}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
        isDisabled={currentPage === 0}
        colorScheme="blue"
        variant="ghost"
        borderRadius="full"
        size="sm"
        fontSize="20px"
      />
      <Text fontWeight={600} fontSize="md" color={useColorModeValue("gray.700", "gray.200")}>{currentPage + 1} / {pageCount}</Text>
      <IconButton
        aria-label="Next"
        icon={<FiChevronRight />}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1))}
        isDisabled={currentPage === pageCount - 1}
        colorScheme="blue"
        variant="ghost"
        borderRadius="full"
        size="sm"
        fontSize="20px"
      />
    </HStack>
  );

  return (
    <Box
      p={{ base: 3, md: 6 }}
      borderRadius={{ base: 10, md: 16 }}
      maxW={"100%"}
      bg={useColorModeValue("#fff", "gray.900")}
      boxShadow="0 4px 24px 0 rgba(33,86,244,0.10)"
      mb={8}
    >
      <Flex mb={5} justify={{ base: "center", md: "space-between" }} align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="#1E40AF" letterSpacing="0.01em">
          Appointments Made in the Last {lastDays} Days
        </Text>
        <DateRangeCalender
          dateRange={dateRange}
          setDateRange={setdateRange}
          setLastDays={setlastDays}
        />
      </Flex>
      <Box>
        {!Appointments ? (
          <Box>
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} h={10} w={"100%"} mt={2} />
            ))}
          </Box>
        ) : (
          <>
            <Box maxH={80} overflowY={{ base: "auto", md: "scroll" }}>
              <DynamicTable
                minPad={"10px 5px"}
                data={paginatedData}
                onActionClick={<YourActionButton navigate={navigate} />}
              />
            </Box>
            <PaginationControls />
          </>
        )}
      </Box>
    </Box>
  );
}

export default AppointmentReg;

const YourActionButton = ({ rowData, navigate }) => {
  // useColorModeValue must be called at the top level, not inside _hover object
  const greenBg = useColorModeValue("green.50", "green.900");
  const greenColor = useColorModeValue("green.600", "green.300");
  const blueBg = useColorModeValue("blue.50", "blue.900");
  const blueColor = useColorModeValue("blue.600", "blue.300");
  return (
    <Flex justify="center" gap={2}>
      <IconButton
        size="sm"
        variant="ghost"
        aria-label="Download Appointment"
        _hover={{
          background: greenBg,
          color: greenColor,
        }}
        icon={<HiDownload fontSize={18} color={theme.colors.green[500]} />}
        onClick={() => navigate(`/appointment/${rowData.id}`)}
      />
      <IconButton
        size="sm"
        variant="ghost"
        aria-label="Edit Appointment"
        _hover={{
          background: blueBg,
          color: blueColor,
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        onClick={() => navigate(`/appointment/${rowData.id}`)}
      />
    </Flex>
  );
};
