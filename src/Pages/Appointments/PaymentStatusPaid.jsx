/* eslint-disable react-hooks/rules-of-hooks */
import { HiCurrencyRupee } from "react-icons/hi";
/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { FaCreditCard, FaMoneyBillAlt } from "react-icons/fa";
import { MdOnlinePrediction } from "react-icons/md";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ShowToast from "../../Controllers/ShowToast";
import Loading from "../../Components/Loading";

const paymentModes = [
  {
    id: 1,
    name: "Cash",
    icon: <FaMoneyBillAlt />,
  },
  {
    id: 2,
    name: "Online",
    icon: <MdOnlinePrediction />,
  },
  {
    id: 3,
    name: "Other",
    icon: <MdOnlinePrediction />,
  },
  {
    id: 4,
    name: "Wallet",
    icon: <FaCreditCard />,
  },
  {
    id: 5,
    name: "UPI",
    icon: <HiCurrencyRupee />,
  },
];

const handlePaymetToPaid = async (data) => {
  const res = await UPDATE(admin.token, "update_appointment_to_paid", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function PaymentStatusPaid({ id, isOpen, onClose }) {
  const [paymentMode, setpaymentMode] = useState();
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const mutation = useMutation({
    mutationFn: async () => {
      let data = {
        appointment_id: id,
        payment_method: paymentMode.name,
      };

      if (!paymentMode) {
        ShowToast(toast, "error", "Please Select Payment Mode");
      } else {
        handlePaymetToPaid(data);
      }
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["payment", id]);
      queryClient.invalidateQueries(["transaction", id]);
      queryClient.invalidateQueries(["invoice", id]);
      onClose();
    },
  });

  if (mutation.isPending) return <Loading />;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        maxW={{ base: "95vw", md: "400px" }}
        mx={4}
        borderRadius="xl"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
      >
        <ModalHeader 
          fontSize="lg" 
          fontWeight="bold" 
          py={4}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          Mark Payment as Paid
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontWeight="semibold" fontSize="md" mb={4} color="gray.700">
                Select Payment Method
              </Text>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  w="full"
                  bg="transparent"
                  textAlign="left"
                  pl={0}
                  pt={0}
                  h={12}
                  _hover={{ bg: "transparent" }}
                  _focus={{ bg: "transparent" }}
                  borderBottom="1px solid"
                  borderBottomRadius={0}
                  borderColor={borderColor}
                  fontWeight="normal"
                >
                  {paymentMode ? (
                    <HStack gap={3} align="center">
                      {paymentMode.icon} 
                      <Text>{paymentMode.name}</Text>
                    </HStack>
                  ) : (
                    <Text color="gray.500">Select Payment Mode</Text>
                  )}
                </MenuButton>
                <MenuList w="100%">
                  {paymentModes.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => {
                        setpaymentMode(item);
                      }}
                    >
                      <HStack gap={3} align="center">
                        {item.icon} 
                        <Text>{item.name}</Text>
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          </VStack>
        </ModalBody>

        <Divider borderColor={borderColor} />
        
        <HStack spacing={3} p={6} justify="flex-end">
          <Button
            colorScheme="gray"
            variant="outline"
            onClick={onClose}
            size="md"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            size="md"
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            loadingText="Updating..."
            isDisabled={!paymentMode}
          >
            Mark as Paid
          </Button>
        </HStack>
      </ModalContent>
    </Modal>
  );
}
