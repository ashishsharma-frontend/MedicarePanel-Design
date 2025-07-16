/* eslint-disable react/prop-types */
import { AiFillEye } from "react-icons/ai";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  Input,
  Skeleton,
  Text,
  theme,
  Tooltip,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useNavigate } from "react-router-dom";
import getStatusBadge from "../../Hooks/StatusBadge";
import { useEffect, useRef, useState } from "react";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import moment from "moment";
import { RefreshCwIcon } from "lucide-react";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { useSelectedClinic } from "../../Context/SelectedClinic";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AppointmentStatusLog() {
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [statusFilters, setStatusFilters] = useState([]); // Track status filters
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { hasPermission } = useHasPermission();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { selectedClinic } = useSelectedClinic();

  const handleStatusChange = (selectedStatuses) => {
    setStatusFilters(selectedStatuses); // Update the state when checkboxes change
  };

  const getData = async () => {
    const url = `get_appointment_status_log?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&status=${statusFilters.join(
      ", "
    )}&doctor_id=${admin.role.name === "Doctor" ? admin.id : ""}&clinic_id=${
      selectedClinic?.id || ""
    }`;

    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        patient_id,
        status,
        created_at,
        f_name,
        l_name,
        notes,
        appointment_id,
      } = item;
      return {
        id: id,
        appointment_id: appointment_id,
        PatientID: `#${patient_id}`,
        Patient: `${f_name} ${l_name}`,
        Status: getStatusBadge(status),
        Date: moment(created_at).format("DD MMM YYYY"),
        Time: moment(created_at).format("hh:mm A"),
        Notes: (
          <Tooltip
            label={notes || "No notes available"}
            aria-label="Notes Tooltip"
          >
            <span>{notes || "No notes available"}</span>
          </Tooltip>
        ),
        filterStatus: status,
      };
    });

    // Filter based on selected statuses
    const filteredData = statusFilters.length
      ? rearrangedArray.filter((item) => {
          return (
            statusFilters.includes(item.filterStatus) ||
            (statusFilters.includes("Cancellation") &&
              item.current_cancel_req_status !== null)
          );
        })
      : rearrangedArray;

    return {
      data: filteredData.sort((a, b) => b.id - a.id),
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error, isFetching, isRefetching } = useQuery({
    queryKey: [
      "appointment-status-log",
      page,
      debouncedSearchQuery,
      statusFilters,
      dateRange,
      selectedClinic?.id,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (!boxRef.current) return;
    const yOffset = -64; // height of your sticky header
    const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("APPOINTMENT_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" w="100%" maxW="1200px" mx="auto" px={{ base: 2, md: 4 }} py={4} pb={{ base: 20, md: 6 }}>
      {/* Heading */}
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Appointment Status Log
      </Text>

      {/* Filters/Search Card */}
      <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 6 }} align={{ base: "stretch", lg: "center" }} justify="space-between">
          <Flex direction={{ base: "column", md: "row" }} gap={3} flex={1} align={{ base: "stretch", md: "center" }}>
            <Input size="md" placeholder="Search by patient or ID..." w={{ base: "100%", md: 350 }} maxW={{ base: "100%", md: "45vw" }} onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} borderColor="gray.300" borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} _hover={{ borderColor: "gray.400" }} />
            <DateRangeCalender dateRange={dateRange} setDateRange={setDateRange} size="md" />
          </Flex>
          <Button size="md" colorScheme="blue" onClick={() => queryClient.invalidateQueries(["appointment-status-log", page, debouncedSearchQuery, statusFilters], { refetchInactive: true })} rightIcon={<RefreshCwIcon size={16} />} fontWeight="600" minW={{ base: "100%", lg: "auto" }} px={6} borderRadius={8} _hover={{ bg: "blue.600" }}>
            Refresh
          </Button>
        </Flex>
        {/* Status Filters */}
        <Flex mt={4} wrap="wrap" gap={3} align="center">
          <CheckboxGroup colorScheme="blue" onChange={handleStatusChange} value={statusFilters}>
            <Flex gap={2} wrap="wrap" align="center">
              {["Confirmed", "Visited", "Completed", "Pending", "Cancelled", "Rejected", "Cancellation Initiated"].map((status) => (
                <Checkbox key={status} value={status} size="md" fontWeight="500" color="gray.700">
                  {status}
                </Checkbox>
              ))}
            </Flex>
          </CheckboxGroup>
        </Flex>
      </Box>

      {/* Table Card */}
      <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
        {isLoading || !data ? (
          <Box>
            <Flex mb={4} justify="space-between">
              <Skeleton w={300} h={8} />
              <Skeleton w={150} h={8} />
            </Flex>
            {[...Array(10)].map((_, index) => (
              <Skeleton key={index} h={10} w="100%" mt={2} borderRadius={4} />
            ))}
          </Box>
        ) : (
          <DynamicTable minPad="10px 15px" data={data.data} onActionClick={<YourActionButton onClick={() => {}} navigate={navigate} />} />
        )}
      </Box>

      {/* Pagination Section */}
      <Flex justify="center" mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} colorScheme="blue" />
      </Flex>
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center">
      {hasPermission("APPOINTMENT_VIEW") && (
        <IconButton
          size="sm"
          variant="ghost"
          onClick={() => {
            onClick(rowData);
            navigate(`/appointment/${rowData.appointment_id}`);
          }}
          icon={<AiFillEye fontSize={18} color={theme.colors.blue[500]} />}
          _hover={{ bg: useColorModeValue("gray.100", "gray.700"), color: "blue.500" }}
          aria-label="View Appointment"
        />
      )}
    </Flex>
  );
};