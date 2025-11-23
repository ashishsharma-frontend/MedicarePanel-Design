// AddDoctor.tsx — Fully recreated with desktop layout preserved, mobile improved
import {
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useToast,
  Heading,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { AiOutlineDown } from "react-icons/ai";
import { FiCamera } from "react-icons/fi";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ComboboxDemo } from "../../Components/ComboBox";
import { MultiTagInput } from "../../Components/MultiTaginput";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import { ADD, GET } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import ISDCODEMODAL from "../../Components/IsdModal";
import todayDate from "../../Controllers/today";
import UseClinicsData from "../../Hooks/UseClinicsData";

export default function AddDoctor() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const [departmentID, setdepartmentID] = useState();
  const [specializationID, setspecializationID] = useState([]);
  const [isd_code, setisd_code] = useState("+91");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { clinicsData } = UseClinicsData();
  const [selectedClinic, setselectedClinic] = useState();
  const inputRef = useRef();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  const AddNew = async (data) => {
    if (data.password !== data.cnfPassword) {
      return ShowToast(toast, "error", "Password does not match");
    }
    if (!departmentID) {
      return ShowToast(toast, "error", "Select department");
    }
    if (!specializationID || specializationID.length === 0) {
      return ShowToast(toast, "error", "Select specialization");
    }
    if (!selectedClinic) {
      return ShowToast(toast, "error", "Select clinic");
    }
    let formData = {
      isd_code: isd_code,
      image: profilePicture,
      department: departmentID,
      specialization: Array.isArray(specializationID) ? specializationID.join(", ") : specializationID,
      active: 0,
      clinic_id: selectedClinic.id,
      ...data,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Added!");
        queryClient.invalidateQueries("doctors");
        reset();
        setdepartmentID();
        setspecializationID([]);
        setselectedClinic();
        setprofilePicture(null);
        navigate(`/doctor/update/${res.id}`);
      } else {
        ShowToast(toast, "error", `${res.message} - ${res.response}`);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const getDepartmentList = async () => {
    const res = await GET(admin.token, "get_department_active");
    return res.data;
  };
  const { data: departmentList } = useQuery({
    queryKey: ["department-active"],
    queryFn: getDepartmentList,
  });

  const getSpclizeList = async () => {
    const res = await GET(admin.token, "get_specialization");
    return res.data;
  };
  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  // Transform data to have 'title' property for custom components
  const departmentListWithTitle = departmentList?.map((dept) => ({
    ...dept,
    title: dept.name || dept.title,
  }));

  const specializationListWithTitle = specializationList?.map((spec) => ({
    ...spec,
    title: spec.name || spec.title,
  }));

  const clinicsDataWithTitle = clinicsData?.map((clinic) => ({
    ...clinic,
    title: clinic.name || clinic.title,
  }));

  return (
    <Box
      bg="#F9FAFB"
      minH="100vh"
      px={{ base: 2, sm: 4, md: 10 }}
      py={{ base: 4, sm: 6, md: 10 }}
    >
      <Flex justify="space-between" align="center" mb={8} wrap="wrap">
        <Box>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="#162D5D"
          >
            Add New Doctor
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Create a new doctor profile with all required information
          </Text>
        </Box>
        <Button
          w={{ base: "full", md: 28 }}
          h={12}
          bg="#162D5D"
          color="white"
          fontWeight="bold"
          fontSize="md"
          borderRadius="lg"
          _hover={{ bg: "#0F1E3D" }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Flex>

      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={8}
        align="flex-start"
      >
        <Card
          w={{ base: "100%", lg: "70%" }}
          bg="white"
          p={{ base: 4, sm: 6, md: 8 }}
          borderRadius="2xl"
          boxShadow="md"
        >
          <CardBody p={0}>
            <CardBody as="form" onSubmit={handleSubmit(AddNew)} p={0}>
              <Heading as="h3" size="md" mb={6} color="#162D5D">
                Basic Information
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("email", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("password", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    First Name
                  </FormLabel>
                  <Input
                    placeholder="Enter first name"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("f_name", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Last Name
                  </FormLabel>
                  <Input
                    placeholder="Enter last name"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("l_name", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Confirm Password
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("cnfPassword", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Date Of Birth
                  </FormLabel>
                  <Input
                    max={todayDate()}
                    placeholder="dd-mm-yyyy"
                    size="md"
                    type="date"
                    borderRadius="lg"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("dob", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
              </SimpleGrid>

              <Divider my={8} />

              <Heading as="h3" size="md" mb={6} color="#162D5D">
                Contact & Professional Details
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Phone
                  </FormLabel>
                  <InputGroup>
                    <InputLeftAddon
                      cursor="pointer"
                      onClick={onOpen}
                      bg="#F1F5F9"
                      border="none"
                      fontWeight="semibold"
                      px={3}
                      minW="70px"
                      fontSize="sm"
                      borderRadius="lg"
                    >
                      {isd_code} <AiOutlineDown style={{ marginLeft: "6px" }} />
                    </InputLeftAddon>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      borderRadius="lg"
                      size="md"
                      bg="#F8FAFC"
                      fontSize="sm"
                      {...register("phone", {
                        required: true,
                        pattern:
                          /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                      })}
                      _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Years Of Experience
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter Years Of Experience"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("ex_year", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Gender
                  </FormLabel>
                  <Select
                    placeholder="Select Gender"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("gender", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Department
                  </FormLabel>
                  <ComboboxDemo
                    name="Department"
                    data={departmentListWithTitle}
                    setState={setdepartmentID}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Specialization
                  </FormLabel>
                  <MultiTagInput
                    name="Specialization"
                    data={specializationListWithTitle}
                    setState={setspecializationID}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel
                    fontWeight="semibold"
                    color="#374151"
                    fontSize="sm"
                  >
                    Clinic
                  </FormLabel>
                  <ClinicComboBox
                    name="Clinic"
                    data={clinicsDataWithTitle}
                    setState={setselectedClinic}
                  />
                </FormControl>
              </SimpleGrid>

              <Button
                w="100%"
                h={12}
                mt={4}
                type="submit"
                bg="#2563EB"
                color="white"
                fontWeight="bold"
                fontSize="lg"
                borderRadius="lg"
                _hover={{ bg: "#1D4ED8" }}
                isLoading={isLoading}
                boxShadow="0 2px 8px 0 rgba(37,99,235,0.10)"
              >
                Submit Details
              </Button>
            </CardBody>
          </CardBody>
        </Card>

        <Card
          w={{ base: "100%", lg: "30%" }}
          bg="#F6F9FE"
          p={{ base: 4, sm: 6, md: 8 }}
          borderRadius="2xl"
          boxShadow="md"
          mt={{ base: 6, lg: 0 }}
        >
          <CardBody p={0}>
            <Text
              textAlign="center"
              fontWeight="bold"
              fontSize="lg"
              color="#162D5D"
              mb={4}
            >
              Profile Picture
            </Text>
            <Divider mb={6} />
            <Flex justify="center" mt={2} position="relative">
              <Image
                borderRadius="full"
                h={{ base: "120px", md: "160px" }}
                w={{ base: "120px", md: "160px" }}
                objectFit="cover"
                src={
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : "/admin/profilePicturePlaceholder.png"
                }
                border="4px solid #E5E7EB"
                bg="#E5E7EB"
              />
              {profilePicture && (
                <Tooltip label="Clear" fontSize="md">
                  <CloseButton
                    colorScheme="red"
                    variant="solid"
                    position="absolute"
                    right={2}
                    top={2}
                    onClick={() => setprofilePicture(null)}
                  />
                </Tooltip>
              )}
            </Flex>
            <VStack spacing={4} align="stretch" mt={8}>
              <Input
                type="file"
                display="none"
                ref={inputRef}
                onChange={handleFileChange}
                accept=".jpeg, .png, .jpg, .gif"
              />
              <Button
                leftIcon={<FiCamera />}
                size="md"
                bg="#2563EB"
                color="white"
                borderRadius="lg"
                fontWeight="semibold"
                onClick={() => inputRef.current.click()}
                _hover={{ bg: "#1D4ED8" }}
                w="100%"
                h={12}
              >
                Upload Profile Picture
              </Button>
              <Box
                textAlign="center"
                color="gray.500"
                fontSize="sm"
                mt={2}
                lineHeight="short"
              >
                Supported formats: JPG, PNG, GIF <br />
                Max file size: 5MB
              </Box>
            </VStack>

            {/* Quick Stats */}
            <Box mt={8} p={4} bg="white" borderRadius="lg">
              <Text fontWeight="semibold" color="#374151" mb={3}>
                Quick Info
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Department:</Text>
                  <Badge colorScheme="blue" fontSize="xs">
                    {departmentID && departmentList?.find(d => d.id == departmentID)?.name || "Not Selected"}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Specialization:</Text>
                  <Badge colorScheme="green" fontSize="xs">
                    {specializationID && specializationID.length > 0 ? `${specializationID.length} Selected` : "Not Selected"}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Clinic:</Text>
                  <Badge colorScheme="purple" fontSize="xs">
                    {selectedClinic?.name || selectedClinic?.title || "Not Selected"}
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </CardBody>
        </Card>
      </Flex>
      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />
    </Box>
  );
}
