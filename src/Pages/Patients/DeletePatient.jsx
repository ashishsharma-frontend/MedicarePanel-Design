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
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DELETE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";

export default function DeletePatient({ isOpen, onClose, data }) {
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
      const res = await DELETE(admin.token, "delete_patient", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Patient Deleted!");
        queryClient.invalidateQueries("patients");
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
        maxW={{ base: "98vw", md: "400px" }}
        w="100%"
        mx={{ base: 1, md: 4 }}
        borderRadius={{ base: "lg", md: "xl" }}
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        boxShadow={{ base: "none", md: "lg" }}
        p={{ base: 2, md: 6 }}
      >
        <AlertDialogHeader fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" borderBottom="1px solid" borderColor="gray.200" pb={2}>
          Delete Patient ( <b>#{data?.id} - {data?.name}</b> )
        </AlertDialogHeader>
        <AlertDialogBody py={4}>
          Are you sure? You can not undo this action afterwards.
        </AlertDialogBody>
        <AlertDialogFooter flexDirection={{ base: "column", md: "row" }} gap={2}>
          <Button
            ref={cancelRef}
            onClick={onClose}
            colorScheme="gray"
            size={"sm"}
            w={{ base: "100%", md: "auto" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={HandleDelete}
            ml={0}
            size={"sm"}
            isLoading={isLoading}
            w={{ base: "100%", md: "auto" }}
          >
            Delete Patient
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
