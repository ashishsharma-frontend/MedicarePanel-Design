/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";

import { useNavigate } from "react-router-dom";
import moment from "moment";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import useRolesData from "../../Hooks/UserRolesData";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import DeleteUser from "./DeleteUser";

const ITEMS_PER_PAGE = 50;

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

const transformData = (data) => {
  return data?.map((item) => {
    const {
      id,
      clinic_id,
      f_name,
      l_name,
      phone,
      email,
      image,
      wallet_amount,
      created_at,
      role_name,
    } = item;

    return {
      id: id,
      clinic_id,
      image: image,
      name: `${f_name} ${l_name}`,
      role_name,
      Phone: `${phone}`,
      Email: email,
      "Wallet Balance": wallet_amount,
      CreatedAt: moment(created_at).format("DD MMM YYYY hh:mm a"),
    };
  });
};

export default function Users() {
  const [SelectedData, setSelectedData] = useState();
  const navigate = useNavigate();
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const boxRef = useRef(null);
  const { Roles, rolesLoading } = useRolesData();
  const [selectedRole, setSelectedRole] = useState("");
  const { selectedClinic } = useSelectedClinic();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_users/page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&role_id=${selectedRole}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
    return {
      data: res.data,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "users",
      page,
      debouncedSearchQuery,
      selectedRole,
      selectedClinic,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / ITEMS_PER_PAGE);
  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
    return SelectedData; // only for avoidind error  , ye line kuch bhi nahi karta hai
  };

  useEffect(() => {
    if (boxRef.current) {
      const yOffset = -64; // height of your sticky header
      const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [page]);

  useEffect(() => {
    if (error && !toast.isActive("Errortoast")) {
      toast({
        id: "Errortoast",
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }, [error, toast]);

  if (!hasPermission("USER_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Users
      </Text>
      {isLoading || !data || rolesLoading ? (
        <Box>
          <Flex mb={{ base: 3, sm: 4, md: 6 }} direction={{ base: "column", md: "row" }} gap={{ base: 3, sm: 4, md: 6 }} align={{ base: "stretch", md: "center" }} w="100%" flexWrap="wrap">
            <Skeleton w="100%" h={{ base: 8, sm: 9, md: 10 }} />
            <Skeleton w="100%" h={{ base: 8, sm: 9, md: 10 }} />
          </Flex>
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
          <Skeleton h={{ base: 40, sm: 45, md: 50 }} w="100%" mt={1} />
        </Box>
      ) : (
        <Box>
          <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
            <Flex direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "center" }} justify={{ base: "flex-start", lg: "space-between" }} gap={{ base: 4, lg: 0 }} w="100%">
              <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "100%", lg: "auto" }}>
                <Input size={{ base: "sm", md: "md" }} placeholder="Search" w={{ base: "100%", md: 300 }} maxW={{ base: "100%", md: "50vw" }} onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
              </Flex>
              <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "100%", lg: "auto" }} justify={{ base: "flex-start", lg: "flex-end" }}>
                <Button isDisabled={!hasPermission("USER_ADD")} size={{ base: "sm", md: "md" }} colorScheme="blue" onClick={() => { navigate("/users/add"); }} borderRadius={8} _hover={{ bg: "blue.600" }} minW={{ base: "100%", md: "150px" }}>Add New</Button>
              </Flex>
            </Flex>
          </Box>
          <Box my={2}>
            <RadioGroup onChange={setSelectedRole} value={selectedRole}>
              <Flex direction="row" gap={4} wrap="wrap">
                <Radio value={""}>All</Radio>
                {Roles.map((role) => (
                  <Radio key={role.id} value={role.id.toString()}>
                    {role.name}
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable minPad={"1px 20px"} data={transformData(data.data)} onActionClick={<YourActionButton onClick={handleActionClick} navigate={navigate} DeleteonOpen={DeleteonOpen} />} />
          </Box>
        </Box>
      )}
      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} />
      </Flex>
      {DeleteisOpen && <DeleteUser isOpen={DeleteisOpen} onClose={DeleteonClose} data={SelectedData} />}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("USER_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          navigate(`/user/update/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("USER_DELETE")}
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
