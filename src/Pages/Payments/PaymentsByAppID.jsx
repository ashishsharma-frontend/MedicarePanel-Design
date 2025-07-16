/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
} from "@chakra-ui/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import moment from "moment";
import { Link } from "react-router-dom";
import { TbDownload } from "react-icons/tb";
import printPDF from "../../Controllers/printPDF";
import api from "../../Controllers/api";
export default function PaymentsByAppID({ appointmentID }) {
  const [SelectedData, setSelectedData] = useState();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_appointment_payment?appointment_id=${appointmentID}`
    );
    if (res.data === null) {
      return [];
    } else {
      const rearrangedTransaction = res?.data?.map((transaction) => {
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
          patient: (
            <Link to={`/patient/${patient_id}`}>
              {`${patient_f_name} ${patient_l_name}`}
            </Link>
          ),
          user: (
            <Link
              to={`/user/${user_id}`}
            >{`${user_f_name} ${user_l_name}`}</Link>
          ),
          "APP ID": (
            <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
          ),
          amount,
          "payment Method": payment_method,
          "Time stamp": moment(payment_time_stamp).format("D MMM YY hh.mmA"),
          "created At": moment(created_at).format("D MMM YY hh:mmA"),
        };
      });
      return rearrangedTransaction;
      // Assuming res is the response from your GET request
    }
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data } = useQuery({
    queryKey: ["payment", appointmentID],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  return (
    <Box>
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
            <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "100%", lg: "auto" }}>
              <Input size={{ base: "sm", md: "md" }} placeholder="Search" w={{ base: "100%", md: 300 }} maxW={{ base: "100%", md: "50vw" }} onChange={(e) => handleSearchChange(e.target.value)} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable data={filteredData} onActionClick={<YourActionButton rowData={SelectedData} onClick={handleActionClick} />} />
          </Box>
        </Box>
      )}
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
