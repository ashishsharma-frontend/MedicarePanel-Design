/* eslint-disable react/prop-types */
import { Box, Flex, Heading, Image, Text, Badge, SimpleGrid, useBreakpointValue } from "@chakra-ui/react";
import { FaUserMd, FaCalendarCheck, FaUsers, FaUser } from "react-icons/fa";
import admin from "../../Controllers/admin";

const statData = [
  {
    label: "Active Doctors",
    valueKey: "total_active_doctors",
    icon: FaUserMd,
    color: "#3b82f6",
    bg: "#f1f6fe",
  },
  {
    label: "Appointments",
    valueKey: "total_appointments",
    icon: FaCalendarCheck,
    color: "#a855f7",
    bg: "#f7f1fe",
  },
  {
    label: "Patients",
    valueKey: "total_patients",
    icon: FaUser,
    color: "#22c55e",
    bg: "#f1fef6",
  },
  {
    label: "Users",
    valueKey: "total_users",
    icon: FaUsers,
    color: "#fbbf24",
    bg: "#fffbea",
  },
];

export default function WelcomeCard({ data }) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box w="100%">
      {/* Header */}
      <Box
        bg="#074799"
        w="100%"
        borderRadius={16}
        px={{ base: 4, md: 10 }}
        py={{ base: 6, md: 8 }}
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        alignItems={{ base: "center", md: "center" }}
        justifyContent={{ base: "center", md: "space-between" }}
      >
        <Flex align="center" flexDirection={{ base: "column", sm: "row" }} mb={{ base: 4, md: 0 }}>
          <Image
            src="/admin/profile.png"
            w={16}
            h={16}
            borderRadius="full"
            objectFit="cover"
            fallbackSrc="/profile.png"
            alt="Admin Profile"
            mr={{ base: 0, sm: 4 }}
            mb={{ base: 2, sm: 0 }}
            border="3px solid #fff"
            boxShadow="md"
          />
          <Box color="white" textAlign={{ base: "center", sm: "left" }}>
            <Text fontWeight="bold" fontSize="lg">Welcome Back</Text>
            <Text fontWeight="semibold" fontSize="md">
              {admin.role.name} - {admin.f_name} {admin.l_name}
            </Text>
          </Box>
        </Flex>
        <Box
          mt={{ base: 2, md: 0 }}
          ml={{ base: 0, md: 4 }}
          display="flex"
          justifyContent={{ base: "center", md: "flex-end" }}
          width={{ base: "100%", md: "auto" }}
        >
          <Box
            as="button"
            bg="transparent"
            color="white"
            fontWeight="semibold"
            fontSize="md"
            px={6}
            py={2}
            borderRadius={8}
            letterSpacing={1}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            border="1px solid #EBFFD8"
            outline="none"
            cursor="pointer"
          >
            ACTIVE
          </Box>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box
        bg="white"
        borderRadius={20}
        boxShadow="sm"
        mt={8}
        p={{ base: 2, sm: 4, md: 8 }}
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, sm: 4, md: 6 }}>
          {statData.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={data?.[stat.valueKey] || 0}
              icon={stat.icon}
              color={stat.color}
              bg={stat.bg}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg={bg}
      borderRadius={16}
      py={{ base: 5, sm: 7, md: 8 }}
      px={{ base: 2, sm: 4, md: 2 }}
      minH={{ base: "110px", sm: "130px", md: "150px" }}
      boxShadow="xs"
    >
      <Box
        bg={bg}
        borderRadius="full"
        mb={3}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w={{ base: 10, sm: 12, md: 14 }}
        h={{ base: 10, sm: 12, md: 14 }}
      >
        <Icon size={28} color={color} />
      </Box>
      <Text fontSize={{ base: "sm", sm: "md" }} color="#444" fontWeight={500} mb={1}>
        {label}
      </Text>
      <Text fontSize={{ base: "xl", sm: "2xl" }} color="#222" fontWeight={700}>
        {value}
      </Text>
    </Flex>
  );
}