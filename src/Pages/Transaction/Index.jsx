/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  useToast,
  Text,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import moment from "moment";
import { Link } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { useSelectedClinic } from "../../Context/SelectedClinic";
const txnBadge = (txn) => {
  switch (txn) {
    case "Credited":
      return (
        <Badge
          colorScheme="green"
          fontSize={12}
          letterSpacing={0.5}
          p={"5px"}
          size={"sm"}
        >
          Credited
        </Badge>
      );
    case "Debited":
      return (
        <Badge colorScheme="red" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Debited
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="yellow" fontSize={12} letterSpacing={0.5} p={"5px"}>
          N/A
        </Badge>
      );
  }
};
export default function Transactions() {
  return (
    <AllTransactions />
  );
}

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

function AllTransactions() {
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const toast = useToast();
  const id = "Errortoast";
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const { startIndex, endIndex } = getPageIndices(page, 50);
    const url = `get_all_transaction?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    const rearrangedTransactions = res?.data.map((transaction) => {
      const {
        id,
        user_id,
        patient_id,
        appointment_id,
        payment_transaction_id,
        amount,
        transaction_type,
        is_wallet_txn,
        notes,
        created_at,
        patient_f_name,
        patient_l_name,
        user_f_name,
        user_l_name,
      } = transaction;

      return {
        id,
        patient: patient_id ? (
          <Link to={`/patient/${patient_id}`}>
            {`${patient_f_name} ${patient_l_name}`}
          </Link>
        ) : (
          "N/A"
        ),
        user: user_id ? (
          <Link to={`/user/${user_id}`}>{`${user_f_name} ${user_l_name}`}</Link>
        ) : (
          "N/A"
        ),
        "app ID": (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        "txn ID": payment_transaction_id || "N/A",
        amount,
        "txn type": txnBadge(transaction_type),
        "wallet Txn": is_wallet_txn == 1 ? "Yes" : "No",
        notes: notes || "N/A",
        createdAt: moment(created_at).format("D MMM YY hh:mmA"),
      };
    });
    return {
      data: rearrangedTransactions,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "transactions",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic,
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
        description: "Something went wrong.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("ALL_TRANSACTION_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Transactions
      </Text>
      {isLoading || !data ? (
        <Box>
          <Flex mb={{ base: 3, sm: 4, md: 6 }} direction={{ base: "column", md: "row" }} gap={{ base: 3, sm: 4, md: 6 }} align={{ base: "stretch", md: "center" }} w="100%" flexWrap="wrap">
            <Skeleton w="100%" h={{ base: 8, sm: 9, md: 10 }} />
            <Skeleton w="100%" h={{ base: 8, sm: 9, md: 10 }} />
          </Flex>
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
        </Box>
      ) : (
        <Box>
          <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
            <Flex direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "center" }} justify={{ base: "flex-start", lg: "space-between" }} gap={{ base: 4, lg: 0 }} w="100%">
              <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "100%", lg: "auto" }}>
                <Input size={{ base: "sm", md: "md" }} placeholder="Search" w={{ base: "100%", md: 300 }} maxW={{ base: "100%", md: "50vw" }} onChange={(e) => setsearchQuery(e.target.value)} value={searchQuery} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
                <DateRangeCalender dateRange={dateRange} setDateRange={setdateRange} size={{ base: "sm", md: "md" }} w={{ base: "100%", md: 220 }} maxW={{ base: "100%", md: "30vw" }} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
              </Flex>
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable data={data?.data} onActionClick={<YourActionButton />} />
          </Box>
        </Box>
      )}
      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} />
      </Flex>
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData }) => {
  return (
    <Flex justify={"center"}>
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
        }}
        icon={<FiEdit fontSize={18} color={"blue.500"} />}
      />
    </Flex>
  );
};
