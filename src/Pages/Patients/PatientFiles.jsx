/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Link,
  ListItem,
  OrderedList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import Loading from "../../Components/Loading";
import imageBaseURL from "../../Controllers/image";
import { FaEdit, FaTrash } from "react-icons/fa";
import moment from "moment";
import AddPatientFiles from "./AddPatientFiles";
import UpdatePatientFiles from "./UpdatePatientFiles";
import DeletePatientFiles from "./DeletePatientFile";

export default function PatientFiles({ id }) {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const getPatientFiles = async () => {
    const res = await GET(admin.token, `get_patient_file?patient_id=${id}`);
    return res.data;
  };
  const { data: patientFiles, isLoading: patientFilesLoading } = useQuery({
    queryKey: ["patient-files", id],
    queryFn: getPatientFiles,
  });
  if (patientFilesLoading) return <Loading />;

  return (
    <Box bg="white" borderRadius={{ base: 8, md: 12 }} border="1px solid" borderColor="gray.200" p={{ base: 2, md: 4 }} boxShadow={{ base: "none", md: "sm" }}>
      <Flex
        alignItems={{ base: "stretch", sm: "center" }}
        justify={{ base: "flex-start", sm: "space-between" }}
        direction={{ base: "column", sm: "row" }}
        gap={2}
        mb={2}
      >
        <Heading as={"h3"} size={{ base: "md", sm: "sm" }} fontWeight="bold">
          Files & Docs
        </Heading>
        <Button
          size={{ base: "md", sm: "xs" }}
          colorScheme={"blue"}
          onClick={onOpen}
          w={{ base: "100%", sm: "auto" }}
        >
          Add New
        </Button>
      </Flex>
      <Divider mt={2} mb={4} />
      <Box>
        <OrderedList spacing={2}>
          {patientFiles?.map((file, index) => (
            <ListItem key={index}>
              <Flex
                alignItems={{ base: "flex-start", sm: "center" }}
                gap={2}
                direction={{ base: "column", sm: "row" }}
                wrap="wrap"
              >
                <Link
                  fontWeight={600}
                  fontSize={{ base: "md", sm: "sm" }}
                  href={`${imageBaseURL}/${file.file}`}
                  isExternal
                  wordBreak="break-all"
                >
                  {file.file_name}
                </Link>
                <Flex gap={1} mt={{ base: 2, sm: 0 }}>
                  <IconButton
                    size={{ base: "sm", sm: "xs" }}
                    icon={<FaEdit />}
                    colorScheme={"blue"}
                    aria-label="Edit"
                    onClick={() => {
                      setselectedData(file);
                      EditonOpen();
                    }}
                    w={{ base: "100%", sm: "auto" }}
                  />
                  <IconButton
                    size={{ base: "sm", sm: "xs" }}
                    icon={<FaTrash />}
                    colorScheme={"red"}
                    aria-label="Delete"
                    onClick={() => {
                      setselectedData(file);
                      DeleteonOpen();
                    }}
                    w={{ base: "100%", sm: "auto" }}
                  />
                </Flex>
              </Flex>
              <Text fontSize={{ base: "xs", sm: "xs" }} fontWeight={600} mt={1}>
                Updated on - {moment(file.updated_at).format("DD-MM-YY HH:mm A")}
              </Text>
            </ListItem>
          ))}
        </OrderedList>
      </Box>
      <AddPatientFiles isOpen={isOpen} onClose={onClose} id={id} />
      {EditisOpen ? (
        <UpdatePatientFiles
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      ) : null}
      {DeleteisOpen ? (
        <DeletePatientFiles
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      ) : null}
    </Box>
  );
}
