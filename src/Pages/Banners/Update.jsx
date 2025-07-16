/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
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
  useToast
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";

export default function UpdateBanner({ isOpen, onClose, data }) {
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();


  // UseMutation for updating the department
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await UPDATE(admin.token, "update_banner", data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Updated!");
      queryClient.invalidateQueries(["banners"]);
      reset();
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error));
    },
    onSettled: () => {
      // Optionally handle any cleanup logic after success or failure
    },
  });


  // Add New Department function
  const AddNewDepartment = (Inputdata) => {
    const formData = {
      ...Inputdata,
      id: data.id,
    };

    updateMutation.mutate(formData);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Update Banner
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Preference</FormLabel>
              <Input
                defaultValue={data?.preferences}
                placeholder="Preferences"
                {...register("preferences", { required: true })}
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
            isLoading={updateMutation.isPending}
          >
            Update Banner
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
