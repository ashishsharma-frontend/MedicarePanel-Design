import { BsFillClipboardPlusFill } from "react-icons/bs";
/* eslint-disable react-hooks/rules-of-hooks */
import { BsFillTrashFill } from "react-icons/bs";
import {
  Box,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Select,
  HStack,
  Textarea,
  IconButton,
  useToast,
  useDisclosure,
  Grid,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ADD } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useMedicineData from "../../Hooks/Medicines";
import { MedicineAutocomplete } from "../../Components/MedicineAutocomplete";
import Loading from "../../Components/Loading";
import { useForm } from "react-hook-form";
import ShowToast from "../../Controllers/ShowToast";
import AddMedicine from "../Medicines/AddMedicine";

const handleUpdate = async (data) => {
  const res = await ADD(admin.token, "add_prescription", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
function hasEmptyValue(arr) {
  return arr.some((item) =>
    Object.entries(item).some(
      ([key, value]) =>
        key !== "notes" &&
        (value === null || value === "" || value === undefined)
    )
  );
}

// Preview Component
const PrescriptionPreview = ({ medicines, formData, appointmentData }) => {
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Card bg={bg} border="1px" borderColor={borderColor} h="fit-content">
      <CardBody p={4}>
        <Heading size="md" mb={4} color="blue.600">
          Prescription Preview
        </Heading>
        
        {/* Patient & Doctor Info */}
        <Box mb={4} p={3} bg="blue.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>Patient Information</Text>
          <Text fontSize="sm">Name: {appointmentData?.patient_f_name} {appointmentData?.patient_l_name}</Text>
          <Text fontSize="sm">Doctor: {appointmentData?.doct_f_name} {appointmentData?.doct_l_name}</Text>
          <Text fontSize="sm">Date: {new Date().toLocaleDateString()}</Text>
        </Box>

        {/* Physical Information */}
        {Object.keys(formData).length > 0 && (
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Physical Information</Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={2} fontSize="sm">
              {formData.pulse_rate && <Text>Pulse Rate: {formData.pulse_rate}</Text>}
              {formData.temperature && <Text>Temperature: {formData.temperature}</Text>}
              {formData.blood_pressure && <Text>BP: {formData.blood_pressure}</Text>}
              {formData.diabetic && <Text>Diabetic: {formData.diabetic}</Text>}
            </Grid>
          </Box>
        )}

        {/* Medicines Table */}
        {medicines.length > 0 && (
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Medicines</Text>
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Medicine</Th>
                    <Th>Dosage</Th>
                    <Th>Duration</Th>
                    <Th>Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {medicines.map((med, index) => (
                    <Tr key={index}>
                      <Td>
                        <Text fontWeight="medium">{med.medicine_name}</Text>
                        {med.notes && <Text fontSize="xs" color="gray.500">{med.notes}</Text>}
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">{med.dosage}</Badge>
                      </Td>
                      <Td fontSize="xs">{med.duration}</Td>
                      <Td fontSize="xs">{med.time}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Problem & Advice */}
        {formData.problem_desc && (
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Problem</Text>
            <Text fontSize="sm" p={2} bg="gray.50" borderRadius="md">
              {formData.problem_desc}
            </Text>
          </Box>
        )}

        {formData.test && (
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Tests</Text>
            <Text fontSize="sm" p={2} bg="gray.50" borderRadius="md">
              {formData.test}
            </Text>
          </Box>
        )}

        {formData.advice && (
          <Box mb={4}>
            <Text fontWeight="bold" mb={2}>Advice</Text>
            <Text fontSize="sm" p={2} bg="gray.50" borderRadius="md">
              {formData.advice}
            </Text>
          </Box>
        )}

        {formData.next_visit && (
          <Box>
            <Text fontWeight="bold" mb={2}>Next Visit</Text>
            <Badge colorScheme="green">After {formData.next_visit} days</Badge>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

function AddPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, getValues, watch } = useForm();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const appointment_id = searchParams.get("appointmentID");
  const patient_id = searchParams.get("patientID");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { medicinesData } = useMedicineData();

  const [medicines, setMedicines] = useState([
    {
      medicine_name: "",
      dosage: 1,
      duration: "For 3 days",
      time: "After Meal",
      dose_interval: "Once a Day",
      notes: "",
    },
  ]);
  const [medicine, setMedicine] = useState({
    medicine_name: "",
    dosage: 1,
    duration: "For 3 days",
    time: "After Meal",
    dose_interval: "Once a Day",
    notes: "",
  });

  // Watch form data for preview
  const formData = watch();

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prevMedicines) => {
      // Update the specific medicine entry
      const updatedMedicines = prevMedicines.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      );
      return updatedMedicines;
    });
  };

  const handleAdd = () => {
    setMedicines([...medicines, medicine]);
    setMedicine({
      medicine_name: "",
      dosage: 1,
      duration: "For 3 days",
      time: "After Meal",
      dose_interval: "Once a Day",
      notes: "",
    });
  };
  const handleDelete = (indexToRemove) => {
    setMedicines((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove)
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (hasEmptyValue(medicines)) {
        throw new Error("Please fill all the fields in medicines");
      }
      const values = getValues();
      const formData = {
        ...values,
        appointment_id: appointment_id,
        patient_id: patient_id,
        medicines: medicines,
      };
      await handleUpdate(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["prescription", id]);
      queryClient.invalidateQueries(["prescriptios", appointment_id]);
      navigate(`/appointment/${appointment_id}`);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (mutation.isPending) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"} mb={6}>
        <Heading as={"h1"} size={"md"} color="blue.600">
          Add Prescription
        </Heading>
        <Button
          w={120}
          size={"md"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={6}>
        {/* Left Column - Form */}
        <VStack spacing={6} align="stretch">
          {/* Medicines Section */}
          <Card bg={useColorModeValue("white", "gray.700")} shadow="md">
            <CardBody p={6}>
              <Flex justify={"space-between"} alignItems="center" mb={4}>
                <Heading as={"h3"} size={"md"} color="blue.600">
                  Medicines
                </Heading>
                <Button size="sm" colorScheme={"blue"} onClick={onOpen}>
                  New Medicine
                </Button>
              </Flex>

              <Divider mb={6} />

              {medicines.map((med, index) => (
                <Box key={index} mb={6} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                    <FormControl>
                      <FormLabel fontSize={"sm"} mb={1}>
                        Medicine
                      </FormLabel>
                      <MedicineAutocomplete
                        name={"Medicine"}
                        data={medicinesData}
                        defaultName={med.medicine_name}
                        handleChange={handleMedicineChange}
                        mainIndex={index}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={"sm"} mb={1}>
                        Dosage
                      </FormLabel>
                      <Select
                        name="dosage"
                        value={med.dosage}
                        onChange={(e) =>
                          handleMedicineChange(index, "dosage", e.target.value)
                        }
                        size={"md"}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={"sm"} mb={1}>
                        Duration
                      </FormLabel>
                      <Select
                        name="duration"
                        value={med.duration}
                        onChange={(e) =>
                          handleMedicineChange(index, "duration", e.target.value)
                        }
                        size={"md"}
                      >
                        <option value="For 3 days">For 3 days</option>
                        <option value="For 5 days">For 5 days</option>
                        <option value="For 7 days">for 7 days</option>
                        <option value="For 105days">for 15 days</option>
                        <option value="For 1 Month">for 1 Month</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={"sm"} mb={1}>
                        Time
                      </FormLabel>
                      <Select
                        size={"md"}
                        name="time"
                        value={med.time}
                        onChange={(e) =>
                          handleMedicineChange(index, "time", e.target.value)
                        }
                      >
                        <option value="After Meal">After Meal</option>
                        <option value="Before Meal">Before Meal</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={"sm"} mb={1}>
                        Dose Interval
                      </FormLabel>
                      <Select
                        size={"md"}
                        name="dose_interval"
                        value={med.dose_interval}
                        onChange={(e) =>
                          handleMedicineChange(
                            index,
                            "dose_interval",
                            e.target.value
                          )
                        }
                      >
                        <option value="Once a Day">Once a Day</option>
                        <option value="Every Morning & Evening">
                          Every Morning & Evening
                        </option>
                        <option value="3 Times a day">3 Times a day</option>
                        <option value="4 Times a day">4 Times a day</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={"sm"} mb={1}>
                        Notes
                      </FormLabel>
                      <Input
                        size={"md"}
                        name="notes"
                        value={med.notes}
                        onChange={(e) =>
                          handleMedicineChange(index, "notes", e.target.value)
                        }
                        placeholder="Additional notes..."
                      />
                    </FormControl>
                  </Grid>
                  
                  {medicines.length > 1 && (
                    <Flex justify="flex-end" mt={3}>
                      <IconButton
                        size={"sm"}
                        colorScheme={"red"}
                        icon={<BsFillTrashFill />}
                        onClick={() => {
                          handleDelete(index);
                        }}
                      />
                    </Flex>
                  )}
                </Box>
              ))}
              
              <Button
                onClick={handleAdd}
                size={"md"}
                colorScheme={"blue"}
                rightIcon={<BsFillClipboardPlusFill />}
                w="full"
              >
                Add New Medicine
              </Button>
            </CardBody>
          </Card>

          {/* Physical Information */}
          <Card bg={useColorModeValue("white", "gray.700")} shadow="md">
            <CardBody p={6}>
              <Heading as={"h3"} size={"md"} color="blue.600" mb={4}>
                Physical Information
              </Heading>
              <Divider mb={6} />
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Food Allergies</FormLabel>
                  <Input size={"md"} {...register("food_allergies")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Tendency to Bleed</FormLabel>
                  <Input size={"md"} {...register("tendency_bleed")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Heart Disease</FormLabel>
                  <Input size={"md"} {...register("heart_disease")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Blood Pressure</FormLabel>
                  <Input size={"md"} {...register("blood_pressure")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Diabetic</FormLabel>
                  <Input size={"md"} {...register("diabetic")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Surgery</FormLabel>
                  <Input size={"md"} {...register("surgery")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Accident</FormLabel>
                  <Input size={"md"} {...register("accident")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Others</FormLabel>
                  <Input size={"md"} {...register("others")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Medical History</FormLabel>
                  <Input size={"md"} {...register("medical_history")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Current Medication</FormLabel>
                  <Input size={"md"} {...register("current_medication")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Female Pregnancy</FormLabel>
                  <Input size={"md"} {...register("female_pregnancy")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Breast Feeding</FormLabel>
                  <Input size={"md"} {...register("breast_feeding")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Pulse Rate</FormLabel>
                  <Input size={"md"} {...register("pulse_rate")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"}>Temperature</FormLabel>
                  <Input size={"md"} {...register("temperature")} />
                </FormControl>
              </Grid>
            </CardBody>
          </Card>

          {/* Problem & Advice */}
          <Card bg={useColorModeValue("white", "gray.700")} shadow="md">
            <CardBody p={6}>
              <Heading as={"h3"} size={"md"} color="blue.600" mb={4}>
                Problem & Advice
              </Heading>
              <Divider mb={6} />
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize={"md"} mb={2}>
                    Problem
                  </FormLabel>
                  <Textarea height={100} {...register("problem_desc")} placeholder="Describe the problem..." />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize={"md"} mb={2}>
                    Tests
                  </FormLabel>
                  <Textarea height={100} {...register("test")} placeholder="Recommended tests..." />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize={"md"} mb={2}>
                    Advice
                  </FormLabel>
                  <Textarea height={100} {...register("advice")} placeholder="Medical advice..." />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize={"md"} mb={2}>
                    Next Visit
                  </FormLabel>
                  <Flex gap={3} alignItems={"center"}>
                    <Text>After</Text>
                    <Input
                      w={20}
                      type="number"
                      {...register("next_visit")}
                      min={1}
                      defaultValue={1}
                    />
                    <Text>Days</Text>
                  </Flex>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Flex justify={"end"} mt={6}>
            <Button
              size={"lg"}
              colorScheme={"green"}
              onClick={() => {
                mutation.mutate();
              }}
              px={8}
            >
              Save Prescription
            </Button>
          </Flex>
        </VStack>

        {/* Right Column - Preview */}
        <Box position="sticky" top={4}>
          <PrescriptionPreview 
            medicines={medicines} 
            formData={formData}
            appointmentData={{ patient_f_name: "Patient", patient_l_name: "Name", doct_f_name: "Dr.", doct_l_name: "Doctor" }}
          />
        </Box>
      </Grid>

      <AddMedicine isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default AddPrescription;
