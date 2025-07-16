import { BiLinkExternal } from "react-icons/bi";
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
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Image,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DELETE, GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useLocationData from "../../Hooks/UseLocationData";
import Loading from "../../Components/Loading";
import { FaTrash } from "react-icons/fa";
import imageBaseURL from "../../Controllers/image";
import GalleryImages from "./GalleryImages";
const handleUpdate = async (data) => {
  const res = await UPDATE(admin.token, "update_clinic", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
const handleFileDelete = async (data) => {
  const res = await DELETE(admin.token, "remove_clinic_image", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

export default function UpdateClinic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { cities } = useLocationData();
  const inputRef = useRef();

  const { data: clinicData, isLoading: isClinicLoading } = useQuery({
    queryKey: ["clinic", id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_clinic/${id}`);
      if (res.response !== 200) {
        throw new Error(res.message);
      }
      return res.data;
    },
  });

  useEffect(() => {
    clinicData &&
      Object.keys(clinicData).forEach((key) => {
        setValue(key, clinicData[key]);
      });
  }, [clinicData, setValue]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      let data = {
        id: id,
      };
      await handleFileDelete(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Removed!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    let formData = {
      id: id,
      image: selectedFile,
    };
    mutation.mutate(formData);
  };

  const submitForm = (data) => {
    let formData = {
      ...data,
      id: id,
    };
    mutation.mutate(formData);
  };

  if (isClinicLoading) return <Loading />;

  return (
    <Box
      bg="#F9FAFB"
      minH="100vh"
      px={{ base: 2, sm: 4, md: 10 }}
      py={{ base: 4, sm: 6, md: 10 }}
    >
      <Flex justify="space-between" alignItems="center" mb={8} wrap="wrap">
        <Box>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="#162D5D">
            Update Clinic
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

      <Tabs variant="enclosed-colored" colorScheme="blue" isFitted={false}>
        <TabList mb={4} overflowX="auto" whiteSpace="nowrap" sx={{ scrollbarWidth: 'none', '::-webkit-scrollbar': { display: 'none' } }}>
          <Tab>Basic Details</Tab>
          <Tab>Gallery Images</Tab>
          <Tab>Opening Hours</Tab>
          <Tab>Contact</Tab>
          <Tab>Setting</Tab>
        </TabList>
        <TabPanels mt={0}>
          <TabPanel p={0}>
            <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start">
              {/* Form Section */}
              <Card w={{ base: "100%", lg: "70%" }} bg="white" p={{ base: 4, sm: 6, md: 8 }} borderRadius="2xl" boxShadow="md">
                <CardBody p={0}>
                  <Box as="form" onSubmit={handleSubmit(submitForm)}>
                    <Heading as="h3" size="md" mb={6} color="#162D5D">
                      Basic Information
                    </Heading>
                    <Flex gap={10} mb={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">Title</FormLabel>
                        <Input type="text" placeholder="Title" {...register("title", { required: true })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">Active</FormLabel>
                        <Select isRequired {...register("active", { required: true })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                          isDisabled={clinicData?.active.toString() === "0" && admin.role.name.toLowerCase() !== "super admin"}
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </Select>
                        {clinicData?.active.toString() === "0" && admin.role.name.toLowerCase() !== "super admin" && (
                          <FormHelperText color="red.500">Only Super Admin can activate this account.</FormHelperText>
                        )}
                      </FormControl>
                    </Flex>
                    <Flex gap={10} mb={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">City</FormLabel>
                        <Select placeholder="Select City" isRequired {...register("city_id", { required: true })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}>
                          {cities?.map((city) => (
                            <option key={city.id} value={city.id}>{city.title}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">State</FormLabel>
                        <Input type="Text" placeholder="State" {...register("state_title", { required: true })} isReadOnly borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
                      </FormControl>
                    </Flex>
                    <Flex gap={10} mb={6}>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">Latitude</FormLabel>
                        <Input type="text" placeholder="Latitude" {...register("latitude", { pattern: /^-?\d+(\.\d+)?$/ })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">Longitude</FormLabel>
                        <Input type="text" placeholder="Longitude" {...register("longitude", { pattern: /^-?\d+(\.\d+)?$/ })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
                      </FormControl>
                    </Flex>
                    <Flex mb={6}>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">Address</FormLabel>
                        <Textarea type="text" placeholder="Address" {...register("address", { required: false })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
                      </FormControl>
                    </Flex>
                    <Flex mb={6}>
                      <FormControl>
                        <FormLabel fontWeight="semibold" color="#374151" fontSize="sm">Description</FormLabel>
                        <Textarea type="text" placeholder="Description" {...register("description", { required: false })} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
                      </FormControl>
                    </Flex>
                    <Button w="100%" h={12} mt={4} type="submit" bg="#2563EB" color="white" fontWeight="bold" fontSize="lg" borderRadius="lg" _hover={{ bg: "#1D4ED8" }} isLoading={mutation.isPending} boxShadow="0 2px 8px 0 rgba(37,99,235,0.10)">
                      Update
                    </Button>
                  </Box>
                </CardBody>
              </Card>
              {/* Profile Picture Section */}
              <Card w={{ base: "100%", lg: "30%" }} bg="#F6F9FE" p={{ base: 4, sm: 6, md: 8 }} borderRadius="2xl" boxShadow="md" mt={{ base: 6, lg: 0 }}>
                <CardBody p={0}>
                  <Text textAlign="center" fontWeight="bold" fontSize="lg" color="#162D5D" mb={4}>
                    Clinic Image
                  </Text>
                  <Divider mb={6} />
                  <Flex justify="center" mt={2} position="relative">
                    <Image
                      borderRadius="full"
                      h={{ base: "120px", md: "160px" }}
                      w={{ base: "120px", md: "160px" }}
                      objectFit="cover"
                      src={clinicData?.image ? `${imageBaseURL}/${clinicData?.image}` : "/admin/imagePlaceholder.png"}
                      border="4px solid #E5E7EB"
                      bg="#E5E7EB"
                    />
                    {clinicData?.image && (
                      <Tooltip label="Delete" fontSize="md">
                        <IconButton
                          size="sm"
                          colorScheme="red"
                          variant="solid"
                          position="absolute"
                          right={2}
                          top={2}
                          icon={<FaTrash />}
                          isLoading={deleteMutation.isPending}
                          onClick={() => {
                            deleteMutation.mutate();
                          }}
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
                      bg="#2563EB"
                      color="white"
                      borderRadius="lg"
                      fontWeight="semibold"
                      onClick={() => inputRef.current.click()}
                      _hover={{ bg: "#1D4ED8" }}
                      w="100%"
                      h={12}
                      isLoading={mutation.isPending}
                    >
                      Upload Clinic Image
                    </Button>
                    <Box textAlign="center" color="gray.500" fontSize="sm" mt={2} lineHeight="short">
                      Supported formats: JPG, PNG, GIF <br />
                      Max file size: 5MB
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </Flex>
          </TabPanel>
          <TabPanel p={0}>
            <GalleryImages data={clinicData} id={id} />
          </TabPanel>
          <TabPanel p={0}>
            {/* Opening Hours Modern Card */}
            <Card mt={5} bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 4, sm: 6, md: 8 }}>
              <CardBody p={0}>
                <Heading as="h3" size="md" fontWeight="bold" color="#162D5D" mb={6}>
                  Opening Hours
                </Heading>
                <OpeningHrs data={clinicData} id={id} />
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel p={0}>
            {/* Contact Modern Card */}
            <Card mt={5} bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 4, sm: 6, md: 8 }}>
              <CardBody p={0}>
                <Heading as="h3" size="md" fontWeight="bold" color="#162D5D" mb={6}>
                  Contact Details
                </Heading>
                <Contact data={clinicData} id={id} />
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel p={0}>
            {/* Setting Modern Card */}
            <Card mt={5} bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 4, sm: 6, md: 8 }}>
              <CardBody p={0}>
                <Heading as="h3" size="md" fontWeight="bold" color="#162D5D" mb={6}>
                  Settings
                </Heading>
                <Setting data={clinicData} id={id} />
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const OpeningHrs = ({ data, id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const openingHour = data.opening_hours ? JSON.parse(data.opening_hours) : {};
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const { control, handleSubmit } = useForm({
    defaultValues: daysOfWeek.reduce((acc, day) => {
      acc[day] = openingHour?.[day] || "";
      return acc;
    }, {}),
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });
  const onSubmit = (data) => {
    const formattedString = JSON.stringify(data);
    let formData = {
      opening_hours: formattedString,
      id: id,
    };
    mutation.mutate(formData);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={6}>
        {daysOfWeek.map((day) => (
          <Box key={day}>
            <FormLabel textTransform="capitalize" minW={24} alignSelf="center">
              {day}
            </FormLabel>
            <Controller
              name={day}
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="e.g., 9am-5pm or Closed" borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
              )}
            />
          </Box>
        ))}
      </SimpleGrid>
      <Button colorScheme="blue" type="submit" w={{ base: "full", md: "auto" }} mt={2} isLoading={mutation.isPending} fontWeight="bold" fontSize="md" borderRadius="lg">
        Update
      </Button>
    </form>
  );
};
const Contact = ({ data, id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: data?.email || "",
      phone: data?.phone || "",
      phone_second: data?.phone_second || "",
      whatsapp: data?.whatsapp || "",
    },
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });
  const onSubmit = (data) => {
    let formData = {
      ...data,
      id: id,
    };
    mutation.mutate(formData);
  };
  const inputs = [
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "phone_second", label: "Phone (Alt)" },
    { name: "whatsapp", label: "WhatsApp" },
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
        {inputs.map(({ name, label }) => (
          <Box key={name}>
            <FormLabel minW={24} alignSelf="center">
              {label}
            </FormLabel>
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <Input {...field} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />
              )}
            />
          </Box>
        ))}
      </SimpleGrid>
      <Button colorScheme="blue" type="submit" w={{ base: "full", md: "auto" }} mt={2} isLoading={mutation.isPending} fontWeight="bold" fontSize="md" borderRadius="lg">
        Update
      </Button>
    </form>
  );
};
const Setting = ({ data, id }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      ambulance_btn_enable: data?.ambulance_btn_enable || "0",
      ambulance_number: data?.ambulance_number || "",
      stop_booking: data?.stop_booking || "0",
      coupon_enable: data?.coupon_enable || "0",
      tax: data?.tax || "",
    },
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Clinic Updated!");
      queryClient.invalidateQueries(["clinics", id]);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });
  const onSubmit = (data) => {
    let formData = {
      ...data,
      id: id,
    };
    mutation.mutate(formData);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={6}>
        <Box>
          <FormLabel minW={24} alignSelf="center">
            Ambulance Number
          </FormLabel>
          <Controller
            name={"ambulance_number"}
            control={control}
            render={({ field }) => <Input {...field} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />}
          />
        </Box>
        <Box>
          <FormLabel minW={24} alignSelf="center">
            Ambulance Button Enable
          </FormLabel>
          <Controller
            name={"ambulance_btn_enable"}
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select option" value={field.value} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}>
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </Select>
            )}
          />
        </Box>
        <Box>
          <FormLabel minW={24} alignSelf="center">
            Stop Booking
          </FormLabel>
          <Controller
            name={"stop_booking"}
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select option" value={field.value} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </Select>
            )}
          />
        </Box>
        <Box>
          <FormLabel minW={24} alignSelf="center">
            Coupon Enable
          </FormLabel>
          <Controller
            name={"coupon_enable"}
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select option" value={field.value} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}>
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </Select>
            )}
          />
        </Box>
        <Box>
          <FormLabel minW={24} alignSelf="center">
            Tax (%)
          </FormLabel>
          <Controller
            name={"tax"}
            control={control}
            render={({ field }) => <Input {...field} type="number" min={0} borderRadius="lg" size="md" bg="#F8FAFC" fontSize="sm" _focus={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }} />}
          />
        </Box>
      </SimpleGrid>
      <Button colorScheme="blue" type="submit" w={{ base: "full", md: "auto" }} mt={2} isLoading={mutation.isPending} fontWeight="bold" fontSize="md" borderRadius="lg">
        Update
      </Button>
    </form>
  );
};
