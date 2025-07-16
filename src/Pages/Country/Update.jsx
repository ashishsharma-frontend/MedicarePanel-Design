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
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";

export default function UpdateCountryModal({ isOpen, onClose, data }) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateCountry = async (inputData) => {
    const formData = {
      ...inputData,
      id: data.id,
    };

    try {
      setIsLoading(true);
      const res = await UPDATE(admin.token, "update_country", formData);
      setIsLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Country Updated!");
        queryClient.invalidateQueries("countries");
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setIsLoading(false);
      ShowToast(toast, "error", error.message || "An error occurred.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(updateCountry)}>
        <ModalHeader fontSize={18} py={2}>
          Update Country
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                id="title"
                defaultValue={data?.title}
                placeholder="Country Name"
                {...register("title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel htmlFor="iso_code">ISO Code</FormLabel>
              <Input
                id="iso_code"
                defaultValue={data?.iso_code}
                placeholder="ISO Code (e.g., US)"
                {...register("iso_code", {
                  required: true,
                })}
              />
            </FormControl>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size="sm">
            Close
          </Button>
          <Button
            variant="solid"
            size="sm"
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Update Country
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
