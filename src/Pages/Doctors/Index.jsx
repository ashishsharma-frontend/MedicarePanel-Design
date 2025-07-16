/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  FormControl,
  IconButton,
  Input,
  Skeleton,
  Switch,
  theme,
  useDisclosure,
  useToast,
  Text,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  Avatar,
  Badge,
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import DeleteDoctor from "./Delete";
import { useNavigate } from "react-router-dom";
import useHasPermission from "../../Hooks/HasPermission";
import ShowToast from "../../Controllers/ShowToast";
import NotAuth from "../../Components/NotAuth";
import t from "../../Controllers/configs";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";

const ITEMS_PER_PAGE = 50;

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Doctors() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tabIndex, setTabIndex] = useState(0); // 0: Cards, 1: Table
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const boxRef = useRef(null);
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const navigate = useNavigate();
  const { selectedClinic } = useSelectedClinic();
  const toast = useToast();
  const id = "Errortoast";
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const getData = async () => {
    await t();
    const res = await GET(
      admin.token,
      `get_doctor?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
   
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        user_id,
        image,
        f_name,
        l_name,
        phone,
        email,
        specialization,
        department_name,
        clinic_title,
        active,
        stop_booking,
        clinic_id,
        city_title,
        state_title,
      } = doctor;
      return {
        id: user_id,
        active: <IsActive id={user_id} isActive={active} />,
        "Stop Booking": (
          <StopBooking id={user_id} isStop_booking={stop_booking} />
        ),

        image,
        name: `${f_name} ${l_name}`,
        clinic: `${clinic_title} -#${clinic_id}`,
        phone,
        email,
        specialization,
        dept: department_name,
        city: city_title,
        state: state_title,
      };
    });
    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };
  const { isLoading, data, error } = useQuery({
    queryKey: ["doctors-main", selectedClinic?.id, debouncedSearchQuery],
    queryFn: getData,
  });
  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / ITEMS_PER_PAGE);

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
        title: "oops!.",
        description: "Something bad happens.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("DOCTOR_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" minH="100vh" p={{ base: 2.5, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
            Doctors
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage and track all doctors
          </Text>
        </Box>
        {/* Filters Card */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <CardBody p={{ base: 2.5, md: 6 }}>
            <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <Input
                size="md"
                variant="outline"
                placeholder="Search doctors..."
                w={{ base: "100%", md: 350 }}
                maxW={{ base: "100%", md: "45vw" }}
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                borderColor={borderColor}
                borderRadius="md"
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                _hover={{ borderColor: "gray.400" }}
              />
              <Button
                size="md"
                colorScheme="blue"
                onClick={() => navigate("/doctors/add")}
                isDisabled={!hasPermission("DOCTOR_ADD")}
                fontWeight="600"
                minW={{ base: "100%", lg: "auto" }}
                px={6}
                borderRadius="md"
                _hover={{ bg: "blue.600" }}
              >
                Add New Doctor
              </Button>
            </Flex>
          </CardBody>
        </Card>
        {/* Tabs for Cards/Table View */}
        <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed" colorScheme="blue" mb={2}>
          <TabList>
            <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Cards View</Tab>
            <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Table View</Tab>
          </TabList>
          <TabPanels>
            {/* Cards View */}
            <TabPanel px={0}>
              {isLoading || !data ? (
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={{ base: 5, md: 4 }}>
                  {[...Array(8)].map((_, idx) => (
                    <Skeleton key={idx} h={48} borderRadius="lg" />
                  ))}
                </Grid>
              ) : data?.data?.length ? (
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={{ base: 5, md: 4 }}>
                  {data.data.map((doctor) => (
                    <Card
                      key={doctor.id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={doctor.active === 1 ? "green.300" : "gray.300"}
                      borderRadius="lg"
                      cursor="pointer"
                      transition="all 0.2s ease-in-out"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                        borderColor: "blue.400"
                      }}
                      onClick={(e) => {
                        if (e.target.closest('.doctor-action-btn')) return;
                        navigate(`/doctor/update/${doctor.id}`);
                      }}
                      p={{ base: 2, md: 4 }}
                      mx={{ base: 0.5, md: 0 }}
                    >
                      <CardBody p={0}>
                        <VStack spacing={3} align="stretch">
                          {/* Header with ID Badge and Active */}
                          <Flex justify="space-between" align="center">
                            <Badge colorScheme="purple" py="2px" px="8px" fontSize="xs" borderRadius="none">
                              #{doctor.id}
                            </Badge>
                            <Badge colorScheme={doctor.active === 1 ? "green" : "red"} fontSize="0.8em" px={2} py={1} borderRadius="none">
                              {doctor.active === 1 ? "Active" : "Inactive"}
                            </Badge>
                          </Flex>
                          {/* Image and Name */}
                          <HStack spacing={3} align="center">
                            <Avatar
                              src={doctor.image ? doctor.image : "/admin/profilePicturePlaceholder.png"}
                              size="md"
                              name={doctor.name}
                              bg="blue.500"
                              color="white"
                              border="2px solid #3182ce"
                              fontWeight="bold"
                            />
                            <Box flex={1} minW={0}>
                              <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={1}>
                                {doctor.name}
                              </Text>
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {doctor.dept} | {doctor.specialization}
                              </Text>
                            </Box>
                          </HStack>
                          {/* Bottom details section */}
                          <Divider borderColor={borderColor} mt={4} />
                          <Box px={4} py={3} borderBottomRadius="none" bg={useColorModeValue('gray.50', 'gray.800')}>
                            {/* Horizontally scrollable badges row */}
                            <Box
                              overflowX="auto"
                              whiteSpace="nowrap"
                              sx={{
                                '&::-webkit-scrollbar': { display: 'none' },
                                'scrollbarWidth': 'none',
                                'msOverflowStyle': 'none'
                              }}
                              position="relative"
                              mb={3}
                              pr={8}
                            >
                              <HStack spacing={2} display="inline-flex" minW="max-content">
                                <Badge colorScheme="gray" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  {doctor.clinic}
                                </Badge>
                                <Badge colorScheme="blue" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  Phone: {doctor.phone || "N/A"}
                                </Badge>
                                <Badge colorScheme="teal" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  Email: {doctor.email || "N/A"}
                                </Badge>
                                <Badge colorScheme="purple" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  City: {doctor.city || "N/A"}
                                </Badge>
                                <Badge colorScheme="cyan" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  State: {doctor.state || "N/A"}
                                </Badge>
                              </HStack>
                            </Box>
                            {/* Action buttons on separate line */}
                            <Flex justify="flex-end" gap={2}>
                              <IconButton
                                className="doctor-action-btn"
                                isDisabled={!hasPermission("DOCTOR_UPDATE")}
                                size="sm"
                                variant="ghost"
                                aria-label="Edit"
                                icon={<FiEdit fontSize={18} color="#3182ce" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/doctor/update/${doctor.id}`);
                                }}
                              />
                              <IconButton
                                isDisabled={!hasPermission("DOCTOR_UPDATE")}
                                size="sm"
                                variant="ghost"
                                aria-label="Delete"
                                icon={<FaTrash fontSize={18} color="#e53e3e" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedData(doctor);
                                  DeleteonOpen();
                                }}
                              />
                            </Flex>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
              ) : (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>No doctors found matching your criteria</AlertDescription>
                </Alert>
              )}
            </TabPanel>
            {/* Table View */}
            <TabPanel px={0}>
              {isLoading || !data ? (
                <Box>
                  <Flex mb={5} justify="space-between">
                    <Skeleton w={400} h={8} />
                    <Skeleton w={200} h={8} />
                  </Flex>
                  {[...Array(10)].map((_, index) => (
                    <Skeleton key={index} h={10} w="100%" mt={2} />
                  ))}
                </Box>
              ) : (
                <DynamicTable
                  data={data?.data}
                  onActionClick={<YourActionButton onClick={handleActionClick} navigate={navigate} DeleteonOpen={DeleteonOpen} />}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
        {/* Pagination */}
        <Flex justify="center" mt={6}>
          <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={Math.ceil(data?.total_record / ITEMS_PER_PAGE)} />
        </Flex>
        {/* Delete Modal */}
        {DeleteisOpen && (
          <DeleteDoctor isOpen={DeleteisOpen} onClose={DeleteonClose} data={SelectedData} />
        )}
      </VStack>
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          navigate(`/doctor/update/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={18} color={theme.colors.red[500]} />}
      />
    </Flex>
  );
};

export const IsActive = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.active);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;

          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};
export const StopBooking = ({ id, isStop_booking }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, stop_booking) => {
    let data = { id, stop_booking };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.stop_booking);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isStop_booking === 1}
        size={"sm"}
        onChange={(e) => {
          let stop_booking = e.target.checked ? 1 : 0;

          mutation.mutate({ id, stop_booking });
        }}
      />
    </FormControl>
  );
};
