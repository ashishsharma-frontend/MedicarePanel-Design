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
  Divider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Grid,
  Select,
  useDisclosure,
  InputGroup,
  InputLeftAddon,
  useToast,
  VStack,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import ISDCODEMODAL from "../../Components/IsdModal";
import { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import todayDate from "../../Controllers/today";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import UseClinicsData from "../../Hooks/UseClinicsData";

const addPatient = async (data) => {
  const res = await ADD(admin.token, "add_patient", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddPatients({ nextFn, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [isd_code, setisd_code] = useState("+91");
  const {
    isOpen: isIsdOpen,
    onOpen: onIsdOpen,
    onClose: onIsdClose,
  } = useDisclosure();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addPatient(data);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error));
    },
    onSuccess: () => {
      if (nextFn) {
        nextFn({
          f_name: watch("f_name"),
          l_name: watch("l_name"),
          phone: watch("phone"),
        });
      }
      ShowToast(toast, "success", "Patient Added");
      queryClient.invalidateQueries("users");
      queryClient.invalidateQueries("patients");
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    if (!isd_code) {
      return ShowToast(toast, "error", "Select ISD Code");
    }
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Select Clinic");
    }
    // Debug: Check if age is being captured
    console.log("Age value in form:", data.age);
    
    let formData = {
      ...data,
      isd_code,
      dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
      age: data.age || "",
      clinic_id: selectedClinicID.id,
    };

    console.log("Final form data:", formData);
    mutation.mutate(formData);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={{ base: "full", md: "2xl" }}
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent
          maxW={{ base: "98vw", md: "600px" }}
          w="100%"
          mx={{ base: 1, md: 4 }}
          borderRadius={{ base: "2xl", md: "2xl" }}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          boxShadow={{ base: "lg", md: "2xl" }}
        >
          <ModalHeader
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            px={{ base: 4, md: 6 }}
            pt={{ base: 4, md: 6 }}
            pb={{ base: 2, md: 3 }}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            Add Patient
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />
          <ModalBody px={{ base: 2, md: 6 }} py={{ base: 4, md: 6 }}>
            <VStack spacing={6} align="stretch">
              <Heading as="h3" size="sm" color="gray.600" mb={2} fontWeight="semibold">
                Patient Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Clinic</FormLabel>
                  <ClinicComboBox
                    data={clinicsData}
                    name={"clinic"}
                    defaultData={selectedClinic}
                    setState={setselectedClinicID}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>First Name</FormLabel>
                  <Input
                    size="md"
                    {...register("f_name")}
                    placeholder="First Name"
                    w="100%"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Last Name</FormLabel>
                  <Input
                    {...register("l_name")}
                    placeholder="Last Name"
                    w="100%"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Phone</FormLabel>
                  <InputGroup>
                    <InputLeftAddon
                      bg={"none"}
                      pl={1}
                      pr={2}
                      borderRadius={0}
                      cursor={"pointer"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onIsdOpen();
                      }}
                      fontSize={"sm"}
                    >
                      {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                    </InputLeftAddon>
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      {...register("phone", {
                        required: true,
                        pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
                      })}
                      w="100%"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Gender</FormLabel>
                  <Select
                    defaultValue="Male"
                    {...register("gender")}
                    placeholder="Gender"
                    w="100%"
                  >
                    <option value={"Male"}>Male</option>
                    <option value={"Female"}>Female</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Date of Birth</FormLabel>
                  <Input max={todayDate()} type="date" {...register("dob")}
                    w="100%"
                  />
                </FormControl>
                <FormControl isInvalid={errors.age}>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Age</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter age (e.g., 25)"
                    {...register("age", {
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a valid number"
                      }
                    })}
                    w="100%"
                  />
                  {errors.age && (
                    <FormErrorMessage fontSize="xs">
                      {errors.age.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter flexDirection={{ base: "column", md: "row" }} gap={2}>
            <Button colorScheme="gray" mr={0} onClick={onClose} size={"md"} w={{ base: "100%", md: "auto" }}>
              Close
            </Button>
            <Button
              colorScheme={"blue"}
              size={"md"}
              type="submit"
              isLoading={mutation.isPending}
              w={{ base: "100%", md: "auto" }}
            >
              Add Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
      <ISDCODEMODAL
        isOpen={isIsdOpen}
        onClose={onIsdClose}
        setisd_code={setisd_code}
      />
    </Modal>
  );
}

export default AddPatients;
