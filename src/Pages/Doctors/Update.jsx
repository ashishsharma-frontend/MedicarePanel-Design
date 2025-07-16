/* eslint-disable react-hooks/rules-of-hooks */
import { AiFillYoutube } from "react-icons/ai";
import { BsInstagram } from "react-icons/bs";
import { AiOutlineTwitter } from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { CgFacebook } from "react-icons/cg";
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightElement,
  Select,
  Switch,
  Text,
  Textarea,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Badge,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ComboboxDemo } from "../../Components/ComboBox";
import { MultiTagInput } from "../../Components/MultiTaginput";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import TimeSlotes from "../../Components/DoctorTimeSlotes/TimeSlotes";
import Loading from "../../Components/Loading";
import RatingStars from "../../Hooks/ShowRating";
import ISDCODEMODAL from "../../Components/IsdModal";
import { FaTrash } from "react-icons/fa";
import imageBaseURL from "../../Controllers/image";
import useHasPermission from "../../Hooks/HasPermission";
import VideoTimeSlotes from "../../Components/VideoTimeSlotes/TimeSlotes";
import todayDate from "../../Controllers/today";
import Review from "./Review";
import DoctAppointments from "./DoctAppoinrtments";
import NotAuth from "../../Components/NotAuth";

const getSpclizeList = async () => {
  const res = await GET(admin.token, "get_specialization");
  return res.data;
};
const getDepartmentList = async () => {
  const res = await GET(admin.token, "get_department");
  return res.data;
};

export default function UpdateDoctor() {
  const param = useParams();
  const { data: doctorDetails, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${param.id}`);
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, setValue } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [departmentID, setdepartmentID] = useState(doctorDetails?.department);
  const [specializationID, setspecializationID] = useState(doctorDetails?.specialization);
  const inputRef = useRef();
  const [isd_code, setisd_code] = useState(doctorDetails?.isd_code);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();

  useEffect(() => {
    setdepartmentID(doctorDetails?.department);
    setspecializationID(doctorDetails?.specialization);
  }, [doctorDetails]);

  const AddNew = async (data) => {
    if (data.password && data.password !== data.cnfPassword) {
      return ShowToast(toast, "error", "Passwords do not match");
    }
    if (!departmentID) {
      return ShowToast(toast, "error", "Select department");
    }
    if (!specializationID) {
      return ShowToast(toast, "error", "Select specialization");
    }
    let formData = {
      id: param.id,
      department: departmentID,
      specialization: Array.isArray(specializationID)
        ? specializationID.join(", ")
        : specializationID || "",
      isd_code_sec: isd_code,
      isd_code,
      ...data,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries(["doctor", param.id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries(["doctor", param.id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_doctor_image", {
        id: param.id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image Deleted!");
        queryClient.invalidateQueries(["doctor", param.id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const { data: departmentList } = useQuery({
    queryKey: ["department"],
    queryFn: getDepartmentList,
  });

  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  if (isDoctorLoading || isLoading) return <Loading />;
  if (!hasPermission("DOCTOR_UPDATE")) return <NotAuth />;

  return (
    <Box bg="#F9FAFB" minH="100vh" p={{ base: 2, md: 8 }}>
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="#162D5D">
            Update Doctor
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Manage doctor information and settings
          </Text>
        </Box>
        <Button
          w={{ base: "full", md: 120 }}
          size="sm"
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => navigate(-1)}
          borderRadius="lg"
        >
          Back
        </Button>
      </Flex>

      <Tabs
        variant="unstyled"
        isFitted
        colorScheme="blue"
        borderRadius="lg"
        bg="#fff"
        boxShadow="sm"
        p={2}
      >
        <TabList
          display="flex"
          flexWrap="nowrap"
          overflowX="auto"
          borderBottom="2px solid #E5E7EB"
          css={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
          mb={4}
          px={1}
        >
          <Tab
            _selected={{
              color: '#2563EB',
              borderBottom: '3px solid',
              borderColor: '#2563EB',
              fontWeight: 'bold',
              bg: 'transparent',
              borderRadius: 'none',
            }}
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 6 }}
            py={2}
            minW="120px"
            flex="0 0 auto"
            transition="background 0.2s"
          >
            Details
          </Tab>
          <Tab
            _selected={{
              color: '#2563EB',
              borderBottom: '3px solid',
              borderColor: '#2563EB',
              fontWeight: 'bold',
              bg: 'transparent',
              borderRadius: 'none',
            }}
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 6 }}
            py={2}
            minW="120px"
            flex="0 0 auto"
            transition="background 0.2s"
          >
            Time Slots
          </Tab>
          <Tab
            _selected={{
              color: '#2563EB',
              borderBottom: '3px solid',
              borderColor: '#2563EB',
              fontWeight: 'bold',
              bg: 'transparent',
              borderRadius: 'none',
            }}
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 6 }}
            py={2}
            minW="120px"
            flex="0 0 auto"
            transition="background 0.2s"
          >
            Reviews
          </Tab>
          <Tab
            _selected={{
              color: '#2563EB',
              borderBottom: '3px solid',
              borderColor: '#2563EB',
              fontWeight: 'bold',
              bg: 'transparent',
              borderRadius: 'none',
            }}
            fontWeight="bold"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 6 }}
            py={2}
            minW="120px"
            flex="0 0 auto"
            transition="background 0.2s"
          >
            Appointments
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <Flex
              gap={8}
              align="flex-start"
              direction={{ base: "column", lg: "row" }}
              as="form"
              onSubmit={handleSubmit(AddNew)}
            >
              {/* Left Side: Form */}
              <Box flex="1" minW={0} w="100%">
                {/* Basic Info */}
                <Card mb={6} borderRadius="xl" boxShadow="sm">
                  <CardBody p={6}>
                    <Heading as="h3" size="md" mb={4} color="#162D5D">
                      Basic Information
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">First Name</FormLabel>
                        <Input
                          placeholder="Enter first name"
                          defaultValue={doctorDetails?.f_name}
                          {...register("f_name", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Last Name</FormLabel>
                        <Input
                          placeholder="Enter last name"
                          defaultValue={doctorDetails?.l_name}
                          {...register("l_name", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Gender</FormLabel>
                        <Select
                          placeholder="Select Gender"
                          defaultValue={doctorDetails?.gender}
                          {...register("gender", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Date Of Birth</FormLabel>
                        <Input
                          type="date"
                          max={todayDate()}
                          defaultValue={doctorDetails?.dob}
                          {...register("dob", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Years Of Experience</FormLabel>
                        <Input
                          type="number"
                          placeholder="Enter Years Of Experience"
                          defaultValue={doctorDetails?.ex_year}
                          {...register("ex_year", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                    </SimpleGrid>
                    
                    <Divider my={6} />
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="#374151">
                          Doctor Active?
                        </FormLabel>
                        <Spacer />
                        <IsActiveSwitch id={param.id} isActive={doctorDetails?.active} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" fontSize="sm" fontWeight="semibold" color="#374151">
                          Stop Booking?
                        </FormLabel>
                        <Spacer />
                        <StopBooking id={param.id} isStop_booking={doctorDetails?.stop_booking} />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Contact Details */}
                <Card mb={6} borderRadius="xl" boxShadow="sm">
                  <CardBody p={6}>
                    <Heading as="h3" size="md" mb={4} color="#162D5D">
                      Contact Details
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="Enter Email"
                          defaultValue={doctorDetails?.email}
                          {...register("email", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Phone</FormLabel>
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
                            {isd_code || doctorDetails?.isd_code}
                          </InputLeftAddon>
                          <Input
                            type="tel"
                            placeholder="Enter phone number"
                            defaultValue={doctorDetails?.phone}
                            {...register("phone", { required: true })}
                            size="md"
                            borderRadius="lg"
                            bg="#F8FAFC"
                            _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151">Secondary Phone</FormLabel>
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
                            {isd_code || doctorDetails?.isd_code}
                          </InputLeftAddon>
                          <Input
                            type="tel"
                            placeholder="Enter phone number"
                            defaultValue={doctorDetails?.phone_sec}
                            {...register("phone_sec")}
                            size="md"
                            borderRadius="lg"
                            bg="#F8FAFC"
                            _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                          />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Education and Other Details */}
                <Card mb={6} borderRadius="xl" boxShadow="sm">
                  <CardBody p={6}>
                    <Heading as="h3" size="md" mb={4} color="#162D5D">
                      Education And Specialization
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Department</FormLabel>
                        <ComboboxDemo
                          name={"Department"}
                          data={departmentList}
                          setState={setdepartmentID}
                          defaultId={doctorDetails?.department}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Specialization</FormLabel>
                        <MultiTagInput
                          data={specializationList}
                          setState={setspecializationID}
                          name={"Specialization"}
                          defaultSelected={doctorDetails?.specialization?.split(", ")}
                        />
                      </FormControl>
                      <FormControl isRequired gridColumn="1 / -1">
                        <FormLabel fontWeight="semibold" color="#374151">Description</FormLabel>
                        <Textarea
                          placeholder="Description"
                          defaultValue={doctorDetails?.description}
                          {...register("description", { required: true })}
                          size="md"
                          borderRadius="lg"
                          minH="80px"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Address */}
                <Card mb={6} borderRadius="xl" boxShadow="sm">
                  <CardBody p={6}>
                    <Heading as="h3" size="md" mb={4} color="#162D5D">
                      Address
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">State</FormLabel>
                        <Input
                          placeholder="State"
                          defaultValue={doctorDetails?.state}
                          {...register("state", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">City</FormLabel>
                        <Input
                          placeholder="City"
                          defaultValue={doctorDetails?.city}
                          {...register("city", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Address</FormLabel>
                        <Textarea
                          placeholder="Address"
                          defaultValue={doctorDetails?.address}
                          {...register("address", { required: true })}
                          size="md"
                          borderRadius="lg"
                          minH="60px"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151">Postal Code</FormLabel>
                        <Input
                          type="number"
                          placeholder="Postal Code"
                          defaultValue={doctorDetails?.postal_code}
                          {...register("postal_code", { required: true })}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Password */}
                <Card mb={6} borderRadius="xl" boxShadow="sm">
                  <CardBody p={6}>
                    <Heading as="h3" size="md" mb={4} color="#162D5D">
                      Password
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151">Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...register("password")}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151">CNF Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...register("cnfPassword")}
                          size="md"
                          borderRadius="lg"
                          bg="#F8FAFC"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Button
                  w="100%"
                  h={10}
                  mt={4}
                  type="submit"
                  bg="#3B82F6"
                  color="white"
                  fontWeight="bold"
                  fontSize="lg"
                  borderRadius="lg"
                  _hover={{ bg: "#2563EB" }}
                  isLoading={isLoading}
                  boxShadow="0 2px 8px 0 rgba(59,130,246,0.10)"
                >
                  Update Details
                </Button>
              </Box>

              {/* Right Side: Profile Picture & Social */}
              <Box w={{ base: "100%", lg: "350px" }} maxW="100%" flexShrink={0} mt={{ base: 8, lg: 0 }}>
                <Card bg="#F6F9FE" borderRadius="2xl" boxShadow="0 4px 24px 0 rgba(59,130,246,0.08)" h="fit-content" mb={6} overflow="hidden" w="100%">
                  <CardBody p={6}>
                    <Text textAlign="center" fontWeight="bold" fontSize="lg" color="#162D5D" mb={4}>
                      Profile Picture
                    </Text>
                    <Divider mb={6} />
                    <Flex justify="center" mt={2} position="relative">
                      <Image
                        borderRadius="full"
                        h={{ base: "120px", md: "160px" }}
                        w={{ base: "120px", md: "160px" }}
                        objectFit="cover"
                        src={doctorDetails?.image ? `${imageBaseURL}/${doctorDetails?.image}` : "/admin/profilePicturePlaceholder.png"}
                        border="4px solid #E5E7EB"
                        bg="#E5E7EB"
                      />
                      {doctorDetails?.image && (
                        <Tooltip label="Delete" fontSize="md">
                          <IconButton
                            size="sm"
                            colorScheme="red"
                            variant="solid"
                            position="absolute"
                            right={5}
                            top={5}
                            icon={<FaTrash />}
                            onClick={handleFileDelete}
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
                        leftIcon={<BiLinkExternal />}
                        size="md"
                        bg="#3B82F6"
                        color="white"
                        borderRadius="lg"
                        fontWeight="bold"
                        onClick={() => inputRef.current.click()}
                        _hover={{ bg: "#2563EB" }}
                        w="100%"
                        h={10}
                        isDisabled={!!doctorDetails?.image}
                      >
                        Upload Profile Picture
                      </Button>
                      <Box textAlign="center" color="gray.500" fontSize="sm" mt={2} lineHeight="short">
                        Supported formats: JPG, PNG, GIF <br />
                        Max file size: 5MB
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg="#F6F9FE" borderRadius="2xl" boxShadow="0 4px 24px 0 rgba(59,130,246,0.08)" h="fit-content" mb={6} overflow="hidden" w="100%">
                  <CardBody p={6}>
                    <Text fontWeight="bold" fontSize="lg" color="#162D5D" mb={4} textAlign="center">
                      Social Accounts
                    </Text>
                    <Divider mb={6} />
                    <VStack spacing={4} align="stretch">
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <CgFacebook size={20} color="#1877F3" />
                        </InputLeftElement>
                        <Input
                          borderRadius="lg"
                          placeholder="Facebook"
                          defaultValue={doctorDetails?.fb_linik}
                          {...register("fb_linik")}
                          bg="white"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                        <InputRightElement
                          cursor="pointer"
                          onClick={() => {
                            const url = doctorDetails?.fb_linik;
                            if (url && /^(ftp|http|https):\/\/[^ "']+$/.test(url)) {
                              window.open(url, "_blank");
                            } else {
                              ShowToast(toast, "error", "This is not a valid url");
                            }
                          }}
                        >
                          <BiLinkExternal size={16} />
                        </InputRightElement>
                      </InputGroup>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <AiOutlineTwitter size={20} color="#1DA1F2" />
                        </InputLeftElement>
                        <Input
                          borderRadius="lg"
                          placeholder="Twitter"
                          defaultValue={doctorDetails?.twitter_link}
                          {...register("twitter_link")}
                          bg="white"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                        <InputRightElement
                          cursor="pointer"
                          onClick={() => {
                            const url = doctorDetails?.twitter_link;
                            if (url && /^(ftp|http|https):\/\/[^ "']+$/.test(url)) {
                              window.open(url, "_blank");
                            } else {
                              ShowToast(toast, "error", "This is not a valid url");
                            }
                          }}
                        >
                          <BiLinkExternal size={16} />
                        </InputRightElement>
                      </InputGroup>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <BsInstagram size={20} color="#E1306C" />
                        </InputLeftElement>
                        <Input
                          borderRadius="lg"
                          placeholder="Instagram"
                          defaultValue={doctorDetails?.insta_link}
                          {...register("insta_link")}
                          bg="white"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                        <InputRightElement
                          cursor="pointer"
                          onClick={() => {
                            const url = doctorDetails?.insta_link;
                            if (url && /^(ftp|http|https):\/\/[^ "']+$/.test(url)) {
                              window.open(url, "_blank");
                            } else {
                              ShowToast(toast, "error", "This is not a valid url");
                            }
                          }}
                        >
                          <BiLinkExternal size={16} />
                        </InputRightElement>
                      </InputGroup>
                      <InputGroup size="md">
                        <InputLeftElement pointerEvents="none">
                          <AiFillYoutube size={20} color="#FF0000" />
                        </InputLeftElement>
                        <Input
                          borderRadius="lg"
                          placeholder="Youtube"
                          defaultValue={doctorDetails?.you_tube_link}
                          {...register("you_tube_link")}
                          bg="white"
                          _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                        />
                        <InputRightElement
                          cursor="pointer"
                          onClick={() => {
                            const url = doctorDetails?.you_tube_link;
                            if (url && /^(ftp|http|https):\/\/[^ "']+$/.test(url)) {
                              window.open(url, "_blank");
                            } else {
                              ShowToast(toast, "error", "This is not a valid url");
                            }
                          }}
                        >
                          <BiLinkExternal size={16} />
                        </InputRightElement>
                      </InputGroup>
                    </VStack>
                  </CardBody>
                </Card>

                {/* FeesForm remains unchanged, but ensure it is in a Card with proper spacing and shadow */}
                <FeesForm
                  doctorDetails={doctorDetails}
                  register={register}
                  setValue={setValue}
                />
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel p={0}>
            <TimeSlotes doctorID={param.id} />
            <Divider my={10} />
            <VideoTimeSlotes doctorID={param.id} />
          </TabPanel>
          <TabPanel p={0}>
            <Review doctID={param.id} doctorDetails={doctorDetails} />
          </TabPanel>
          <TabPanel p={0}>
            <DoctAppointments doctID={param.id} />
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

// Fees Form
const FeesForm = ({ doctorDetails, register, setValue }) => {
  const [appointments, setAppointments] = useState({
    video_appointment: doctorDetails?.video_appointment,
    clinic_appointment: doctorDetails?.clinic_appointment,
    emergency_appointment: doctorDetails?.emergency_appointment,
  });

  const handleToggle = (type) => {
    setAppointments((prev) => {
      const updatedValue = prev[type] === 1 ? 0 : 1;
      setValue(type, updatedValue);
      return { ...prev, [type]: updatedValue };
    });
  };

  useEffect(() => {
    setAppointments({
      video_appointment: doctorDetails?.video_appointment,
      clinic_appointment: doctorDetails?.clinic_appointment,
      emergency_appointment: doctorDetails?.emergency_appointment,
    });
  }, [doctorDetails]);

  return (
    <Card bg="#fff" borderRadius="xl" boxShadow="sm" h="fit-content" pb={5}>
      <CardBody p={6}>
        <Heading as="h3" size="md" mb={4} color="#162D5D">
          Fees
        </Heading>
        <Divider mb={6} />
        <VStack spacing={4} align="stretch">
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" fontWeight="semibold" color="#374151">OPD Appointment</FormLabel>
            <Spacer />
            <Switch
              isChecked={appointments.clinic_appointment === 1}
              onChange={() => handleToggle("clinic_appointment")}
              size="md"
              colorScheme="blue"
            />
          </FormControl>
          {appointments.clinic_appointment === 1 && (
            <FormControl>
              <FormLabel fontWeight="semibold" color="#374151">OPD Fee</FormLabel>
              <Input
                size="md"
                borderRadius="lg"
                type="number"
                placeholder="OPD Fee"
                {...register("opd_fee")}
                defaultValue={doctorDetails?.opd_fee}
                bg="#F8FAFC"
                _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
              />
            </FormControl>
          )}
          <Divider />
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" fontWeight="semibold" color="#374151">Video Appointment</FormLabel>
            <Spacer />
            <Switch
              isChecked={appointments.video_appointment === 1}
              onChange={() => handleToggle("video_appointment")}
              size="md"
              colorScheme="blue"
            />
          </FormControl>
          {appointments.video_appointment === 1 && (
            <FormControl>
              <FormLabel fontWeight="semibold" color="#374151">Video Fee</FormLabel>
              <Input
                size="md"
                borderRadius="lg"
                type="number"
                placeholder="Video Fee"
                {...register("video_fee")}
                defaultValue={doctorDetails?.video_fee}
                bg="#F8FAFC"
                _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
              />
            </FormControl>
          )}
          <Divider />
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" fontWeight="semibold" color="#374151">Emergency Appointment</FormLabel>
            <Spacer />
            <Switch
              isChecked={appointments.emergency_appointment === 1}
              onChange={() => handleToggle("emergency_appointment")}
              size="md"
              colorScheme="red"
            />
          </FormControl>
          {appointments.emergency_appointment === 1 && (
            <FormControl>
              <FormLabel fontWeight="semibold" color="#374151">Emergency Fee</FormLabel>
              <Input
                size="md"
                borderRadius="lg"
                type="number"
                placeholder="Emergency Fee"
                {...register("emg_fee")}
                defaultValue={doctorDetails?.emg_fee}
                bg="#F8FAFC"
                _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
              />
            </FormControl>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const IsActiveSwitch = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.active);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isActive === 1}
        size="md"
        colorScheme="blue"
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};

const StopBooking = ({ id, isStop_booking }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, stop_booking) => {
    let data = { id, stop_booking };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.stop_booking);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isStop_booking === 1}
        size="md"
        colorScheme="red"
        onChange={(e) => {
          let stop_booking = e.target.checked ? 1 : 0;
          mutation.mutate({ id, stop_booking });
        }}
      />
    </FormControl>
  );
};