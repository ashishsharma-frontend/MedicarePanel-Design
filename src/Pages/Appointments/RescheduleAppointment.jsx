/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  Box,
  Text,
  SimpleGrid,
  useToast,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import { useState } from "react";
import Loading from "../../Components/Loading";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";

const Calender15Days = () => {
  const next15Days = [];
  // Generate the next 15 days starting from today
  for (let i = 0; i < 15; i++) {
    const date = moment().add(i, "days").format("YYYY-MM-DD");
    next15Days.push(date);
  }
  return next15Days;
};

const getFormattedDate = (dateString) => {
  const date = moment(dateString, "YYYY-MM-DD");
  return {
    month: date.format("MMM"),
    date: date.format("DD"),
    year: date.format("ddd"),
  };
};

// get time slotes
const getDayName = (dateString) => {
  const date = moment(dateString, "YYYYMMDD");
  return date.format("dddd");
};

// swiper params
const swiperParams = {
  spaceBetween: 20,
  centeredSlides: false,
  loop: false,
  slidesPerView: 7.5,
  breakpoints: {
    1024: { spaceBetween: 5, slidesPerView: 7.5 },
    768: { spaceBetween: 5, slidesPerView: 6.5 },
    640: {
      spaceBetween: 5,
      slidesPerView: 5.5,
    },
    320: {
      spaceBetween: 5,
      slidesPerView: 5.5,
    },
  },
};

// handel resch
const handleReschedule = async (data) => {
  const res = await UPDATE(admin.token, "appointment_rescheduled", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function RescheduleAppointment({ data, isOpen, onClose }) {
  const [selectedDate, setselectedDate] = useState();
  const [selectedSlot, setselectedSlot] = useState();
  const queryClient = useQueryClient();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // get doctors time slote
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_doctor_time_interval/${data.doct_id}/${getDayName(selectedDate)}`
    );
    return res.data;
  };
  const { isLoading: timeSlotesLoading, data: timeSlots } = useQuery({
    queryKey: ["timeslotes", selectedDate, data.doct_id],
    queryFn: getData,
    enabled: !!selectedDate,
  });
  // get doctors booked slotes
  const getBookedSlotes = async () => {
    
    const res = await GET(
      admin.token,
      `get_booked_time_slots?doct_id=${data.doct_id}&date=${moment(
        selectedDate
      ).format("YYYY-MM-DD")}&type=OPD`
    );
    return res.data;
  };

  const { isLoading: bookedSlotesLoading, data: bookedSlotes } = useQuery({
    queryKey: ["bookedslotes", selectedDate, data.doct_id],
    queryFn: getBookedSlotes,
    enabled: !!selectedDate,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // get slot is booked or not
  const getSlotStatus = (slot) => {
    let slotAvailable = true;

    bookedSlotes?.forEach((bookedSlot) => {
      if (
        bookedSlot.time_slots === slot.time_start &&
        bookedSlot.date === selectedDate
      ) {
        slotAvailable = false;
      }
    });

    return slotAvailable;
  };

  //   mutatiopn
  const mutation = useMutation({
    mutationFn: async () => {
      let formData = {
        id: data.id,
        date: selectedDate,
        time_slots: selectedSlot.time_start,
      };
      await handleReschedule(formData);
    },
    onSuccess: () => {
      setselectedDate();
      setselectedSlot();
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries(["appointment", data.id]);
      queryClient.invalidateQueries([
        "bookedslotes",
        selectedDate,
        data.doct_id,
      ]);
      queryClient.invalidateQueries(["timeslotes", selectedDate, data.doct_id]);
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (timeSlotesLoading || bookedSlotesLoading || mutation.isPending)
    return <Loading />;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        maxW={{ base: "95vw", md: "600px" }}
        mx={4}
        borderRadius="xl"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
      >
        <ModalHeader 
          fontSize="lg" 
          fontWeight="bold" 
          py={4}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          Reschedule Appointment
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Date Selection */}
            <Box>
              <Text fontWeight="semibold" fontSize="md" mb={4} color="gray.700">
                Select Date
              </Text>
              <Box maxW="100%" overflow="hidden">
                <Swiper
                  {...swiperParams}
                  style={{ cursor: "grab", overflow: "hidden", maxWidth: "100%" }}
                >
                  {Calender15Days().map((day, index) => (
                    <SwiperSlide key={index}>
                      <Box
                        onClick={() => {
                          setselectedDate(moment(day).format("YYYY-MM-DD"));
                        }}
                      >
                        <Box
                          bg={
                            selectedDate === moment(day).format("YYYY-MM-DD")
                              ? "blue.500"
                              : "gray.100"
                          }
                          color={
                            selectedDate === moment(day).format("YYYY-MM-DD")
                              ? "white"
                              : "gray.700"
                          }
                          mr={3}
                          borderRadius="lg"
                          p={3}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "md",
                          }}
                          border="1px solid"
                          borderColor={
                            selectedDate === moment(day).format("YYYY-MM-DD")
                              ? "blue.500"
                              : borderColor
                          }
                        >
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            textAlign="center"
                            m={0}
                          >
                            {getFormattedDate(day).month}
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="700"
                            textAlign="center"
                            m={0}
                          >
                            {getFormattedDate(day).date}
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            textAlign="center"
                            m={0}
                          >
                            {getFormattedDate(day).year}
                          </Text>
                        </Box>
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Box>
            </Box>

            {/* Time Slots */}
            {selectedDate && (
              <Box>
                <Text fontWeight="semibold" fontSize="md" mb={4} color="gray.700">
                  Available Time Slots
                </Text>
                <Box
                  border="1px solid"
                  borderColor={borderColor}
                  p={4}
                  borderRadius="lg"
                  bg="gray.50"
                >
                  {timeSlots?.length ? (
                    <SimpleGrid columns={[2, 3, 4]} spacing={3}>
                      {timeSlots?.map((slot, index) => (
                        <Button
                          key={index}
                          size="md"
                          fontSize="sm"
                          fontWeight="600"
                          colorScheme={
                            !getSlotStatus(slot)
                              ? "red"
                              : slot === selectedSlot
                              ? "blue"
                              : "green"
                          }
                          variant="solid"
                          onClick={() => {
                            if (!getSlotStatus(slot)) {
                              return;
                            }
                            setselectedSlot(slot);
                          }}
                          isDisabled={!getSlotStatus(slot)}
                          _disabled={{
                            backgroundColor: "red.500",
                            opacity: 0.6,
                          }}
                          borderRadius="md"
                          transition="all 0.2s"
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: "sm",
                          }}
                        >
                          {slot.time_start} - {slot.time_end}
                        </Button>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text color="red.500" fontWeight="600" fontSize="sm" textAlign="center">
                      No available time slots found for the selected date.
                    </Text>
                  )}
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <Divider borderColor={borderColor} />
        
        <HStack spacing={3} p={6} justify="flex-end">
          <Button
            colorScheme="gray"
            variant="outline"
            onClick={onClose}
            size="md"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            size="md"
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            loadingText="Rescheduling..."
            isDisabled={!selectedDate || !selectedSlot}
          >
            Reschedule Appointment
          </Button>
        </HStack>
      </ModalContent>
    </Modal>
  );
}
