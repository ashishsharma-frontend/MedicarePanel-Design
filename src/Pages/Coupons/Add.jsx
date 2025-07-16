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
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import UseClinicsData from "../../Hooks/UseClinicsData";
import { ClinicComboBox } from "../../Components/ClinicComboBox";

export default function AddCoupon({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const handleAdd = async (data) => {
    let formData = { ...data, active: 1, title: data.title.toUpperCase() };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_coupon", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Coupon Added!");
        queryClient.invalidateQueries(["coupons"]);
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

  const onSubmit = (data) => {
    if (!selectedClinicID)
      return ShowToast(toast, "error", "Please select a clinic");
    handleAdd({ ...data, clinic_id: selectedClinicID.id });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={18} py={2}>
          Add Coupon
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Clinic</FormLabel>
              <ClinicComboBox
                data={clinicsData}
                name={"clinic"}
                defaultData={selectedClinic}
                setState={setselectedClinicID}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Title</FormLabel>
              <Input
                textTransform={"uppercase"}
                placeholder="Title"
                {...register("title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Value ( Off in %)</FormLabel>
              <Input
                type="number"
                placeholder="Value"
                max={100}
                {...register("value", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Description"
                {...register("description", { required: true })}
              />
            </FormControl>
            <Flex mt={5} gap={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  placeholder="Start Date"
                  {...register("start_date", { required: true })}
                />
              </FormControl>{" "}
              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  placeholder="End Date"
                  {...register("end_date", { required: true })}
                />
              </FormControl>
            </Flex>
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
            Add Coupon
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
