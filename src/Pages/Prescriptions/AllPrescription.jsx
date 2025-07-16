/* eslint-disable react-hooks/rules-of-hooks */
import { BiPrinter } from "react-icons/bi";
import { AiFillEye } from "react-icons/ai";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Skeleton,
  Link,
  useColorModeValue,
  theme,
  useDisclosure,
} from "@chakra-ui/react";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../Controllers/api";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import DeletePrescription from "./DeletePrescription";
import Pagination from "../../Components/Pagination";
import DateRangeCalender from "../../Components/DateRangeCalender";
import useDebounce from "../../Hooks/UseDebounce";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import imageBaseURL from "../../Controllers/image";

// Helper function to calculate pagination indices
const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

function AllPrescription() {
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { startIndex, endIndex } = getPageIndices(page, 50); // 10 items per page
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();
  const { selectedClinic } = useSelectedClinic();
  const boxRef = useRef(null);

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_prescription?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
        dateRange.startDate || ""
      }&end_date=${dateRange.endDate || ""}&clinic_id=${
        selectedClinic?.id || ""
      }&doctor_id=${admin.role.name === "Doctor" ? admin.id : ""}`
    );
    return {
      data: res.data,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "prescriptions",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic,
    ],
    queryFn: getData,
  });

  const totalPage = Math.ceil(data?.total_record / 50); // Adjusted based on items per page

  useEffect(() => {
    if (data) {
      setPage(1); // Reset to first page when data changes
    }
  }, [data]);

  useEffect(() => {
    if (!boxRef.current) return;
    const yOffset = -64; // height of your sticky header
    const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [page]);

  if (error) {
    return <Text color="red.500">Error loading data</Text>;
  }

  const printPdf = (pdfUrl) => {
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
      newWindow.onload = () => {
        newWindow.load();
        newWindow.onafterprint = () => {
          newWindow.close();
        };
      };
    }
  };

  if (!hasPermission("PRESCRIPTION_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Prescriptions
      </Text>
      <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 6 }} align={{ base: "stretch", lg: "center" }} justify="space-between">
          <Flex direction={{ base: "column", md: "row" }} gap={3} flex={1} align={{ base: "stretch", md: "center" }}>
            <Input placeholder="Search" w={{ base: "100%", md: 350 }} maxW={{ base: "100%", md: "45vw" }} onChange={(e) => setSearchQuery(e.target.value)} size="md" borderColor="gray.300" borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} _hover={{ borderColor: "gray.400" }} />
            <DateRangeCalender dateRange={dateRange} setDateRange={setDateRange} size="md" />
          </Flex>
        </Flex>
      </Box>
      <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
        {/* Table */}
        <Box borderWidth="0" borderRadius="lg" overflow="scroll" maxW={"100%"}>
            <Table
              variant="simple"
              colorScheme="gray"
              fontSize={12}
              size={"sm"}
              fontWeight={500}
            >
              <Thead background={useColorModeValue("blue.50", "blue.700")}>
                <Tr>
                  <Th padding={2}>ID</Th>
                  <Th padding={2}>Appointment ID</Th>
                  <Th padding={2}>Patient</Th>
                  <Th padding={2}>Doctor</Th>
                  <Th padding={2}>Date</Th>
                  <Th padding={2}>Pulse Rate</Th>
                  <Th padding={2}>Temperature</Th>
                  <Th padding={2} textAlign={"center"}>
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.data.length > 0 ? (
                  data?.data.map((prescription) => (
                    <Tr key={prescription.id}>
                      <Td py={3} px={2}>
                        {prescription.id}
                      </Td>
                      <Td py={3} px={2}>
                        {prescription.appointment_id}
                      </Td>
                      <Td
                        py={3}
                        px={2}
                      >{`${prescription.patient_f_name} ${prescription.patient_l_name}`}</Td>
                      <Td
                        py={3}
                        px={2}
                      >{`${prescription.doctor_f_name} ${prescription.doctor_l_name}`}</Td>
                      <Td py={3} px={2}>
                        {prescription.date}
                      </Td>
                      <Td py={3} px={2}>
                        {prescription.pulse_rate}
                      </Td>
                      <Td py={3} px={2}>
                        {prescription.temperature}
                      </Td>
                      <Td py={3} px={2} maxW={10}>
                        <Flex alignItems={"center"} justifyContent={"center"}>
                          <IconButton
                            as={Link}
                            aria-label="Print"
                            icon={<BiPrinter fontSize={22} />}
                            colorScheme="whatsapp"
                            size={"sm"}
                            variant={"ghost"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (prescription.pdf_file) {
                                printPdf(`${imageBaseURL}/${prescription.pdf_file}`);
                              } else {
                                printPdf(
                                  `${api}/prescription/generatePDF/${prescription.id}`
                                );
                              }
                            }}
                          />
                          {hasPermission("PRESCRIPTION_UPDATE") && (
                            <IconButton
                              as={RouterLink}
                              aria-label="View"
                              icon={<AiFillEye fontSize={24} />}
                              colorScheme="blue"
                              size={"sm"}
                              variant={"ghost"}
                              to={`/prescription/${prescription?.id}?appointmentID=${prescription?.appointment_id}&patientID=${prescription?.patient_id}`}
                            />
                          )}
                          {hasPermission("PRESCRIPTION_DELETE") && (
                            <IconButton
                              size={"sm"}
                              variant={"ghost"}
                              _hover={{ background: "none" }}
                              onClick={() => {
                                onOpen();
                                setSelectedData(prescription);
                              }}
                              icon={
                                <FaTrash
                                  fontSize={18}
                                  color={theme.colors.red[500]}
                                />
                              }
                            />
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="8">
                      <Text align="center">No data available in table</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      
      <Flex justify={"center"} mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={totalPage}
        />
      </Flex>

      {isOpen && (
        <DeletePrescription
          isOpen={isOpen}
          onClose={onClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

export default AllPrescription;
