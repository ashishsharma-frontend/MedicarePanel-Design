/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Divider,
  FormControl,
  FormLabel,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useForm } from "react-hook-form";
import ShowToast from "../../Controllers/ShowToast";

export default function Fees({ currentTab, activeTab }) {
  const [SelectedData, setSelectedData] = useState();

  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";

  const getData = async () => {
    const res = await GET(admin.token, "get_fee");
    return res.data;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["fees"],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "oops!.",
        description: "Something bad happens.",
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
          Fees Configuration
        </Text>
        <Text fontSize="sm" color="gray.600">
          Manage service fees and charges
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
            <DynamicTable
              data={data}
              onActionClick={
                <YourActionButton
                  onClick={handleActionClick}
                  EditonOpen={EditonOpen}
                />
              }
            />
          </CardBody>
        </Card>
      )}

      {EditisOpen && (
        <Update isOpen={EditisOpen} onClose={EditonClose} data={SelectedData} />
      )}
    </VStack>
  );
}

const YourActionButton = ({ onClick, rowData, EditonOpen }) => {
  return (
    <Flex justify="center">
      <IconButton
        size="sm"
        variant="ghost"
        colorScheme="blue"
        _hover={{
          bg: "blue.50",
        }}
        onClick={() => {
          onClick(rowData);
          EditonOpen();
        }}
        icon={<FiEdit fontSize={16} />}
        aria-label="Edit fee"
      />
    </Flex>
  );
};

const Update = ({ isOpen, onClose, data }) => {
  const [isLoading, setisLoading] = useState();

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateRole = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await UPDATE(
        admin.token,
        `update_fee?id=${data.id}&fee=${Inputdata.fee}&service_charge=${Inputdata.service_charge}`,
        formData
      );
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries("fees");
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(updateRole)}>
        <ModalHeader py={4}>
          <Text fontSize="lg" fontWeight="bold">
            Update Fees
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Title</FormLabel>
              <Input
                defaultValue={data?.title}
                placeholder="Title"
                {...register("title", { required: true })}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Fee</FormLabel>
              <Input
                defaultValue={data?.fee}
                placeholder="Fee"
                {...register("fee", { required: true })}
                type="number"
                size="md"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Service Charge</FormLabel>
              <Input
                defaultValue={data?.service_charge}
                placeholder="Service Charge"
                {...register("service_charge", { required: true })}
                type="number"
                size="md"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <Divider />
        <ModalFooter py={4}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size="md">
            Close
          </Button>
          <Button
            variant="solid"
            size="md"
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
