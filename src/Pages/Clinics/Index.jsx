/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  Text,
  useDisclosure,
  useToast,
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
  IconButton,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  Switch,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import ShowToast from "../../Controllers/ShowToast";
import NotAuth from "../../Components/NotAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import DeleteClinic from "./DeleteClinic";
import imageBaseURL from "../../Controllers/image";
const ITEMS_PER_PAGE = 50;

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Clinics() {
  const { hasPermission } = useHasPermission();
  const [selectedData, setSelectedData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tabIndex, setTabIndex] = useState(0); // 0: Cards, 1: Table
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const boxRef = useRef(null);
  const { selectedClinic } = useSelectedClinic();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_clinic_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
        admin?.role?.name?.toLowerCase() === "super admin"
          ? selectedClinic?.id
          : selectedClinic?.id || ""
      }`
    );
    let data = res.data;
    console.log(data);
    const FormatedData = data?.map((item) => {
      const {
        image,
        id,
        title,
        active,
        updated_at,
        city_title,
        state_title,
        phone,
        address,
      } = item;
      return {
        image,
        id,
        active: <IsActive id={id} isActive={active} />,
        title,
        phone,
        address,
        City: city_title,
        State: state_title,
        updated_at,
      };
    });
    return {
      data,
      formattedData: FormatedData,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "clinics",
      "main-clinics",
      debouncedSearchQuery,
      page,
      selectedClinic,
    ],
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
    if (boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
  }

  if (!hasPermission("CLINIC_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" minH="100vh" p={{ base: 2.5, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
            Clinics
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage and track all clinics
          </Text>
        </Box>

        {/* Filters Card */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
          <CardBody p={{ base: 2.5, md: 6 }}>
            <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <Input
                size="md"
                variant="outline"
                placeholder="Search clinics..."
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
                onClick={() => navigate("/clinic/add")}
                isDisabled={!hasPermission("CLINIC_ADD")}
                fontWeight="600"
                minW={{ base: "100%", lg: "auto" }}
                px={6}
                borderRadius="md"
                _hover={{ bg: "blue.600" }}
              >
                Add New Clinic
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
                  {data.data.map((clinic) => (
                    <Card
                      key={clinic.id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={clinic.active === 1 ? "green.300" : "gray.300"}
                      borderRadius="lg"
                      cursor="pointer"
                      transition="all 0.2s ease-in-out"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                        borderColor: "blue.400"
                      }}
                      onClick={() => navigate(`/clinic/update/${clinic.id}`)}
                      p={{ base: 2, md: 4 }}
                      mx={{ base: 0.5, md: 0 }} // reduce side margin on mobile
                    >
                      <CardBody p={0}>
                        <VStack spacing={3} align="stretch">
                          {/* Header with ID Badge and Active */}
                          <Flex justify="space-between" align="center">
                            <Badge colorScheme="purple" py="2px" px="8px" fontSize="xs" borderRadius="none">
                              #{clinic.id}
                            </Badge>
                            <Badge colorScheme={clinic.active === 1 ? "green" : "red"} fontSize="0.8em" px={2} py={1} borderRadius="none">
                              {clinic.active === 1 ? "Active" : "Inactive"}
                            </Badge>
                          </Flex>
                          {/* Image and Title */}
                          <HStack spacing={3} align="center">
                            <Avatar
                              src={clinic.image ? imageBaseURL + clinic.image : "/admin/imagePlaceholder.png"}
                              size="md"
                              name={clinic.title}
                              bg="purple.500"
                              color="white"
                              border="2px solid #805ad5"
                              fontWeight="bold"
                            />
                            <Box flex={1} minW={0}>
                              <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={1}>
                                {clinic.title}
                              </Text>
                              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                {clinic.city_title}, {clinic.state_title}
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
                              pr={8} // Add right padding so last badge is never hidden
                            >
                              <HStack spacing={2} display="inline-flex" minW="max-content">
                                <Badge colorScheme="gray" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  {clinic.address || "No Address"}
                                </Badge>
                                <Badge colorScheme="blue" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  Phone: {clinic.phone || "N/A"}
                                </Badge>
                                <Badge colorScheme="teal" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  Updated: {clinic.updated_at ? new Date(clinic.updated_at).toLocaleDateString() : "N/A"}
                                </Badge>
                                <Badge colorScheme="purple" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  City: {clinic.city_title || "N/A"}
                                </Badge>
                                <Badge colorScheme="cyan" variant="solid" fontSize="xs" px={3} py={1} borderRadius="none" fontWeight="bold">
                                  State: {clinic.state_title || "N/A"}
                                </Badge>
                                {/* Add more badges for any new fields you add to the table */}
                              </HStack>
                            </Box>
                            {/* Action buttons on separate line */}
                            <Flex justify="flex-end" gap={2}>
                              <IconButton
                                isDisabled={!hasPermission("CLINIC_UPDATE")}
                                size="sm"
                                variant="ghost"
                                aria-label="Edit"
                                icon={<FiEdit fontSize={18} color="#3182ce" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/clinic/update/${clinic.id}`);
                                }}
                              />
                              <IconButton
                                isDisabled={!hasPermission("CLINIC_DELETE")}
                                size="sm"
                                variant="ghost"
                                aria-label="Delete"
                                icon={<FaTrash fontSize={18} color="#e53e3e" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedData(clinic);
                                  onOpen();
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
                  <AlertDescription>No clinics found matching your criteria</AlertDescription>
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
                  data={data?.formattedData}
                  onActionClick={<YourActionButton onClick={handleActionClick} navigate={navigate} DeleteonOpen={onOpen} />}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Pagination */}
        <Flex justify="center" mt={6}>
          <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} />
        </Flex>
      </VStack>

      {/* Delete Modal */}
      {isOpen && (
        <DeleteClinic isOpen={isOpen} onClose={onClose} data={selectedData} />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, navigate, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("CLINIC_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          navigate(`/clinic/update/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color="#3182ce" />} />
      <IconButton
        isDisabled={!hasPermission("CLINIC_DELETE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={18} color="#e53e3e" />} />
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
      const res = await UPDATE(admin.token, "update_clinic", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Clinic Updated!");
        queryClient.invalidateQueries("clinics");
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
        isDisabled={!hasPermission("CLINIC_UPDATE")}
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

