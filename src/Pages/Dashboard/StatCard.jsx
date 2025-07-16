// src/Pages/Dashboard/StatCard.jsx
import { Box, Text, Flex } from "@chakra-ui/react";
import { FiUser, FiCalendar, FiUsers } from "react-icons/fi";
import { FaUserMd, FaUserInjured } from "react-icons/fa";

const icons = {
  doctor: <FaUserMd size={28} color="#3b82f6" />,
  calendar: <FiCalendar size={28} color="#a78bfa" />,
  patient: <FaUserInjured size={28} color="#22c55e" />,
  users: <FiUsers size={28} color="#fbbf24" />,
};

export default function StatCard({ title, value, icon }) {
  return (
    <Box
      flex="1"
      p={5}
      bg="white"
      borderRadius={12}
      boxShadow="sm"
      textAlign="center"
      border="1px solid"
      borderColor="gray.100"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minW={0}
    >
      <Flex align="center" justify="center" mb={2}>
        {icons[icon]}
      </Flex>
      <Text fontSize="md" fontWeight={600} color="gray.700" mb={1}>
        {title}
      </Text>
      <Text fontWeight="bold" fontSize="2xl" color="#162D5D">
        {value}
      </Text>
    </Box>
  );
}