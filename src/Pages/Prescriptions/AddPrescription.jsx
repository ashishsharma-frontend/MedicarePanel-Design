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
import { FaPrint } from "react-icons/fa";
import api from "../../Controllers/api";
import { FaUserMd, FaUser, FaCalendarAlt, FaHeartbeat, FaNotesMedical, FaVial, FaClipboardCheck, FaSyringe } from "react-icons/fa";
import imageBaseURL from "../../Controllers/image";

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

// Add printPdf function from AllPrescription.jsx
const printPdf = (pdfUrl) => {
  const newWindow = window.open(pdfUrl, "_blank");
  if (newWindow) {
    newWindow.focus();
    newWindow.onload = () => {
      newWindow.load();
      newWindow.onafterprint = () => {
        newWindow.close();
      };
    };
  }
};

// Preview Component
const PrescriptionPreview = ({ medicines, formData, appointmentData }) => {
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("blue.400", "blue.300");
  const sectionBg = useColorModeValue("gray.50", "gray.800");
  const accent = useColorModeValue("blue.600", "blue.300");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const valueColor = useColorModeValue("gray.800", "gray.100");

  // Helper to show value or dash
  const showValue = (val) => (val !== undefined && val !== null && val !== "" ? val : "—");

  return (
    <Card bg={bg} borderLeft="6px solid" borderColor={borderColor} boxShadow="lg" w="100%" minW={0} mx={{ base: 0, sm: 0 }}>
      <CardBody p={{ base: 3, md: 6 }}>
        {/* Header with logo and clinic name */}
        <Flex align="center" mb={6} gap={4} direction={{ base: "column", sm: "row" }}>
          <Box boxSize={12} bg="blue.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
            {/* Placeholder logo */}
            <FaClipboardCheck size={32} color={accent} />
          </Box>
          <Box>
            <Heading size="lg" color={accent} fontWeight="bold" letterSpacing="wide">MediCare Clinic</Heading>
            <Text fontSize="sm" color={labelColor}>Prescription Report</Text>
          </Box>
        </Flex>

        {/* Patient & Doctor Info */}
        <Box mb={5} p={4} bg={sectionBg} borderRadius="md" boxShadow="sm">
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} alignItems="center">
            <Flex align="center" gap={2}>
              <FaUser color={accent} />
              <Text fontWeight="bold" color={labelColor}>Patient:</Text>
              <Text color={valueColor}>{appointmentData?.patient_f_name} {appointmentData?.patient_l_name}</Text>
            </Flex>
            <Flex align="center" gap={2}>
              <FaUserMd color={accent} />
              <Text fontWeight="bold" color={labelColor}>Doctor:</Text>
              <Text color={valueColor}>{appointmentData?.doct_f_name} {appointmentData?.doct_l_name}</Text>
            </Flex>
            <Flex align="center" gap={2} gridColumn={{ base: "1", sm: "span 2" }}>
              <FaCalendarAlt color={accent} />
              <Text fontWeight="bold" color={labelColor}>Date:</Text>
              <Text color={valueColor}>{new Date().toLocaleDateString()}</Text>
            </Flex>
          </Grid>
        </Box>

        {/* Physical Information */}
        <Box mb={5} p={4} bg={sectionBg} borderRadius="md" boxShadow="sm">
          <Flex align="center" mb={2} gap={2}>
            <FaHeartbeat color={accent} />
            <Text fontWeight="bold" color={accent}>Physical Information</Text>
          </Flex>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2} fontSize="sm">
            <Text color={labelColor}>Food Allergies: <span style={{ color: valueColor }}>{showValue(formData.food_allergies)}</span></Text>
            <Text color={labelColor}>Tendency to Bleed: <span style={{ color: valueColor }}>{showValue(formData.tendency_bleed)}</span></Text>
            <Text color={labelColor}>Heart Disease: <span style={{ color: valueColor }}>{showValue(formData.heart_disease)}</span></Text>
            <Text color={labelColor}>Blood Pressure: <span style={{ color: valueColor }}>{showValue(formData.blood_pressure)}</span></Text>
            <Text color={labelColor}>Diabetic: <span style={{ color: valueColor }}>{showValue(formData.diabetic)}</span></Text>
            <Text color={labelColor}>Surgery: <span style={{ color: valueColor }}>{showValue(formData.surgery)}</span></Text>
            <Text color={labelColor}>Accident: <span style={{ color: valueColor }}>{showValue(formData.accident)}</span></Text>
            <Text color={labelColor}>Others: <span style={{ color: valueColor }}>{showValue(formData.others)}</span></Text>
            <Text color={labelColor}>Medical History: <span style={{ color: valueColor }}>{showValue(formData.medical_history)}</span></Text>
            <Text color={labelColor}>Current Medication: <span style={{ color: valueColor }}>{showValue(formData.current_medication)}</span></Text>
            <Text color={labelColor}>Female Pregnancy: <span style={{ color: valueColor }}>{showValue(formData.female_pregnancy)}</span></Text>
            <Text color={labelColor}>Breast Feeding: <span style={{ color: valueColor }}>{showValue(formData.breast_feeding)}</span></Text>
            <Text color={labelColor}>Pulse Rate: <span style={{ color: valueColor }}>{showValue(formData.pulse_rate)}</span></Text>
            <Text color={labelColor}>Temperature: <span style={{ color: valueColor }}>{showValue(formData.temperature)}</span></Text>
          </Grid>
        </Box>

        {/* Medicines Section - Responsive */}
        {medicines.length > 0 && (
          <Box mb={5}>
            <Flex align="center" mb={2} gap={2}>
              <FaSyringe color={accent} />
              <Text fontWeight="bold" color={accent}>Medicines</Text>
            </Flex>
            {/* Mobile: Card List */}
            <Box display={{ base: 'block', md: 'none' }}>
              {medicines.map((med, index) => (
                <Box key={index} mb={3} p={3} borderWidth="1px" borderRadius="md" bg="white" boxShadow="xs">
                  <Text fontWeight="semibold" fontSize="sm" color={accent}>{showValue(med.medicine_name)}</Text>
                  <Text fontSize="xs">Dosage: <b>{showValue(med.dosage)}</b></Text>
                  <Text fontSize="xs">Duration: {showValue(med.duration)}</Text>
                  <Text fontSize="xs">Time: {showValue(med.time)}</Text>
                  <Text fontSize="xs">Dose Interval: {showValue(med.dose_interval)}</Text>
                  <Text fontSize="xs">Notes: {showValue(med.notes)}</Text>
                </Box>
              ))}
            </Box>
            {/* Desktop: Table */}
            <Box display={{ base: 'none', md: 'block' }} overflowX="auto" borderRadius="md" borderWidth={{ md: '1px', lg: '0' }}>
              <Table size="sm" variant="simple" minWidth="700px">
                <Thead bg={sectionBg}>
                  <Tr>
                    <Th fontSize={{ base: "xs", md: "sm" }}>Medicine</Th>
                    <Th fontSize={{ base: "xs", md: "sm" }}>Dosage</Th>
                    <Th fontSize={{ base: "xs", md: "sm" }}>Duration</Th>
                    <Th fontSize={{ base: "xs", md: "sm" }}>Time</Th>
                    <Th fontSize={{ base: "xs", md: "sm" }}>Dose Interval</Th>
                    <Th fontSize={{ base: "xs", md: "sm" }}>Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {medicines.map((med, index) => (
                    <Tr key={index} _hover={{ bg: sectionBg }}>
                      <Td><Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }} color={accent}>{showValue(med.medicine_name)}</Text></Td>
                      <Td><Badge colorScheme="blue" fontSize={{ base: "xs", md: "sm" }}>{showValue(med.dosage)}</Badge></Td>
                      <Td fontSize={{ base: "xs", md: "xs" }}>{showValue(med.duration)}</Td>
                      <Td fontSize={{ base: "xs", md: "xs" }}>{showValue(med.time)}</Td>
                      <Td fontSize={{ base: "xs", md: "xs" }}>{showValue(med.dose_interval)}</Td>
                      <Td fontSize={{ base: "xs", md: "xs" }}>{showValue(med.notes)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Problem & Advice */}
        <Box mb={4} p={4} bg={sectionBg} borderRadius="md" boxShadow="sm">
          <Flex align="center" mb={2} gap={2}>
            <FaNotesMedical color={accent} />
            <Text fontWeight="bold" color={accent}>Problem</Text>
          </Flex>
          <Text fontSize="sm" p={2} bg="white" borderRadius="md" wordBreak="break-word" color={valueColor}>
            {showValue(formData.problem_desc)}
          </Text>
        </Box>
        <Box mb={4} p={4} bg={sectionBg} borderRadius="md" boxShadow="sm">
          <Flex align="center" mb={2} gap={2}>
            <FaVial color={accent} />
            <Text fontWeight="bold" color={accent}>Tests</Text>
          </Flex>
          <Text fontSize="sm" p={2} bg="white" borderRadius="md" wordBreak="break-word" color={valueColor}>
            {showValue(formData.test)}
          </Text>
        </Box>
        <Box mb={4} p={4} bg={sectionBg} borderRadius="md" boxShadow="sm">
          <Flex align="center" mb={2} gap={2}>
            <FaClipboardCheck color={accent} />
            <Text fontWeight="bold" color={accent}>Advice</Text>
          </Flex>
          <Text fontSize="sm" p={2} bg="white" borderRadius="md" wordBreak="break-word" color={valueColor}>
            {showValue(formData.advice)}
          </Text>
        </Box>
        <Box p={4} bg={sectionBg} borderRadius="md" boxShadow="sm">
          <Flex align="center" mb={2} gap={2}>
            <FaCalendarAlt color={accent} />
            <Text fontWeight="bold" color={accent}>Next Visit</Text>
          </Flex>
          <Badge colorScheme="green" fontSize={{ base: "xs", md: "sm" }}>{formData.next_visit ? `After ${formData.next_visit} days` : "—"}</Badge>
        </Box>
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
      return await handleUpdate(formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["prescription", id]);
      queryClient.invalidateQueries(["prescriptios", appointment_id]);
      // Use the same print logic as AllPrescription
      const prescriptionId = res?.id || res?.data?.id || appointment_id;
      const pdfFile = res?.pdf_file || res?.data?.pdf_file;
      if (pdfFile) {
        printPdf(`${imageBaseURL}/${pdfFile}`);
      } else {
        printPdf(`${api}/prescription/generatePDF/${prescriptionId}`);
      }
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
        <HStack spacing={3}>
          {/* Removed Print Button */}
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
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
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
              Save & Print
            </Button>
          </Flex>
        </VStack>

        {/* Right Column - Preview */}
        <Box w="100%" minW={0} position={{ base: "static", lg: "sticky" }} top={4}>
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
