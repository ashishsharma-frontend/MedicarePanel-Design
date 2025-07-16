/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  CloseButton,
  Divider,
  SimpleGrid,
  Heading,
  IconButton,
  Image,
  Input,
  Text,
  useColorModeValue,
  useToast,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import admin from "../../Controllers/admin";
import { ADD, GET } from "../../Controllers/ApiControllers";
import { useRef, useState } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageBaseURL from "../../Controllers/image";
import Loading from "../../Components/Loading";
import ShowToast from "../../Controllers/ShowToast";
import { TrashIcon } from "lucide-react";

const handleUpload = async (data) => {
  const res = await ADD(admin.token, "add_clinic_image", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
const handleDelete = async (data) => {
  const res = await ADD(admin.token, "delete_clinic_image", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

function GalleryImages() {
  const { id } = useParams();
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedDelete, setselectedDelete] = useState();

    const handleDrop = (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/svg+xml",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (!file) return;
      if (!allowedTypes.includes(file.type)) {
        return ShowToast(
          toast,
          "error",
          "Only JPEG, JPG, PNG, or SVG files are allowed."
        );
      }
      if (file.size > maxSize) {
        return ShowToast(toast, "error", "File size should not exceed 5MB.");
      }
      setSelectedFile(file);
    };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    console.log(file);
    setSelectedFile(file);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let data = {
        clinic_id: id,
        image: selectedFile,
      };
      await handleUpload(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Success!");
      queryClient.invalidateQueries(["clinic-images", id]);
      setSelectedFile(null);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });
  const deleteMuation = useMutation({
    mutationFn: async (id) => {
      let data = {
        id,
      };
      await handleDelete(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Deleted!");
      queryClient.invalidateQueries(["clinic-images", id]);
      setSelectedFile(null);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error.message));
    },
  });

  const { data: clinicImages, isLoading: ImagesLoading } = useQuery({
    queryKey: ["clinic-images", id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_clinic_images?clinic_id=${id}`);
      if (res.response !== 200) {
        throw new Error(res.message);
      }
      return res.data;
    },
  });

  if (ImagesLoading || mutation.isPending) return <Loading />;
  return (
    <Box>
      <Card mt={5} bg={useColorModeValue("white", "gray.700")}
        borderRadius="2xl"
        boxShadow="md"
        p={{ base: 2, md: 6 }}
      >
        <CardBody p={0}>
          <Heading as="h3" size="md" fontWeight="bold" color="#162D5D" mb={6}>
            Gallery Images
          </Heading>
          <SimpleGrid minChildWidth="160px" spacing={4} mb={6}>
            {clinicImages?.map((image, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="sm"
                position="relative"
                bg={useColorModeValue('gray.50', 'gray.800')}
                _hover={{ boxShadow: 'md' }}
              >
                <Image
                  src={`${imageBaseURL}/${image.image}`}
                  alt={`Uploaded ${index}`}
                  objectFit="cover"
                  w="100%"
                  h="140px"
                  borderTopRadius="xl"
                />
                <IconButton
                  icon={<TrashIcon />}
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={2}
                  isLoading={
                    deleteMuation.isPending && selectedDelete === image.id
                  }
                  onClick={async () => {
                    setselectedDelete(image.id);
                    deleteMuation.mutate(image.id);
                  }}
                  aria-label="Delete image"
                />
              </Box>
            ))}
          </SimpleGrid>
          <Divider my={6} />
          <Heading as="h3" size="md" fontWeight="bold" color="#162D5D" mb={4}>
            Upload Images
          </Heading>
          <Box
            mt={2}
            p={6}
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="lg"
            bg={useColorModeValue('gray.50', 'gray.800')}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            cursor={"pointer"}
            textAlign="center"
            transition="border-color 0.2s"
            _hover={{ borderColor: "#2563EB" }}
          >
            {selectedFile ? (
              <Box position={"relative"}>
                <Text fontWeight="semibold">Selected File: {selectedFile.name}</Text>
                <CloseButton
                  position={"absolute"}
                  right={-2}
                  top={-2}
                  size={"sm"}
                  onClick={() => {
                    setSelectedFile(null);
                  }}
                />
              </Box>
            ) : (
              <Box>
                <VisuallyHidden>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpeg, .svg, .png , .jpg ,.webp"
                    mb={4}
                  />
                </VisuallyHidden>
                <Center>
                  <AiOutlineUpload fontSize={40} color="#2563EB" />
                </Center>
                <Text fontSize="md" color="gray.600" mt={3}>
                  <b>Choose a file</b> or Drag it here.<br />
                  <Text as="span" fontSize="sm" color="gray.400">
                    PNG, JPG, SVG up to 5MB
                  </Text>
                </Text>
              </Box>
            )}
          </Box>
          <Button
            size={"md"}
            w={"full"}
            mt={6}
            onClick={mutation.mutate}
            colorScheme={"blue"}
            isDisabled={!selectedFile}
            borderRadius="lg"
            fontWeight="bold"
            fontSize="md"
          >
            Upload
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
}

export default GalleryImages;
