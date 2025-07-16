/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  FormControl,
  IconButton,
  Input,
  Skeleton,
  Switch,
  theme,
  useDisclosure,
  useToast,
  Card,
  CardBody,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import AddDepartmentModel from "./Add";
import DeleteDepartment from "./Delete";
import UpdateDepartmentModel from "./Update";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import ShowToast from "../../Controllers/ShowToast";

export default function Department() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { hasPermission } = useHasPermission();

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
  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    const res = await GET(admin.token, "get_department");
    const rearrangedArray = res.data.map((item) => {
      return {
        ...item,
        active: <IsActive id={item.id} isActive={item.active} />,
      };
    });
    return rearrangedArray;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["department"],
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

  if (!hasPermission("DEPARTMENT_VIEW")) return <NotAuth />;

  return (
    <Box bg="gray.50" minH="100vh" p={{ base: 2.5, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
            Departments
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage and track all departments
          </Text>
        </Box>
        {/* Search/Add Bar */}
        <Card bg="white" borderRadius="xl" boxShadow="sm">
          <CardBody p={{ base: 2.5, md: 6 }}>
            <Flex direction={{ base: "column", md: "row" }} gap={4} align={{ base: "stretch", md: "center" }} justify="space-between">
              <Input
                size="md"
                placeholder="Search departments..."
                w={{ base: "100%", md: 400 }}
                maxW={{ base: "100%", md: "50vw" }}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {hasPermission("DEPARTMENT_ADD") && (
                <Button size="md" colorScheme="blue" onClick={onOpen} fontWeight="600" minW={{ base: "100%", md: "auto" }} px={6} borderRadius="md" _hover={{ bg: "blue.600" }}>
                  Add New
                </Button>
              )}
            </Flex>
          </CardBody>
        </Card>
        {/* Table Section */}
        {isLoading || !data ? (
          <Box>
            <Flex mb={5} justify="space-between">
              <Skeleton w={400} h={8} />
              <Skeleton w={50} h={8} />
            </Flex>
            <Skeleton h={300} w="100%" />
          </Box>
        ) : (
          <DynamicTable
            minPad={"8px 8px"}
            data={filteredData}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                DeleteonOpen={DeleteonOpen}
                EditonOpen={EditonOpen}
              />
            }
          />
        )}
        {/* Modals */}
        <AddDepartmentModel isOpen={isOpen} onClose={onClose} />
        <DeleteDepartment isOpen={DeleteisOpen} onClose={DeleteonClose} data={SelectedData} />
        {EditisOpen && (
          <UpdateDepartmentModel isOpen={EditisOpen} onClose={EditonClose} data={SelectedData} />
        )}
      </VStack>
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("DEPARTMENT_UPDATE") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          _hover={{
            background: "none",
          }}
          onClick={() => {
            onClick(rowData);
            EditonOpen();
          }}
          icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        />
      )}
      {hasPermission("DEPARTMENT_DELETE") && (
        <IconButton
          size={"sm"}
          variant={"ghost"}
          _hover={{
            background: "none",
          }}
          onClick={() => {
            onClick(rowData);
            DeleteonOpen();
          }}
          icon={<FaTrash fontSize={18} color={theme.colors.red[500]} />}
        />
      )}
    </Flex>
  );
};

export const IsActive = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "udpate_department", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries(["department"]);
        queryClient.invalidateQueries(["department", id]);
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
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DEPARTMENT_UPDATE")}
        defaultChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;

          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};
