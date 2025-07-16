/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  Tooltip,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import DynamicTable from "../../Components/DataTable";
import { useNavigate } from "react-router-dom";
import getFile from "./getfile";
import AddUserNotification from "./AddUserNotifcation";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import DateRangeCalender from "../../Components/DateRangeCalender";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function UserNotification({ currentTab, activeTab }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000); // Track status filters
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const start_date = dateRange.startDate
    ? moment(dateRange.startDate).format("YYYY-MM-DD")
    : "";
  const end_date = dateRange.endDate
    ? moment(dateRange.endDate).format("YYYY-MM-DD")
    : "";
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_user_notification_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}`
    );
    const newData = res.data.map((item) => {
      const { id, title, appointment_id, file_id, txn_id, image, updated_at } =
        item;

      return {
        id,
        title: (
          <Tooltip
            label={title}
            placement="top"
            hasArrow
            bg="gray.600"
            color="white"
            transition="all 0.1s"
            borderRadius="md"
            cursor={"pointer"}
            size={"sm"}
          >
            {title}
          </Tooltip>
        ),
        appointment_id,
        file_id,
        txn_id,
        image,
        updated_at,
        action: (
          <>
            {appointment_id && (
              <Button
                colorScheme="blue"
                onClick={() => navigate(`/appointment/${appointment_id}`)}
                size="xs"
                mt={2}
              >
                Go to Appointment
              </Button>
            )}
            {file_id && (
              <Button
                colorScheme="green"
                onClick={() => {
                  getFile(file_id);
                }}
                size="xs"
                mt={2}
              >
                Go to File
              </Button>
            )}
          </>
        ),
      };
    });

    return {
      data: newData,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "notification-user",
      debouncedSearchQuery,
      page,
      start_date,
      end_date,
    ],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

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

  const { hasPermission } = useHasPermission();
  if (!hasPermission("NOTIFICATION_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        User Notifications
      </Text>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <>
          <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
            <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 6 }} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <Flex direction={{ base: "column", md: "row" }} gap={3} flex={1} align={{ base: "stretch", md: "center" }}>
                <Input size="md" placeholder="Search" w={{ base: "100%", md: 350 }} maxW={{ base: "100%", md: "45vw" }} onChange={(e) => setsearchQuery(e.target.value)} value={searchQuery} borderColor="gray.300" borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} _hover={{ borderColor: "gray.400" }} />
                <DateRangeCalender dateRange={dateRange} setDateRange={setDateRange} size="md" />
              </Flex>
              <Button size="md" colorScheme="blue" onClick={onOpen} isDisabled={!hasPermission("NOTIFICATION_ADD")} fontWeight="600" minW={{ base: "100%", lg: "auto" }} px={6} borderRadius={8} _hover={{ bg: "blue.600" }}>
                Add New
              </Button>
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable minPad={"8px 8px"} data={data.data} />
          </Box>
        </>
      )}
      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} />
      </Flex>
      <AddUserNotification isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}
