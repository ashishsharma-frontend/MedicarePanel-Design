/* eslint-disable react/prop-types */
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DELETE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import { FaExclamationTriangle, FaUserMd } from "react-icons/fa";

export default function DeleteDoctor({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();

  const HandleDelete = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "delete_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Deleted!");
        queryClient.invalidateQueries("doctors");
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
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <AlertDialogContent
        borderRadius="xl"
        boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        maxW="400px"
        mx={4}
      >
        <AlertDialogHeader
          fontSize="lg"
          fontWeight="bold"
          color="#DC2626"
          display="flex"
          alignItems="center"
          gap={2}
          pb={2}
        >
          <Icon as={FaExclamationTriangle} color="#DC2626" />
          Delete Doctor
        </AlertDialogHeader>

        <AlertDialogBody py={6}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
              <Icon as={FaUserMd} color="red.500" boxSize={5} />
              <VStack spacing={1} align="start" flex={1}>
                <Text fontWeight="semibold" color="red.700">
                  {data?.name}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="red" size="sm">
                    ID: #{data?.id}
                  </Badge>
                  {data?.specialization && (
                    <Badge colorScheme="blue" size="sm">
                      {data?.specialization}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>
            
            <Text color="gray.600" fontSize="sm" lineHeight="tall">
              Are you sure you want to delete this doctor? This action cannot be undone and will permanently remove all associated data including appointments, reviews, and time slots.
            </Text>
          </VStack>
        </AlertDialogBody>

        <AlertDialogFooter gap={3} pt={2}>
          <Button
            ref={cancelRef}
            onClick={onClose}
            colorScheme="gray"
            size="md"
            borderRadius="lg"
            variant="outline"
            _hover={{ bg: "gray.50" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={HandleDelete}
            size="md"
            borderRadius="lg"
            isLoading={isLoading}
            loadingText="Deleting..."
            _hover={{ bg: "red.600" }}
            boxShadow="0 2px 8px 0 rgba(220,38,38,0.10)"
          >
            Delete Doctor
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
