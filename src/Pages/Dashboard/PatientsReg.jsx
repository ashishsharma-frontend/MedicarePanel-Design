/* eslint-disable react/prop-types */
import {
  Box, Flex,
  Text, useColorModeValue,
  Skeleton
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import DynamicTable from "../../Components/DataTable";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { daysBack } from "../../Controllers/dateConfig";

const filterRecentData = (data, lastDays) => {
  const lastDay = moment().subtract(lastDays, "days").startOf("day");
  const filterData = data.filter((item) => {
    const createdAt = moment(item.created_at);
    return createdAt.isAfter(lastDay);
  });
  return filterData.map((item) => ({
    id: item.id,
    image: item.image,
    name: `${item.f_name} ${item.l_name}`,
    phone: item.phone,
    gender: item.gender,
  }));
};

const sevenDaysBack = moment().subtract(daysBack, "days").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

function PatientsReg({ Patients }) {
  const [lastDays, setlastDays] = useState(daysBack);
  const [dateRange, setdateRange] = useState({
    startDate: sevenDaysBack,
    endDate: today,
  });

  return (
    <Box
      p={5}
      borderRadius={12}
      maxW="100%"
      bg={useColorModeValue("#fff", "gray.900")}
      boxShadow="sm"
      minH="220px"
      mb={2}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      <Flex
        mb={3}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        gap={3}
        direction={{ base: "column", sm: "row" }}
      >
        <Text
          fontSize="md"
          fontWeight={600}
          color="#2156F4"
          mb={1}
        >
          Patients Registration in the Last {lastDays} Days
        </Text>
        <Box minW={{ base: "100%", sm: "auto" }}>
          <DateRangeCalender
            dateRange={dateRange}
            setDateRange={setdateRange}
            setLastDays={setlastDays}
          />
        </Box>
      </Flex>
      <Box mt={2}>
        {!Patients ? (
          <Box>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} h={10} w="100%" mt={2} borderRadius="lg" />
            ))}
          </Box>
        ) : (
          <Box
            maxH={{ base: "180px", md: "240px" }}
            overflowY="auto"
            sx={{
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { background: "#E8EAF6", borderRadius: "8px" },
            }}
            p={1}
          >
            <DynamicTable
              minPad="10px 5px"
              data={filterRecentData(Patients, lastDays)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default PatientsReg;