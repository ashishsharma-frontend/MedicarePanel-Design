/* eslint-disable react/prop-types */
import { GET } from "../../Controllers/ApiControllers";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "../../Components/ErrorPage";
import { Box, Flex, Skeleton, Text, Card, CardBody, Heading, VStack, HStack, Badge, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid } from "@chakra-ui/react";
import DynamicTable from "../../Components/DataTable";
import admin from "../../Controllers/admin";
import RatingStars from "../../Hooks/ShowRating";

// eslint-disable-next-line react/prop-types
function Review({ doctID, doctorDetails }) {
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_all_doctor_review?doctor_id=${doctID}`
    );
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        user_id,
        appointment_id,
        points,
        description,
        f_name,
        l_name,
        created_at,
      } = doctor;

      return {
        id,
        patient_id: user_id,
        appointment_id,
        Name: `${f_name} ${l_name}`,
        points,
        description,
        created_at,
      };
    });
    return rearrangedArray;
  };
  const { isLoading, data, error } = useQuery({
    queryKey: ["reviews", doctID],
    queryFn: getData,
  });
  if (error) {
    return <ErrorPage errorCode={error.name} />;
  }

  return (
    <Box mt={5}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {/* Loading skeletons */}
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
        </Box>
      ) : (
        <Box>
          {/* Header Section */}
          <Card mb={6} borderRadius="xl" boxShadow="sm" bg="white">
            <CardBody p={6}>
              <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={4}>
                <Box>
                  <Heading as="h3" size="md" color="#162D5D" mb={2}>
                    Doctor Reviews
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Patient feedback and ratings for this doctor
                  </Text>
                </Box>
                <HStack spacing={4}>
                  <VStack spacing={1} align="center">
                    <HStack spacing={1}>
                      <RatingStars rating={doctorDetails?.average_rating || 0} />
                      <Text fontSize="sm" fontWeight={600}>
                        ({doctorDetails?.number_of_reviews || 0})
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">Average Rating</Text>
                  </VStack>
                  <VStack spacing={1} align="center">
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                      {doctorDetails?.total_appointment_done || 0}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">Appointments Done</Text>
                  </VStack>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Card borderRadius="xl" boxShadow="sm" bg="white">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">Total Reviews</StatLabel>
                  <StatNumber color="#162D5D" fontSize="2xl">{data?.length || 0}</StatNumber>
                  <StatHelpText color="green.500" fontSize="xs">All time reviews</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card borderRadius="xl" boxShadow="sm" bg="white">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">Average Rating</StatLabel>
                  <StatNumber color="#162D5D" fontSize="2xl">{doctorDetails?.average_rating || 0}</StatNumber>
                  <StatHelpText color="yellow.500" fontSize="xs">Out of 5 stars</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card borderRadius="xl" boxShadow="sm" bg="white">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.600" fontSize="sm">Appointments</StatLabel>
                  <StatNumber color="#162D5D" fontSize="2xl">{doctorDetails?.total_appointment_done || 0}</StatNumber>
                  <StatHelpText color="blue.500" fontSize="xs">Total completed</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Reviews Table */}
          <Card borderRadius="xl" boxShadow="sm" bg="white" overflow="hidden">
            <CardBody p={0}>
              <Box p={6} borderBottom="1px solid" borderColor="gray.200">
                <Text fontWeight="semibold" color="#374151" fontSize="sm">
                  Recent Reviews ({data?.length || 0} total)
                </Text>
              </Box>
              <DynamicTable minPad="15px 10px" data={data} />
            </CardBody>
          </Card>
        </Box>
      )}
    </Box>
  );
}

export default Review;
