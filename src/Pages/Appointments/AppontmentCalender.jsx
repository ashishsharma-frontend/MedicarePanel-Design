/* eslint-disable react/prop-types */
import { Box, Flex, Skeleton, useToast, Heading, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useRef } from "react";
import ErrorPage from "../../Components/ErrorPage";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AppointmentsCalendar from "../Dashboard/Calender";
import { useSelectedClinic } from "../../Context/SelectedClinic";

export default function AppontmentCalender() {
  const toast = useToast();
  const id = "Errortoast";
  const boxRef = useRef(null);
  const { hasPermission } = useHasPermission();
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const url = `get_appointments?doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    return res.data;
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["all-appointments", selectedClinic?.id],
    queryFn: getData,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("APPOINTMENT_VIEW")) return <NotAuth />;

  return (
    <Box
      ref={boxRef}
      p={{ base: 2, md: 4, lg: 6 }}
      w="100%"
      maxW="100vw"
      bgGradient="linear(to-br, gray.50, white)"
      borderRadius={{ base: 8, md: 12 }}
      boxShadow="lg"
      overflowX="hidden"
    >
      <Heading
        as="h2"
        size={{ base: "md", md: "lg" }}
        mb={4}
        color="blue.700"
        textAlign="center"
        fontWeight="bold"
      >
        Appointment Calendar
      </Heading>
      {isLoading || !data ? (
        <Box>
          <Flex
            mb={{ base: 3, md: 5 }}
            justify="space-between"
            flexDirection={{ base: "column", md: "row" }}
            gap={{ base: 2, md: 0 }}
            alignItems="center"
          >
            <Skeleton
              w={{ base: "100%", md: 400 }}
              h={8}
              borderRadius={8}
              startColor="gray.200"
              endColor="gray.300"
            />
            <Skeleton
              w={{ base: "100%", md: 200 }}
              h={8}
              borderRadius={8}
              startColor="gray.200"
              endColor="gray.300"
            />
          </Flex>
          <Flex direction="column" gap={{ base: 1, md: 2 }}>
            {[...Array(8)].map((_, index) => (
              <Skeleton
                key={index}
                h={{ base: 8, md: 10 }}
                w="100%"
                borderRadius={8}
                startColor="gray.200"
                endColor="gray.300"
              />
            ))}
          </Flex>
        </Box>
      ) : (
        <Box w="100%" h="auto" borderRadius={8} overflow="hidden">
          <AppointmentsCalendar appointmentData={data} />
          <Text
            mt={4}
            textAlign="center"
            color="gray.600"
            fontSize={{ base: "sm", md: "md" }}
          >
            Showing appointments for {selectedClinic?.name || "selected clinic"}
          </Text>
        </Box>
      )}
    </Box>
  );
}