/* eslint-disable react-hooks/rules-of-hooks */
import { AiOutlineDown } from "react-icons/ai";
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
  Select,
  Text,
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
  Badge,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import Loading from "../../Components/Loading";
import ISDCODEMODAL from "../../Components/IsdModal";
import { FaTrash } from "react-icons/fa";
import VitalsData from "./VitalsData";
import FamilyMembersByUser from "../Family-Members/FamilyMembersByUser";
import todayDate from "../../Controllers/today";
import Wallet from "../Wallet/Wallet";
import { walletMinAmount } from "../../Controllers/Wallet";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import UseClinicsData from "../../Hooks/UseClinicsData";
import DeleteAssignRole from "../Roles/DeleteAssignRole";
import UserAssignRole from "./UserAssignRole";
import { FiActivity, FiUser, FiGrid, FiCalendar } from "react-icons/fi";
import { css } from '@emotion/react';

export default function UpdateUser() {
  const { id } = useParams();
  const { hasPermission } = useHasPermission();
  if (!hasPermission("USER_UPDATE")) return <NotAuth />;
  return (
    <Box py={{ base: 4, md: 8 }} px={{ base: 0, md: 4 }} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading
          as="h2"
          size="md"
          fontWeight={700}
          color="blue.700"
          letterSpacing="tight"
        >
          User Management
        </Heading>
        <Button
          size="md"
          variant="outline"
          colorScheme="blue"
          onClick={() => window.history.back()}
          borderRadius={8}
          fontWeight={600}
        >
          Back
        </Button>
      </Flex>
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="none"
        boxShadow={{ base: 'none', md: 'md' }}
        px={{ base: 0, md: 6 }}
        py={{ base: 2, md: 6 }}
        w="100%"
        maxW="100vw"
      >
        <Tabs variant="unstyled" isFitted>
          <TabList
            overflowX="auto"
            whiteSpace="nowrap"
            borderBottom="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            mb={4}
            px={2}
            css={css`
              scrollbar-width: none;
              -ms-overflow-style: none;
              &::-webkit-scrollbar { display: none; }
            `}
            gap={{ base: 2, md: 4 }}
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
              <FiActivity /> Overview
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
              <FiUser /> Family Members
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
              <FiGrid /> Family Vitals Data
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
              <FiCalendar /> Wallet
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={{ base: 1, md: 4 }} py={{ base: 2, md: 4 }}>
              <UserDetails />
            </TabPanel>
            <TabPanel px={{ base: 1, md: 4 }} py={{ base: 2, md: 4 }}>
              <FamilyMembersByUser userID={id} />
            </TabPanel>
            <TabPanel px={{ base: 1, md: 4 }} py={{ base: 2, md: 4 }}>
              <VitalsData />
            </TabPanel>
            <TabPanel px={{ base: 1, md: 4 }} py={{ base: 2, md: 4 }}>
              <Wallet userID={id} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}

const handlePasswordChange = async (data) => {
  const res = await UPDATE(admin.token, "update_password", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function UserDetails() {
  const param = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [password, setpassword] = useState();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  // assignRole
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const {
    isOpen: AssignisOpen,
    onOpen: AssignonOpen,
    onClose: AssignonClose,
  } = useDisclosure();

  // get doctor details

  const { data: userDetails, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_user/${param.id}`);
      setisd_code(res.data.isd_code);
      return res.data;
    },
  });

  const [isd_code, setisd_code] = useState(userDetails?.isd_code || undefined);

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return ShowToast(toast, "error", "password does not match");
    }
    let formData = {
      id: param.id,
      isd_code,
      clinic_id: selectedClinicID?.id || userDetails.clinic_id,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_user", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Updated!");
        queryClient.invalidateQueries(["user", param.id]);
        queryClient.invalidateQueries("users");
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
      const res = await ADD(admin.token, "update_user", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Updated!");
        queryClient.invalidateQueries(["user", param.id]);
        queryClient.invalidateQueries("users");
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

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_user_image", {
        id: param.id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image Deleted!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const paswordChngMutate = useMutation({
    mutationFn: async (data) => {
      await handlePasswordChange(data);
    },
    onSuccess: () => {
      setpassword("");
      ShowToast(toast, "success", "Success");
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (isUserLoading || isLoading) return <Loading />;

  return (
    <Box>
      <Flex gap={8} flexDir={{ base: 'column', lg: 'row' }}>
        <Card mt={0} bg={useColorModeValue('white', 'gray.700')} w={{ base: '100%', lg: '70%' }} boxShadow={{ base: 'sm', md: 'md' }} borderRadius={16}>
          <CardBody p={{ base: 4, md: 6 }} as="form" onSubmit={handleSubmit(AddNew)}>
            <Flex alignItems="center" gap={3} flexWrap="wrap" mb={4}>
              <Heading as="h1" size="md" color="blue.700">
                {admin.id === param.id ? "Admin Details" : "User Details"}
              </Heading>
              <Badge
                p={1}
                px={3}
                fontSize="sm"
                textAlign="center"
                borderRadius={6}
                colorScheme={userDetails.wallet_amount < walletMinAmount ? "red" : "green"}
                my={2}
              >
                Wallet Amount - {userDetails.wallet_amount}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                ml={2}
                colorScheme={userDetails.role_id ? "red" : "blue"}
                onClick={() => {
                  if (userDetails.role_id) {
                    DeleteonOpen();
                  } else {
                    AssignonOpen();
                  }
                }}
                borderRadius={8}
                fontWeight={600}
              >
                {userDetails.role_id
                  ? `Delete Assigned Role - ${userDetails?.role_name}`
                  : "Assign a Role"}
              </Button>
            </Flex>
            <Divider mb={4} />
            <Flex gap={6} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl isRequired>
                <FormLabel color="#242424">First Name</FormLabel>
                <Input
                  placeholder="First Name"
                  {...register("f_name", { required: true })}
                  defaultValue={userDetails.f_name}
                  variant={{ base: 'flushed', md: 'outline' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="#242424">Last Name</FormLabel>
                <Input
                  placeholder="Last Name"
                  {...register("l_name", { required: false })}
                  defaultValue={userDetails.l_name}
                  variant={{ base: 'flushed', md: 'outline' }}
                />
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel color="#242424">Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  defaultValue={userDetails.email}
                  variant={{ base: 'flushed', md: 'outline' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="#242424">Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor="pointer"
                    onClick={e => {
                      e.stopPropagation();
                      onOpen();
                    }}
                  >
                    {isd_code || userDetails?.isd_code} <AiOutlineDown style={{ marginLeft: '10px' }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
                    })}
                    defaultValue={userDetails.phone}
                    variant={{ base: 'flushed', md: 'outline' }}
                  />
                </InputGroup>
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel color="#242424">Date Of Birth</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Select Date"
                  size="md"
                  type="date"
                  {...register("dob", { required: false })}
                  defaultValue={userDetails.dob}
                  variant={{ base: 'flushed', md: 'outline' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="#242424">Gender</FormLabel>
                <Select
                  placeholder="Select Gender"
                  {...register("gender", { required: false })}
                  defaultValue={userDetails.gender}
                  variant={{ base: 'flushed', md: 'outline' }}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </Select>
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel color="#242424">Clinic</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={"clinic"}
                  defaultData={userDetails.clinic_id}
                  setState={setselectedClinicID}
                  isDisabled
                />
              </FormControl>
            </Flex>
            <Button
              w="100%"
              mt={8}
              type="submit"
              colorScheme="blue"
              size="md"
              isLoading={isLoading}
              borderRadius={8}
              fontWeight={600}
              fontSize="sm"
              py={3}
              px={6}
              boxShadow="sm"
              _hover={{
                boxShadow: "md",
              }}
              transition="all 0.2s"
            >
              Update User
            </Button>
            <Divider py={2} mb={2} />
            <Heading as="h2" size="md" mb={2} color="#242424">
              Update Password
            </Heading>
            <Flex gap={6} mt={2} align="flex-end" flexDir={{ base: 'column', md: 'row' }}>
              <FormControl w={{ base: '100%', md: 300 }}>
                <FormLabel color="#242424">New Password</FormLabel>
                <Input
                  value={password}
                  type="password"
                  placeholder="Enter New Password..."
                  onChange={e => setpassword(e.target.value)}
                  variant={{ base: 'flushed', md: 'outline' }}
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={() => {
                  let user_id = param.id;
                  paswordChngMutate.mutate({
                    user_id,
                    password,
                  });
                }}
                isLoading={paswordChngMutate.isPending}
                borderRadius={8}
                fontWeight={700}
              >
                Update Password
              </Button>
            </Flex>
          </CardBody>
        </Card>
        <Card
          mt={0}
          bg={useColorModeValue('white', 'gray.700')}
          w={{ base: '100%', lg: '30%' }}
          h="fit-content"
          pb={6}
          boxShadow={{ base: 'sm', md: 'md' }}
          borderRadius={16}
        >
          <CardBody p={4}>
            <Text textAlign="center" fontWeight={600} fontSize={{ base: 'md', md: 'lg' }} mb={2} color="#242424">
              Profile Picture
            </Text>
            <Divider mb={4} />
            <Flex p={2} justify="center" mt={2} position="relative" flexDir="column" alignItems="center">
              <Image
                borderRadius="full"
                h={180}
                w={180}
                objectFit="cover"
                src={userDetails?.image ? `${imageBaseURL}/${userDetails?.image}` : '/profilePicturePlaceholder.png'}
                boxShadow="md"
                border="4px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                mb={2}
              />
              {userDetails?.image && (
                <Tooltip label="Clear" fontSize="md">
                  <IconButton
                    size="sm"
                    colorScheme="red"
                    variant="solid"
                    position="absolute"
                    right={6}
                    top={6}
                    icon={<FaTrash />}
                    onClick={() => handleFileDelete()}
                  />
                </Tooltip>
              )}
            </Flex>
            <VStack spacing={4} align="stretch" mt={6}>
              <Input
                type="file"
                display="none"
                ref={inputRef}
                onChange={handleFileChange}
                accept=".jpeg, .svg, .png, .jpg"
              />
              <Button
                isDisabled={userDetails?.image !== null}
                size="md"
                onClick={() => inputRef.current.click()}
                colorScheme="blue"
                borderRadius={8}
                fontWeight={600}
                boxShadow="sm"
              >
                Change Profile Picture
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
      <ISDCODEMODAL isOpen={isOpen} onClose={onClose} setisd_code={setisd_code} />
      {DeleteisOpen && (
        <DeleteAssignRole
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={{
            id: userDetails?.role_assign_id,
            userID: param.id,
            role_name: userDetails?.role_name,
            name: `${userDetails?.f_name} ${userDetails?.l_name}`,
          }}
        />
      )}
      {AssignisOpen && (
        <UserAssignRole
          isOpen={AssignisOpen}
          onClose={AssignonClose}
          userID={param.id}
        />
      )}
    </Box>
  );
}
