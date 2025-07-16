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
  Heading,
  Image,
  Input,
  Select,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useLocationData from "../../Hooks/UseLocationData";

export default function AddClinic() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const { cities } = useLocationData();
  const inputRef = useRef();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  const AddNew = async (data) => {
    if (data.password !== data.cnfPassword) {
      return ShowToast(toast, "error", "Password does not match");
    }
    let formData = {
      image: profilePicture,
      ...data,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_clinic", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Clinic Added!");
        queryClient.invalidateQueries("clinics");
        reset();
        setprofilePicture(null);
        navigate(`/clinic/update/${res.id}`);
      } else {
        ShowToast(toast, "error", `${res.message} - ${res.response}`);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

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
            Add New Clinic
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Create a new clinic profile with all required information
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
          mt={{ base: 4, md: 0 }}
        >
          Back
        </Button>
      </Flex>

      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={8}
        align="flex-start"
      >
        {/* Form Section */}
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
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
                    Title
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter clinic title"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("title", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
                    City
                  </FormLabel>
                  <Select
                    placeholder="Select City"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("city_id", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  >
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <Divider my={8} />

              <Heading as="h3" size="md" mb={6} color="#162D5D">
                Clinic Admin Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
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
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("password", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
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
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
                    Confirm Password
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    borderRadius="lg"
                    size="md"
                    bg="#F8FAFC"
                    fontSize="sm"
                    {...register("cnfPassword", { required: true })}
                    _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">
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

        {/* Profile Picture Section */}
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
              Clinic Image
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
                Upload Clinic Image
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
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}
