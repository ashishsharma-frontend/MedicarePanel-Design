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
import admin from "../../Controllers/admin";
import showToast from "../../Controllers/ShowToast";

export default function DeleteCountry({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const deleteCountry = async () => {
    const formData = {
      id: data.id,
    };
    try {
      setIsLoading(true);
      const res = await DELETE(admin.token, "delete_country", formData);
      setIsLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Country Deleted!");
        queryClient.invalidateQueries("countries");
        onClose();
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      setIsLoading(false);
      showToast(toast, "error", error.message || "An error occurred.");
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="semibold">
            Delete Country (<b>{data?.title}</b>)
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              colorScheme="gray"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={deleteCountry}
              ml={3}
              size="sm"
              isLoading={isLoading}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
