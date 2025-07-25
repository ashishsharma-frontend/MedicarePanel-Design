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

import { FaUserMd, FaUserCircle } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";

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

  // Helper for patient avatar (use real image if available)
  const PatientAvatar = ({ name }) => (
    <Box
      bg="blue.100"
      borderRadius="full"
      w="40px"
      h="40px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="2xl"
      color="blue.600"
      mr={3}
    >
      <FaUserCircle />
    </Box>
  );

  return (
    <Box p={{ base: 2, md: 6 }} bg="gray.100" minH="100vh">
      {/* Header */}
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={{ base: 3, md: 5 }}
        mb={6}
        w="100%"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "center", md: "center" }}
          justify={{ base: "center", md: "space-between" }}
          gap={{ base: 4, md: 6 }}
          w="100%"
        >
          {/* Logo and Title */}
          <Flex align="center" gap={3} w={{ base: "100%", md: "auto" }} justify={{ base: "center", md: "flex-start" }}>
            <Image
              w={{ base: 10, md: 14 }}
              h={{ base: 10, md: 14 }}
              src={logo?.value ? `${imageBaseURL}/${logo.value}` : "/admin/logo.png"}
              fallbackSrc="/admin/logo.png"
              alt="Logo"
              objectFit="contain"
              borderRadius="md"
              bg="gray.50"
            />
            <Text fontWeight="bold" fontSize={{ base: "lg", md: "2xl" }} color="blue.700" ml={2}>
              Doctor Queue
            </Text>
          </Flex>

          {/* Doctor, Selector, Date */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            align="center"
            gap={{ base: 3, sm: 4, md: 6 }}
            flexWrap="wrap"
            justify="center"
            w={{ base: "100%", md: "auto" }}
          >
            <Flex align="center" gap={2} w={{ base: "100%", sm: "auto" }} justify={{ base: "center", sm: "flex-start" }}>
              <FaUserMd color="#3182ce" size={22} />
              <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="blue.600">
                {doctname}
              </Text>
            </Flex>
            <Select
              w={{ base: "100%", sm: 44, md: 56 }}
              fontSize={{ base: "sm", md: "md" }}
              value={doctID}
              onChange={e => {
                const doct = doctors.find(d => d.user_id.toString() === e.target.value);
                setSearchParams({
                  doct: doct.user_id,
                  name: `${doct.f_name} ${doct.l_name}`,
                });
              }}
              bg="gray.50"
              borderColor="blue.100"
              _hover={{ borderColor: "blue.300" }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
              mb={{ base: 2, sm: 0 }}
            >
              {doctors.map(doct => (
                <option key={doct.user_id} value={doct.user_id}>
                  Dr. {doct.f_name} {doct.l_name}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={selectedDate}
              max={todayDate()}
              onChange={e => setselectedDate(moment(e.target.value).format("YYYY-MM-DD"))}
              w={{ base: "100%", sm: 40, md: 44 }}
              fontSize={{ base: "sm", md: "md" }}
              bg="gray.50"
              borderColor="blue.100"
              _hover={{ borderColor: "blue.300" }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
            />
          </Flex>

          {/* Time */}
          <Flex align="center" gap={2} w={{ base: "100%", md: "auto" }} justify={{ base: "center", md: "flex-end" }} mt={{ base: 2, md: 0 }}>
            <MdOutlineEventAvailable color="#3182ce" size={22} />
            <Text fontWeight={600} fontSize={{ base: "sm", md: "md" }} color="blue.600" whiteSpace="nowrap">
              {time}
            </Text>
          </Flex>
        </Flex>
      </Box>

      <Grid
        templateColumns={{ base: "1fr" }}
        gap={6}
        minH="70vh"
        justifyContent="center"
      >
        {/* Next Patients */}
        <Box
          bg="white"
          p={{ base: 3, md: 8 }}
          borderRadius="2xl"
          boxShadow="lg"
          minH="60vh"
          maxW={{ base: "100%", sm: "90%", md: "70%", lg: "900px" }}
          mx="auto"
          w="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb={2} color="blue.700" textAlign="center">
            Next Patients
          </Text>
          <Box w="60px" h="4px" bg="blue.100" borderRadius="full" mb={6} />
          <Box w="100%" overflowX="auto">
            <Table variant="simple" size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th fontSize={{ base: "md", md: "lg" }}>S No.</Th>
                  <Th fontSize={{ base: "md", md: "lg" }}>ID</Th>
                  <Th fontSize={{ base: "md", md: "lg" }}>Patient Name</Th>
                </Tr>
              </Thead>
              <Tbody>
                {nextAppointments.length > 0 ? (
                  nextAppointments.map((appointment, index) => (
                    <Tr key={appointment.id} _hover={{ bg: "gray.50" }} transition="background 0.2s">
                      <Td fontWeight="bold" color="blue.800">#{index + 2}</Td>
                      <Td fontWeight="bold" color="blue.800">#{appointment.appointment_id}</Td>
                      <Td>
                        <Flex align="center" gap={3}>
                          <PatientAvatar name={appointment.patient_f_name} />
                          <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="gray.800">
                            {appointment.patient_f_name} {appointment.patient_l_name}
                          </Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={3} textAlign="center">
                      <Text color="gray.400" fontSize="lg">
                        No upcoming patients
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
        {/* Current Patient (Now) section is commented out and not rendered */}
        {/**
        <Box
          bg="blue.50"
          borderRadius="lg"
          boxShadow="md"
          border="1px solid #90cdf4"
          p={6}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minH="60vh"
        >
          <Text fontSize="2xl" fontWeight="bold" mb={4} color="blue.700">
            Now
          </Text>
          {currentAppointment ? (
            <Box textAlign="center">
              <PatientAvatar name={currentAppointment.patient_f_name} />
              <Text fontSize="xl" fontWeight={700} mb={2}>
                Appointment ID: #{currentAppointment.appointment_id}
              </Text>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                {currentAppointment.patient_f_name} {currentAppointment.patient_l_name}
              </Text>
              <Text fontSize="md">
                Time: {moment(currentAppointment.time, "hh:mm:ss").format("hh:mm A")}
              </Text>
              <Text fontSize="md">
                Date: {currentAppointment.date}
              </Text>
            </Box>
          ) : (
            <Text color="gray.400" fontSize="lg">
              No patient is currently being seen
            </Text>
          )}
        </Box>
        */}
      </Grid>
    </Box>
  );
};

export default QueueList;
