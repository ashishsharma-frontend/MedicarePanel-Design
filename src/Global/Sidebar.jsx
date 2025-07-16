import { FaImages } from "react-icons/fa";
import { RiUserShared2Fill } from "react-icons/ri";
import { FaListAlt } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { SiContactlesspayment } from "react-icons/si";
import { FaLocationArrow } from "react-icons/fa";
import { BiClinic } from "react-icons/bi";
import { IoIosNotifications } from "react-icons/io";
import { BiCalendar } from "react-icons/bi";
/* eslint-disable react-hooks/rules-of-hooks */
import {
  MdFamilyRestroom,
  MdMobileScreenShare,
  MdRateReview,
} from "react-icons/md";
import { BiFolderOpen } from "react-icons/bi";
import { RiCoupon2Fill, RiStethoscopeFill } from "react-icons/ri";
import { BiCheckShield } from "react-icons/bi";
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { CgArrowsExchangeAlt } from "react-icons/cg";
import { FiSettings } from "react-icons/fi";
import {
  FaFileAlt,
  FaHospitalUser,
  FaMedkit,
  FaPills,
  FaUserMd,
} from "react-icons/fa";
import { AiFillContacts, AiOutlineSearch } from "react-icons/ai";
import { MdAdminPanelSettings } from "react-icons/md";
import { ImUsers } from "react-icons/im";
import { AiFillDashboard } from "react-icons/ai";
import { FaHospital } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Tooltip,
  useColorModeValue,
  useMediaQuery,
  InputLeftElement,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import admin from "../Controllers/admin";
import useSettingsData from "../Hooks/SettingData";
import { BsBookmarkStar } from "react-icons/bs";
import useHasPermission from "../Hooks/HasPermission";
import { motion, AnimatePresence } from "framer-motion";

const getLinkSections = (isSuperAdmin) => {
  const baseSections = [
    {
      section: "Dashboard",
      links: [{ name: "Dashboard", icon: AiFillDashboard, superadmin: true }],
    },
    {
      section: "Appointments & Checkins",
      links: [
        { name: "Checkins", icon: BiCheckShield, permission: "CHECKIN_VIEW" },
        {
          name: "Appointments",
          icon: RiStethoscopeFill,
          permission: "APPOINTMENT_VIEW",
          superadmin: true,
        },
        {
          name: "Appointment-Status-Log",
          icon: FaListAlt,
          permission: "APPOINTMENT_VIEW",
        },
        {
          name: "Appointments-Calender",
          icon: BiCalendar,
          permission: "APPOINTMENT_VIEW",
        },
      ],
    },
    {
      section: "Finance",
      links: [
        {
          name: "Transactions",
          icon: CgArrowsExchangeAlt,
          permission: "ALL_TRANSACTION_VIEW",
        },
        {
          name: "Payments",
          icon: SiContactlesspayment,
          permission: "ALL_TRANSACTION_VIEW",
        },
        {
          name: "Invoices",
          icon: FaFileInvoiceDollar,
          permission: "ALL_TRANSACTION_VIEW",
        },
      ],
    },
    {
      section: isSuperAdmin ? "Clinic" : "Clinics & Doctors",
      links: [
        {
          name: "Clinics",
          icon: BiClinic,
          permission: "CLINIC_VIEW",
          superadmin: true,
        },
        {
          name: "Doctors",
          icon: FaUserMd,
          permission: "DOCTOR_VIEW",
          superadmin: true,
        },
        {
          name: "Departments",
          icon: FaHospital,
          permission: "DEPARTMENT_VIEW",
          superadmin: true,
        },
        {
          name: "Specialization",
          icon: FaMedkit,
          permission: "SPECIALIZATION_VIEW",
          superadmin: true,
        },
      ],
    },
    {
      section: "Patients & Users",
      links: [
        {
          name: "Patients",
          icon: FaHospitalUser,
          permission: "PATIENT_VIEW",
          superadmin: true,
        },
        {
          name: "Family-Members",
          icon: MdFamilyRestroom,
          permission: "FAMILY_VIEW",
          superadmin: true,
        },
        { name: "Users", icon: ImUsers, permission: "USER_VIEW" },
        {
          name: "Patient-Refer",
          icon: RiUserShared2Fill,
          permission: "REFER_VIEW",
        },
      ],
    },
    {
      section: "Prescriptions & Files",
      links: [
        {
          name: "Prescriptions",
          icon: FaFileAlt,
          permission: "PRESCRIPTION_VIEW",
        },
        { name: "Patient-Files", icon: BiFolderOpen, permission: "FILE_VIEW" },
      ],
    },
    {
      section: "Medicines",
      links: [
        { name: "Medicines", icon: FaPills, permission: "MEDICINE_VIEW" },
      ],
    },
    {
      section: "Promo",
      links: [
        {
          name: "Banners",
          icon: FaImages,
          permission: "BANNER_VIEW",
          superadmin: true,
        },
        { name: "Coupons", icon: RiCoupon2Fill, permission: "COUPON_VIEW" },
        {
          name: "Doctor-Reviews",
          icon: BsBookmarkStar,
          permission: "REVIEW_VIEW",
        },
        {
          name: "Testimonials",
          icon: MdRateReview,
          permission: "TESTIMONIAL_VIEW",
        },
      ],
    },
    {
      section: "Notifications & Settings",
      links: [
        {
          name: "Contact-Us-Form",
          icon: AiFillContacts,
          permission: "CONTACT_AS_VIEW",
        },
        {
          name: "Notification",
          icon: IoIosNotifications,
          permission: "NOTIFICATION_VIEW",
        },
        {
          name: "Login-Screen",
          icon: MdMobileScreenShare,
          permission: "LOGINSCREEN_VIEW",
        },
        ...(isSuperAdmin
          ? [
              {
                name: "Roles",
                icon: MdAdminPanelSettings,
                permission: "ROLE_VIEW",
              },
              {
                name: "Location-Settings",
                icon: FaLocationArrow,
                permission: "LOCATION_VIEW",
              },
              {
                name: "Settings",
                icon: FiSettings,
                permission: "SETTING_VIEW",
              },
            ]
          : []),
      ],
    },
  ];

  return isSuperAdmin
    ? baseSections.map((section) => ({
        ...section,
        links: section.links,
      }))
    : baseSections.map((section) => ({
        ...section,
        links: section.links.filter(
          (link) =>
            !["Roles", "Settings", "Location-Settings"].includes(link.name)
        ),
      }));
};

export default function Sidebar() {
  const [isLarge] = useMediaQuery("(min-width: 751px)");
  const isMobile = !isLarge;
  const Uselocation = useLocation();
  const location = Uselocation.pathname.split("/")[1];
  const [isOpen, setisOpen] = useState(!isLarge);
  const [activeTab, setActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission } = useHasPermission();
  const { settingsData } = useSettingsData();
  const title = settingsData?.find((value) => value.id_name === "clinic_name");
  const isSuperAdmin = admin?.role?.name?.toLowerCase() === "super admin";
  const LinkSections = getLinkSections(isSuperAdmin);

  const filteredSections = LinkSections.map((section) => {
    const filteredLinks = section.links?.filter((link) =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredLinks?.length) {
      return {
        ...section,
        links: filteredLinks,
      };
    }
    return null;
  }).filter(Boolean);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleTabClick(location ? location : "Dashboard");
  }, [location]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const getDefaultExpandedIndices = () => {
    const indices = [];

    if (filteredSections.some((section) => section.section === "Dashboard")) {
      indices.push(0);
    }

    filteredSections.forEach((section, index) => {
      if (
        section.links.some(
          (link) => link.name.toLowerCase() === location?.toLowerCase()
        )
      ) {
        indices.push(index);
      }
    });

    return [...new Set(indices)];
  };

  // Helper: Get all main menu items (flattened, unique, with icon)
  const mainMenuLinks = filteredSections
    .flatMap(section => section.links)
    .filter(link =>
      link.icon &&
      (link.name.toLowerCase() === "dashboard" || hasPermission(link.permission))
    );

  return (
    <>
      {/* Desktop Sidebar */}
      {isLarge && (
        <Box
          maxH="100vh"
          minH="100vh"
          overflowY="auto"
          sx={{
            "::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          <motion.div
            initial={{ width: 64 }}
            animate={{ width: isOpen ? 250 : 64 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              minHeight: "100vh",
              overflow: "hidden",
              backgroundColor: "#1A237E",
              color: "#FFF",
              borderRight: "1px solid #232F5C",
            }}
          >
            <Box
              bg="#1A237E"
              overflow="hidden"
              minH="100vh"
              color="#FFF"
              transition="0.4s ease"
              display="flex"
              flexDirection="column"
            >
              {/* Header */}
              <Flex px={isOpen ? 5 : 2} pt={6} pb={2} alignItems="center" gap={3}>
                <Box bg="#2A3A8E" borderRadius="lg" w={9} h={9} display="flex" alignItems="center" justifyContent="center">
                  <IconButton
                    onClick={() => setisOpen(!isOpen)}
                    icon={<GiHamburgerMenu fontSize="22" />}
                    color="white"
                    bg="none"
                    _hover={{ bg: "#2A3A8E", borderRadius: "md" }}
                    aria-label="Toggle Sidebar"
                    size="sm"
                  />
                </Box>
                {isOpen && (
                  <Text fontSize="lg" fontWeight="bold" color="white" letterSpacing="0.5px" ml={1}>
                    Medicare
                  </Text>
                )}
              </Flex>
              {/* Add margin below header for spacing */}
              {isOpen && <Box mt={3} />}
              {/* Search Bar with extra margin below for spacing */}
              {isOpen && (
                <Box px={5} pb={3} mb={3}>
                  <InputGroup size="md" boxShadow="sm">
                    <InputLeftElement pointerEvents="none">
                      <AiOutlineSearch color="#3A4EAE" size="18" />
                    </InputLeftElement>
                    <Input
                      onChange={handleSearchChange}
                      placeholder="Search"
                      borderRadius="12px"
                      bg="white"
                      color="#1A237E"
                      fontSize="sm"
                      _placeholder={{ color: "#A0AEC0" }}
                      border="none"
                      boxShadow="sm"
                    />
                  </InputGroup>
                </Box>
              )}

              {/* Sections & Menu Items */}
              {isOpen ? (
                <Box flex={1} px={2}>
                  <Accordion allowMultiple defaultIndex={getDefaultExpandedIndices()}>
                    {filteredSections.map((section, idx) => {
                      const hasAnyLinkPermission =
                        section.section.toLowerCase() === "dashboard"
                          ? true
                          : section.links &&
                            section.links.some((link) => hasPermission(link.permission));
                      if (!hasAnyLinkPermission) return null;
                      return (
                        <AccordionItem key={section.section} border="none" mb={2}>
                          <AccordionButton
                            px={4}
                            py={2}
                            _hover={{ bg: "#26336A" }}
                            justifyContent="space-between"
                            bg="none"
                            borderRadius="md"
                            _expanded={{ bg: "#232F5C" }}
                          >
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color="#F6F6F6"
                              textTransform="uppercase"
                              letterSpacing="1px"
                            >
                              {section.section}
                            </Text>
                            <AccordionIcon color="#A0AEC0" fontSize="lg" />
                          </AccordionButton>
                          <AccordionPanel pb={2} px={2}>
                            {section.links &&
                              section.links.map((link) =>
                                link.name.toLowerCase() === "dashboard" ||
                                hasPermission(link.permission) ? (
                                  <Box
                                    key={link.name}
                                    as={Link}
                                    to={`/${link.name.toLowerCase()}`}
                                    display="block"
                                    onClick={() => handleTabClick(link.name.toLowerCase())}
                                    mb={1}
                                  >
                                    <Flex
                                      align="center"
                                      px={3}
                                      py={2}
                                      borderRadius="lg"
                                      bg={
                                        link.name.toLowerCase() === activeTab
                                          ? "#3A4EAE"
                                          : "transparent"
                                      }
                                      _hover={{ bg: "#26336A" }}
                                      color="white"
                                      fontWeight={
                                        link.name.toLowerCase() === activeTab
                                          ? "bold"
                                          : "normal"
                                      }
                                      boxShadow={
                                        link.name.toLowerCase() === activeTab
                                          ? "md"
                                          : "none"
                                      }
                                      transition="background 0.2s, box-shadow 0.2s"
                                      gap={3}
                                    >
                                      {link.icon && (
                                        <Icon as={link.icon} fontSize={20} mr={2} />
                                      )}
                                      <Text fontSize="sm">{link.name}</Text>
                                    </Flex>
                                  </Box>
                                ) : null
                              )}
                          </AccordionPanel>
                          {/* Divider below each section except last */}
                          {idx < filteredSections.length - 1 && (
                            <Box h="1px" bg="#232F5C" mx={4} my={1} borderRadius="full" />
                          )}
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </Box>
              ) : (
                // Collapsed: Only icons, no section headings, no user card
                <Box flex={1} pt={2}>
                  {filteredSections.map((section) => {
                    const hasAnyLinkPermission =
                      section.section.toLowerCase() === "dashboard"
                        ? true
                        : section.links &&
                          section.links.some((link) => hasPermission(link.permission));
                    if (!hasAnyLinkPermission) return null;
                    return (
                      <Box key={section.section} mb={2}>
                        {section.links &&
                          section.links.map((link) =>
                            link.name.toLowerCase() === "dashboard" ||
                            hasPermission(link.permission) ? (
                              <Tooltip
                                label={link.name}
                                placement="right"
                                key={link.name}
                                bg="#2A3A8E"
                                color="white"
                              >
                                <Box
                                  as={Link}
                                  to={`/${link.name.toLowerCase()}`}
                                  display="block"
                                  onClick={() => handleTabClick(link.name.toLowerCase())}
                                  mb={2}
                                >
                                  <Flex
                                    align="center"
                                    justifyContent="center"
                                    p={2}
                                    borderRadius="lg"
                                    bg={link.name.toLowerCase() === activeTab ? "#3A4EAE" : "transparent"}
                                    _hover={{ bg: "#2A3A8E" }}
                                    color="white"
                                  >
                                    {link.icon && <Icon as={link.icon} fontSize={20} />}
                                  </Flex>
                                </Box>
                              </Tooltip>
                            ) : null
                          )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* User Card at Bottom */}
              {isOpen && (
                <Box mt="auto" px={5} py={4} bg="#2A3A8E" borderRadius="2xl" mb={4} boxShadow="sm">
                  <Flex align="center" gap={3}>
                    <Box
                      bgGradient="linear(to-br, #3A4EAE, #1A237E)"
                      borderRadius="full"
                      w={10}
                      h={10}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontWeight="bold" color="white" fontSize="lg">DR</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="white">Dr. Sarah Johnson</Text>
                      <Text fontSize="xs" color="#A0AEC0" fontWeight="medium">Cardiologist</Text>
                    </Box>
                  </Flex>
                </Box>
              )}
            </Box>
          </motion.div>
        </Box>
      )}

      {/* Mobile Bottom Nav - improved design */}
      {isMobile && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          w="100vw"
          bg="#fff"
          borderTop="1px solid #e5e7eb"
          zIndex={100}
          py={1}
          boxShadow="0 -1px 4px rgba(0,0,0,0.04)"
        >
          <Flex overflowX="auto" whiteSpace="nowrap" px={0} justify="flex-start" align="center">
            {mainMenuLinks.map(link => {
              const isActive = link.name.toLowerCase() === activeTab;
              return (
                <Tooltip label={link.name} placement="top" key={link.name} bg="#232F5C" color="#222">
                  <Box
                    as={Link}
                    to={`/${link.name.toLowerCase()}`}
                    onClick={() => handleTabClick(link.name.toLowerCase())}
                    minW="33.33vw"
                    flex="none"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    py={1}
                  >
                    <Icon
                      as={link.icon}
                      fontSize={22}
                      color={isActive ? "#2563eb" : "#374151"}
                      mb={0.5}
                    />
                    <Text
                      fontSize="sm"
                      color={isActive ? "#2563eb" : "#374151"}
                      fontWeight={isActive ? "bold" : "normal"}
                      letterSpacing="0.2px"
                      lineHeight={1.1}
                      mt={0.5}
                      noOfLines={1}
                      textAlign="center"
                    >
                      {link.name}
                    </Text>
                  </Box>
                </Tooltip>
              );
            })}
          </Flex>
        </Box>
      )}
    </>
  );
}
