import { BiLinkExternal } from "react-icons/bi";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ADD, GET } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import QRCodeScanner from "../../Components/QrScanner";
import todayDate from "../../Controllers/today";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import moment from "moment";

const isOwnAppointment = (appointmentData, selectedClinic) => {
  if (admin.role.name === "Admin" || admin.role.name === "Super Admin") {
    return true;
  }
  return appointmentData?.clinic_id === selectedClinic.id;
};

export default function AddCheckin({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: { appointment_id: "", date: "", time: "" },
  });
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();

  const onQrScan = (qrData) => {
    setValue("appointment_id", qrData.appointment_id || "");
    setValue("date", qrData.date || "");
    setValue("time", qrData.time || "");
    setShowQRScanner(false);
    getAppData(qrData.appointment_id);
  };

  const getAppData = async () => {
    const { appointment_id } = getValues();
    if (!appointment_id) {
      ShowToast(toast, "error", "Please enter an Appointment ID");
      return;
    }
    setIsLoading(true);
    try {
      const res = await GET(admin.token, `get_appointment/${appointment_id}`);
      setIsLoading(false);
      if (!res.data) {
        ShowToast(toast, "error", "Appointment not found");
        reset();
        return;
      } else if (!isOwnAppointment(res.data, selectedClinic)) {
        ShowToast(toast, "error", "Appointment not found in your clinic");
        reset();
        return;
      } else {
        const data = res.data;
        setAppointmentData(data);
        setValue("appointment_id", data.id || "");
        setValue("date", data.date || "");
        setValue("time", data.time_slots || "");
      }
    } catch (error) {
      setIsLoading(false);
      ShowToast(toast, "error", "Failed to fetch appointment data");
      reset();
    }
  };

  const addCheckin = async (data) => {
    if (appointmentData?.type === "Video Consultant") {
      ShowToast(toast, "error", "Video Consultations cannot be checked in");
      return;
    }
    const formData = {
      ...data,
      time: moment(data.time, "HH:mm").format("HH:mm:ss"),
    };
    setIsLoading(true);
    try {
      const res = await ADD(admin.token, "add_appointment_checkin", formData);
      setIsLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Checkin added successfully!");
        queryClient.invalidateQueries("checkins");
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message || "Failed to add checkin");
      }
    } catch (error) {
      setIsLoading(false);
      ShowToast(toast, "error", "An error occurred");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "xs", md: "lg" }}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(addCheckin)} maxW={{ base: "90%", md: "500px" }}>
        <ModalHeader fontSize={18} py={4}>New Checkin</ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody py={6}>
          <Button
            w="full"
            size="sm"
            colorScheme="blue"
            mb={4}
            onClick={() => setShowQRScanner(!showQRScanner)}
          >
            {showQRScanner ? "Add Data Manually" : "Scan QR"}
          </Button>

          {showQRScanner && <QRCodeScanner onScan={onQrScan} />}

          {!showQRScanner && (
            <Box>
              <Box position="relative" py={4}>
                <Divider />
                <Box bg="white" px={2} fontWeight={500} position="absolute" top="50%" transform="translateY(-50%)">
                  Or
                </Box>
              </Box>
              <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
                <FormControl isRequired isInvalid={errors.appointment_id}>
                  <FormLabel>Appointment ID</FormLabel>
                  <Input
                    size="sm"
                    placeholder="Appointment ID"
                    {...register("appointment_id", { required: "Appointment ID is required" })}
                    onChange={() => {
                      setValue("date", "");
                      setValue("time", "");
                      setAppointmentData(null);
                    }}
                  />
                </FormControl>
                <Button
                  colorScheme="teal"
                  size="sm"
                  mt={{ base: 2, md: 0 }}
                  onClick={getAppData}
                  isLoading={isLoading}
                >
                  Get Details
                </Button>
              </Flex>
              <FormControl isRequired isInvalid={errors.date} mb={4}>
                <FormLabel>Date</FormLabel>
                <Input
                  max={todayDate()}
                  size="sm"
                  type="date"
                  placeholder="Date"
                  {...register("date", { required: "Date is required" })}
                />
              </FormControl>
              <FormControl isRequired isInvalid={errors.time} mb={4}>
                <FormLabel>Time</FormLabel>
                <Input
                  size="sm"
                  type="time"
                  step={60}
                  placeholder="Time"
                  {...register("time", { required: "Time is required" })}
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>
        <Divider />
        <ModalFooter py={4}>
          <Button colorScheme="gray" mr={3} size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="solid"
            size="sm"
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Add Checkin
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}