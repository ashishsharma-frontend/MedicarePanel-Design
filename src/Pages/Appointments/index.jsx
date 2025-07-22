/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Grid,
  Input,
  Skeleton,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  HStack,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useNavigate } from "react-router-dom";
import getStatusBadge from "../../Hooks/StatusBadge";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import AddNewAppointment from "./AddNewAppointment";
import { useEffect, useRef, useState } from "react";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { RefreshCwIcon } from "lucide-react";
import t from "../../Controllers/configs";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import getStatusColor from "../../Hooks/GetStatusColor";
import imageBaseURL from "../../Controllers/image";
import moment from "moment";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Appointments() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [statusFilters, setStatusFilters] = useState([]);
  const [typeFilters, settypeFilters] = useState([]);
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { hasPermission } = useHasPermission();
  const queryClient = useQueryClient();
  const { selectedClinic } = useSelectedClinic();
  const [cacellationReq, setCacellationReq] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
  });
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "gray.700");

  const handleStatusChange = (selectedStatuses) => {
    setStatusFilters(selectedStatuses || "");
  };
  const handleCancellationChange = (selectedStatuses) => {
    setCacellationReq(selectedStatuses || "");
  };
  const handleTypeChange = (selectedType) => {
    settypeFilters(selectedType || "");
  };

  const getData = async () => {
    const url = `get_appointments?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&status=${statusFilters.join(
      ", "
    )}&type=${typeFilters.join(
      ", "
    )}&current_cancel_req_status=${cacellationReq.join(", ")}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    await t();
    const res = await GET(admin.token, url);

    return {
      total_record: res.total_record,
      maindata: res.data,
    };
  };

  const { isLoading, data, error, isFetching, isRefetching } = useQuery({
    queryKey: [
      "appointments",
      page,
      debouncedSearchQuery,
      JSON.stringify(statusFilters),
      JSON.stringify(typeFilters),
      JSON.stringify(cacellationReq),
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
    const yOffset = -64;
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
    <Box ref={boxRef} scrollMarginTop="64px" bg={bgColor} minH="100vh" p={{ base: 1, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
            Appointments
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage and track all appointment bookings
          </Text>
        </Box>

        {/* Filters Card */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <CardBody p={{ base: 2.5, md: 6 }}>
            <VStack spacing={5} align="stretch">
              {/* Search, Date Range, and Add Button - Responsive */}
              <Box w="100%">
                <VStack spacing={3} align="stretch" w="100%" display={{ base: "flex", lg: "none" }}>
                  <Input
                    size="md"
                    variant="outline"
                    placeholder="Search appointments..."
                    w="100%"
                    onChange={(e) => setsearchQuery(e.target.value)}
                    value={searchQuery}
                    borderColor={borderColor}
                    borderRadius="md"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                    _hover={{ borderColor: "gray.400" }}
                  />
                  <DateRangeCalender
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    size="md"
                  />
                  <Button
                    size="md"
                    colorScheme="blue"
                    onClick={onOpen}
                    isDisabled={!hasPermission("APPOINTMENT_ADD")}
                    fontWeight="600"
                    w="100%"
                    borderRadius="md"
                    _hover={{ bg: "blue.600" }}
                  >
                    Add New Appointment
                  </Button>
                </VStack>
                <Flex
                  direction={{ base: "row", lg: "row" }}
                  gap={4}
                  align={{ base: "stretch", lg: "center" }}
                  justify="space-between"
                  display={{ base: "none", lg: "flex" }}
                >
                  <HStack spacing={4} flex={1}>
                    <Input
                      size="md"
                      variant="outline"
                      placeholder="Search appointments..."
                      w={{ base: "100%", md: 350 }}
                      maxW={{ base: "100%", md: "45vw" }}
                      onChange={(e) => setsearchQuery(e.target.value)}
                      value={searchQuery}
                      borderColor={borderColor}
                      borderRadius="lg"
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                      _hover={{ borderColor: "gray.400" }}
                    />
                    <DateRangeCalender
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                      size="md"
                    />
                  </HStack>
                  <Button
                    size="md"
                    colorScheme="blue"
                    onClick={onOpen}
                    isDisabled={!hasPermission("APPOINTMENT_ADD")}
                    fontWeight="600"
                    minW={{ base: "100%", lg: "auto" }}
                    px={6}
                    borderRadius="lg"
                    _hover={{ bg: "blue.600" }}
                  >
                    Add New Appointment
                  </Button>
                </Flex>
              </Box>

              {/* Filters as Tabs */}
              <Tabs variant="enclosed" colorScheme="blue" mb={4}>
                <TabList>
                  <Tab>Status</Tab>
                  <Tab>Cancellation Status</Tab>
                  <Tab>Type</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <CheckboxGroup colorScheme="blue" onChange={handleStatusChange} value={statusFilters}>
                      <Flex direction={{ base: "column", sm: "row" }} gap={3} wrap="wrap">
                        {['Confirmed', 'Visited', 'Completed', 'Pending', 'Cancelled', 'Rejected'].map((status) => (
                          <Checkbox key={status} value={status} size="md">
                            {status}
                          </Checkbox>
                        ))}
                      </Flex>
                    </CheckboxGroup>
                  </TabPanel>
                  <TabPanel>
                    <CheckboxGroup colorScheme="blue" onChange={handleCancellationChange} value={cacellationReq}>
                      <Flex direction={{ base: "column", sm: "row" }} gap={3} wrap="wrap">
                        {['Initiated', 'Processing', 'Approved', 'Rejected'].map((status) => (
                          <Checkbox key={status} value={status} size="md">
                            {status}
                          </Checkbox>
                        ))}
                      </Flex>
                    </CheckboxGroup>
                  </TabPanel>
                  <TabPanel>
                    <CheckboxGroup colorScheme="blue" onChange={handleTypeChange} value={typeFilters}>
                      <Flex direction={{ base: "column", sm: "row" }} gap={3} wrap="wrap">
                        {['OPD', 'Video Consultant', 'Emergency'].map((type) => (
                          <Checkbox key={type} value={type} size="md">
                            {type}
                          </Checkbox>
                        ))}
                      </Flex>
                    </CheckboxGroup>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {/* Refresh Button */}
              <Flex justify="flex-end">
                <Button 
                  isLoading={isFetching || isRefetching} 
                  size="md" 
                  colorScheme="blue" 
                  variant="outline" 
                  onClick={() => { 
                    queryClient.invalidateQueries(["appointments", page, debouncedSearchQuery, statusFilters], { refetchInactive: true }); 
                  }} 
                  rightIcon={<RefreshCwIcon size={16} />} 
         
                >
                  Refresh
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Card View Only (remove Table View/tabs) */}
        <Box>
          {isLoading || !data ? (
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={{ base: 4, md: 6 }}>
              {[...Array(12)].map((_, index) => (
                <Skeleton key={index} h={48} borderRadius="lg" />
              ))}
            </Grid>
          ) : data?.maindata?.length ? (
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={{ base: 4, md: 6 }}>
              {data?.maindata?.map((appointment) => (
                <Card
                  key={appointment.id}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={getStatusColor(appointment.status)}
                  borderRadius="lg"
                  cursor="pointer"
                  transition="all 0.2s ease-in-out"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                    borderColor: "blue.400"
                  }}
                  onClick={() => navigate(`/appointment/${appointment.id}`)}
                  p={{ base: 2, md: 4 }}
                  mx={{ base: 0.5, md: 0 }}
                >
                  <CardBody p={0}>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Badge colorScheme="purple" py="2px" px="8px" fontSize="xs" borderRadius="md">
                          #{appointment.id}
                        </Badge>
                        {getStatusBadge(appointment.status)}
                      </Flex>
                      <HStack spacing={3} align="center">
                        <Avatar 
                          src={`${imageBaseURL}/${appointment.doct_image}`} 
                          size="md"
                          name={`${appointment.doct_f_name} ${appointment.doct_l_name}`}
                        />
                        <Box flex={1}>
                          <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={1}>
                            Dr. {appointment.doct_f_name} {appointment.doct_l_name}
                          </Text>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {appointment.patient_f_name} {appointment.patient_l_name}
                          </Text>
                        </Box>
                      </HStack>
                      <Divider borderColor="gray.200" />
                      <HStack justify="space-between" align="center">
                        <Text fontSize="sm" fontWeight="500" color="green.600">
                          {appointment.date}
                        </Text>
                        <Text fontSize="sm" fontWeight="500" color="green.600">
                          {appointment.time_slots}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" align="center">
                        <Text fontSize="sm">
                          {appointment.type === "Emergency" ? (
                            <Badge colorScheme="red" py="2px" px="6px" fontSize="xs">
                              {appointment.type}
                            </Badge>
                          ) : appointment.type === "Video Consultant" ? (
                            <Badge colorScheme="purple" py="2px" px="6px" fontSize="xs">
                              {appointment.type}
                            </Badge>
                          ) : (
                            <Badge colorScheme="green" py="2px" px="6px" fontSize="xs">
                              {appointment.type}
                            </Badge>
                          )}
                        </Text>
                        <Text fontSize="sm">
                          {appointment?.payment_status === "Paid" ? (
                            <Badge colorScheme="green" py="2px" px="6px" fontSize="xs">
                              {appointment.payment_status}
                            </Badge>
                          ) : appointment.payment_status === "Refunded" ? (
                            <Badge colorScheme="blue" py="2px" px="6px" fontSize="xs">
                              {appointment.payment_status}
                            </Badge>
                          ) : (
                            <Badge colorScheme="red" py="2px" px="6px" fontSize="xs">
                              Not Paid
                            </Badge>
                          )}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" align="center">
                        <Text fontSize="xs" fontWeight="500" color="gray.600">
                          Clinic: #{appointment.clinic_id}
                        </Text>
                        {getCancellationStatusBadge(appointment.current_cancel_req_status)}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          ) : (
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>No appointments found matching your criteria</AlertDescription>
            </Alert>
          )}
        </Box>

        {/* Pagination */}
        {data?.maindata?.length > 0 && (
          <Flex justify="center" mt={6}>
            <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} />
          </Flex>
        )}
      </VStack>

      {/* Add New Appointment Modal */}
      {isOpen && <AddNewAppointment isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
}
