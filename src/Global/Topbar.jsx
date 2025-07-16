import { FaHospitalUser } from "react-icons/fa";
/* eslint-disable react-hooks/rules-of-hooks */
import { AiFillSetting } from "react-icons/ai";
import { FiLogOut, FiSun, FiMoon, FiUser } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import {
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Avatar,
  Image,
  useColorMode,
  Divider,
  Input,
  VStack,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useMediaQuery,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import admin from "../Controllers/admin";
import NotificationIcon from "../Components/Notification";
import UpdateAdminPassword from "../Components/UpdatePassword";
import useSettingsData from "../Hooks/SettingData";
import imageBaseURL from "../Controllers/image";
import useHasPermission from "../Hooks/HasPermission";
import Logout from "../Controllers/logout";
import UseClinicsData from "../Hooks/UseClinicsData";
import { useSelectedClinic } from "../Context/SelectedClinic";
import { motion } from "framer-motion";

export default function Topbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const Uselocation = useLocation();
  const location = Uselocation.pathname.split("/")[1];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useMediaQuery("(max-width: 750px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { settingsData } = useSettingsData();
  const { hasPermission } = useHasPermission();

  useEffect(() => {
    colorMode === "dark"
      ? document.body.classList.add("dark")
      : document.body.classList.remove("dark");
  }, [colorMode]);

  // update  user
  const logo = settingsData?.find((value) => value.id_name === "logo");

  // handle updateMutation

  return (
    <Box
      as="header"
      w="100%"
      bg={colorMode === "light" ? "white" : "#1A237E"}
      boxShadow="0 2px 8px rgba(0,0,0,0.04)"
      borderBottom="1px solid"
      borderColor={colorMode === "light" ? "#e5e7eb" : "#232F5C"}
      px={{ base: 3, md: 6 }}
      py={{ base: 2, md: 0 }}
      borderRadius={0}
      minH={{ base: 14, md: 14 }}
      position="sticky"
      top={0}
      zIndex={110}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left: Logo + Brand + Page Title (desktop only) */}
      <Flex align="center" gap={4} minW={0}>
        <Image
          w={{ base: 10, md: 12 }}
          h={{ base: 10, md: 12 }}
          src={`${imageBaseURL}/${logo?.value}`}
          fallbackSrc="/logo.png"
          borderRadius="lg"
          boxShadow="sm"
          bg="white"
        />
        {!isMobile && (
          <Box minW={0}>
            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="bold"
              color={colorMode === "light" ? "#1A237E" : "white"}
              letterSpacing="0.5px"
              noOfLines={1}
            >
            </Text>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight={600}
              color={colorMode === "light" ? "#374151" : "#B0B8C1"}
              textTransform="capitalize"
              noOfLines={1}
            >
              {location ? location : "Dashboard"}
            </Text>
          </Box>
        )}
      </Flex>

      {/* Right: Actions */}
      <Flex align="center" gap={{ base: 2, md: 4 }}>
        {/* Clinic selector only on desktop */}
        {!isMobile && <ClinicSelctor />}
        <NotificationIcon />
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={() => {
            toggleColorMode();
            colorMode === "light"
              ? document.body.classList.add("dark")
              : document.body.classList.remove("dark");
          }}
          variant="ghost"
          colorScheme="black"
          fontSize="xl"
          borderRadius="full"
        />
        {/* Profile: dropdown on desktop, drawer on mobile */}
        {isMobile ? (
          <IconButton
            aria-label="Profile"
            icon={<Avatar size="sm" src={`${imageBaseURL}/${admin.image}`} />}
            variant="ghost"
            colorScheme="black"
            fontSize="xl"
            borderRadius="full"
            onClick={() => setDrawerOpen(true)}
          />
        ) : (
          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              colorScheme="black"
              icon={<FiUser />}
              borderRadius="full"
              fontSize="xl"
            />
            <MenuList boxShadow="lg" borderRadius="xl" p={0} minW={56}>
              <Box p={4} textAlign="center">
                <Avatar
                  src={`${imageBaseURL}/${admin.image}`}
                  fallbackSrc="/admin/profile.png"
                  w={16}
                  h={16}
                  mx="auto"
                  mb={2}
                />
                <Text fontSize="lg" fontWeight="bold">
                  {admin.f_name} {admin.l_name}
                </Text>
                <Text fontSize="md" fontWeight={600} color="gray.500">
                  {admin.role.name}
                </Text>
              </Box>
              <Divider mb={2} />
              <MenuItem
                onClick={() => {
                  admin.role.name.toLowerCase() === "doctor"
                    ? navigate(`/doctor/profile`)
                    : admin.role.name.toLowerCase() === "clinic"
                    ? navigate(`/clinic/self/profile/update/${admin.clinic_id}`)
                    : navigate(`/user/update/${admin.id}`);
                }}
                icon={<FiUser />}
              >
                Account
              </MenuItem>
              <MenuItem onClick={onOpen} icon={<RiLockPasswordLine />}>
                Change Password
              </MenuItem>
              {hasPermission("SETTING_VIEW") && (
                <MenuItem
                  onClick={() => {
                    navigate("/settings");
                  }}
                  icon={<AiFillSetting />}
                >
                  Settings
                </MenuItem>
              )}
              <MenuItem
                icon={<FiLogOut />}
                onClick={() => {
                  Logout();
                }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
      {/* Mobile Profile Drawer */}
      <Drawer isOpen={drawerOpen} placement="bottom" onClose={() => setDrawerOpen(false)} size="full">
        <DrawerOverlay />
        <DrawerContent borderTopRadius="2xl" pb={6}>
          <DrawerCloseButton mt={2} />
          <DrawerHeader textAlign="center" fontWeight="bold">
            Profile
          </DrawerHeader>
          <DrawerBody>
            <Box textAlign="center" mb={4}>
              <Avatar
                src={`${imageBaseURL}/${admin.image}`}
                fallbackSrc="/admin/profile.png"
                w={20}
                h={20}
                mx="auto"
                mb={2}
              />
              <Text fontSize="lg" fontWeight="bold">
                {admin.f_name} {admin.l_name}
              </Text>
              <Text fontSize="md" fontWeight={600} color="gray.500">
                {admin.role.name}
              </Text>
            </Box>
            <VStack spacing={4} align="stretch">
              <Button
                leftIcon={<FiUser />}
                variant="outline"
                onClick={() => {
                  setDrawerOpen(false);
                  admin.role.name.toLowerCase() === "doctor"
                    ? navigate(`/doctor/profile`)
                    : admin.role.name.toLowerCase() === "clinic"
                    ? navigate(`/clinic/self/profile/update/${admin.clinic_id}`)
                    : navigate(`/user/update/${admin.id}`);
                }}
              >
                Account
              </Button>
              <Button
                leftIcon={<RiLockPasswordLine />}
                variant="outline"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpen();
                }}
              >
                Change Password
              </Button>
              {hasPermission("SETTING_VIEW") && (
                <Button
                  leftIcon={<AiFillSetting />}
                  variant="outline"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/settings");
                  }}
                >
                  Settings
                </Button>
              )}
              <Button
                leftIcon={<FiLogOut />}
                colorScheme="red"
                variant="solid"
                onClick={() => {
                  setDrawerOpen(false);
                  Logout();
                }}
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <UpdateAdminPassword isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

const ClinicSelctor = () => {
  const [search, setSearch] = useState("");
  const { clinicsData, clinicsError, clinicsLoading } = UseClinicsData();
  const { selectedClinic, setSelectedClinic } = useSelectedClinic();

  const filteredClinics = clinicsData?.filter((clinic) => {
    if (!search) return true;

    const query = search.toLowerCase();
    const searchableFields = [
      clinic.title,
      clinic.address,
      clinic.city_title,
      clinic.state_title,
      clinic.description,
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(query)
    );
  });
  useEffect(() => {
    if (admin) {
      if (admin.role.name.toLowerCase() === "clinic") {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.clinic_id
        );
        setSelectedClinic(clinic);
      } else if (admin.clinic_id) {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.clinic_id
        );
        setSelectedClinic(clinic);
      } else if (admin.assign_clinic_id) {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.assign_clinic_id
        );
        setSelectedClinic(clinic);
      }
    }
  }, [clinicsData]);

  return (
    <VStack spacing={4} align="start">
      <Menu>
        <Flex align={"center"} gap={2}>
          <Text fontWeight={600}>Clinic - </Text>
          <MenuButton
            as={Button}
            leftIcon={<FaHospitalUser />}
            size={"sm"}
            bg={"none"}
            border={"1px solid"}
            borderColor={"gray.300"}
            _hover={{
              bg: "none",
            }}
            _active={{
              bg: "none",
            }}
            isDisabled={
              clinicsError ||
              clinicsLoading ||
              (admin.role.name.toLowerCase() !== "admin" &&
                admin.role.name.toLowerCase() !== "super admin")
            }
            _disabled={{
              cursor: "not-allowed",
            }}
          >
            {clinicsLoading ? (
              <Flex>
                Loading
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                >
                  .
                </motion.span>
              </Flex>
            ) : selectedClinic ? (
              selectedClinic.title
            ) : (
              "All"
            )}
          </MenuButton>
        </Flex>
        <MenuList
          maxW={"500px"}
          minW={"300px"}
          zIndex={100}
          maxH={"70vh"}
          overflow={"auto"}
        >
          <Box p={2}>
            <Input
              placeholder="Search clinics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="md"
            />
          </Box>
          <MenuItem
            onClick={() => {
              setSelectedClinic();
              setSearch("");
            }}
            bg={
              !selectedClinic
                ? useColorModeValue("gray.100", "gray.600")
                : "initial"
            }
            _hover={{
              bg: useColorModeValue("gray.100", "gray.600"),
            }}
          >
            All
          </MenuItem>
          {filteredClinics?.length > 0 ? (
            filteredClinics?.map((clinic) => (
              <MenuItem
                key={clinic?.id}
                onClick={() => {
                  setSelectedClinic(clinic);
                  setSearch("");
                }}
                bg={
                  selectedClinic?.id === clinic?.id
                    ? useColorModeValue("gray.100", "gray.600")
                    : "initial"
                }
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.600"),
                }}
                fontSize={"md"}
              >
                {clinic.title} - {clinic.city_title}, {clinic.state_title} - #
                {clinic.id}
              </MenuItem>
            ))
          ) : (
            <Box p={2} textAlign="center" color="gray.500">
              No results found
            </Box>
          )}
        </MenuList>
      </Menu>
    </VStack>
  );
};
