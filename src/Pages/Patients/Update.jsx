/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ADD, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ISDCODEMODAL from "../../Components/IsdModal";
import Loading from "../../Components/Loading";
import showToast from "../../Controllers/ShowToast";
import imageBaseURL from "../../Controllers/image";
import ShowToast from "../../Controllers/ShowToast";
import PatientFiles from "./PatientFiles";
import todayDate from "../../Controllers/today";
import { FaTrash } from "react-icons/fa";
import AppointmentsByPatientID from "../Appointments/AppointmentsByPatientID";
import PrescriptionByPatientID from "../Prescriptions/PrescriptionByPatientID";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";

export default function UpdatePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isd_code, setisd_code] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef();
  const { hasPermission } = useHasPermission();

  const getPatient = async () => {
    const res = await GET(admin.token, `get_patients/${id}`);
    console.log("API response for patient:", res);
    console.log("Patient city:", res.data.city);
    console.log("Patient address:", res.data.address);
    setisd_code(res.data.isd_code);
    return res.data;
  };

  const { data: patientDetails, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: getPatient,
  });

  const AddNew = async (data) => {
    console.log("Update form data received:", data);
    console.log("City value:", data.city);
    console.log("Address value:", data.address);
    
    let formData = {
      id: id,
      isd_code,
      ...data,
      age: data.age || "",
    };

    console.log("Final update form data:", formData);
    
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_patient", formData);
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Patient Updated!");
        queryClient.invalidateQueries(["patient", id]);
        queryClient.invalidateQueries(["patients"]);
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_patient", {
        id: id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Patient Updated!");
        queryClient.invalidateQueries(["patient", id]);
        queryClient.invalidateQueries(["patients"]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   handle file upload
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_patient_image", {
        id: id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image Deleted!");
        queryClient.invalidateQueries("patient", id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  if (patientLoading || isLoading) return <Loading />;
  if (!hasPermission("PATIENT_UPDATE")) return <NotAuth />;

  return (
    <Box px={{ base: 2, md: 6 }}>
      <Text
        fontSize={{ base: 'xl', md: '2xl' }}
        fontWeight="bold"
        color="#2156F4"
        mb={1}
        letterSpacing="0.01em"
      >
        Patient Details
      </Text>
      <Text fontSize="md" color="gray.600" mb={4} textAlign="left">
        Update and manage patient information
      </Text>
      <Flex justify="space-between" alignItems="center" mb={2}>
        <Box />
        <Button
          w={120}
          size="sm"
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>
      <Divider mb={2} mt={3} />
      <Tabs variant="unstyled" isFitted align="center" mt={2}>
        <Box
          borderRadius="none"
          border="none"
          bg="transparent"
          px={{ base: 0, md: 0 }}
          py={0}
          mb={2}
          overflowX="auto"
          w="100%"
          sx={{
            '::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          <TabList
            display="flex"
            flexDirection="row"
            gap={{ base: 2, md: 4 }}
            minW="max-content"
            w="100%"
            borderBottom="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            mb={2}
            px={2}
          >
            <Tab
              _selected={{
                color: "blue.700",
                borderBottom: "3px solid",
                borderColor: "blue.500",
                fontWeight: "bold",
                bg: "transparent",
                borderRadius: 'none',
              }}
              fontSize={{ base: "md", md: "md" }}
              color={useColorModeValue("gray.600", "gray.300")}
              py={3}
              px={{ base: 3, md: 6 }}
              minW="130px"
              flex="0 0 auto"
              display="flex"
              alignItems="center"
              gap={2}
              borderRadius="none"
              transition="background 0.2s"
            >
              Details
            </Tab>
            <Tab
              _selected={{
                color: "blue.700",
                borderBottom: "3px solid",
                borderColor: "blue.500",
                fontWeight: "bold",
                bg: "transparent",
                borderRadius: 'none',
              }}
              fontSize={{ base: "md", md: "md" }}
              color={useColorModeValue("gray.600", "gray.300")}
              py={3}
              px={{ base: 3, md: 6 }}
              minW="130px"
              flex="0 0 auto"
              display="flex"
              alignItems="center"
              gap={2}
              borderRadius="none"
              transition="background 0.2s"
            >
              Patient Files
            </Tab>
            <Tab
              _selected={{
                color: "blue.700",
                borderBottom: "3px solid",
                borderColor: "blue.500",
                fontWeight: "bold",
                bg: "transparent",
                borderRadius: 'none',
              }}
              fontSize={{ base: "md", md: "md" }}
              color={useColorModeValue("gray.600", "gray.300")}
              py={3}
              px={{ base: 3, md: 6 }}
              minW="130px"
              flex="0 0 auto"
              display="flex"
              alignItems="center"
              gap={2}
              borderRadius="none"
              transition="background 0.2s"
            >
              Patient Appointments
            </Tab>
            <Tab
              _selected={{
                color: "blue.700",
                borderBottom: "3px solid",
                borderColor: "blue.500",
                fontWeight: "bold",
                bg: "transparent",
                borderRadius: 'none',
              }}
              fontSize={{ base: "md", md: "md" }}
              color={useColorModeValue("gray.600", "gray.300")}
              py={3}
              px={{ base: 3, md: 6 }}
              minW="130px"
              flex="0 0 auto"
              display="flex"
              alignItems="center"
              gap={2}
              borderRadius="none"
              transition="background 0.2s"
            >
              Patient Prescriptions
            </Tab>
          </TabList>
        </Box>
        <TabPanels>
          <TabPanel px={0}>
            <Flex gap={{ base: 0, md: 10 }} mt={2} direction={{ base: "column", md: "row" }} as={"form"} onSubmit={handleSubmit(AddNew)}>
              <Box w={{ base: "100%", md: "60%" }}>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")} border="1px solid" borderColor="gray.200" boxShadow={{ base: "xs", md: "md" }}>
                  <CardBody p={{ base: 2, md: 3 }} as={"form"}>
                    <Flex align={"center"} justify={"space-between"} mb={2}>
                      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="#242424">Basic Details</Text>
                    </Flex>
                    <Divider mt={2} mb={5} />
                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>First Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="First Name"
                          {...register("f_name", { required: true })}
                          defaultValue={patientDetails?.f_name}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Last Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Last Name"
                          {...register("l_name", { required: true })}
                          defaultValue={patientDetails?.l_name}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Date Of Birth</FormLabel>
                        <Input
                          max={todayDate()}
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Select Date"
                          type="date"
                          {...register("dob")}
                          defaultValue={patientDetails?.dob}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl isInvalid={errors.age}>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Age</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="text"
                          placeholder="Enter age (e.g., 25)"
                          {...register("age", {
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Please enter a valid number"
                            }
                          })}
                          defaultValue={patientDetails?.age}
                          w="100%"
                        />
                        {errors.age && (
                          <FormErrorMessage fontSize="xs">
                            {errors.age.message}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Gender</FormLabel>
                        <Select
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Select Gender"
                          {...register("gender")}
                          defaultValue={patientDetails?.gender}
                          w="100%"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Notes</FormLabel>
                        <Textarea
                          placeholder="Notes"
                          size="sm"
                          resize={"vertical"}
                          {...register("notes")}
                          defaultValue={patientDetails?.notes}
                          w="100%"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")} border="1px solid" borderColor="gray.200" boxShadow={{ base: "xs", md: "md" }}>
                  <CardBody p={{ base: 2, md: 3 }} as={"form"}>
                    <Flex align={"center"} justify={"space-between"} mb={2}>
                      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="#242424">Contact Details</Text>
                    </Flex>
                    <Divider mt={2} mb={5} />
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Email</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="Email"
                          {...register("email")}
                          defaultValue={patientDetails?.email}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl mt={0} isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Phone</FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code}
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            placeholder="Enter your phone number"
                            type="Tel"
                            fontSize={16}
                            {...register("phone", { required: true })}
                            defaultValue={patientDetails?.phone}
                            w="100%"
                          />
                        </InputGroup>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")} border="1px solid" borderColor="gray.200" boxShadow={{ base: "xs", md: "md" }}>
                  <CardBody p={{ base: 2, md: 3 }} as={"form"}>
                    <Flex align={"center"} justify={"space-between"} mb={2}>
                      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="#242424">Address</Text>
                    </Flex>
                    <Divider mt={2} mb={5} />
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>State</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="text"
                          placeholder="State"
                          {...register("state")}
                          defaultValue={patientDetails?.state}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>City</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="text"
                          placeholder="City"
                          {...register("city")}
                          defaultValue={patientDetails?.city}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Postal Code</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="number"
                          placeholder="Postal Code"
                          {...register("postal_code")}
                          defaultValue={patientDetails?.postal_code}
                          w="100%"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Address</FormLabel>
                        <Textarea
                          placeholder="Address"
                          size="sm"
                          resize={"vertical"}
                          {...register("address")}
                          defaultValue={patientDetails?.address}
                          w="100%"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
                <Button
                  w="100%"
                  mt={8}
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={isLoading}
                  borderRadius={8}
                  fontWeight={600}
                  fontSize={{ base: 'md', md: 'lg' }}
                  boxShadow="md"
                >
                  Update
                </Button>
              </Box>
              <Box w={{ base: "100%", md: "35%" }} mt={{ base: 8, md: 0 }}>
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow={{ base: "xs", md: "md" }}
                >
                  <CardBody p={2}>
                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="#242424" textAlign="center">Profile Picture</Text>
                    <Divider mt={2} />
                    <Flex p={2} justify={"center"} mt={5} position={"relative"}>
                      <Image
                        borderRadius={"50%"}
                        h={150}
                        objectFit={"cover"}
                        w={150}
                        src={
                          patientDetails?.image
                            ? `${imageBaseURL}/${patientDetails?.image}`
                            : "/admin/profilePicturePlaceholder.png"
                        }
                      />
                      {patientDetails?.image && (
                        <Tooltip label="Delete" fontSize="md">
                          <IconButton
                            size={"sm"}
                            colorScheme="red"
                            variant={"solid"}
                            position={"absolute"}
                            right={5}
                            icon={<FaTrash />}
                            onClick={() => {
                              handleFileDelete();
                            }}
                          />
                        </Tooltip>
                      )}
                    </Flex>
                    <VStack spacing={4} align="stretch" mt={10}>
                      <Input
                        size={"sm"}
                        borderRadius={6}
                        type="file"
                        display="none"
                        ref={inputRef}
                        onChange={handleFileChange}
                        accept=".jpeg, .svg, .png , .jpg"
                      />
                      <Button
                        size={"sm"}
                        onClick={() => {
                          inputRef.current.click();
                        }}
                        colorScheme="blue"
                        w={{ base: "100%", md: "auto" }}
                      >
                        Upload Profile Picture
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow={{ base: "xs", md: "md" }}
                >
                  <CardBody p={2}>
                    <PatientFiles id={id} />
                  </CardBody>
                </Card>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel px={0}>
            <Box maxW={500} w="100%">
              <PatientFiles id={id} />
            </Box>
          </TabPanel>
          <TabPanel px={0}>
            <AppointmentsByPatientID patientID={id} />
          </TabPanel>
          <TabPanel px={0}>
            <PrescriptionByPatientID patientID={id} queryActive={true} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />
    </Box>
  );
}
