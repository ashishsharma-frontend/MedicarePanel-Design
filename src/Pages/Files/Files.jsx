import { FiExternalLink } from "react-icons/fi";
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Link,
  Skeleton,
  theme,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { FaTrash } from "react-icons/fa";

import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import DynamicTable from "../../Components/DataTable";
import { FiEdit } from "react-icons/fi";
import UpdatePatientFiles from "../Patients/UpdatePatientFiles";
import useDebounce from "../../Hooks/UseDebounce"; // Use debounce for search
import Pagination from "../../Components/Pagination"; // Pagination component
import DateRangeCalender from "../../Components/DateRangeCalender"; // Date range filtering component
import imageBaseURL from "../../Controllers/image";
import ErrorPage from "../../Components/ErrorPage";
import AddPatientsFiles from "./AddFile";
import DeletePatientFiles from "../Patients/DeletePatientFile";
import { useSelectedClinic } from "../../Context/SelectedClinic";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Files() {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000); // Debounce search query
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const boxRef = useRef(null);
  const { selectedClinic } = useSelectedClinic();

  const handleActionClick = (rowData) => {
    setselectedData(rowData);
  };

  const getPatientFiles = async () => {
    const res = await GET(
      admin.token,
      `get_patient_file?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
        dateRange.startDate || ""
      }&end_date=${dateRange.endDate || ""}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        patient_id,
        file_name,
        file,
        f_name,
        l_name,
        phone,
        isd_code,
        updated_at,
        created_at,
      } = item;

      return {
        id: id,
        patient_id,
        file_name,
        file: (
          <Link
            isExternal
            href={`${imageBaseURL}/${file}`}
            display={"flex"}
            alignItems={"center"}
            gap={3}
          >
            {file_name} <FiExternalLink />
          </Link>
        ),
        patient_Name: `${f_name} ${l_name}`,
        phone: `${isd_code}${phone}`,
        created_at,
        updated_at,
      };
    });
    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };

  const {
    data,
    isLoading: patientFilesLoading,
    error,
  } = useQuery({
    queryKey: [
      "all-files",
      debouncedSearchQuery,
      page,
      dateRange,
      selectedClinic,
    ],
    queryFn: getPatientFiles,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (!boxRef.current) return;
    const yOffset = -64; // height of sticky header
    const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [page]);

  if (error) return <ErrorPage errorCode={error.name} />;
  if (!hasPermission("FILE_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Files
      </Text>
      {patientFilesLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
        </Box>
      ) : (
        <>
          <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
            <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 6 }} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <Flex direction={{ base: "column", md: "row" }} gap={3} flex={1} align={{ base: "stretch", md: "center" }}>
                <Input size="md" placeholder="Search" w={{ base: "100%", md: 350 }} maxW={{ base: "100%", md: "45vw" }} onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} borderColor="gray.300" borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} _hover={{ borderColor: "gray.400" }} />
                <DateRangeCalender dateRange={dateRange} setDateRange={setDateRange} size="md" />
              </Flex>
              <Button size="md" colorScheme="blue" onClick={onOpen} isDisabled={!hasPermission("FILE_ADD")} fontWeight="600" minW={{ base: "100%", lg: "auto" }} px={6} borderRadius={8} _hover={{ bg: "blue.600" }}>
                Add New
              </Button>
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable minPad={"8px 8px"} data={data.data} onActionClick={<YourActionButton onClick={handleActionClick} DeleteonOpen={DeleteonOpen} EditonOpen={EditonOpen} />} />
          </Box>
        </>
      )}
      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} />
      </Flex>
      {isOpen && <AddPatientsFiles isOpen={isOpen} onClose={onClose} />}
      {EditisOpen && <UpdatePatientFiles isOpen={EditisOpen} onClose={EditonClose} data={selectedData} />}
      {DeleteisOpen && <DeletePatientFiles isOpen={DeleteisOpen} onClose={DeleteonClose} data={selectedData} />}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("FILE_UPDATE") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          _hover={{
            background: "none",
          }}
          onClick={() => {
            onClick(rowData);
            EditonOpen();
          }}
          icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        />
      )}
      {hasPermission("FILE_DELETE") && (
        <IconButton
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
      )}
    </Flex>
  );
};
