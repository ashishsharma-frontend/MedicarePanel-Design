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
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import AddRoleModel from "./Add";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AssignRole from "./AssignRole";
import useRolesData from "../../Hooks/UserRolesData";
import DeleteAssignRole from "./DeleteAssignRole";

const getData = async () => {
  const res = await GET(admin.token, "get_assign_roles");
  const rearrangedArray = res?.data.map((item) => {
    const {
      id,
      user_id,
      role_id,
      role_name,
      f_name,
      l_name,
      phone,
      isd_code,
      updated_at,
      created_at,
    } = item;

    return {
      id: id,
      user_id,
      role_id,
      role_name: role_name,
      name: `${f_name} ${l_name}`,
      phone: `${phone}`,
      created_at,
      updated_at,
      serchQuery:
        id +
        user_id +
        role_id +
        role_name +
        f_name +
        l_name +
        phone +
        isd_code +
        updated_at +
        created_at,
    };
  });
  return rearrangedArray.sort((a, b) => {
    return b.id - a.id;
  });
};

export default function AssignedUsers() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { Roles } = useRolesData();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
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

  const { isLoading, data, error } = useQuery({
    queryKey: ["assigned-roles"],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

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
  const { hasPermission } = useHasPermission();
  if (!hasPermission("ROLE_VIEW")) return <NotAuth />;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          User Role Assignments
        </Text>
        <Text fontSize="sm" color="gray.600">
          Manage role assignments for users across the system
        </Text>
      </Box>

      {isLoading || !data ? (
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
                  placeholder="Search assigned roles..."
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
                  />
                }
              />
            </CardBody>
          </Card>
        </VStack>
      )}

      <AddRoleModel isOpen={isOpen} onClose={onClose} />
      {DeleteisOpen && (
        <DeleteAssignRole
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
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

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center">
      {hasPermission("ROLE_DELETE") && (
        <IconButton
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
          aria-label="Delete role assignment"
        />
      )}
    </Flex>
  );
};


