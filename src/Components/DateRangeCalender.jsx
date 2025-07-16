/* eslint-disable react/prop-types */
import {
  Box,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  useDisclosure,
  VStack,
  HStack,
  SimpleGrid,
  useBreakpointValue,
  InputGroup,
  InputLeftElement,
  Divider,
  Text,
  Flex,
} from "@chakra-ui/react";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment";
import { useState } from "react";
import { DateRangePicker, Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { daysBack } from "../Controllers/dateConfig";

const PRESETS = [
  { label: "Today", getRange: () => {
    const today = new Date();
    return { startDate: today, endDate: today };
  }},
  { label: "Yesterday", getRange: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return { startDate: yesterday, endDate: yesterday };
  }},
  { label: "This Week", getRange: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return { startDate: start, endDate: now };
  }},
  { label: "Last Week", getRange: () => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() - now.getDay() - 1);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { startDate: start, endDate: end };
  }},
  { label: "This Month", getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start, endDate: now };
  }},
  { label: "Last Month", getRange: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: start, endDate: end };
  }},
];

const DateRangeCalender = ({ setDateRange, setLastDays, size, dateRange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const initialStartDate = new Date();
  initialStartDate.setDate(initialStartDate.getDate() - daysBack);

  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  // For mobile input fields
  const [mobileStart, setMobileStart] = useState("");
  const [mobileEnd, setMobileEnd] = useState("");
  const [activePreset, setActivePreset] = useState(null);

  const handleSelect = (ranges) => {
    setSelectionRange(ranges.selection);
    setMobileStart(moment(ranges.selection.startDate).format("YYYY-MM-DD"));
    setMobileEnd(moment(ranges.selection.endDate).format("YYYY-MM-DD"));
    setActivePreset(null);
  };

  const setDate = () => {
    const startDate = isMobile ? mobileStart : moment(selectionRange.startDate).format("YYYY-MM-DD");
    const endDate = isMobile ? mobileEnd : moment(selectionRange.endDate).format("YYYY-MM-DD");
    setDateRange({
      startDate,
      endDate,
    });
    if (setLastDays) {
      setLastDays(calculateDaysDifference(startDate, endDate));
    }
    onClose();
  };

  const calculateDaysDifference = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, "days") + 1;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = moment(startDate).format("D MMM YY");
    const end = moment(endDate).format("D MMM YY");
    return `${start} - ${end}`;
  };

  // Handle preset click (for mobile)
  const handlePreset = (getRange, idx) => {
    const { startDate, endDate } = getRange();
    setSelectionRange({ startDate, endDate, key: "selection" });
    setMobileStart(moment(startDate).format("YYYY-MM-DD"));
    setMobileEnd(moment(endDate).format("YYYY-MM-DD"));
    setActivePreset(idx);
  };

  return (
    <Box>
      <Input
        onClick={onOpen}
        isReadOnly
        size={size || "sm"}
        borderRadius={6}
        value={
          dateRange?.startDate && dateRange?.endDate
            ? formatDateRange(dateRange?.startDate, dateRange?.endDate)
            : "Select Date Range"
        }
        cursor="pointer"
        w={isMobile ? "100%" : "fit-content"}
        minW={isMobile ? "auto" : 44}
        fontSize={isMobile ? "md" : "sm"}
        maxW={isMobile ? "100%" : "300px"}
        py={isMobile ? 5 : undefined}
      />
      {isMobile ? (
        <MobileDateRangeModal
          isOpen={isOpen}
          onClose={onClose}
          selectionRange={selectionRange}
          setSelectionRange={setSelectionRange}
          setDate={setDate}
          mobileStart={mobileStart}
          setMobileStart={setMobileStart}
          mobileEnd={mobileEnd}
          setMobileEnd={setMobileEnd}
          handlePreset={handlePreset}
          activePreset={activePreset}
        />
      ) : (
        <CalenderModal
          isOpen={isOpen}
          onClose={onClose}
          selectionRange={selectionRange}
          handleSelect={handleSelect}
          setDate={setDate}
        />
      )}
    </Box>
  );
};

const CalenderModal = ({
  isOpen,
  onClose,
  selectionRange,
  handleSelect,
  setDate,
}) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("black", "white");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md" py={2}>
          Select Date Range
        </ModalHeader>
        <ModalCloseButton top={2} size="sm" />
        <ModalBody p={0}>
          <Box bg={bgColor} color={textColor} borderRadius="md">
            <DateRangePicker
              ranges={[selectionRange]}
              onChange={handleSelect}
              rangeColors={["#3182CE"]}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
            />
          </Box>
          <Box p={2}>
            <Button
              size="sm"
              w="full"
              mt={2}
              colorScheme="blue"
              onClick={setDate}
            >
              Set
            </Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const MobileDateRangeModal = ({
  isOpen,
  onClose,
  selectionRange,
  setSelectionRange,
  setDate,
  mobileStart,
  setMobileStart,
  mobileEnd,
  setMobileEnd,
  handlePreset,
  activePreset,
}) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("black", "white");
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="2xl" m={2} minW="unset" maxW="420px" boxShadow="2xl">
        <ModalHeader fontSize="xl" fontWeight="bold" py={4} textAlign="center">
          Select Date Range
        </ModalHeader>
        <Divider borderColor={dividerColor} mb={2} />
        <ModalCloseButton top={4} size="lg" />
        <ModalBody p={0}>
          <VStack spacing={5} align="stretch" px={4} pb={4}>
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Start Date
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaCalendarAlt color="#3182CE" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={mobileStart}
                  onChange={e => {
                    setMobileStart(e.target.value);
                    setSelectionRange(r => ({ ...r, startDate: new Date(e.target.value) }));
                  }}
                  borderRadius="lg"
                  borderColor="gray.300"
                  bg={bgColor}
                  size="lg"
                />
              </InputGroup>
            </VStack>
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                End Date
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaCalendarAlt color="#3182CE" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={mobileEnd}
                  onChange={e => {
                    setMobileEnd(e.target.value);
                    setSelectionRange(r => ({ ...r, endDate: new Date(e.target.value) }));
                  }}
                  borderRadius="lg"
                  borderColor="gray.300"
                  bg={bgColor}
                  size="lg"
                />
              </InputGroup>
            </VStack>
            <Box
              w="full"
              bg={bgColor}
              color={textColor}
              borderRadius="2xl"
              boxShadow="md"
              p={2}
              display="flex"
              justifyContent="center"
            >
              <Calendar
                date={selectionRange.startDate}
                onChange={date => {
                  setSelectionRange(r => ({ ...r, startDate: date, endDate: date }));
                  setMobileStart(moment(date).format("YYYY-MM-DD"));
                  setMobileEnd(moment(date).format("YYYY-MM-DD"));
                }}
                color="#3182CE"
                showMonthAndYearPickers={true}
                showDateDisplay={false}
                showPreview={false}
              />
            </Box>
            <Box w="full" overflowX="auto" pb={1}>
              <HStack spacing={2} minW="max-content">
                {PRESETS.map((preset, idx) => (
                  <Button
                    key={preset.label}
                    size="sm"
                    variant={activePreset === idx ? "solid" : "outline"}
                    colorScheme="blue"
                    borderRadius="full"
                    fontWeight={activePreset === idx ? "bold" : "normal"}
                    onClick={() => handlePreset(preset.getRange, idx)}
                    boxShadow={activePreset === idx ? "md" : undefined}
                  >
                    {preset.label}
                  </Button>
                ))}
              </HStack>
            </Box>
            <Button
              size="lg"
              w="full"
              mt={2}
              colorScheme="blue"
              onClick={setDate}
              fontSize="lg"
              py={6}
              borderRadius="xl"
              boxShadow="md"
            >
              Set
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DateRangeCalender;
