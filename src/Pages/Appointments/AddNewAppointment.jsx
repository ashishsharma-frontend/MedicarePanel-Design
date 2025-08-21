/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Select,
  useDisclosure,
  useToast,
  Stack,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import useDoctorData from "../../Hooks/UseDoctorData";
import usePatientData from "../../Hooks/UsePatientsData";
import { useState, useEffect } from "react";
import UsersCombobox from "../../Components/UsersComboBox";
import moment from "moment";
import { ChevronDownIcon } from "lucide-react";
import getStatusBadge from "../../Hooks/StatusBadge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ADD, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import AvailableTimeSlotes from "./AvailableTimeSlotes";
import AddPatients from "../Patients/AddPatients";

let defStatus = ["Pending", "Confirmed"];

const getTypeBadge = (type) => {
  switch (type) {
    case "Emergency":
      return (
        <Badge colorScheme="red" px={3} py={1} borderRadius="md" fontSize="xs">
          {type}
        </Badge>
      );
    case "OPD":
      return (
        <Badge colorScheme="green" px={3} py={1} borderRadius="md" fontSize="xs">
          {type}
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="blue" px={3} py={1} borderRadius="md" fontSize="xs">
          {type}
        </Badge>
      );
  }
};

const getFee = (type, doct) => {
  switch (type) {
    case "Emergency":
      return doct?.emg_fee;
    case "OPD":
      return doct?.opd_fee;
    case "Video Consultant":
      return doct?.video_fee;
    default:
      return doct?.emg_fee;
  }
};

const paymentModes = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Online" },
  { id: 3, name: "Other" },
  { id: 4, name: "Wallet" },
  { id: 5, name: "UPI" },
];

// add appointment
const addAppointment = async (data) => {
  const res = await ADD(admin.token, "add_appointment", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

// add appointment checkin
const addAppointmentCheckin = async (data) => {
  const res = await ADD(admin.token, "add_appointment_checkin", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddNewAppointment({ isOpen, onClose, PatientID }) {
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const {
    isOpen: timeSlotisOpen,
    onOpen: timeSlotonOpen,
    onClose: timeSlotonClose,
  } = useDisclosure();
  const {
    isOpen: AddPatientisOpen,
    onOpen: AddPatientonOpen,
    onClose: AddPatientonClose,
  } = useDisclosure();
  const { doctorsData } = useDoctorData();
  const { patientsData } = usePatientData();
  const [patient, setpatient] = useState();
  const [doct, setdoct] = useState();
  const [selectedDate, setselectedDate] = useState();
  const [selectedSlot, setselectedSlot] = useState();
  const [status, setstatus] = useState("Confirmed");
  const [type, settype] = useState();
  const [paymentStatus, setpaymentStatus] = useState();
  const [paymentMathod, setpaymentMathod] = useState();
  const [autoCheckin, setAutoCheckin] = useState(false);
  const queryClient = useQueryClient();
  const [defalutDataForPationt, setdefalutDataForPationt] = useState(PatientID);
  const [defaultDoctor, setDefaultDoctor] = useState();

  // Auto-select defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      // Auto-select next date (tomorrow)
      const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
      setselectedDate(tomorrow);
      
      // Auto-select "OPD" as default type
      settype("OPD");
      
      // Auto-select default payment status for OPD
      setpaymentStatus("Unpaid");
      
      // Auto-select first available doctor if available
      if (doctorsData && doctorsData.length > 0) {
        const firstDoctor = doctorsData[0];
        console.log("Setting default doctor:", firstDoctor);
        setdoct(firstDoctor);
        setDefaultDoctor(firstDoctor);
      } else {
        console.log("No doctors data available:", doctorsData);
      }
      
      // Auto-select patient if PatientID is provided
      if (PatientID && patientsData) {
        const defaultPatient = patientsData.find(p => p.id === PatientID);
        if (defaultPatient) {
          setpatient(defaultPatient);
        }
      }
    }
  }, [isOpen, doctorsData, patientsData, PatientID]);

  // Handle doctor data loading after modal is open
  useEffect(() => {
    if (isOpen && doctorsData && doctorsData.length > 0 && !doct) {
      const firstDoctor = doctorsData[0];
      console.log("Setting default doctor after data load:", firstDoctor);
      setdoct(firstDoctor);
      setDefaultDoctor(firstDoctor);
    }
  }, [isOpen, doctorsData, doct]);

  // Auto-select next available timeslot when doctor and date are set
  useEffect(() => {
    if (doct && selectedDate && type === "OPD") {
      // Get current time
      const now = moment();
      const selectedMoment = moment(selectedDate);
      
      // If selected date is today, find next available slot
      if (selectedMoment.isSame(now, 'day')) {
        const currentTime = now.format('HH:mm');
        
        // Default time slots (you can adjust these based on your business hours)
        const timeSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
          '16:00', '16:30', '17:00', '17:30'
        ];
        
        // Find next available slot
        const nextSlot = timeSlots.find(slot => slot > currentTime);
        if (nextSlot) {
          setselectedSlot({ time_start: nextSlot });
        } else {
          // If no slots available today, set first slot of next day
          setselectedDate(moment().add(1, 'day').format('YYYY-MM-DD'));
          setselectedSlot({ time_start: '09:00' });
        }
      } else {
        // For future dates, set first available slot
        setselectedSlot({ time_start: '09:00' });
      }
    }
  }, [doct, selectedDate, type]);

  // doctorDetails
  const { data: doctorDetails, isLoading: isDoctLoading } = useQuery({
    queryKey: ["doctor", doct?.user_id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${doct?.user_id}`);
      return res.data;
    },
    enabled: !!doct,
  });

  const checkMissingValues = () => {
    if (!patient) return "patient";
    if (!doct) return "doctor";
    if (!type) return "Appointment Type";
    if (!selectedDate) return "Date";
    if (!selectedSlot) return "Time Slot";
    if (!status) return "Appointment status";
    if (!paymentStatus) return "Payment Status";
    if (paymentStatus === "Paid" && !paymentMathod) return "Payment Method";
    return null;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const missingField = checkMissingValues();
      if (missingField) {
        throw new Error(`Please select ${missingField}`);
      } else if (isDoctLoading || !doctorDetails) {
        throw new Error(`Unable to fetch doctor details`);
      }
      if (!missingField) {
        let formData = {
          patient_id: patient.id,
          status: status,
          date: selectedDate,
          time_slots: selectedSlot.time_start,
          doct_id: doct.user_id,
          dept_id: doctorDetails.department,
          type: type,
          fee: getFee(type, doct),
          total_amount: getFee(type, doct),
          unit_total_amount: getFee(type, doct),
          invoice_description: type,
          payment_method: paymentMathod || null,
          service_charge: 0,
          payment_transaction_id:
            paymentStatus === "Paid" ? "Pay at Hospital" : null,
          is_wallet_txn: 0,
          payment_status: paymentStatus,
          source: "Admin",
        };
        const res = await addAppointment(formData);
        
        // Auto check-in if enabled
        if (autoCheckin) {
          try {
            // Try different possible response structures
            const appointmentId = res.data?.id || res.id || res.data?.appointment_id;
            
            if (appointmentId) {
              let formDataCheckin = {
                appointment_id: appointmentId,
                date: selectedDate,
                time: moment(selectedSlot.time_start, "HH:mm").format("HH:mm:ss"),
              };
              await addAppointmentCheckin(formDataCheckin);
            } else {
              ShowToast(toast, "warning", "Appointment created but could not get ID for check-in");
            }
          } catch (error) {
            ShowToast(toast, "warning", "Appointment created but check-in failed");
          }
        }
        
        return res;
      }
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      ShowToast(toast, "success", autoCheckin ? "Appointment added and checked in successfully!" : "Appointment added successfully!");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries("checkins");
      onClose();
    },
  });

  // Manual check-in function
  const handleManualCheckin = async () => {
    const missingField = checkMissingValues();
    if (missingField) {
      ShowToast(toast, "error", `Please select ${missingField}`);
      return;
    }
    
    try {
      let formDataCheckin = {
        appointment_id: "", // Will be filled after appointment creation
        date: selectedDate,
        time: selectedSlot.time_start,
      };
      
      // First create appointment
      let formData = {
        patient_id: patient.id,
        status: status,
        date: selectedDate,
        time_slots: selectedSlot.time_start,
        doct_id: doct.user_id,
        dept_id: doctorDetails.department,
        type: type,
        fee: getFee(type, doct),
        total_amount: getFee(type, doct),
        unit_total_amount: getFee(type, doct),
        invoice_description: type,
        payment_method: paymentMathod || null,
        service_charge: 0,
        payment_transaction_id:
          paymentStatus === "Paid" ? "Pay at Hospital" : null,
        is_wallet_txn: 0,
        payment_status: paymentStatus,
        source: "Admin",
      };
      
      const res = await addAppointment(formData);
      
      // Try different possible response structures
      const appointmentId = res.data?.id || res.id || res.data?.appointment_id;
      
      if (appointmentId) {
        formDataCheckin.appointment_id = appointmentId;
        formDataCheckin.time = moment(selectedSlot.time_start, "HH:mm").format("HH:mm:ss");
        await addAppointmentCheckin(formDataCheckin);
        ShowToast(toast, "success", "Appointment added and checked in successfully!");
        queryClient.invalidateQueries("appointments");
        queryClient.invalidateQueries("main-appointments");
        queryClient.invalidateQueries("checkins");
        onClose();
      } else {
        ShowToast(toast, "error", "Appointment created but could not get ID for check-in");
      }
    } catch (error) {
      ShowToast(toast, "error", error.message);
    }
  };

  return (
    <Box>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        onOverlayClick={false}
        isCentered
        scrollBehavior="inside"
        blockScrollOnMount={false}
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent
          maxW={{ base: "95vw", md: "600px" }}
          w="100%"
          mx={{ base: 1, md: 4 }}
          borderRadius="lg"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
          maxH={{ base: "100svh", md: "85vh" }}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          minH={0}
        >
          <ModalHeader 
            fontSize="lg"
            fontWeight="bold"
            px={4}
            py={3}
            borderBottom="1px solid"
            borderColor={borderColor}
            flexShrink={0}
          >
            Add New Appointment
          </ModalHeader>
          <ModalCloseButton top={3} right={3} />
          <ModalBody
            px={4}
            py={4}
            overflowY="auto"
            flex="1"
            minH={0}
            sx={{ WebkitOverflowScrolling: "touch" }}
            style={{ overscrollBehavior: "contain", touchAction: "pan-y" }}
          >
            <VStack spacing={4} align="stretch">
              {/* Patient & Doctor Selection */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Patient
                  </FormLabel>
                  <UsersCombobox
                    data={patientsData}
                    name={"Patient"}
                    setState={setpatient}
                    defaultData={defalutDataForPationt}
                    addNew={true}
                    addOpen={AddPatientonOpen}
                    w="100%"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Doctor
                  </FormLabel>
                  <UsersCombobox
                    data={doctorsData}
                    name={"Doctor"}
                    setState={setdoct}
                    defaultData={defaultDoctor}
                    w="100%"
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={AddPatientonOpen}
                w="fit-content"
              >
                Add New Patient
              </Button>

              {/* Appointment Details */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Appointment Type
                  </FormLabel>
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      w="100%"
                      textAlign="left"
                      variant="outline"
                      fontWeight="normal"
                      bg="white"
                      borderColor={borderColor}
                      _hover={{ borderColor: "blue.400" }}
                      size="sm"
                    >
                      {type ? getTypeBadge(type) : "Select Type"}
                    </MenuButton>
                    <MenuList w="100%">
                      {["OPD", "Video Consultant", "Emergency"].map((option) => (
                        <MenuItem
                          key={option}
                          onClick={() => {
                            if (option !== "OPD") setpaymentStatus("Paid");
                            if (option === "Emergency") {
                              settype(option);
                              setselectedDate(moment().format("YYYY-MM-DD"));
                              setselectedSlot({ time_start: moment().format("HH:mm") });
                            } else {
                              setselectedDate();
                              setselectedSlot();
                              settype(option);
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            {getTypeBadge(option)}
                          </Box>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Status
                  </FormLabel>
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      w="100%"
                      textAlign="left"
                      variant="outline"
                      fontWeight="normal"
                      bg="white"
                      borderColor={borderColor}
                      _hover={{ borderColor: "blue.400" }}
                      size="sm"
                    >
                      {status ? getStatusBadge(status) : "Select Status"}
                    </MenuButton>
                    <MenuList w="100%">
                      {defStatus.map((option) => (
                        <MenuItem
                          key={option}
                          onClick={() => setstatus(option)}
                        >
                          <Box display="flex" alignItems="center">
                            {getStatusBadge(option)}
                          </Box>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Appointment Date
                  </FormLabel>
                  <Input
                    size="sm"
                    variant="outline"
                    value={selectedDate ? moment(selectedDate).format("DD-MM-YYYY") : ""}
                    placeholder="Select Date"
                    readOnly
                    onClick={() => {
                      if (!doct) return ShowToast(toast, "error", "Please Select Doctor");
                      if (!type) return ShowToast(toast, "error", "Please Select Appointment Type");
                      timeSlotonOpen();
                    }}
                    cursor="pointer"
                    bg="white"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Time Slot
                  </FormLabel>
                  <Input
                    size="sm"
                    variant="outline"
                    value={
                      selectedSlot
                        ? moment(selectedSlot.time_start, "HH:mm").format("hh:mm A")
                        : "Select Time Slot"
                    }
                    readOnly
                    onClick={() => {
                      if (!doct) return ShowToast(toast, "error", "Please Select Doctor");
                      timeSlotonOpen();
                    }}
                    cursor="pointer"
                    bg="white"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400" }}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Payment Details */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Payment Status
                  </FormLabel>
                  <Select
                    placeholder="Select payment status"
                    variant="outline"
                    onChange={(e) => setpaymentStatus(e.target.value)}
                    value={paymentStatus}
                    bg="white"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400" }}
                    size="sm"
                  >
                    <option value="Paid">Paid</option>
                    {type === "OPD" && <option value="Unpaid">Not Paid</option>}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Payment Method
                  </FormLabel>
                  <Select
                    placeholder="Select payment method"
                    variant="outline"
                    onChange={(e) => setpaymentMathod(e.target.value)}
                    bg="white"
                    borderColor={borderColor}
                    _hover={{ borderColor: "blue.400" }}
                    size="sm"
                  >
                    {paymentModes.map((item) => (
                      <option value={item.name} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Fee
                  </FormLabel>
                  <Input
                    variant="outline"
                    size="sm"
                    isReadOnly
                    value={doct && type ? getFee(type, doct) : 0}
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1}>
                    Total Amount
                  </FormLabel>
                  <Input
                    variant="outline"
                    size="sm"
                    isReadOnly
                    value={doct && type ? getFee(type, doct) : 0}
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
              </SimpleGrid>

              {/* Check-in Options */}
              <Box>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={0} mr={2}>
                    Auto Check-in
                  </FormLabel>
                  <input
                    type="checkbox"
                    checked={autoCheckin}
                    onChange={(e) => setAutoCheckin(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                </FormControl>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Automatically create check-in record when appointment is added
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter px={4} py={3} borderTop="1px solid" borderColor={borderColor} flexShrink={0}>
            <HStack spacing={3} w="100%">
              <Button
                colorScheme="gray"
                onClick={onClose}
                size="sm"
                variant="outline"
                flex={1}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => mutation.mutate()}
                isLoading={mutation.isPending}
                loadingText="Adding..."
                flex={1}
              >
                Add Appointment
              </Button>
              {/*
              <Button
                colorScheme="green"
                size="sm"
                onClick={handleManualCheckin}
                isLoading={mutation.isPending}
                loadingText="Adding & Checking In..."
                flex={1}
              >
                Add & Check-in
              </Button>
              */}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {timeSlotisOpen ? (
        <AvailableTimeSlotes
          isOpen={timeSlotisOpen}
          onClose={timeSlotonClose}
          doctID={doct?.user_id}
          selectedDate={selectedDate}
          setselectedDate={setselectedDate}
          selectedSlot={selectedSlot}
          setselectedSlot={setselectedSlot}
          type={type}
        />
      ) : null}
      {AddPatientisOpen ? (
        <AddPatients
          nextFn={(data) => {
            setdefalutDataForPationt(data);
          }}
          isOpen={AddPatientisOpen}
          onClose={AddPatientonClose}
        />
      ) : null}
    </Box>
  );
}

export default AddNewAppointment;