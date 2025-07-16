import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Text,
  Card,
  CardBody,
  Heading,
  HStack,
  VStack,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { FiEdit, FiPlus, FiSearch } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useNavigate } from "react-router-dom";
import getStatusBadge from "../../Hooks/StatusBadge";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import { useEffect, useRef, useState } from "react";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AddNewAppointment from "../Appointments/AddNewAppointment";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function DoctAppointments({ doctID }) {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [statusFilters, setStatusFilters] = useState([]); // Track status filters
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { hasPermission } = useHasPermission();

  const handleStatusChange = (selectedStatuses) => {
    setStatusFilters(selectedStatuses); // Update the state when checkboxes change
  };

  const getData = async () => {
    const url = `get_appointments?doctor_id=${doctID}&start=${startIndex}&end=${endIndex}`;
    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        status,
        date,
        time_slots,
        type,
        payment_status,
        current_cancel_req_status,
        patient_f_name,
        patient_l_name,
        patient_phone,
        doct_f_name,
        doct_l_name,
        doct_image,
        source,
      } = item;

      return {
        id: id,
        image: doct_image,
        Doctor: `${doct_f_name} ${doct_l_name}`,
        Patient: `${patient_f_name} ${patient_l_name}`,
        phone: patient_phone,
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
        "Cancellation Status": getCancellationStatusBadge(
          current_cancel_req_status
        ),
        source,
        status: status, // Add status field for filtering
        filterStatus: status,
        current_cancel_req_status: current_cancel_req_status,
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

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "appointments",
      page,
      debouncedSearchQuery,
      statusFilters,
      doctID,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
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
    <Box ref={boxRef} mt={5}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {/* Loading skeletons */}
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
        </Box>
      ) : (
        <Box>
          {/* Header Section */}
          <Card mb={6} borderRadius="xl" boxShadow="sm" bg="white">
            <CardBody p={6}>
              <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={4}>
                <Box>
                  <Heading as="h3" size="md" color="#162D5D" mb={2}>
                    Doctor Appointments
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Manage and view all appointments for this doctor
                  </Text>
                </Box>
                <Button
                  size="md"
                  colorScheme="blue"
                  onClick={() => {
                    onOpen();
                  }}
                  leftIcon={<FiPlus />}
                  borderRadius="lg"
                  _hover={{ bg: "blue.600" }}
                  boxShadow="0 2px 8px 0 rgba(37,99,235,0.10)"
                >
                  Add New Appointment
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Card borderRadius="xl" boxShadow="sm" bg="white">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">Total Appointments</StatLabel>
                  <StatNumber color="#162D5D" fontSize="2xl">{data?.total_record || 0}</StatNumber>
                  <StatHelpText color="green.500" fontSize="xs">All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card borderRadius="xl" boxShadow="sm" bg="white">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">Current Page</StatLabel>
                  <StatNumber color="#162D5D" fontSize="2xl">{data?.data?.length || 0}</StatNumber>
                  <StatHelpText color="blue.500" fontSize="xs">Showing {startIndex + 1}-{Math.min(endIndex + 1, data?.total_record || 0)}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card borderRadius="xl" boxShadow="sm" bg="white">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">Active Filters</StatLabel>
                  <StatNumber color="#162D5D" fontSize="2xl">{statusFilters.length}</StatNumber>
                  <StatHelpText color="purple.500" fontSize="xs">{statusFilters.length > 0 ? statusFilters.join(", ") : "No filters"}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Search and Filters */}
          <Card mb={6} borderRadius="xl" boxShadow="sm" bg="white">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Flex direction={{ base: "column", md: "row" }} gap={4} align={{ base: "stretch", md: "center" }}>
                  <Box flex={1}>
                    <Text fontWeight="semibold" color="#374151" mb={2} fontSize="sm">
                      Search Appointments
                    </Text>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.400" />
                      </InputLeftElement>
                      <Input
                        size="md"
                        placeholder="Search by patient name, phone, or appointment details..."
                        w="100%"
                        maxW="100%"
                        onChange={(e) => setsearchQuery(e.target.value)}
                        value={searchQuery}
                        borderRadius="lg"
                        bg="#F8FAFC"
                        _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                      />
                    </InputGroup>
                  </Box>
                </Flex>

                <Divider />

                <Box>
                  <Text fontWeight="semibold" color="#374151" mb={3} fontSize="sm">
                    Filter by Status
                  </Text>
                  <CheckboxGroup
                    colorScheme="blue"
                    onChange={handleStatusChange}
                    value={statusFilters}
                  >
                    <Flex direction={{ base: "column", sm: "row" }} gap={4} flexWrap="wrap">
                      <Checkbox value="Confirmed" borderRadius="md">Confirmed</Checkbox>
                      <Checkbox value="Visited" borderRadius="md">Visited</Checkbox>
                      <Checkbox value="Completed" borderRadius="md">Completed</Checkbox>
                      <Checkbox value="Pending" borderRadius="md">Pending</Checkbox>
                      <Checkbox value="Cancelled" borderRadius="md">Cancelled</Checkbox>
                      <Checkbox value="Rejected" borderRadius="md">Rejected</Checkbox>
                      <Checkbox value="Cancellation" borderRadius="md">Cancellation Initiated</Checkbox>
                    </Flex>
                  </CheckboxGroup>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Data Table */}
          <Card borderRadius="xl" boxShadow="sm" bg="white" overflow="hidden">
            <CardBody p={0}>
              <DynamicTable
                minPad="10px 10px"
                data={data?.data}
                onActionClick={
                  <YourActionButton onClick={() => {}} navigate={navigate} />
                }
              />
            </CardBody>
          </Card>
        </Box>
      )}

      <Flex justify={"center"} mt={6}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>

      {/* Add New Appointment */}
      {isOpen && <AddNewAppointment isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isdisabled={!hasPermission("APPOINTMENT_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          navigate(`/appointment/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
