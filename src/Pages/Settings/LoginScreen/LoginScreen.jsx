/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  IconButton,
  Input,
  Skeleton,
  Stack,
  Text,
  theme,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { GET } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import { useQuery } from "@tanstack/react-query";
import useSearchFilter from "../../../Hooks/UseSearchFilter";
import useHasPermission from "../../../Hooks/HasPermission";
import NotAuth from "../../../Components/NotAuth";
import ErrorPage from "../../../Components/ErrorPage";
import DynamicTable from "../../../Components/DataTable";
import { FaTrash } from "react-icons/fa";
import AddLoginScreen from "./Add";
import DeleteLoginImage from "./Delete";

export default function Files() {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const handleActionClick = (rowData) => {
    setselectedData(rowData);
  };

  const getPatientFiles = async () => {
    const res = await GET(admin.token, `get_login_screen_images`);
    return res.data;
  };
  const {
    data,
    isLoading: patientFilesLoading,
    error,
  } = useQuery({
    queryKey: ["login-screen"],
    queryFn: getPatientFiles,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  if (error) return <ErrorPage errorCode={error.name} />;
  if (!hasPermission("LOGINSCREEN_VIEW")) return <NotAuth />;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          Login Screen Management
        </Text>
        <Text fontSize="sm" color="gray.600">
          Manage login screen images and configurations
        </Text>
      </Box>

      {patientFilesLoading || !data ? (
        <VStack spacing={4} align="stretch">
          <Card>
            <CardBody>
              <Flex direction={{ base: "column", md: "row" }} gap={4} justify="space-between" align="center">
                <Skeleton w={{ base: "100%", md: 400 }} h={10} />
                <Skeleton w={{ base: "100%", md: 200 }} h={10} />
              </Flex>
            </CardBody>
          </Card>
          {/* Loading skeletons */}
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} h={12} w="100%" />
          ))}
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch">
          {/* Search and Add Section */}
          <Card>
            <CardBody>
              <Flex 
                direction={{ base: "column", md: "row" }} 
                gap={4} 
                justify="space-between" 
                align={{ base: "stretch", md: "center" }}
              >
                <Input
                  size="md"
                  placeholder="Search login screen images..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  maxW={{ base: "100%", md: "400px" }}
                />
                <Button
                  isDisabled={!hasPermission("LOGINSCREEN_ADD")}
                  size="md"
                  colorScheme="blue"
                  onClick={onOpen}
                  w={{ base: "100%", md: "auto" }}
                >
                  Add New Image
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Table Section */}
          <Card>
            <CardBody p={0}>
              <DynamicTable
                minPad="16px"
                data={filteredData}
                onActionClick={
                  <YourActionButton
                    onClick={handleActionClick}
                    DeleteonOpen={DeleteonOpen}
                  />
                }
              />
            </CardBody>
          </Card>
        </VStack>
      )}

      {isOpen && <AddLoginScreen isOpen={isOpen} onClose={onClose} />}
      {DeleteisOpen && (
        <DeleteLoginImage
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      )}
    </VStack>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center">
      <IconButton
        isDisabled={!hasPermission("LOGINSCREEN_DELETE")}
        size="sm"
        variant="ghost"
        colorScheme="red"
        _hover={{
          bg: "red.50",
        }}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={16} />}
        aria-label="Delete login screen image"
      />
    </Flex>
  );
};
