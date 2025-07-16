/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
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
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import UseClinicsData from "../../Hooks/UseClinicsData";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import usePatientData from "../../Hooks/UsePatientsData";
import UsersCombobox from "../../Components/UsersComboBox";

export default function AddRefer({ isOpen, onClose, patient }) {
  const [isLoading, setisLoading] = useState();
  const { handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const { patientsData } = usePatientData();
  const [selectedClinicID, setselectedClinicID] = useState();
  const [selectedPatient, setselectedPatient] = useState(patient);

  const AddNewDepartment = async () => {
    if (!selectedPatient) {
      return ShowToast(toast, "error", "Please Select Patient");
    }
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Please Select Clinic");
    }

    let formData = {
      patient_id: selectedPatient.id,
      from_clinic_id: selectedClinic.id,
      to_clinic_id: selectedClinicID.id,
      requested_by: admin.id,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_referral_clinic", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Referral  request initaited!");
        queryClient.invalidateQueries(["referals"]);
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Refer Patient
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Patient</FormLabel>
              <UsersCombobox
                data={patientsData}
                name={"Patient"}
                defaultData={selectedPatient}
                setState={setselectedPatient}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>To Clinic</FormLabel>
              <ClinicComboBox
                data={clinicsData}
                name={"clinic"}
                setState={setselectedClinicID}
                isDisabledOverright={true}
              />
            </FormControl>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Close
          </Button>
          <Button
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
