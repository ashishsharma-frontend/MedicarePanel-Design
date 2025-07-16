/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  IconButton,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  useColorModeValue,
  useToast,
  useDisclosure, 
  FormControl,
  theme,
  Text,
  VStack,
  Badge
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit } from "react-icons/fi";
import { GET, UPDATE } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import ShowToast from "../../../Controllers/ShowToast";
import UpdatePaymentGetways from "./Update";
import MaskedCell from "../../../Components/MaskedCell";

const getData = async () => {
  const res = await GET(admin.token, "get_payment_gateway");
  return res.data;
};

function PaymentGetways({ currentTab, activeTab }) {
  const toast = useToast();
  const id = "Errortoast";
  const [selectedData, setselectedData] = useState();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();

  const { isLoading, data, error } = useQuery({
    queryKey: ["payment-getways"],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          Payment Gateways
        </Text>
        <Text fontSize="sm" color="gray.600">
          Configure and manage payment gateway settings
        </Text>
      </Box>

      {isLoading || !data ? (
        <VStack spacing={4} align="stretch">
          <Card>
            <CardBody>
              <Skeleton h={400} w="100%" />
            </CardBody>
          </Card>
        </VStack>
      ) : (
        <Card>
          <CardBody p={0}>
            <TableContainer
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              borderRadius="lg"
              overflow="hidden"
            >
              <Table
                variant="simple"
                colorScheme="gray"
                fontSize="sm"
                size="sm"
              >
                <Thead bg={useColorModeValue("blue.50", "blue.700")}>
                  <Tr>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Action
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      ID
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Title
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Key
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Secret
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Webhook Secret
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Status
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Created At
                    </Th>
                    <Th
                      color={useColorModeValue("gray.800", "white")}
                      py={4}
                      textAlign="center"
                      fontWeight="semibold"
                    >
                      Updated At
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((item) => (
                    <Tr key={item.id} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                      <Td>
                        <Flex justify="center">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            _hover={{
                              bg: "blue.50",
                            }}
                            onClick={() => {
                              setselectedData(item);
                              EditonOpen();
                            }}
                            icon={<FiEdit fontSize={16} />}
                            aria-label="Edit payment gateway"
                          />
                        </Flex>
                      </Td>
                      <Td textAlign="center">
                        <Badge colorScheme="purple" variant="solid" fontSize="xs">
                          #{item.id}
                        </Badge>
                      </Td>
                      <Td textAlign="center" fontWeight="medium">
                        {item.title}
                      </Td>
                      <Td textAlign="center">
                        <MaskedCell value={item.key} />
                      </Td>
                      <Td textAlign="center">
                        <MaskedCell value={item.secret} />
                      </Td>
                      <Td textAlign="center">
                        <MaskedCell value={item.webhook_secret_key} />
                      </Td>
                      <Td textAlign="center">
                        <IsActive id={item.id} isActive={item.is_active} />
                      </Td>
                      <Td textAlign="center" fontSize="xs" color="gray.600">
                        {item.created_at}
                      </Td>
                      <Td textAlign="center" fontSize="xs" color="gray.600">
                        {item.updated_at}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {EditisOpen && (
        <UpdatePaymentGetways
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      )}
    </VStack>
  );
}

const IsActive = ({ id, isActive }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const handleActive = async (id, active) => {
    let data = { id, is_active: active };
    try {
      const res = await UPDATE(admin.token, "update_payment_gateway", data);
      if (res.response === 200) {
        return res;
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
    onSuccess: () => {
      ShowToast(toast, "success", "Payment gateway updated!");
      queryClient.invalidateQueries("payment-getways");
    },
  });

  return (
    <FormControl display="flex" alignItems="center" justifyContent="center">
      <Switch
        isChecked={isActive === 1}
        size="sm"
        colorScheme="green"
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};

export default PaymentGetways;
