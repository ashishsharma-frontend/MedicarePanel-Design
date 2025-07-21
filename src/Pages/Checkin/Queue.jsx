import {
  Box,
  Grid,
  Text,
  List,
  Image,
  Flex,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
} from "@chakra-ui/react";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import moment from "moment";
import useSettingsData from "../../Hooks/SettingData";
import imageBaseURL from "../../Controllers/image";
import Loading from "../../Components/Loading";
import { useSearchParams } from "react-router-dom";
import todayDate from "../../Controllers/today";

// Fetch Appointments Function

// get doctors
const getData = async (clinic_id) => {
  const res = await GET(admin.token, `get_doctor?clinic_id=${clinic_id || ""}`);
  return res.data;
};

const QueueList = () => {
  const { settingsData } = useSettingsData();
  const logo = settingsData?.find((value) => value.id_name === "logo");
  const [time, setTime] = useState(moment().format("MMMM D YYYY, h:mm:ss a"));
  const [selectDoc, setselectDoc] = useState(false);
  const [selectedDate, setselectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [isLOad, setisLOad] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const doctID = searchParams.get("doct");
  const doctname = searchParams.get("name");
  const clinic_id = searchParams.get("clinic_id");
  const ParamsDoctor = searchParams.get("isSelectedDoctor");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format("MMMM D YYYY, h:mm:ss a"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // doctors
  const { isLoading: doctorsLoading, data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getData(clinic_id),
  });

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const selectedDoctor = doctID
        ? doctors?.find((doc) => doc.user_id.toString() === doctID)
        : null;
      if (doctID && selectedDoctor) {
        const expectedName = `${selectedDoctor.f_name} ${selectedDoctor.l_name}`;
        if (doctname !== expectedName) {
          setSearchParams({
            ...searchParams,
            clinic_id: clinic_id || "",
            doct: doctID,
            name: expectedName,
            isSelectedDoctor: ParamsDoctor,
          });
        }
      } else {
        const firstDoctor = doctors[0];
        setSearchParams({
          clinic_id: clinic_id || "",
          doct: firstDoctor.user_id,
          name: `${firstDoctor.f_name} ${firstDoctor.l_name}`,
        });
      }
    }
  }, [
    doctors,
    doctID,
    doctname,
    clinic_id,
    setSearchParams,
    searchParams,
    ParamsDoctor,
  ]);

  const fetchAppointments = async () => {
    setisLOad(true);
    const res = await GET(
      admin?.token,
      `get_appointment_check_in?start_date=${selectedDate}&end_date=${selectedDate}&doctor_id=${doctID}&clinic_id=${
        clinic_id || ""
      }`
    );
    setisLOad(false);
    return res.data;
  };
  const { data, error, isLoading } = useQuery({
    queryKey: ["appointments-queue", doctID, selectedDate, clinic_id],
    queryFn: fetchAppointments,
    refetchInterval: 30000,
    enabled: !!doctID,
  });

  if (isLoading || doctorsLoading || isLOad) return <Loading />;
  if (error) return <Text color="red.500">Failed to load appointments</Text>;
  const appointments = data || [];
  const currentAppointment = appointments[0] || null;
  const nextAppointments = appointments.slice(1);

  return (
    <Box p={{ base: 2, md: 6 }} bg="gray.100" minH="100vh">
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "center" }}
        justify="space-between"
        bg="white"
        p={{ base: 3, md: 5 }}
        borderRadius="lg"
        boxShadow="md"
        mb={4}
        gap={4}
      >
        {/* Logo */}
        <Flex align="center" gap={2} mb={{ base: 2, md: 0 }}>
          <Image
            w={{ base: 12, md: 20 }}
            src={`${imageBaseURL}/${logo?.value}`}
            fallbackSrc={"/admin/logo.png"}
            alt="Logo"
          />
        </Flex>
        {/* Doctor and Date Selector */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          align="center"
          gap={3}
          flex={1}
          justify="center"
        >
          <Text
            fontSize={{ base: "lg", md: "2xl" }}
            fontWeight="bold"
            color="blue.600"
            cursor={ParamsDoctor ? "not-allowed" : "pointer"}
            onClick={() => {
              if (!ParamsDoctor) setselectDoc(!selectDoc);
            }}
          >
            Doctor {doctname}
          </Text>
          {selectDoc && (
            <>
              <Select
                placeholder={doctname ? doctname : "Select Doctor"}
                w={{ base: "100%", sm: 48 }}
                color="#000"
                value={selectDoc}
                onChange={(e) => {
                  const doct = JSON.parse(e.target.value);
                  setSearchParams({
                    doct: doct.user_id,
                    name: `${doct.f_name} ${doct.l_name}`,
                  });
                  setselectDoc(false);
                }}
              >
                {doctors.map((doct) => (
                  <option
                    color="#000"
                    key={doct.id}
                    value={JSON.stringify(doct)}
                  >
                    Dr. {doct.f_name} {doct.l_name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder={"Select Date"}
                w={{ base: "100%", sm: 48 }}
                color="#000"
                value={selectedDate}
                type="date"
                max={todayDate()}
                onChange={(e) => {
                  const date = moment(e.target.value).format("YYYY-MM-DD");
                  setselectedDate(date);
                  setselectDoc(false);
                }}
              />
            </>
          )}
        </Flex>
        {/* Time */}
        <Box textAlign="center">
          <Text fontSize={{ base: "md", md: "xl" }} fontWeight={600} color="blue.600">
            {time}
          </Text>
        </Box>
      </Flex>

      <Grid
        templateColumns={{ base: "1fr", md: "1fr 2fr" }}
        gap={6}
        mt={2}
        minH={{ base: "auto", md: "80vh" }}
      >
        {/* Next Appointments */}
        <Box
          bg="white"
          p={{ base: 3, md: 5 }}
          borderRadius="lg"
          boxShadow="sm"
          minH={{ base: "auto", md: "70vh" }}
        >
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            mb={4}
            textAlign="center"
            color="blue.700"
          >
            Next Patients
          </Text>
          <Box overflowX="auto">
            <Table variant="simple" size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th>S No.</Th>
                  <Th>ID</Th>
                  <Th>Patient Name</Th>
                </Tr>
              </Thead>
              <Tbody>
                {nextAppointments.length > 0 ? (
                  nextAppointments.map((appointment, index) => (
                    <Tr key={appointment.id} fontWeight={600}>
                      <Td>#{index + 2}</Td>
                      <Td>#{appointment.appointment_id}</Td>
                      <Td fontWeight="bold">
                        {appointment.patient_f_name} {appointment.patient_l_name}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={3} textAlign="center">
                      <Text color="gray.500">No upcoming patients</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Current Appointment */}
        {/* <Box>
          <Box
            bg="blue.50"
            borderRadius="lg"
            boxShadow="md"
            border="1px solid #90cdf4"
            p={{ base: 3, md: 6 }}
            mb={4}
            minH={{ base: "auto", md: "60vh" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              mb={4}
              color="blue.700"
              textAlign="center"
            >
              Now
            </Text>
            {currentAppointment ? (
              <Box textAlign="center">
                <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight={700} mb={2}>
                  Appointment ID: #{currentAppointment.appointment_id}
                </Text>
                <Text fontWeight="bold" fontSize={{ base: "md", md: "xl" }} mb={2}>
                  Name - {currentAppointment.patient_f_name} {currentAppointment.patient_l_name}
                </Text>
                <Text fontSize={{ base: "md", md: "lg" }}>
                  Time: {moment(currentAppointment.time, "hh:mm:ss").format("hh:mm A")}
                </Text>
                <Text fontSize={{ base: "md", md: "lg" }}>
                  Date: {currentAppointment.date}
                </Text>
              </Box>
            ) : (
              <Text color="gray.500">No patient is currently being seen</Text>
            )}
          </Box>
        </Box> */}
      </Grid>
    </Box>
  );
};

export default QueueList;
