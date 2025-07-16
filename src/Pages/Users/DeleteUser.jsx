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

export default function DeleteUser({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();
  const [isSoftDeleteOpen, setIsSoftDeleteOpen] = useState(false);

  const HandleSoftDelete = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "user_soft_delete", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Soft Deleted!");
        queryClient.invalidateQueries("users");
        setIsSoftDeleteOpen(false);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const HandleDelete = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "user_delete", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Deleted!");
        queryClient.invalidateQueries("users");
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
        setIsSoftDeleteOpen(true); // Open soft delete alert
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleAllClose = () => {
    setIsSoftDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={isSoftDeleteOpen ? handleAllClose : onClose}
        leastDestructiveRef={cancelRef}
        isCentered
      >
        <AlertDialogOverlay>
          {isSoftDeleteOpen ? (
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
                  Soft Delete User ({" "}
                  <b>
                    #{data?.id} - {data?.name}
                  </b>{" "}
                  )
                </AlertDialogHeader>

                <AlertDialogBody>
                  The user could not be permanently deleted. Would you like to
                  perform a soft delete instead?
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={handleAllClose}
                    colorScheme="gray"
                    size={"sm"}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="orange"
                    onClick={HandleSoftDelete}
                    ml={3}
                    size={"sm"}
                    isLoading={isLoading}
                  >
                    Soft Delete User
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          ) : (
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
                Delete User ({" "}
                <b>
                  #{data?.id} - {data?.name}
                </b>{" "}
                )
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can not undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={handleAllClose}
                  colorScheme="gray"
                  size={"sm"}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={HandleDelete}
                  ml={3}
                  size={"sm"}
                  isLoading={isLoading}
                >
                  Delete User
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
