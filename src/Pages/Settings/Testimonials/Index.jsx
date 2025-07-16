/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDebounce from "../../../Hooks/UseDebounce";
import DynamicTable from "../../../Components/DataTable";
import Pagination from "../../../Components/Pagination";
import { GET } from "../../../Controllers/ApiControllers";
import ErrorPage from "../../../Components/ErrorPage";
import admin from "../../../Controllers/admin";
import useHasPermission from "../../../Hooks/HasPermission";
import NotAuth from "../../../Components/NotAuth";
import DeleteSocial from "./delete.JSX";
import AddTestimonial from "./Add";
import UpdateTastimonials from "./Update";
import { RefreshCwIcon } from "lucide-react";
import { useSelectedClinic } from "../../../Context/SelectedClinic";

const Testimonials = () => {
  const toast = useToast();
  const id = "ErrorToast";
  const queryClient = useQueryClient();
  const boxRef = useRef(null);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [SelectedData, setSelectedData] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const { hasPermission } = useHasPermission();

  const getPageIndices = (currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;
    return { startIndex, endIndex };
  };
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const fetchTestimonials = async () => {
    const url = `get_testimonial?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
      selectedClinic?.id || ""
    }`;
    const res = await GET(admin.token, url);

    return {
      data: res.data.map((item) => {
        const { id, title, sub_title, description, rating, image } = item;
        return {
          id,
          name: title,
          sub_title,
          rating,
          image,
          description,
        };
      }),
      totalRecord: res.total_record,
    };
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["testimonials", page, debouncedSearchQuery, selectedClinic],
    queryFn: fetchTestimonials,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil((data?.totalRecord || 0) / 50);

  useEffect(() => {
    if (!boxRef.current) return;
    const yOffset = -64; // height of sticky header
    const y = boxRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [page]);

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

  if (!hasPermission("TESTIMONIAL_VIEW")) return <NotAuth />;
  return (
    <Box ref={boxRef} scrollMarginTop="64px" px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Testimonials
      </Text>
      {isLoading ? (
        <Box>
          <Skeleton height={8} width={400} mb={4} />
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} height={8} width="100%" mb={2} />
          ))}
        </Box>
      ) : (
        <>
          <Box bg="#fff" borderRadius={16} boxShadow="0 2px 8px 0 rgba(33,86,244,0.06)" p={{ base: 3, md: 5 }} mb={5}>
            <Flex direction={{ base: "column", md: "row" }} gap={{ base: 3, md: 4 }} align={{ base: "stretch", md: "center" }} justify="space-between">
              <Input
                placeholder="Search testimonials"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                w={{ base: "100%", md: 350 }}
                maxW={{ base: "100%", md: "45vw" }}
                mb={{ base: 2, md: 0 }}
                borderColor="gray.300"
                borderRadius={8}
                _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                _hover={{ borderColor: "gray.400" }}
              />
              <Flex gap={2} w={{ base: "100%", md: "auto" }}>
                <Button
                  size="md"
                  colorScheme="blue"
                  onClick={onOpen}
                  isDisabled={!hasPermission("TESTIMONIAL_ADD")}
                  fontWeight="600"
                  w={{ base: "100%", md: "auto" }}
                  px={6}
                  borderRadius={8}
                  _hover={{ bg: "blue.600" }}
                >
                  Add New
                </Button>
                <Button
                  isLoading={isFetching}
                  onClick={() => queryClient.invalidateQueries(["testimonials"])}
                  rightIcon={<RefreshCwIcon size={16} />}
                  size="md"
                  colorScheme="blue"
                  fontWeight="600"
                  w={{ base: "100%", md: "auto" }}
                  px={6}
                  borderRadius={8}
                  _hover={{ bg: "blue.600" }}
                >
                  Refresh
                </Button>
              </Flex>
            </Flex>
          </Box>
          <Box bg="#F9FAFB" borderRadius={16} p={{ base: 2, md: 4 }} boxShadow="sm" mb={5}>
            <DynamicTable
              minPad={3}
              data={data?.data}
              onActionClick={
                <SocialMediaActionButton
                  onClick={setSelectedData}
                  DeleteonOpen={DeleteonOpen}
                  EditonOpen={EditonOpen}
                />
              }
            />
            {/* Center and contain the 'No data found' message */}
            {data?.data?.length === 0 && (
              <Box bg="red.100" color="black" textAlign="center" py={3} px={2} borderRadius={8} mt={3} mx="auto" maxW="400px">
                No data found
              </Box>
            )}
          </Box>
        </>
      )}
      <Flex justify={"center"} mt={{ base: 5, md: 8 }}>
        <Pagination currentPage={page} onPageChange={handlePageChange} totalPages={totalPages} size={{ base: "sm", md: "md" }} />
      </Flex>
      <AddTestimonial isOpen={isOpen} onClose={onClose} />
      <DeleteSocial isOpen={DeleteisOpen} onClose={DeleteonClose} data={SelectedData} />
      {EditisOpen && <UpdateTastimonials isOpen={EditisOpen} onClose={EditonClose} data={SelectedData} />}
    </Box>
  );
};

export default Testimonials;
const SocialMediaActionButton = ({
  onClick,
  rowData,
  DeleteonOpen,
  EditonOpen,
}) => {
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
          EditonOpen();
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        isDisabled={!hasPermission("TESTIMONIAL_UPDATE")}
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
        isDisabled={!hasPermission("TESTIMONIAL_DELETE")}
      />
    </Flex>
  );
};
