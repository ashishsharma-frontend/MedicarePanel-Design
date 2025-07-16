/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import useSearchFilter from "../../../Hooks/UseSearchFilter";
import DynamicTable from "../../../Components/DataTable";
import { GET } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import AddSocialMedia from "./Add";
import UpdateSocialMedia from "./Update";
import DeleteSocial from "./delete.JSX";

export default function SocialMedia({ currentTab, activeTab }) {
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

  const getData = async () => {
    const res = await GET(admin.token, "get_social_media");
    const newData = res.data.map((item) => {
      const { id, title, url, image, updated_at } = item;
      return {
        id,
        title,
        url: url,
        image,
        updated_at,
      };
    });
    return newData;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["social-media"],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          Social Media
        </Text>
        <Text fontSize="sm" color="gray.600">
          Manage social media links and configurations
        </Text>
      </Box>

      {isLoading || !data ? (
        <VStack spacing={4} align="stretch">
          <Card>
            <CardBody>
              <Flex direction={{ base: "column", md: "row" }} gap={4} justify="space-between" align="center">
                <Skeleton w={{ base: "100%", md: 400 }} h={10} />
                <Skeleton w={{ base: "100%", md: 200 }} h={10} />
              </Flex>
            </CardBody>
          </Card>
          <Skeleton h={400} w="100%" />
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
                  placeholder="Search social media..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  maxW={{ base: "100%", md: "400px" }}
                />
                <Button 
                  size="md" 
                  colorScheme="blue" 
                  onClick={onOpen}
                  w={{ base: "100%", md: "auto" }}
                >
                  Add New
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
                  <SocialMediaActionButton
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

      <AddSocialMedia isOpen={isOpen} onClose={onClose} />
      <DeleteSocial
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateSocialMedia
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={SelectedData}
        />
      )}
    </VStack>
  );
}

const SocialMediaActionButton = ({
  onClick,
  rowData,
  DeleteonOpen,
  EditonOpen,
}) => {
  return (
    <Flex justify="center" gap={2}>
      <IconButton
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
        aria-label="Edit social media"
      />
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
        aria-label="Delete social media"
      />
    </Flex>
  );
};
