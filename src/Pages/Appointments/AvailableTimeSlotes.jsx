/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";
import { GET } from "../../Controllers/ApiControllers";
import Loading from "../../Components/Loading";
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Grid } from "swiper/modules";
import "swiper/css/grid";
import { useQuery } from "@tanstack/react-query";
import admin from "../../Controllers/admin";

const Calender15Days = () => {
  const next15Days = [];
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

const getDayName = (dateString) => {
  const date = moment(dateString, "YYYYMMDD");
  return date.format("dddd");
};

const dateSwiperParams = {
  spaceBetween: 20,
  centeredSlides: false,
  loop: false,
  slidesPerView: 7.5,
  mousewheel: true,
  modules: [Mousewheel],
  breakpoints: {
    1024: { spaceBetween: 5, slidesPerView: 7.5 },
    768: { spaceBetween: 5, slidesPerView: 6.5 },
    640: { spaceBetween: 5, slidesPerView: 5.5 },
    320: { spaceBetween: 5, slidesPerView: 5.5 },
  },
};

const timeSlotSwiperParams = {
  direction: "horizontal",
  spaceBetween: 16,
  // Reduce spaceBetween for mobile
  breakpoints: {
    1024: { slidesPerView: 3, spaceBetween: 16 },
    768: { slidesPerView: 3, spaceBetween: 12 },
    640: { slidesPerView: 3, spaceBetween: 8 },
    320: { slidesPerView: 3, spaceBetween: 6 },
  },
  slidesPerView: 3, // 3 columns visible at a time
  mousewheel: true,
  modules: [Mousewheel, Grid],
  grid: {
    rows: 3,
    fill: "row",
  },
};

export default function AvailableTimeSlotes({
  doctID,
  isOpen,
  onClose,
  selectedSlot,
  setselectedSlot,
  selectedDate,
  setselectedDate,
  type,
}) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const getData = async () => {
    const url =
      type === "OPD"
        ? `get_doctor_time_interval/${doctID}/${getDayName(selectedDate)}`
        : type === "Video Consultant"
        ? `get_doctor_video_time_interval/${doctID}/${getDayName(selectedDate)}`
        : `get_doctor_time_interval/${doctID}/${getDayName(selectedDate)}`;
    const res = await GET(admin.token, url);
    return res.data;
  };

  const { isLoading: timeSlotesLoading, data: timeSlots, refetch: refetchTimeSlots } = useQuery({
    queryKey: ["timeslotes", selectedDate, doctID, type],
    queryFn: getData,
    enabled: !!selectedDate,
  });

  const getBookedSlotes = async () => {
    const res = await GET(
      admin.token,
      `get_booked_time_slots?doct_id=${doctID}&date=${moment(selectedDate).format("YYYY-MM-DD")}&type=${type}`
    );
    return res.data;
  };

  const { isLoading: bookedSlotesLoading, data: bookedSlotes } = useQuery({
    queryKey: ["bookedslotes", selectedDate, doctID],
    queryFn: getBookedSlotes,
    enabled: !!selectedDate,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

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

  if (timeSlotesLoading || bookedSlotesLoading) return <Loading />;

  // Sort timeSlots so available slots come first
  const sortedTimeSlots = [...(timeSlots || [])].sort((a, b) => {
    if (getSlotStatus(a) && !getSlotStatus(b)) return -1;
    if (!getSlotStatus(a) && getSlotStatus(b)) return 1;
    return 0;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside" blockScrollOnMount={false}>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        maxW={{ base: "95vw", md: "600px" }}
        mx={4}
        borderRadius="xl"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        maxH={{ base: "100svh", md: "85vh" }}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        minH={0}
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="bold"
          py={4}
          borderBottom="1px solid"
          borderColor={borderColor}
          flexShrink={0}
        >
          Select Date and Time Slot
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody p={6} overflowY="auto" flex="1" minH={0} sx={{ WebkitOverflowScrolling: "touch" }} style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}>
          <VStack spacing={6} align="stretch">
            {/* Date Selection */}
            <Box>
              <Text fontWeight="semibold" fontSize="md" mb={4} color="gray.700">
                Select Date
              </Text>
              <Box maxW="100%" overflow="hidden">
                <Swiper
                  {...dateSwiperParams}
                  style={{ cursor: "grab", overflow: "hidden", maxWidth: "100%" }}
                >
                  {Calender15Days().map((day, index) => (
                    <SwiperSlide key={index}>
                      <Box
                        onClick={() => {
                          setselectedDate(moment(day).format("YYYY-MM-DD"));
                          setTimeout(() => {
                            refetchTimeSlots();
                          }, 0);
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
                          mr={{ base: 1, md: 3 }}
                          borderRadius="lg"
                          p={{ base: 2, md: 3 }}
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
                          minW={{ base: "48px", md: "60px" }}
                          maxW={{ base: "56px", md: "70px" }}
                        >
                          <Text
                            fontSize={{ base: "2xs", md: "xs" }}
                            fontWeight="bold"
                            textAlign="center"
                            m={0}
                          >
                            {getFormattedDate(day).month}
                          </Text>
                          <Text
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="700"
                            textAlign="center"
                            m={0}
                          >
                            {getFormattedDate(day).date}
                          </Text>
                          <Text
                            fontSize={{ base: "2xs", md: "xs" }}
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
                  p={{ base: 2, md: 4 }}
                  borderRadius={{ base: "md", md: "lg" }}
                  bg="gray.50"
                  overflow="hidden"
                  minH={{ base: "40px", md: "80px" }}
                  maxH="none"
                >
                  {timeSlots?.length ? (
                    <Swiper {...timeSlotSwiperParams} style={{ width: "100%" }}>
                      {sortedTimeSlots.map((slot, index) => (
                        <SwiperSlide key={index}>
                          <Button
                            size={{ base: "sm", md: "md" }}
                            fontSize={{ base: "xs", md: "sm" }}
                            fontWeight="bold"
                            colorScheme={
                              slot === selectedSlot
                                ? "blue"
                                : !getSlotStatus(slot)
                                ? "red"
                                : "green"
                            }
                            variant="solid"
                            onClick={() => {
                              setselectedSlot(slot);
                              onClose();
                            }}
                            isDisabled={!getSlotStatus(slot)}
                            borderRadius={{ base: "md", md: "md" }}
                            transition="all 0.2s"
                            _hover={{
                              transform: "translateY(-1px)",
                              boxShadow: "sm",
                            }}
                            w="100%"
                            p={{ base: 2, md: 4 }}
                            minH={{ base: "32px", md: "40px" }}
                          >
                            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold">
                              {slot.time_start} - {slot.time_end}
                            </Text>
                          </Button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
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
      </ModalContent>
    </Modal>
  );
}