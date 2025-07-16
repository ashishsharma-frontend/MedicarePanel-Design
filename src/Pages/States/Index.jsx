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
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import AddStateModel from "./Add";
import UpdateStateModel from "./Update";
import DeleteState from "./Delete";
import ShowToast from "../../Controllers/ShowToast";
import useHasPermission from "../../Hooks/HasPermission";

export default function States({ activeTab, tabId }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
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

  // Fetching data for states
  const getData = async () => {
    const res = await GET(admin.token, "get_states");
    let data = res.data;
    const FormatedData = data?.map((item) => {
      const {
        id,
        title,
        active,
        updated_at,
        country_title,
        created_at,
        country_id,
      } = item;
      return {
        id,
        title,
        country_title,
        country_id,
        active: <IsActive id={id} isActive={active} />,
        updated_at,
        created_at,
      };
    });
    return FormatedData;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["states"],
    queryFn: getData,
    enabled: activeTab === tabId,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "oops!.",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <Box>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <Box>
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Input
              size={"md"}
              placeholder="Search"
              w={400}
              maxW={"50vw"}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Box>
              <Button size={"sm"} colorScheme="blue" onClick={onOpen}>
                Add New
              </Button>
            </Box>
          </Flex>
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
        </Box>
      )}

      <AddStateModel isOpen={isOpen} onClose={onClose} />
      <DeleteState
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateStateModel
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  return (
    <Flex justify={"center"}>
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
      const res = await UPDATE(admin.token, "update_state", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "State Updated!");
        queryClient.invalidateQueries("states");
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("STATE_UPDATE")}
        isChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          handleActive(id, active);
        }}
      />
    </FormControl>
  );
};
