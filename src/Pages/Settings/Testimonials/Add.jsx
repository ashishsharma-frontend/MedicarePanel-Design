﻿import { AiOutlineUpload } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Center,
  CloseButton,
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
  Select,
  Text,
  Textarea,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../../Controllers/ApiControllers";
import ShowToast from "../../../Controllers/ShowToast";
import admin from "../../../Controllers/admin";
import UseClinicsData from "../../../Hooks/UseClinicsData";
import { ClinicComboBox } from "../../../Components/ClinicComboBox";
import { useSelectedClinic } from "../../../Context/SelectedClinic";

export default function AddTestimonial({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      return ShowToast(
        toast,
        "error",
        "Only JPEG, JPG, PNG, or SVG files are allowed."
      );
    }
    if (file.size > maxSize) {
      return ShowToast(toast, "error", "File size should not exceed 5MB.");
    }
    setSelectedFile(file);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const AddNewDepartment = async (data) => {
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Please Select Clinic");
    }

    let formData = {
      ...data,
      image: selectedFile,
      clinic_id: selectedClinicID.id,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_testimonial", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "testimonial Added!");
        queryClient.invalidateQueries(["testimonials"]);
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
      size={"2xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Add Testimonial
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
                placeholder="Title"
                {...register("title", { required: true })}
              />
            </FormControl>

            <FormControl isRequired mt={5}>
              <FormLabel>Sub Title</FormLabel>
              <Input
                placeholder="Sub Title"
                {...register("sub_title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Rating</FormLabel>
              <Select
                placeholder="Rating"
                {...register("rating", { required: true })}
              >
                {[1, 2, 3, 4, 5].map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Description"
                {...register("description", { required: true })}
              />
            </FormControl>
            <Box
              mt={5}
              p={4}
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              cursor={"pointer"}
            >
              {selectedFile ? (
                <Box position={"relative"}>
                  <Text>Selected File: {selectedFile.name}</Text>
                  <CloseButton
                    position={"absolute"}
                    right={-2}
                    top={-2}
                    size={"sm"}
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                  />
                </Box>
              ) : (
                <Box>
                  <VisuallyHidden>
                    {" "}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".jpeg, .svg, .png , .jpg"
                      mb={4}
                    />
                  </VisuallyHidden>

                  <Center>
                    {" "}
                    <AiOutlineUpload fontSize={32} />
                  </Center>
                  <Text textAlign={"center"} mt={3}>
                    <b>Choose a file</b> or Drag it here.
                  </Text>
                </Box>
              )}
            </Box>
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
