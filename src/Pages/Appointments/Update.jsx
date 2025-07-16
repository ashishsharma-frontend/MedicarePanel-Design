import { BsPersonVideo } from "react-icons/bs";
import { BiLinkExternal } from "react-icons/bi";
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Link,
  theme,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useForm } from "react-hook-form";
import Loading from "../../Components/Loading";
import moment from "moment";
import getStatusBadge from "../../Hooks/StatusBadge";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import DynamicTable from "../../Components/DataTable";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import showToast from "../../Controllers/ShowToast";
import InvoiceByAppointmentID from "../Invoices/InvoiceByAppointmentID";
import TransactionByAppID from "../Transaction/TransactionByAppID";
import PaymentsByAppID from "../Payments/PaymentsByAppID";
import RescheduleAppointment from "./RescheduleAppointment";
import PaymentStatusPaid from "./PaymentStatusPaid";
import PrescriptionByAppID from "../Prescriptions/Prescription";
import useHasPermission from "../../Hooks/HasPermission";
import PatientFiles from "../Patients/PatientFiles";
import { FaPrint } from "react-icons/fa";
import api from "../../Controllers/api";

let defStatusOPD = ["Pending", "Confirmed", "Rejected", "Visited"];
let defStatusVedio = ["Pending", "Confirmed", "Rejected", "Completed"];

const getDef = (type) => {
  return type === "OPD"
    ? defStatusOPD
    : type === "Video Consultant"
    ? defStatusVedio
    : defStatusOPD;
};

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
        <Badge colorScheme="green" px={3} py={1} borderRadius="md" fontSize="xs">
          {type}
        </Badge>
      );
  }
};

const handleUpdate = async (data) => {
  const res = await UPDATE(admin.token, "update_appointment", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleStatusUpdate = async (data) => {
  const res = await UPDATE(admin.token, "update_appointment_status", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleAppointmentReject = async (data) => {
  const res = await UPDATE(admin.token, "appointment_reject_and_refund", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleCancelAppointment = async (data) => {
  const res = await UPDATE(
    admin.token,
    "appointment_cancellation_and_refund",
    data
  );
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function UpdateAppointment() {
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "gray.700");
  
  const {
    isOpen: RescheduleIsOpen,
    onOpen: RescheduleOnOpen,
    onClose: RescheduleOnClose,
  } = useDisclosure();
  const {
    isOpen: paymentIsOpen,
    onOpen: paymentOnOpen,
    onClose: paymentOnClose,
  } = useDisclosure();

  const getData = async () => {
    const res = await GET(admin.token, `get_appointment/${id}`);
    setSelectedOption(res.data.status);
    return res.data;
  };

  const { data: appointmntData, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: getData,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment", id]);
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });
  const statusMutation = useMutation({
    mutationFn: async (data) => {
      await handleStatusUpdate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment", id]);
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({ ...formData, status: selectedOption });
  };

  if (isLoading || mutation.isPending || statusMutation.isPending)
    return <Loading />;

  return (
    <Box bg={bgColor} minH="100vh" p={{ base: 2.5, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box mb={2}>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight="bold"
            color="#2156F4"
            mb={{ base: 4, md: 5 }}
            letterSpacing="0.01em"
            textAlign="left"
          >
            Appointment Details #{id}
          </Text>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'center' }}
            gap={{ base: 2, md: 4 }}
            mb={{ base: 4, md: 5 }}
          >
            <HStack spacing={3} mb={{ base: 2, md: 0 }}>
              {getStatusBadge(appointmntData?.status)}
              <Badge colorScheme="gray" px={3} py={1} borderRadius="md">
                Source - {appointmntData.source}
              </Badge>
            </HStack>
            <HStack spacing={3}>
              <Button
                rightIcon={<FaPrint />}
                size="sm"
                variant="outline"
                as={Link}
                href={`${api}/consultation_report/${id}`}
                isExternal
              >
                Print Report
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={() => navigate(-1)}
                colorScheme="gray"
              >
                Back
              </Button>
            </HStack>
          </Flex>
        </Box>
        {/* Tabs */}
        <Box bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Tabs colorScheme="blue" variant="enclosed">
            <TabList
              px={{ base: 2.5, md: 6 }}
              pt={{ base: 2, md: 4 }}
              overflowX={{ base: "auto", md: "visible" }}
              whiteSpace={{ base: "nowrap", md: "normal" }}
              sx={{
                scrollbarWidth: "none",
                '::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Overview</Tab>
              {hasPermission("PRESCRIPTION_VIEW") && <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Prescriptions</Tab>}
              {hasPermission("APPOINTMENT_INVOICE_VIEW") && <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Invoice</Tab>}
              {hasPermission("ALL_TRANSACTION_VIEW") && <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Transaction</Tab>}
              {hasPermission("APPOINTMENT_PAYMENTS_VIEW") && <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Payments</Tab>}
              {hasPermission("FILE_VIEW") && <Tab fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>Patient Files</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel px={{ base: 2.5, md: 6 }} py={{ base: 4, md: 6 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={6} align="stretch">
                    {/* Patient & Doctor Details */}
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={{ base: 4, md: 6 }}>
                      {/* Patient Details */}
                      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" w="100%">
                        <CardBody p={{ base: 2.5, md: 6 }}>
                          <HStack justify="space-between" align="center" mb={4}>
                            <Heading as="h3" size="md" color="gray.800">
                              Patient Details
                            </Heading>
                            <Link
                              to={`/patient/${appointmntData.patient_id}`}
                              as={RouterLink}
                            >
                              <BiLinkExternal fontSize={20} color={theme.colors.blue[500]} />
                            </Link>
                          </HStack>
                          <VStack spacing={4} align="stretch">
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  First Name
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.patient_f_name}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Last Name
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.patient_l_name}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                            </HStack>
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Phone
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.patient_phone}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Gender
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.patient_gender}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Doctor Details */}
                      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" w="100%">
                        <CardBody p={{ base: 2.5, md: 6 }}>
                          <HStack justify="space-between" align="center" mb={4}>
                            <Heading as="h3" size="md" color="gray.800">
                              Doctor Details
                            </Heading>
                            <Link
                              to={`/doctor/${appointmntData.doct_id}`}
                              as={RouterLink}
                            >
                              <BiLinkExternal fontSize={20} color={theme.colors.blue[500]} />
                            </Link>
                          </HStack>
                          <VStack spacing={4} align="stretch">
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  First Name
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.doct_f_name}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Last Name
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.doct_l_name}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                            </HStack>
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Specialization
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.doct_specialization}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Department
                                </FormLabel>
                                <Input
                                  size="md"
                                  isReadOnly
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.dept_title}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    {/* Appointment & Other Details */}
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={{ base: 4, md: 6 }}>
                      {/* Appointment Details */}
                      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" w="100%">
                        <CardBody p={{ base: 2.5, md: 6 }}>
                          <Heading as="h3" size="md" color="gray.800" mb={4}>
                            Appointment Details
                          </Heading>
                          <VStack spacing={4} align="stretch">
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Date
                                </FormLabel>
                                <Input
                                  size="md"
                                  fontWeight="600"
                                  variant="outline"
                                  value={moment(appointmntData?.date).format("DD-MM-YYYY")}
                                  onClick={() => {
                                    if (
                                      appointmntData?.status == "Confirmed" ||
                                      appointmntData?.status == "Pending" ||
                                      appointmntData?.status == "Rescheduled"
                                    ) {
                                      RescheduleOnOpen();
                                    }
                                  }}
                                  cursor="pointer"
                                  borderColor={borderColor}
                                  _hover={{ borderColor: "blue.400" }}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Time Slot
                                </FormLabel>
                                <Input
                                  size="md"
                                  fontWeight="600"
                                  variant="outline"
                                  value={moment(appointmntData?.time_slots, "hh:mm:ss").format("hh:mm A")}
                                  onClick={() => {
                                    if (
                                      appointmntData?.status == "Confirmed" ||
                                      appointmntData?.status == "Pending" ||
                                      appointmntData?.status == "Rescheduled"
                                    ) {
                                      RescheduleOnOpen();
                                    }
                                  }}
                                  cursor="pointer"
                                  borderColor={borderColor}
                                  _hover={{ borderColor: "blue.400" }}
                                />
                              </FormControl>
                            </HStack>
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Status
                                </FormLabel>
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                    bg="transparent"
                                    w="100%"
                                    textAlign="left"
                                    pl={0}
                                    pt={0}
                                    h={10}
                                    _hover={{ bg: "transparent" }}
                                    _focus={{ bg: "transparent" }}
                                    borderBottom="1px solid"
                                    borderBottomRadius={0}
                                    borderColor={borderColor}
                                  >
                                    {selectedOption
                                      ? getStatusBadge(selectedOption)
                                      : getStatusBadge(appointmntData?.status)}
                                  </MenuButton>
                                  {["Pending", "Confirmed", "Rescheduled"].includes(
                                    appointmntData?.status
                                  ) && (
                                    <MenuList>
                                      {getDef(appointmntData.type).map((option) => (
                                        <MenuItem
                                          key={option}
                                          onClick={() => {
                                            if (
                                              appointmntData.current_cancel_req_status ===
                                              "Initiated"
                                            ) {
                                              return showToast(
                                                toast,
                                                "error",
                                                "Please Update the Cancellation request first"
                                              );
                                            }

                                            if (option === "Rejected") {
                                              onOpen();
                                            } else {
                                              let data = {
                                                id: id,
                                                status: option,
                                              };
                                              statusMutation.mutate(data);
                                            }
                                          }}
                                        >
                                          <Box display="flex" alignItems="center">
                                            {getStatusBadge(option)}
                                          </Box>
                                        </MenuItem>
                                      ))}
                                    </MenuList>
                                  )}
                                </Menu>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Type
                                </FormLabel>
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                    bg="transparent"
                                    w="100%"
                                    textAlign="left"
                                    pl={0}
                                    pt={0}
                                    h={10}
                                    _hover={{ bg: "transparent" }}
                                    _focus={{ bg: "transparent" }}
                                    borderBottom="1px solid"
                                    borderBottomRadius={0}
                                    borderColor={borderColor}
                                  >
                                    {getTypeBadge(appointmntData.type)}
                                  </MenuButton>
                                </Menu>
                              </FormControl>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Other Details */}
                      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" w="100%">
                        <CardBody p={{ base: 2.5, md: 6 }}>
                          <Heading as="h3" size="md" color="gray.800" mb={4}>
                            Other Details
                          </Heading>
                          <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                Payment Status
                              </FormLabel>
                              <Select
                                placeholder="Select payment status"
                                variant="outline"
                                value={appointmntData?.payment_status}
                                {...register("payment_status")}
                                isReadOnly
                                onChange={(e) => {
                                  if (e.target.value === "Paid") {
                                    paymentOnOpen();
                                  }
                                }}
                                borderColor={borderColor}
                              >
                                {["Pending", "Not Paid", "Unpaid"].includes(
                                  appointmntData.payment_status
                                ) || appointmntData.payment_status === null ? (
                                  <>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Not Paid">Not Paid</option>
                                    <option value="Refunded">Refunded</option>
                                  </>
                                ) : (
                                  <>
                                    <option value={appointmntData.payment_status}>
                                      {appointmntData.payment_status}
                                    </option>
                                  </>
                                )}
                              </Select>
                            </FormControl>
                            <HStack spacing={2} flexDir={{ base: "column", sm: "row" }}>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Meeting ID
                                </FormLabel>
                                <Input
                                  {...register("meeting_id")}
                                  size="md"
                                  fontWeight="600"
                                  variant="outline"
                                  defaultValue={appointmntData.meeting_id}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                                  Meeting Link
                                </FormLabel>
                                <Input
                                  {...register("meeting_link")}
                                  size="md"
                                  fontWeight="600"
                                  variant="outline"
                                  value={appointmntData.meeting_link}
                                  borderColor={borderColor}
                                />
                              </FormControl>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Grid>

                    {/* Cancellation Request */}
                    <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" w="100%">
                      <CardBody p={{ base: 2.5, md: 6 }}>
                        <Heading as="h3" size="md" color="gray.800" mb={4}>
                          Cancellation Request
                        </Heading>
                        <CancellationReq current_req={appointmntData.current_cancel_req_status} />
                      </CardBody>
                    </Card>
                  </VStack>
                </form>
              </TabPanel>
              {hasPermission("PRESCRIPTION_VIEW") && (
                <TabPanel px={{ base: 2.5, md: 6 }} py={{ base: 4, md: 6 }}>
                  <PrescriptionByAppID
                    appointmentID={id}
                    appointmntData={appointmntData}
                  />
                </TabPanel>
              )}
              {hasPermission("APPOINTMENT_INVOICE_VIEW") && (
                <TabPanel px={{ base: 2.5, md: 6 }} py={{ base: 4, md: 6 }}>
                  <InvoiceByAppointmentID appointmentID={id} />
                </TabPanel>
              )}
              {hasPermission("ALL_TRANSACTION_VIEW") && (
                <TabPanel px={{ base: 2.5, md: 6 }} py={{ base: 4, md: 6 }}>
                  <TransactionByAppID appointmentID={id} />
                </TabPanel>
              )}
              {hasPermission("APPOINTMENT_PAYMENTS_VIEW") && (
                <TabPanel px={{ base: 2.5, md: 6 }} py={{ base: 4, md: 6 }}>
                  <PaymentsByAppID appointmentID={id} />
                </TabPanel>
              )}
              <TabPanel px={{ base: 2.5, md: 6 }} py={{ base: 4, md: 6 }}>
                <PatientFiles id={appointmntData.patient_id} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
      
      <HandlePendingStatus
        isOpen={isOpen}
        onClose={onClose}
        id={id}
        appData={appointmntData}
      />
      <RescheduleAppointment
        data={appointmntData}
        isOpen={RescheduleIsOpen}
        onClose={RescheduleOnClose}
      />
      <PaymentStatusPaid
        id={id}
        isOpen={paymentIsOpen}
        onClose={paymentOnClose}
      />
    </Box>
  );
}

function getNextStates(currentState) {
  switch (currentState) {
    case "Initiated":
      return ["Processing", "Rejected", "Approved"];
    case "Processing":
      return ["Rejected", "Approved"];
    case "Rejected":
      return [];
    case "Approved":
      return [];
    default:
      return [];
  }
}

const CancellationReq = ({ current_req }) => {
  const { id } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updatedStatus, setupdatedStatus] = useState();
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_appointment_cancel_req/appointment/${id}`
    );
    const rearrangedArray = res?.data.map((item) => {
      const { status, notes, created_at } = item;
      return {
        Status: getCancellationStatusBadge(status),
        notes: notes,
        "Created At": moment(created_at).format("DD MMM YY hh:mm A"),
      };
    });

    return rearrangedArray.sort((a, b) => b.id - a.id);
  };
  const { isLoading, data } = useQuery({
    queryKey: ["appointment-canc-req", id],
    queryFn: getData,
  });

  const updateReqStatus = async (status) => {
    let data = {
      appointment_id: id,
      status: status,
    };
    try {
      const res = await UPDATE(admin.token, "appointment_cancellation", data);
      if (res.response === 200) {
        showToast(toast, "success", "Updated!");
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (status) => {
      updateReqStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["appointment-canc-req", id]);
      queryClient.invalidateQueries("appointment", id);
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
    },
  });

  if (mutation.isLoading) return <Loading />;
  return (
    <Box>
      {isLoading || !data ? (
        <VStack spacing={4} align="stretch">
          <Skeleton h={8} w="300px" />
          <Skeleton h={10} w="100%" />
          <Skeleton h={10} w="100%" />
          <Skeleton h={10} w="100%" />
          <Skeleton h={10} w="100%" />
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch">
          {data.length ? (
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                Update Request Status
              </FormLabel>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  bg="transparent"
                  w="300px"
                  textAlign="left"
                  pl={0}
                  pt={0}
                  h={10}
                  _hover={{ bg: "transparent" }}
                  _focus={{ bg: "transparent" }}
                  borderBottom="1px solid"
                  borderBottomRadius={0}
                  borderColor={borderColor}
                >
                  {getCancellationStatusBadge(current_req)}
                </MenuButton>
                {getNextStates(current_req)?.length ? (
                  <MenuList>
                    {getNextStates(current_req)?.map((option) => (
                      <MenuItem
                        key={option}
                        onClick={() => {
                          onOpen();
                          setupdatedStatus(option);
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          {getCancellationStatusBadge(option)}
                        </Box>
                      </MenuItem>
                    ))}
                  </MenuList>
                ) : null}
              </Menu>
            </FormControl>
          ) : null}
          <DynamicTable minPad="8px 10px" data={data} />
        </VStack>
      )}

      <HandelUpdateCancellation
        isOpen={isOpen}
        onClose={onClose}
        id={id}
        type={updatedStatus}
      />
    </Box>
  );
};

const HandlePendingStatus = ({ isOpen, onClose, id, appData }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const rejectMutation = useMutation({
    mutationFn: async (data) => {
      if (appData.source === "Admin") {
        let data = {
          id: id,
          status: "Rejected",
        };
        await handleStatusUpdate(data);
      } else {
        await handleAppointmentReject(data);
      }
    },
    onSuccess: () => {
      showToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment", id]);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  if (rejectMutation.isPending) return <Loading />;

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Reject Appointment #{id}
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You cannot undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose} size="md" variant="outline">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                let data = { appointment_id: id };
                rejectMutation.mutate(data);
              }}
              ml={3}
              size="md"
            >
              Reject
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

const HandelUpdateCancellation = ({ isOpen, onClose, id, type }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateReqStatus = async (status) => {
    let data = {
      appointment_id: id,
      status: status,
    };
    try {
      const res = await UPDATE(admin.token, "appointment_cancellation", data);
      if (res.response === 200) {
        showToast(toast, "success", "Updated!");
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutationApprove = useMutation({
    mutationFn: async (data) => {
      await handleCancelAppointment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment-canc-req", id]);
      queryClient.invalidateQueries("appointment", id);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
      onClose();
    },
  });

  const mutationRest = useMutation({
    mutationFn: async (data) => {
      await updateReqStatus(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment-canc-req", id]);
      queryClient.invalidateQueries("appointment", id);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
      onClose();
    },
  });

  if (mutationApprove.isPending || mutationRest.isPending) return <Loading />;

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="md" fontWeight="bold">
            {type} Request #{id}
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? Update cancellation status to {type}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose} size="md" variant="outline">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                if (type === "Approved") {
                  let data = { appointment_id: id, status: "Approved" };
                  mutationApprove.mutate(data);
                } else {
                  mutationRest.mutate(type);
                }
              }}
              ml={3}
              size="md"
            >
              {type} Cancellation Request
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
