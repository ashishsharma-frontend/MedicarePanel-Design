import { BiCheckShield } from "react-icons/bi";
/* eslint-disable react-hooks/rules-of-hooks */
import useAppointmentData from "../../Hooks/UseAppointmentData";
import useUserData from "../../Hooks/Users";
import useTransactionData from "../../Hooks/UseTransaction";
import {
  Box,
  Button,
  Flex,
  Skeleton,
  useColorModeValue,
  useDisclosure,
  Text,
  Grid,
} from "@chakra-ui/react";
import WelcomeCard from "./WelcomeCard";
import usePatientData from "../../Hooks/UsePatientsData";
import AppointmentChart from "./AppointmentChart";
import StatusPieChart from "./AppointmentStatusPieChart";
import TransactionChart from "./TransactionChart";
import TransactionPieChart from "./TransactionPieChart";
import { MdAddCircleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddMedicine from "../Medicines/AddMedicine";
import AddNewAppointment from "../Appointments/AddNewAppointment";
import UsersReg from "./UsersReg";
import PatientsReg from "./PatientsReg";
import AppointmentReg from "./AppointmentReg";
import AddPatients from "../Patients/AddPatients";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ClockWithCountdown from "../../Components/LiveClock";
import useHasPermission from "../../Hooks/HasPermission";
import CancellationReqStatsics from "./CancellationReqStatsics";
import CancellationPieChart from "./CancelationReqChart";
import AppointmentCards from "./AppointmentCards";
import AppointmentsCalendar from "./Calender";
import AddCheckin from "../Checkin/Add";
import { useSelectedClinic } from "../../Context/SelectedClinic";

// ----------- DESIGN IMPROVEMENT: BUTTONS BAR -----------
import { FaUserPlus } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { FaBed } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import React from "react";
import { FiUser, FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

const dashboardButtons = [
  {
    label: "Add Doctor",
    icon: <FaUserPlus size={20} />,
    permission: "DOCTOR_ADD",
    onClick: (navigate) => navigate("/doctors/add"),
  },
  {
    label: "Add Apointment",
    icon: <FaUserDoctor size={20} />,
    permission: "APPOINTMENT_ADD",
    onClick: (open) => open("appointment"),
  },
  {
    label: "Add Patients",
    icon: <FaBed size={20} />,
    permission: "PATIENT_ADD",
    onClick: (open) => open("patient"),
  },
  {
    label: "Add Medicines",
    icon: <FaPlusCircle size={20} />,
    permission: "MEDICINE_ADD",
    onClick: (open) => open("medicine"),
  },
  {
    label: "Checkins",
    icon: <FaCheckCircle size={20} />,
    permission: "CHECKIN_ADD",
    onClick: (open) => open("checkin"),
  },
];

const getData = async () => {
  const res = await GET(admin.token, "get_dashboard_count");
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
const getDataByDoct = async () => {
  const res = await GET(admin.token, `get_dashboard_count/doctor/${admin.id}`);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

export default function DashboardMain() {
  const { appointmentsData } = useAppointmentData();
  const { usersData } = useUserData();
  const { transactionsData } = useTransactionData();
  const { patientsData } = usePatientData();
  const { hasPermission } = useHasPermission();
  const { selectedClinic } = useSelectedClinic();
  const getDataByClinic = async () => {
    const res = await GET(
      admin.token,
      `get_dashboard_count/clinic/${selectedClinic.id}`
    );
    if (res.response !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", selectedClinic],
    queryFn:
      admin.role.name === "Doctor"
        ? getDataByDoct
        : selectedClinic
        ? getDataByClinic
        : getData,
  });

  // Filter functions
  const completedAppointment = appointmentsData?.filter(
    (appointment) =>
      appointment.status === "Completed" || appointment.status === "Visited"
  );
  const CancelledAppointments = appointmentsData?.filter(
    (appointment) => appointment.status === "Cancelled"
  );
  const confirmAppointments = appointmentsData?.filter(
    (appointment) =>
      appointment.status !== "Cancelled" &&
      appointment.status !== "Rejected" &&
      appointment.status !== "Pending"
  );

  // Transaction filters
  const debitTxn = transactionsData?.filter(
    (item) => item.transaction_type === "Debited"
  );
  const creditTxn = transactionsData?.filter(
    (item) => item.transaction_type === "Credited"
  );

  // ----------- DESIGN IMPROVEMENT: BUTTONS BAR HANDLERS -----------
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: appointmentisOpen,
    onOpen: appointmentonOpen,
    onClose: appointmentonClose,
  } = useDisclosure();
  const {
    isOpen: patientisOpen,
    onOpen: patientonOpen,
    onClose: patientonClose,
  } = useDisclosure();
  const {
    isOpen: checkinisOpen,
    onOpen: checkinonOpen,
    onClose: checkinonClose,
  } = useDisclosure();

  // Button open handler
  const handleButtonClick = (btn) => {
    if (btn.label === "Add Doctor") btn.onClick(navigate);
    if (btn.label === "Add Apointment") btn.onClick(appointmentonOpen);
    if (btn.label === "Add Patients") btn.onClick(patientonOpen);
    if (btn.label === "Add Medicines") btn.onClick(onOpen);
    if (btn.label === "Checkins") btn.onClick(checkinonOpen);
  };

  return (
    <Box p={{ base: -2, md: -2 }} w="100%" maxW="100vw" overflow="hidden" pb={{ base: 8, md: 10 }}>
      {/* ----------- DESIGN IMPROVEMENT: BUTTONS BAR ----------- */}
      <Box w="100%" mb={6} px={0}>
        <Flex
          as="nav"
          bg="#fff"
          borderRadius="2xl"
          boxShadow={{ base: "sm", md: "0 2px 8px 0 rgba(44,62,80,0.06)" }}
          px={{ base: 3, md: 2 }}
          py={{ base: 3, md: 2 }}
          align="center"
          minH="64px"
          w={{ base: "100%", md: "fit-content" }}
          maxW="100vw"
          overflowX={{ base: "unset", md: "auto" }}
          style={{ WebkitOverflowScrolling: "touch" }}
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 4 }}
            minW={{ base: "unset", md: "max-content" }}
            w={{ base: "100%", md: "fit-content" }}
            align="center"
          >
            {dashboardButtons
              .filter((btn) => hasPermission(btn.permission))
              .map((btn) => (
                <Button
                  key={btn.label}
                  leftIcon={
                    btn.icon &&
                      React.cloneElement(btn.icon, {
                        color: "#0033FF",
                        size: 22,
                        style: { marginRight: 6 },
                      })
                  }
                  onClick={() => handleButtonClick(btn)}
                  bg="#F5F7FF"
                  color="#1A237E"
                  fontWeight="700"
                  fontSize="md"
                  borderRadius="2xl"
                  px={6}
                  py={6}
                  minW={{ base: "100%", md: "180px" }}
                  boxShadow="none"
                  _hover={{ bg: "#E8F1FF" }}
                  _active={{ bg: "#E8F1FF" }}
                  whiteSpace="nowrap"
                  transition="all 0.15s"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                >
                  {btn.label}
                </Button>
              ))}
          </Flex>
        </Flex>
      </Box>
      {/* ----------- END BUTTONS BAR ----------- */}

      {/* ----------- WELCOME CARD & APPOINTMENT CARDS ----------- */}
      <Box w="100%" mb={6}>
        {!isLoading && <WelcomeCard data={data} />}
        {!isLoading && (() => {
          // Top cards
          const topCards = [
            {
              title: "Today Appointment",
              value: data?.total_today_appointment || 0,
              icon: <FiUser size={22} />,
              color: "#162D5D",
              iconBg: "#E8F1FF",
            },
            {
              title: "Confirm Appointment",
              value: data?.total_confirmed_appointment || 0,
              icon: <FiCalendar size={22} />,
              color: "#2D60FF",
              iconBg: "#E8F1FF",
            },
            {
              title: "Pending Appointment",
              value: data?.total_pending_appointment || 0,
              icon: <FiClock size={20} />,
              color: "#2D60FF",
              iconBg: "#E8F1FF",
            },
            {
              title: "Upcoming Appointment",
              value: data?.total_upcoming_appointments || 0,
              icon: <FiCalendar size={20} />,
              color: "#2D60FF",
              iconBg: "#E8F1FF",
            },
          ];
          // Bottom cards
          const bottomCards = [
            {
              title: "Cancelled Appointments",
              value: data?.total_cancelled_appointment || 0,
              icon: <FiXCircle size={20} />,
              color: "#FF5C5C",
              iconBg: "#FEE2E2",
            },
            {
              title: "Rejected Appointments",
              value: data?.total_rejected_appointment || 0,
              icon: <FiXCircle size={20} />,
              color: "#A0AEC0",
              iconBg: "#F7F9FB",
            },
            {
              title: "Completed Appointments",
              value: data?.total_completed_appointment || 0,
              icon: <FiCheckCircle size={20} />,
              color: "#22C55E",
              iconBg: "#E6F9F0",
            },
            {
              title: "Visited Appointments",
              value: data?.total_visited_appointment || 0,
              icon: <FiCheckCircle size={20} />,
              color: "#2D60FF",
              iconBg: "#E8F1FF",
            },
          ];
          const allCards = [...topCards, ...bottomCards];
          return (
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} mt={6}>
              {allCards.map((card, idx) => (
                <Box
                  key={idx}
                  p={{ base: 4, md: 5 }}
                  bg={useColorModeValue("#fff", "gray.900")}
                  borderRadius={12}
                  boxShadow="sm"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  minH={{ base: "80px", md: "100px" }}
                  transition="box-shadow 0.2s"
                  _hover={{ boxShadow: "md" }}
                  h="100%"
                >
                  <Box>
                    <Text fontSize="md" fontWeight={600} color="#64748B" mb={1}>
                      {card.title}
                    </Text>
                    <Text fontWeight="bold" fontSize="2xl" color={card.color}>
                      {card.value}
                    </Text>
                  </Box>
                  <Flex
                    align="center"
                    justify="center"
                    w={{ base: "38px", md: "44px" }}
                    h={{ base: "38px", md: "44px" }}
                    borderRadius="full"
                    bg={card.iconBg}
                    color={card.color}
                    ml={3}
                  >
                    {card.icon}
                  </Flex>
                </Box>
              ))}
            </Grid>
          );
        })()}
      </Box>
      {/* ----------- END WELCOME CARD & APPOINTMENT CARDS ----------- */}


      <Flex
        gap={{ base: 2, md: 5 }}
        mt={{ base: 4, md: 6 }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "stretch", md: "flex-start" }}
        w="100%"
      >
        {admin.role.name === "Admin" || hasPermission("USER_VIEW") ? (
          <Box
            flex={{ base: 1, md: 1 }}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
            mb={{ base: 2, md: 0 }}
          >
            <UsersReg Users={usersData} />
          </Box>
        ) : null}
        {admin.role.name === "Admin" || hasPermission("PATIENT_VIEW") ? (
          <Box
            flex={{ base: 1, md: 1 }}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <PatientsReg Patients={patientsData} />
          </Box>
        ) : null}
      </Flex>
      {hasPermission("APPOINTMENT_VIEW") && (
        <Box mt={{ base: 4, md: 6 }} w="100%">
          <AppointmentsCalendar appointmentData={appointmentsData} />
        </Box>
      )}
      {hasPermission("APPOINTMENT_VIEW") && (
        <Box mt={{ base: 4, md: 6 }} w="100%">
          <AppointmentReg Appointments={appointmentsData} />
        </Box>
      )}
      {hasPermission("APPOINTMENT_VIEW") && (
        <Flex
          gap={{ base: 2, md: 5 }}
          mt={{ base: 4, md: 6 }}
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "flex-start" }}
          w="100%"
        >
          <Box
            maxW={{ base: "100%", md: "68%" }}
            flex={{ base: 1, md: 2 }}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
            mb={{ base: 2, md: 0 }}
          >
            <AppointmentChart
              appointments={appointmentsData}
              cancelledAppointments={CancelledAppointments}
              compleatedAppointments={completedAppointment}
              confirmedAppointments={confirmAppointments}
            />
          </Box>
          <Box
            maxW={{ base: "100%", md: "30%" }}
            flex={{ base: 1, md: 1 }}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <StatusPieChart appointments={appointmentsData} />
          </Box>
        </Flex>
      )}
      {hasPermission("ALL_TRANSACTION_VIEW") && (
        <Flex
          gap={{ base: 2, md: 5 }}
          mt={{ base: 4, md: 6 }}
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "flex-start" }}
          w="100%"
        >
          <Box
            maxW={{ base: "100%", md: "68%" }}
            flex={{ base: 1, md: 2 }}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
            mb={{ base: 2, md: 0 }}
          >
            <TransactionChart
              creditTransactions={creditTxn}
              debitTransactions={debitTxn}
            />
          </Box>
          <Box
            maxW={{ base: "100%", md: "30%" }}
            flex={{ base: 1, md: 1 }}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionPieChart transactions={transactionsData} />
          </Box>
        </Flex>
      )}
      <Flex
        gap={{ base: 2, sm: 3, md: 5, lg: 8, xl: 10 }}
        mt={{ base: 4, md: 6 }}
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "stretch" }}
        w="100%"
        flexWrap={{ base: "wrap", sm: "nowrap" }}
        minH={0}
        mb={{ base: 6, md: 8 }}
      >
        <Box
          w={{ base: "100%", sm: "65%", md: "70%", lg: "72%", xl: "75%" }}
          maxW={{ base: "100%", sm: "65%", md: "70%", lg: "72%", xl: "75%" }}
          flex={{ base: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
          minW={0}
          mb={{ base: 4, sm: 0 }}
        >
          <CancellationReqStatsics data={data} />
        </Box>
        <Box
          w={{ base: "100%", sm: "35%", md: "30%", lg: "28%", xl: "25%" }}
          maxW={{ base: "100%", sm: "35%", md: "30%", lg: "28%", xl: "25%" }}
          flex={{ base: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
          bg={useColorModeValue("#fff", "gray.900")}
          borderRadius={8}
          maxH={{ base: "fit-content", md: "fit-content" }}
          minW={0}
        >
          <CancellationPieChart cancelData={data} />
        </Box>
      </Flex>
      {/* ----------- DESIGN IMPROVEMENT: BUTTONS BAR MODALS ----------- */}
      <AddMedicine isOpen={isOpen} onClose={onClose} />
      <AddNewAppointment isOpen={appointmentisOpen} onClose={appointmentonClose} />
      <AddPatients nextFn={() => {}} onClose={patientonClose} isOpen={patientisOpen} />
      <AddCheckin isOpen={checkinisOpen} onClose={checkinonClose} />
    </Box>
  );
}