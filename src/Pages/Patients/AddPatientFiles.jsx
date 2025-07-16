import { AiOutlineUpload } from "react-icons/ai";
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
  Text,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import UseClinicsData from "../../Hooks/UseClinicsData";
import { ClinicComboBox } from "../../Components/ClinicComboBox";

export default function AddPatientFiles({ isOpen, onClose, id }) {
  const [isLoading, setisLoading] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      ShowToast(toast, "error", "Please select a file smaller than 5 MB.");
    } else {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      ShowToast(toast, "error", "Please select a file smaller than 5 MB.");
    } else {
      setSelectedFile(file);
    }
  };

  const AddNewFile = async (data) => {
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Please Select Clinic");
    }

    let formData = {
      ...data,
      patient_id: id,
      file: selectedFile,
      clinic_id: selectedClinicID.id,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_patient_file", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "File Added!");
        queryClient.invalidateQueries(["patient-files", id]);
        setSelectedFile(null);
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay />
      <ModalContent
        as={"form"}
        onSubmit={handleSubmit(AddNewFile)}
        maxW={{ base: "98vw", md: "600px" }}
        mx={{ base: 1, md: 4 }}
        borderRadius={{ base: "lg", md: "xl" }}
        boxShadow={{ base: "none", md: "lg" }}
        border="1px solid"
        borderColor="gray.200"
      >
        <ModalHeader fontSize={{ base: 18, md: 22 }} py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
          Add Patient Files
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <Divider />
        <ModalBody px={{ base: 2, md: 6 }} py={{ base: 3, md: 5 }}>
          <FormControl isRequired mb={4} w="100%">
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Name"
              {...register("file_name", { required: true })}
              w="100%"
              size="md"
            />
          </FormControl>
          <FormControl isRequired mb={4} w="100%">
            <FormLabel>Clinic</FormLabel>
            <ClinicComboBox
              data={clinicsData}
              name={"clinic"}
              defaultData={selectedClinic}
              setState={setselectedClinicID}
            />
          </FormControl>
          <Box
            mt={2}
            p={{ base: 3, md: 4 }}
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
            w="100%"
          >
            {selectedFile ? (
              <Box position={"relative"}>
                <Text fontSize={{ base: "sm", md: "md" }}>Selected File: {selectedFile.name}</Text>
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
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="*"
                    mb={4}
                  />
                </VisuallyHidden>
                <Center>
                  <AiOutlineUpload fontSize={32} />
                </Center>
                <Text textAlign={"center"} mt={3} fontSize={{ base: "sm", md: "md" }}>
                  <b>Choose a file</b> or Drag it here.
                  <br />
                  Max 5 MB
                </Text>
              </Box>
            )}
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={{ base: 2, md: 3 }} px={{ base: 2, md: 6 }}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size="md" w={{ base: "100%", md: "auto" }}>
            Close
          </Button>
          <Button
            variant="solid"
            size="md"
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
            w={{ base: "100%", md: "auto" }}
          >
            Add File
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
