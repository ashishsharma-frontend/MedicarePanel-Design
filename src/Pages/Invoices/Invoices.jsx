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
import { TbDownload } from "react-icons/tb";
import api from "../../Controllers/api";
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
const id = "Errortoast";

export default function Invoices() {
  const [SelectedData, setSelectedData] = useState();
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Add date range state
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const url = `get_invoice?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    const rearrangedInvoices = res?.data.map((invoice) => {
      const {
        id,
        user_id,
        patient_id,
        appointment_id,
        status,
        total_amount,
        invoice_date,
        created_at,
        patient_f_name,
        patient_l_name,
        user_f_name,
        user_l_name,
        coupon_title,
        coupon_value,
        coupon_off_amount,
      } = invoice;

      return {
        id,
        status,
        total_Amount: total_amount,
        applied_coupon: coupon_title || "N/A",
        "coupon value (%)": coupon_value || "N/A",
        coupon_off_amount: coupon_off_amount || 0,
        invoice_Date: moment(invoice_date).format("D MMM YY"),
        patient: patient_f_name ? (
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
        appointmentID: (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        createdAt: moment(created_at).format("D MMM YY hh:mmA"),
      };
    });
    return {
      data: rearrangedInvoices,
      total_record: res.total_record,
    };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "invoices",
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

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "oops!",
        description: "Something bad happens.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (!hasPermission("APPOINTMENT_INVOICE_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Invoices
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
            <DynamicTable data={data?.data} onActionClick={<YourActionButton rowData={SelectedData} onClick={handleActionClick} />} />
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
          printPdf(`${api}/invoice/generatePDF/${rowData.id}`);
        }}
        icon={<TbDownload fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
