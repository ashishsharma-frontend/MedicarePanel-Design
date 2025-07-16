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
  VStack,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";

export default function UpdatePatientFiles({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpdate = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      file: selectedFile,
      id: data.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_patient_file", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Patient File Updated!");
        queryClient.invalidateQueries(["patient-files", data.patient_id]);
        queryClient.invalidateQueries(["all-files"]);
        reset();
        setSelectedFile(null);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  console.log(data);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent as={"form"} onSubmit={handleSubmit(handleUpdate)}
        maxW={{ base: "98vw", md: "600px" }}
        w="100%"
        mx={{ base: 1, md: 4 }}
        borderRadius={{ base: "lg", md: "xl" }}
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        boxShadow={{ base: "none", md: "lg" }}
      >
        <ModalHeader fontSize={{ base: 18, md: 22 }} fontWeight="bold" py={2} px={{ base: 4, md: 6 }} borderBottom="1px solid" borderColor="gray.200">
          Update Patient Files
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={{ base: 2, md: 6 }} py={{ base: 4, md: 6 }}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Title</FormLabel>
              <Input
                defaultValue={data?.file_name}
                placeholder="Title"
                {...register("file_name", { required: true })}
                w="100%"
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
                      accept=".jpeg, .svg, .png , .jpg"
                      mb={4}
                    />
                  </VisuallyHidden>
                  <Center>
                    <AiOutlineUpload fontSize={32} />
                  </Center>
                  <Text textAlign={"center"} mt={3} fontSize={{ base: "sm", md: "md" }}>
                    <b>Choose a file</b> or Drag it here.
                  </Text>
                </Box>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter py={{ base: 2, md: 3 }} px={{ base: 4, md: 6 }} flexDirection={{ base: "column", md: "row" }} gap={2}>
          <Button colorScheme="gray" mr={0} onClick={onClose} size={"sm"} w={{ base: "100%", md: "auto" }}>
            Close
          </Button>
          <Button
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
            w={{ base: "100%", md: "auto" }}
          >
            Update Patient Files
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
