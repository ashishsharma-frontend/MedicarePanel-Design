import { Box, Grid, Flex, Text, useColorModeValue, Icon, Badge } from "@chakra-ui/react";
import { FiUser, FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { FaUserMd, FaCalendarCheck, FaUserFriends, FaUsers } from "react-icons/fa";

export default function AppointmentCards({ data }) {
  // Stats grid (top)
  const stats = [
    {
      title: "Active Doctors",
      value: data?.total_active_doctors || 0,
      icon: <FaUserMd size={28} />, // blue
      iconBg: "#E8F1FF",
      iconColor: "#4F8CFF",
    },
    {
      title: "Appointments",
      value: data?.total_appointments || 0,
      icon: <FaCalendarCheck size={28} />, // purple
      iconBg: "#F3E8FF",
      iconColor: "#A259FF",
    },
    {
      title: "Patients",
      value: data?.total_patients || 0,
      icon: <FaUserFriends size={28} />, // green
      iconBg: "#E6F9F0",
      iconColor: "#22C55E",
    },
    {
      title: "Users",
      value: data?.total_users || 0,
      icon: <FaUsers size={28} />, // yellow
      iconBg: "#FFF9E5",
      iconColor: "#FFD600",
    },
  ];

  // Appointment cards grid (bottom)
  const appointmentCards = [
    {
      title: "Today Appointment",
      value: data?.total_today_appointment || 0,
      icon: <FiUser size={24} />, // blue
      iconBg: "#E8F1FF",
      iconColor: "#4F8CFF",
    },
    {
      title: "Confirm Appointment",
      value: data?.total_confirmed_appointment || 0,
      icon: <FiCalendar size={24} />, // blue
      iconBg: "#E8F1FF",
      iconColor: "#4F8CFF",
    },
    {
      title: "Pending Appointment",
      value: data?.total_pending_appointment || 0,
      icon: <FiClock size={24} />, // blue
      iconBg: "#E8F1FF",
      iconColor: "#4F8CFF",
    },
    {
      title: "Upcoming Appointment",
      value: data?.total_upcoming_appointments || 0,
      icon: <FiCalendar size={24} />, // blue
      iconBg: "#E8F1FF",
      iconColor: "#4F8CFF",
    },
    {
      title: "Cancelled Appointments",
      value: data?.total_cancelled_appointment || 0,
      percent: data?.cancelled_percent || 0,
      icon: <FiXCircle size={24} />, // red
      iconBg: "#FEE2E2",
      iconColor: "#FF5C5C",
    },
    {
      title: "Rejected Appointments",
      value: data?.total_rejected_appointment || 0,
      percent: data?.rejected_percent || 0,
      icon: <FiXCircle size={24} />, // gray
      iconBg: "#F7F9FB",
      iconColor: "#A0AEC0",
    },
    {
      title: "Completed Appointments",
      value: data?.total_completed_appointment || 0,
      percent: data?.completed_percent || 0,
      icon: <FiCheckCircle size={24} />, // green
      iconBg: "#E6F9F0",
      iconColor: "#22C55E",
    },
    {
      title: "Visited Appointments",
      value: data?.total_visited_appointment || 0,
      percent: data?.visited_percent || 0,
      icon: <FiCheckCircle size={24} />, // blue
      iconBg: "#E8F1FF",
      iconColor: "#4F8CFF",
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <Box w="100%" mb={6}>
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
          {stats.map((stat, idx) => (
            <Box
              key={idx}
              bg={useColorModeValue("white", "gray.800")}
              borderRadius={16}
              boxShadow="sm"
              p={{ base: 5, md: 7 }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minH={{ base: 120, md: 140 }}
            >
              <Flex align="center" justify="center" mb={3}>
                <Box
                  bg={stat.iconBg}
                  color={stat.iconColor}
                  borderRadius="full"
                  p={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize={12}
                >
                  {stat.icon}
                </Box>
              </Flex>
              <Text fontSize="md" color="gray.500" fontWeight={600} mb={1}>
                {stat.title}
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                {stat.value}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>
      {/* Appointment Cards Grid */}
      <Box w="100%">
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
          {appointmentCards.map((card, idx) => (
            <Box
              key={idx}
              bg={useColorModeValue("white", "gray.800")}
              borderRadius={16}
              boxShadow="sm"
              p={{ base: 5, md: 7 }}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
              minH={{ base: 120, md: 140 }}
            >
              <Flex align="center" justify="flex-end" w="100%" mb={2}>
                <Box
                  bg={card.iconBg}
                  color={card.iconColor}
                  borderRadius="full"
                  p={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize={12}
                >
                  {card.icon}
                </Box>
              </Flex>
              <Text fontSize="md" color="gray.500" fontWeight={600} mb={1}>
                {card.title}
              </Text>
              <Flex align="center" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color={card.color}>
                  {card.value}
                </Text>
                {typeof card.percent === "number" && (
                  <Badge
                    colorScheme={card.color === "#FF5C5C" ? "red" : card.color === "#22C55E" ? "green" : "blue"}
                    variant="subtle"
                    fontSize="sm"
                    borderRadius={8}
                    px={2}
                  >
                    {card.percent}%
                  </Badge>
                )}
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>
    </>
  );
}