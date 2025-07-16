/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  Heading,
  IconButton,
  Input,
  Skeleton,
  Switch,
  theme,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import UpdateDepartmentModel from "./Update";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import ShowToast from "../../Controllers/ShowToast";
import DeleteCoupons from "./Delete";
import AddCoupon from "./Add";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AllCoupons() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const id = "Errortoast";
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

  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_coupon?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        active,
        clinic_id,
        title,
        value,
        description,
        updated_at,
        start_date,
        end_date,
      } = doctor;
      return {
        active: <IsActive id={id} isActive={active} />,
        id,
        clinic_id,
        title,
        value,
        description,
        start_date,
        end_date,
        updated_at,
      };
    });
    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["coupons", page, debouncedSearchQuery, selectedClinic?.id],
    queryFn: getData,
  });
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);
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

  useEffect(() => {
    if (!boxRef.current) return;
    const yOffset = -64; // height of sticky header
    const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [page]);

  if (!hasPermission("COUPON_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        All Coupons
      </Text>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <>
          <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
            <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 4, lg: 6 }} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <Flex direction={{ base: "column", md: "row" }} gap={3} flex={1} align={{ base: "stretch", md: "center" }}>
                <Input size="md" placeholder="Search" w={{ base: "100%", md: 350 }} maxW={{ base: "100%", md: "45vw" }} onChange={(e) => setsearchQuery(e.target.value)} value={searchQuery} borderColor="gray.300" borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} _hover={{ borderColor: "gray.400" }} />
              </Flex>
              {hasPermission("COUPON_ADD") && (
                <Button size="md" colorScheme="blue" onClick={onOpen} fontWeight="600" minW={{ base: "100%", lg: "auto" }} px={6} borderRadius={8} _hover={{ bg: "blue.600" }}>
                  Add New
                </Button>
              )}
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable minPad={"8px 8px"} data={data?.data} onActionClick={<YourActionButton onClick={handleActionClick} DeleteonOpen={DeleteonOpen} EditonOpen={EditonOpen} />} />
          </Box>
        </>
      )}
      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPage} size={{ base: "sm", md: "md" }} />
      </Flex>
      <AddCoupon isOpen={isOpen} onClose={onClose} />
      <DeleteCoupons isOpen={DeleteisOpen} onClose={DeleteonClose} data={SelectedData} />
      {EditisOpen && <UpdateDepartmentModel isOpen={EditisOpen} onClose={EditonClose} data={SelectedData} />}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("COUPON_UPDATE") && (
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
      {hasPermission("COUPON_DELETE") && (
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
const IsActive = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_coupon", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries("coupons");
        queryClient.invalidateQueries(["coupons", "dashboard"]);
        queryClient.invalidateQueries(["coupons", id]);
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
        isDisabled={!hasPermission("COUPON_UPDATE")}
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
