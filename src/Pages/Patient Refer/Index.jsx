/* eslint-disable react/prop-types */
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  theme,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useDebounce from "../../Hooks/UseDebounce";
import DynamicTable from "../../Components/DataTable";
import Pagination from "../../Components/Pagination";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ErrorPage from "../../Components/ErrorPage";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { RefreshCwIcon } from "lucide-react";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import ShowToast from "../../Controllers/ShowToast";
import AddRefer from "./AddRefer";
import DeleteRefer from "./Delete";

const ReferPatient = () => {
  const toast = useToast();
  const id = "ErrorToast";
  const queryClient = useQueryClient();
  const boxRef = useRef(null);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [SelectedData, setSelectedData] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for "Referred to You", 1 for "Referred by You"

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const { hasPermission } = useHasPermission();

  const getPageIndices = (currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;
    return { startIndex, endIndex };
  };
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const fetchData = async () => {
    const url = `get_referral_clinic?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&to_clinic_id=${
      activeTab === 1 ? selectedClinic?.id || "" : ""
    }&from_clinic_id=${activeTab === 0 ? selectedClinic?.id || "" : ""}`;
    const res = await GET(admin.token, url);

    return {
      data: res.data.map((item) => {
        const {
          id,
          patient_id,
          from_clinic_id,
          to_clinic_id,
          status,
          requested_by,
          approved_by,
          updated_at,
          patient_f_name,
          patient_l_name,
          from_clinic_title,
          to_clinic_title,
          requested_by_f_name,
          requested_by_l_name,
          approved_by_f_name,
          approved_by_l_name,
        } = item;

        return {
          id: `${id}`,
          status: (
            <HandleStatus
              id={id}
              status={status}
              isDisabled={activeTab === 0}
            />
          ),
          patient: `${patient_f_name} ${patient_l_name} #${patient_id}`,
          from_Clinic: `${from_clinic_title}`,
          from_clinic_id,
          to_Clinic: `${to_clinic_title} #${to_clinic_id}`,
          "requested By": `#${requested_by} ${requested_by_f_name} ${requested_by_l_name}`,
          "approved By": approved_by
            ? `#${approved_by} ${
                approved_by_f_name
                  ? `${approved_by_f_name} ${approved_by_l_name}`
                  : ""
              }`
            : null,
          updated_at: updated_at,
        };
      }),
      totalRecord: res.total_record,
    };
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [
      "referals",
      page,
      debouncedSearchQuery,
      selectedClinic,
      activeTab,
    ],
    queryFn: fetchData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil((data?.totalRecord || 0) / 50);

  useEffect(() => {
    if (!boxRef.current) return;
    const yOffset = -64; // height of your sticky header
    const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [page, activeTab]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Error",
        description: "Failed to fetch testimonials.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("REFER_VIEW")) return <NotAuth />;
  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Patient Referrals
      </Text>
      <Tabs index={activeTab} onChange={setActiveTab} mb={4} colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Referred by You</Tab>
          <Tab>Referred to You</Tab>
        </TabList>
        <TabPanels>
          {[0, 1].map((tabIdx) => (
            <TabPanel key={tabIdx} p={0} mt={5}>
              {isLoading ? (
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
                        <Input placeholder="Search Referrals" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size={{ base: "sm", md: "md" }} borderRadius={8} _focus={{ borderColor: "blue.500", boxShadow: "outline" }} />
                      </Flex>
                      <Flex gap={2} direction={{ base: "column", sm: "row" }} w={{ base: "100%", lg: "auto" }} justify={{ base: "flex-start", lg: "flex-end" }}>
                        <Button size={{ base: "sm", md: "md" }} colorScheme="blue" onClick={onOpen} isDisabled={!hasPermission("REFER_ADD")} borderRadius={8} _hover={{ bg: "blue.600" }} minW={{ base: "100%", md: "150px" }}>Refer Your Patient</Button>
                        <Button isLoading={isFetching} onClick={() => queryClient.invalidateQueries(["referals"])} rightIcon={<RefreshCwIcon size={16} />} size={{ base: "sm", md: "md" }} colorScheme="blue" borderRadius={8} _hover={{ bg: "blue.600" }} minW={{ base: "100%", md: "120px" }}>Refresh</Button>
                      </Flex>
                    </Flex>
                  </Box>
                  <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
                    <DynamicTable minPad={3} data={data?.data} onActionClick={<SocialMediaActionButton onClick={setSelectedData} DeleteonOpen={DeleteonOpen} isDisabled={activeTab === 1} />} />
                  </Box>
                  <Flex justifyContent="center" mt={{ base: 5, md: 8 }}>
                    <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPages} size={{ base: "sm", md: "md" }} />
                  </Flex>
                </Box>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      {isOpen ? <AddRefer isOpen={isOpen} onClose={onClose} /> : null}
      {DeleteisOpen ? <DeleteRefer isOpen={DeleteisOpen} onClose={DeleteonClose} data={SelectedData} /> : null}
    </Box>
  );
};

export default ReferPatient;

const SocialMediaActionButton = ({
  onClick,
  rowData,
  DeleteonOpen,
  isDisabled,
}) => {
  console.log("rowData", rowData, "isDisabled", isDisabled);
  const { hasPermission } = useHasPermission();
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
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={18} color={theme.colors.red[500]} />}
        isDisabled={!hasPermission("REFER_DELETE") || isDisabled}
      />
    </Flex>
  );
};

const HandleStatus = ({ id, status, isDisabled }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const getBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "yellow";
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "gray";
    }
  };
  const handleUpdate = async (data) => {
    try {
      const res = await UPDATE(admin.token, "update_referral_clinic", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries("referals");
        queryClient.invalidateQueries(["referals", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
  });
  const handleStatusChange = (newStatus) => {
    mutation.mutate({
      referral_id: id,
      status: newStatus,
      approved_by: admin.id,
    });
  };

  return (
    <Menu>
      <MenuButton
        isDisabled={status !== "Pending" || isDisabled}
        as={Button}
        p={0}
        style={{ all: "unset", cursor: "pointer" }}
        cursor={"pointer"}
        _disabled={{
          cursor: "not-allowed",
        }}
      >
        {mutation.isPending ? (
          <Spinner />
        ) : (
          <Button colorScheme={getBadgeColor(status)} p={1} px={3} size={"sm"}>
            {status}
          </Button>
        )}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleStatusChange("Pending")}>
          <Badge
            colorScheme={getBadgeColor("Pending")}
            p={1}
            px={3}
            w={"100%"}
            variant={"subtle"}
          >
            Pending
          </Badge>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Approved")}>
          <Badge
            colorScheme={getBadgeColor("Approved")}
            p={1}
            px={3}
            w={"100%"}
            variant={"subtle"}
          >
            Approved
          </Badge>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Rejected")}>
          <Badge
            colorScheme={getBadgeColor("Rejected")}
            p={1}
            px={3}
            w={"100%"}
            variant={"subtle"}
          >
            Rejected
          </Badge>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
