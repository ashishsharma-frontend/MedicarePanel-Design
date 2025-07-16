/* eslint-disable react-hooks/rules-of-hooks */
import { AiOutlineDown } from "react-icons/ai";
/* eslint-disable react/prop-types */
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
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ADD } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import ISDCODEMODAL from "../../Components/IsdModal";
import todayDate from "../../Controllers/today";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import UseClinicsData from "../../Hooks/UseClinicsData";
import useRolesData from "../../Hooks/UserRolesData";
import { css } from '@emotion/react';

export default function AddUser() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const [isd_code, setisd_code] = useState("+91");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();
  const { Roles, rolesLoading, rolesError } = useRolesData();
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  const AddNew = async (data) => {
    if (data.password != data.cnfPassword) {
      return showToast(toast, "error", "password does not match");
    }

    let formData = {
      image: profilePicture,
      isd_code: isd_code,
      clinic_id: selectedClinicID?.id || "",
      ...data,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_user", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Added!");
        queryClient.invalidateQueries("users");
        reset();
        navigate("/users");
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const { hasPermission } = useHasPermission();
  if (!hasPermission("USER_ADD")) return <NotAuth />;

  return (
    <Box py={{ base: 4, md: 8 }} px={{ base: 0, md: 4 }} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Heading
        as="h2"
        size="lg"
        textAlign="center"
        fontWeight={700}
        color={useColorModeValue('gray.700', 'gray.100')}
        mb={8}
        letterSpacing="tight"
      >
        Add User
      </Heading>
      <Flex gap={8} flexDir={{ base: 'column', lg: 'row' }} align="stretch">
        <Card mt={0} bg={useColorModeValue('white', 'gray.700')} w={{ base: '100%', lg: '70%' }} boxShadow={{ base: 'xs', md: 'md' }} borderRadius={16}>
          <CardBody p={{ base: 4, md: 6 }} as="form" onSubmit={handleSubmit(AddNew)}>
            <Flex gap={6} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input w="100%" type="email" placeholder="Email" {...register('email')} boxShadow={{ base: 'none', md: undefined }} />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="Password" {...register('password')} boxShadow={{ base: 'none', md: undefined }} />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input type="password" placeholder="Confirm Password" {...register('cnfPassword')} boxShadow={{ base: 'none', md: undefined }} />
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input placeholder="First Name" {...register('f_name', { required: true })} boxShadow={{ base: 'none', md: undefined }} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input placeholder="Last Name" {...register('l_name', { required: true })} boxShadow={{ base: 'none', md: undefined }} />
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor="pointer"
                    onClick={e => {
                      e.stopPropagation();
                      onOpen();
                    }}
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: '10px' }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    {...register('phone', {
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
                    })}
                    boxShadow={{ base: 'none', md: undefined }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Date Of Birth</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Select Date"
                  size="md"
                  type="date"
                  {...register('dob')}
                  boxShadow={{ base: 'none', md: undefined }}
                />
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select placeholder="Select Gender" {...register('gender')} boxShadow={{ base: 'none', md: undefined }}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </Select>
              </FormControl>
              <FormControl isRequired={admin.role.name === 'Clinic'}>
                <FormLabel>Role</FormLabel>
                <Select
                  placeholder={rolesLoading ? 'Loading...' : rolesError ? "Can't Get Roles" : 'Select Role'}
                  {...register('role_id')}
                  boxShadow={{ base: 'none', md: undefined }}
                >
                  {Roles?.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>
            <Flex gap={6} mt={4} flexDir={{ base: 'column', md: 'row' }}>
              <FormControl isRequired mt={2}>
                <FormLabel>Clinic</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={'clinic'}
                  defaultData={selectedClinic}
                  setState={setselectedClinicID}
                  boxShadow={{ base: 'none', md: undefined }}
                />
              </FormControl>
            </Flex>
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
              Add User
            </Button>
          </CardBody>
        </Card>
        <Card
          mt={0}
          bg={useColorModeValue('white', 'gray.700')}
          w={{ base: '100%', lg: '30%' }}
          h="fit-content"
          pb={6}
          boxShadow={{ base: 'xs', md: 'md' }}
          borderRadius={16}
        >
          <CardBody p={4}>
            <Text textAlign="center" fontWeight={600} fontSize={{ base: 'md', md: 'lg' }} mb={2}>
              Profile Picture
            </Text>
            <Divider mb={4} />
            <Flex p={2} justify="center" mt={2} position="relative" flexDir="column" alignItems="center">
              <Image
                borderRadius="full"
                h={180}
                w={180}
                objectFit="cover"
                src={profilePicture ? URL.createObjectURL(profilePicture) : '/profilePicturePlaceholder.png'}
                boxShadow="md"
                border="4px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                mb={2}
              />
              {profilePicture && (
                <Tooltip label="Clear" fontSize="md">
                  <CloseButton
                    colorScheme="red"
                    variant="solid"
                    position="absolute"
                    right={6}
                    top={6}
                    onClick={() => setprofilePicture(null)}
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
                size="md"
                onClick={() => inputRef.current.click()}
                colorScheme="blue"
                borderRadius={8}
                fontWeight={600}
                boxShadow="sm"
              >
                Upload Profile Picture
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
      <ISDCODEMODAL isOpen={isOpen} onClose={onClose} setisd_code={setisd_code} />
    </Box>
  );
}
