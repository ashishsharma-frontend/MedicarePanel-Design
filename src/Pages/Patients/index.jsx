/* eslint-disable react/prop-types */
import {
  Box,
  Button,
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
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import AddPatients from "./AddPatients";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import AddRefer from "../Patient Refer/AddRefer";
import { FaTrash } from "react-icons/fa";
import DeletePatient from "./DeletePatient";
import imageBaseURL from "../../Controllers/image";

const ITEMS_PER_PAGE = 50;

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

const transformData = (data) => {
  return data?.map((item) => {
    const { id, f_name, l_name, phone, gender, dob, age, email, image, created_at, city, address } =
      item;
    console.log("Raw patient data from API:", item);
    console.log("Age from API:", age, "Type:", typeof age);
    console.log("City from API:", city, "Type:", typeof city);
    console.log("Address from API:", address, "Type:", typeof address);
    return {
      id,
      name: `${f_name} ${l_name}`,
      phone,
      gender,
      date_Of_Birth: dob ? moment(dob).format("DD MMM YYYY") : "N/A",
      age,
      email: email || "N/A",
      city: city || "N/A",
      address: address || "N/A",
      image,
      created_At: moment(created_at).format("DD MMM YYYY hh:mm a"),
    };
  });
};

const Patients = () => {
  const { hasPermission } = useHasPermission();
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabIndex, setTabIndex] = useState(0); // 0: Cards, 1: Table
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const { selectedClinic } = useSelectedClinic();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: referisOpen,
    onOpen: referonOpen,
    onClose: referonClose,
  } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const { isLoading, data, error } = useQuery({
    queryKey: ["patients", page, debouncedSearchQuery, selectedClinic?.id],
    queryFn: async () => {
      const res = await GET(
        admin.token,
        `get_patients?start=${startIndex}&end=${endIndex}&clinic_id=${
          selectedClinic?.id || ""
        }&search=${debouncedSearchQuery}`
      );
      return { data: res.data, totalRecord: res.total_record };
    },
  });

  const handlePageChange = (newPage) => setPage(newPage);

  useEffect(() => {
    if (boxRef.current) {
      const yOffset = -64; // height of your sticky header
      const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [page]);

  useEffect(() => {
    if (error && !toast.isActive("Errortoast")) {
      toast({
        id: "Errortoast",
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }, [error, toast]);

  const transformedData = transformData(data?.data);
  const totalPage = Math.ceil(data?.totalRecord / ITEMS_PER_PAGE);
  const handleActionClick = (rowData) => setSelectedData(rowData);

  if (!hasPermission("PATIENT_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" minH="100vh" p={{ base: 2.5, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
            Patients
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage and track all patients
          </Text>
        </Box>

        {/* Filters Card */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <CardBody p={{ base: 2.5, md: 6 }}>
            <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <Input
                size="md"
                variant="outline"
                placeholder="Search patients..."
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
                onClick={onOpen}
                isDisabled={!hasPermission("PATIENT_ADD")}
                fontWeight="600"
                minW={{ base: "100%", lg: "auto" }}
                px={6}
                borderRadius="md"
                _hover={{ bg: "blue.600" }}
              >
                Add New Patient
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
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
                  {[...Array(8)].map((_, idx) => (
                    <Skeleton key={idx} h={48} borderRadius="lg" />
                  ))}
                </Grid>
              ) : data?.data?.length ? (
                <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={{ base: 2, md: 4 }}>
                  {data.data.map((patient) => {
                    console.log("Patient data for card:", patient);
                    console.log("Patient city for card:", patient.city);
                    console.log("Patient address for card:", patient.address);
                    return (
                      <Card
                        key={patient.id}
                        bg={cardBg}
                        border="1px solid"
                        borderColor="gray.300"
                        borderRadius="lg"
                        cursor="pointer"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                          borderColor: "blue.400"
                        }}
                        onClick={() => navigate(`/patient/${patient.id}`)}
                        p={{ base: 2, md: 4 }}
                        mx={{ base: 0.5, md: 0 }}
                      >
                        <CardBody p={0}>
                          <VStack spacing={3} align="stretch">
                            {/* Header with ID Badge and Gender */}
                            <Flex justify="space-between" align="center">
                              <Badge colorScheme="purple" py="2px" px="8px" fontSize="xs" borderRadius="none">
                                #{patient.id}
                              </Badge>
                              <Badge colorScheme={patient.gender === "Male" ? "blue" : "pink"} fontSize="0.8em" px={2} py={1} borderRadius="none">
                                {patient.gender}
                              </Badge>
                            </Flex>
                            {/* Image and Name */}
                            <HStack spacing={3} align="center">
                              <Avatar
                                src={patient.image ? imageBaseURL + patient.image : "/admin/profilePicturePlaceholder.png"}
                                size="md"
                                name={`${patient.f_name} ${patient.l_name}`}
                                bg="purple.500"
                                color="white"
                                border="2px solid #805ad5"
                                fontWeight="bold"
                              />
                              <Box flex={1} minW={0}>
                                <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={1}>
                                  {patient.f_name} {patient.l_name}
                                </Text>
                                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                  {patient.phone}
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
                                    DOB: {patient.dob ? moment(patient.dob).format("DD MMM YYYY") : "N/A"}
                                  </Badge>
                                  <Badge colorScheme="green" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                    Age: {patient.age || "N/A"}
                                  </Badge>
                                  <Badge colorScheme="blue" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                    Email: {patient.email || "N/A"}
                                  </Badge>
                                  <Badge colorScheme="purple" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                    City: {patient.city || "N/A"}
                                  </Badge>
                                  <Badge colorScheme="orange" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                    Address: {patient.address || "N/A"}
                                  </Badge>
                                  <Badge colorScheme="teal" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                    Created: {moment(patient.created_at).format("DD MMM YYYY")}
                                  </Badge>
                                </HStack>
                              </Box>
                              {/* Action buttons on separate line */}
                              <Flex justify="flex-end" gap={2}>
                                <IconButton
                                  isDisabled={!hasPermission("PATIENT_UPDATE")}
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Refer"
                                  colorScheme="orange"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedData(patient);
                                    referonOpen();
                                  }}
                                >
                                  Refer
                                </IconButton>
                                <IconButton
                                  isDisabled={!hasPermission("PATIENT_UPDATE")}
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Edit"
                                  icon={<FiEdit fontSize={18} color="#3182ce" />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/patient/${patient.id}`);
                                  }}
                                />
                                <IconButton
                                  isDisabled={!hasPermission("PATIENT_DELETE")}
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Delete"
                                  icon={<FaTrash fontSize={18} color="#e53e3e" />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedData(patient);
                                    DeleteonOpen();
                                  }}
                                />
                              </Flex>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </Grid>
              ) : (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>No patients found matching your criteria</AlertDescription>
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
                  imgLast={true} 
                  minPad="1px 20px" 
                  data={transformedData} 
                  onActionClick={<YourActionButton onClick={handleActionClick} navigate={navigate} rowData={selectedData} onOpen={referonOpen} DeleteonOpen={DeleteonOpen} />} 
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Pagination */}
        <Flex justify="center" mt={6}>
          <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} />
        </Flex>
      </VStack>

      {/* Modals */}
      <AddPatients isOpen={isOpen} onClose={onClose} />
      {referisOpen ? <AddRefer isOpen={referisOpen} onClose={referonClose} patient={selectedData} /> : null}
      {DeleteisOpen && <DeletePatient isOpen={DeleteisOpen} onClose={DeleteonClose} data={selectedData} />}
    </Box>
  );
};

const SkeletonList = () => (
  <Box>
    <Flex mb={5} justify="space-between">
      <Skeleton w={400} h={8} />
      <Skeleton w={200} h={8} />
    </Flex>
    {Array.from({ length: 10 }).map((_, index) => (
      <Skeleton key={index} h={10} w="100%" mt={2} />
    ))}
  </Box>
);

const YourActionButton = ({
  onClick,
  rowData,
  navigate,
  onOpen,
  DeleteonOpen,
}) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center" align={"center"} gap={2}>
      <Button
        isDisabled={!hasPermission("PATIENT_UPDATE")}
        size="xs"
        onClick={() => {
          onClick(rowData);
          onOpen();
        }}
        colorScheme="orange"
      >
        Refer
      </Button>
      <IconButton
        isDisabled={!hasPermission("PATIENT_UPDATE")}
        size="sm"
        variant="ghost"
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          navigate(`/patient/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("PATIENT_DELETE")}
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

export default Patients;
