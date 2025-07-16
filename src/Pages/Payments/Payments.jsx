/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import moment from "moment";
import { Link } from "react-router-dom";
import printPDF from "../../Controllers/printPDF";
import api from "../../Controllers/api";
import { TbDownload } from "react-icons/tb";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { useSelectedClinic } from "../../Context/SelectedClinic";



const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AppointmentPayments() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const toast = useToast();
  const id = "Errortoast";
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const { startIndex, endIndex } = getPageIndices(page, 50);
    const url = `get_appointment_payment?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);

    const rearrangedTransactions = res?.data.map((transaction) => {
      const {
        id,
        txn_id,
        invoice_id,
        amount,
        payment_time_stamp,
        payment_method,
        created_at,
        user_id,
        patient_id,
        appointment_id,
        patient_f_name,
        patient_l_name,
        user_f_name,
        user_l_name,
      } = transaction;

      return {
        id,
        "txn ID": txn_id,
        invoiceID: invoice_id,
        patient: patient_f_name ? (
          <Link to={`/patient/${patient_id}`}>
            {`${patient_f_name} ${patient_l_name}`}
          </Link>
        ) : (
          "N/A"
        ),
        user: user_f_name ? (
          <Link to={`/user/${user_id}`}>{`${user_f_name} ${user_l_name}`}</Link>
        ) : (
          "N/A"
        ),
        "APP ID": (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        amount,
        "payment Method": payment_method,
        "payment Time stamp":
          moment(payment_time_stamp).format("D MMM YY hh.mmA"),
        "created At": moment(created_at).format("D MMM YY hh:mmA"),
      };
    });

    return {
      data: rearrangedTransactions,
      total_record: res.total_record,
    };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "appointment-payments",
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
        title: "oops!.",
        description: "Something bad happens.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("APPOINTMENT_PAYMENTS_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Appointment Payments
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
                <Input size={{ base: "sm", md: "md" }} placeholder="Search" w={{ base: "100%", md: 300 }} maxW={{ base: "100%", md: "50vw" }} onChange={(e) => setsearchQuery(e.target.value)} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
                <DateRangeCalender dateRange={dateRange} setDateRange={setdateRange} size={{ base: "sm", md: "md" }} w={{ base: "100%", md: 220 }} maxW={{ base: "100%", md: "30vw" }} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
              </Flex>
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable data={data ? data.data : []} onActionClick={<YourActionButton onClick={handleActionClick} rowData={SelectedData} />} />
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
          printPDF(`${api}/invoice/generatePDF/${rowData.invoiceID}`);
        }}
        icon={<TbDownload fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
