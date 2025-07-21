import { BiLinkExternal } from "react-icons/bi";
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
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { Link, useNavigate } from "react-router-dom";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AddCheckin from "./Add";
import UpdateCheckin from "./Update";
import DeleteCheckin from "./Delete";
import moment from "moment";
import useDebounce from "../../Hooks/UseDebounce";
import DateRangeCalender from "../../Components/DateRangeCalender";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};
export default function Checkin() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { selectedClinic } = useSelectedClinic();

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
  const navigate = useNavigate();

  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    const url = `get_appointment_check_in?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        appointment_id,
        time,
        date,
        created_at,
        updated_at,
        doct_f_name,
        doct_l_name,
        patient_f_name,
        patient_l_name,
        clinic_id,
      } = doctor;
      return {
        id,
        clinic_id,
        app_id: (
          <Link to={`/appointment/${appointment_id}`}>
            <Flex gap={1} align={"center"}>
              {appointment_id} <BiLinkExternal />
            </Flex>
          </Link>
        ),
        doctor: `${doct_f_name} ${doct_l_name}`,
        patient: `${patient_f_name} ${patient_l_name}`,
        Date: moment(date).format("DD MMM YYYY"),
        Time: moment(time, "HH:mm:ss").format("hh:mm A"),
        created_at,
        updated_at,
      };
    });
    return { data: rearrangedArray, total_record: res.total_record };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "checkins",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic?.id,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

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

  if (!hasPermission("CHECKIN_VIEW")) return <NotAuth />;

  return (
    <Box
      ref={boxRef}
      px={{ base: 2, sm: 3, md: 4, lg: 6 }}
      py={{ base: 2, sm: 3, md: 4 }}
      mt={{ base: 1, sm: 2, md: 3 }}
      w="100%"
    >
      <Text
        fontSize={{ base: 'xl', md: '2xl' }}
        fontWeight="bold"
        color="#2156F4"
        mb={5}
        letterSpacing="0.01em"
      >
        Check-in Records
      </Text>
      {isLoading || !data ? (
        <Box>
          <Flex
            mb={{ base: 3, sm: 4, md: 6 }}
            direction={{ base: "column", md: "row" }}
            gap={{ base: 3, sm: 4, md: 6 }}
            align={{ base: "stretch", md: "center" }}
            w="100%"
            flexWrap="wrap"
          >
            <Skeleton w="100%" h={{ base: 8, sm: 9, md: 10 }} />
            <Skeleton w="100%" h={{ base: 8, sm: 9, md: 10 }} />
          </Flex>
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
        </Box>
      ) : (
        <Box>
          <Box
            bg={"#fff"}
            borderRadius={16}
            boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)"
            p={{ base: 3, md: 5 }}
            mb={5}
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              align={{ base: "stretch", lg: "center" }}
              justify={{ base: "flex-start", lg: "space-between" }}
              gap={{ base: 4, lg: 0 }}
              w="100%"
            >
              {/* Left input group */}
              <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "100%", lg: "auto" }}>
                <Input
                  size={{ base: "sm", md: "md" }}
                  placeholder="Search"
                  w={{ base: "100%", md: 300 }}
                  maxW={{ base: "100%", md: "50vw" }}
                  onChange={(e) => setsearchQuery(e.target.value)}
                  value={searchQuery}
                  borderRadius={8}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
                <DateRangeCalender
                  dateRange={dateRange}
                  setDateRange={setdateRange}
                  size={{ base: "sm", md: "md" }}
                  w={{ base: "100%", md: 220 }}
                  maxW={{ base: "100%", md: "30vw" }}
                  borderRadius={8}
                  _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                />
              </Flex>
              {/* Right button group */}
              <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "100%", lg: "auto" }} justify={{ base: "flex-start", lg: "flex-end" }}>
                <Button
                  size={{ base: "sm", md: "md" }}
                  colorScheme="blue"
                  onClick={() => {
                    if (!selectedClinic?.id) {
                      alert("Please select a clinic first!");
                      return;
                    }
                    const baseUrl = `${window.location.protocol}//${window.location.host}`;
                    const isDoctor = admin.role.name.toLowerCase() === "doctor";
                    const queryParams = new URLSearchParams({
                      clinic_id: selectedClinic.id,
                      ...(isDoctor && { doct: admin.id }),
                      ...(isDoctor && { isSelectedDoctor: admin.id }),
                    }).toString();

                    window.open(
                      `${baseUrl}/admin/queue?${queryParams}`,
                      "_blank"
                    );
                  }}
                  rightIcon={<BiLinkExternal />}
                  borderRadius={8}
                  _hover={{ bg: "blue.600" }}
                  minW={{ base: "100%", md: "180px" }}
                >
                  Show Checkin Display
                </Button>
                <Button
                  isDisabled={!hasPermission("CHECKIN_ADD")}
                  size={{ base: "sm", md: "md" }}
                  colorScheme="blue"
                  onClick={() => {
                    onOpen();
                  }}
                  borderRadius={8}
                  _hover={{ bg: "blue.600" }}
                  minW={{ base: "100%", md: "150px" }}
                >
                  New Checkin
                </Button>
              </Flex>
            </Flex>
          </Box>
          <Box
            bg={"#F9FAFB"}
            borderRadius={16}
            p={{ base: 2, md: 4 }}
            boxShadow="sm"
            mb={5}
          >
            <DynamicTable
              data={data.data}
              onActionClick={
                <YourActionButton
                  onClick={handleActionClick}
                  navigate={navigate}
                  EditonOpen={EditonOpen}
                  DeleteonOpen={DeleteonOpen}
                />
              }
            />
          </Box>
        </Box>
      )}

      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
          size={{ base: "sm", md: "md" }}
        />
      </Flex>

      {isOpen && <AddCheckin isOpen={isOpen} onClose={onClose} />}
      {EditisOpen && (
        <UpdateCheckin
          data={SelectedData}
          isOpen={EditisOpen}
          onClose={EditonClose}
        />
      )}

      {DeleteisOpen && (
        <DeleteCheckin
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"} gap={{ base: 1, sm: 2, md: 2 }}>
      <IconButton
        isDisabled={!hasPermission("CHECKIN_UPDATE")}
        size={{ base: "xs", sm: "sm", md: "sm" }}
        variant={"ghost"}
        _hover={{
          background: "none",
          color: theme.colors.blue[600],
        }}
        onClick={() => {
          onClick(rowData);
          EditonOpen();
        }}
        icon={<FiEdit fontSize={{ base: 14, sm: 16, md: 18 }} color={theme.colors.blue[500]} />}
        borderRadius={4}
      />
      <IconButton
        isDisabled={!hasPermission("CHECKIN_DELETE")}
        size={{ base: "xs", sm: "sm", md: "sm" }}
        variant={"ghost"}
        _hover={{
          background: "none",
          color: theme.colors.red[600],
        }}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={{ base: 14, sm: 16, md: 18 }} color={theme.colors.red[500]} />}
        borderRadius={4}
      />
    </Flex>
  );
};