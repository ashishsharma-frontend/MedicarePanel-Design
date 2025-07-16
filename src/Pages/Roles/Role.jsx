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
  useToast,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import DynamicTable from "../../Components/DataTable";
import UpdateRoleModel from "./Update";
import AddRoleModel from "./Add";
import DeleteRole from "./Delete";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AssignRole from "./AssignRole";
import useRolesData from "../../Hooks/UserRolesData";

const transformData = (data) => {
  return data?.map((item) => {
    const { id, name, created_at, is_super_admin_role } = item;

    return {
      id,
      name,
      Role_Type: (
        <Badge 
          colorScheme={is_super_admin_role === 1 ? "purple" : "green"} 
          variant="solid"
          fontSize="sm"
          px={3}
          py={1}
        >
          {is_super_admin_role === 1 ? "Special Role" : "Normal Role"}
        </Badge>
      ),
      created_at,
    };
  });
};

export default function Roles() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { Roles, rolesLoading, rolesError } = useRolesData();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const {
    isOpen: AssignisOpen,
    onOpen: AssignonOpen,
    onClose: AssignonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { handleSearchChange, filteredData } = useSearchFilter(
    transformData(Roles)
  );

  if (rolesError) {
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
  const { hasPermission } = useHasPermission();
  if (!hasPermission("ROLE_VIEW")) return <NotAuth />;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          Role Management
        </Text>
        <Text fontSize="sm" color="gray.600">
          Create and manage user roles and permissions
        </Text>
      </Box>

      {rolesLoading || !Roles ? (
        <VStack spacing={4} align="stretch">
          <Card>
            <CardBody>
              <Flex direction={{ base: "column", md: "row" }} gap={4} justify="space-between" align="center">
                <Skeleton w={{ base: "100%", md: 400 }} h={10} />
                <Skeleton w={{ base: "100%", md: 300 }} h={10} />
              </Flex>
            </CardBody>
          </Card>
          <Skeleton h={400} w="100%" />
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch">
          {/* Search and Actions Section */}
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
                  placeholder="Search roles..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  maxW={{ base: "100%", md: "400px" }}
                />
                {hasPermission("ROLE_ADD") && (
                  <Flex 
                    direction={{ base: "column", sm: "row" }} 
                    gap={3} 
                    w={{ base: "100%", md: "auto" }}
                  >
                    <Button 
                      size="md" 
                      colorScheme="teal" 
                      onClick={AssignonOpen}
                      w={{ base: "100%", sm: "auto" }}
                    >
                      Assign Role
                    </Button>
                    <Button 
                      size="md" 
                      colorScheme="blue" 
                      onClick={onOpen}
                      w={{ base: "100%", sm: "auto" }}
                    >
                      Add New Role
                    </Button>
                  </Flex>
                )}
              </Flex>
            </CardBody>
          </Card>

          {/* Table Section */}
          <Card>
            <CardBody p={0}>
              <DynamicTable
                data={filteredData}
                onActionClick={
                  <YourActionButton
                    onClick={handleActionClick}
                    DeleteonOpen={DeleteonOpen}
                    EditonOpen={EditonOpen}
                  />
                }
              />
            </CardBody>
          </Card>
        </VStack>
      )}

      <AddRoleModel isOpen={isOpen} onClose={onClose} />
      <DeleteRole
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateRoleModel
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={SelectedData}
        />
      )}
      {AssignisOpen && (
        <AssignRole
          isOpen={AssignisOpen}
          onClose={AssignonClose}
          Roles={Roles}
        />
      )}
    </VStack>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center" gap={2}>
      {hasPermission("ROLE_UPDATE") && (
        <IconButton
          isDisabled={rowData?.name === "Admin" || rowData?.name === "admin"}
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
          aria-label="Edit role"
        />
      )}
      {hasPermission("ROLE_DELETE") && (
        <IconButton
          isDisabled={rowData?.name === "Admin" || rowData?.name === "admin"}
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
          aria-label="Delete role"
        />
      )}
    </Flex>
  );
};
