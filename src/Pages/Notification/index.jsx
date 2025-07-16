/* eslint-disable react/prop-types */
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Text } from "@chakra-ui/react";
import { useState } from "react";
import UserNotification from "./UserNotification";
import DoctorNotification from "./DoctorNotification";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import admin from "../../Controllers/admin";
import AdminNotification from "./AdminNotifcation";

export default function Notification() {
  const [activeTab, setActiveTab] = useState(0);
  const { hasPermission } = useHasPermission();

  if (!hasPermission("NOTIFICATION_VIEW")) return <NotAuth />;

  const role = admin.role.name.toLowerCase();
  const isSuperAdmin = role === "super admin";
  const isDoctor = role === "doctor";
  const isClinic = role === "clinic";

  // Determine which tabs to show based on role
  const showUserTab = isSuperAdmin;
  const showDoctorTab = isSuperAdmin || isDoctor || isClinic;
  const showAdminTab = isSuperAdmin || isClinic;

  return (
    <Box px={{ base: 2, sm: 3, md: 4, lg: 6 }} py={{ base: 2, sm: 3, md: 4 }} mt={{ base: 1, sm: 2, md: 3 }} w="100%">
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="#2156F4" mb={5} letterSpacing="0.01em">
        Notifications
      </Text>
      <Tabs index={activeTab} onChange={(index) => setActiveTab(index)} variant="enclosed" colorScheme="blue">
        <Box 
          overflowX="auto" 
          overflowY="hidden"
          sx={{
            '&::-webkit-scrollbar': { display: 'none' },
            'scrollbarWidth': 'none',
            'msOverflowStyle': 'none'
          }}
        >
          <TabList 
            px={{ base: 4, md: 6 }} 
            pt={6}
            minW="max-content"
            borderBottom="2px solid"
            borderColor="blue.200"
          >
            {showUserTab && (
              <Tab 
                fontWeight="semibold" 
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                px={{ base: 3, sm: 4, md: 6 }}
                py={{ base: 2, sm: 3 }}
                whiteSpace="nowrap"
                _selected={{ 
                  bg: "blue.50", 
                  color: "blue.600",
                  borderColor: "blue.500"
                }}
                _hover={{ bg: "blue.50" }}
              >
                User Notification
              </Tab>
            )}
            {showDoctorTab && (
              <Tab 
                fontWeight="semibold" 
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                px={{ base: 3, sm: 4, md: 6 }}
                py={{ base: 2, sm: 3 }}
                whiteSpace="nowrap"
                _selected={{ 
                  bg: "blue.50", 
                  color: "blue.600",
                  borderColor: "blue.500"
                }}
                _hover={{ bg: "blue.50" }}
              >
                Doctor Notification
              </Tab>
            )}
            {showAdminTab && (
              <Tab 
                fontWeight="semibold" 
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                px={{ base: 3, sm: 4, md: 6 }}
                py={{ base: 2, sm: 3 }}
                whiteSpace="nowrap"
                _selected={{ 
                  bg: "blue.50", 
                  color: "blue.600",
                  borderColor: "blue.500"
                }}
                _hover={{ bg: "blue.50" }}
              >
                Admin Notification
              </Tab>
            )}
          </TabList>
        </Box>

        <TabPanels>
          {showUserTab && (
            <TabPanel px={{ base: 4, md: 6 }} py={6}>
              <UserNotification currentTab={0} activeTab={activeTab} />
            </TabPanel>
          )}
          {showDoctorTab && (
            <TabPanel px={{ base: 4, md: 6 }} py={6}>
              <DoctorNotification
                currentTab={showUserTab ? 1 : 0}
                activeTab={activeTab}
              />
            </TabPanel>
          )}
          {showAdminTab && (
            <TabPanel px={{ base: 4, md: 6 }} py={6}>
              <AdminNotification
                currentTab={showUserTab ? 2 : showDoctorTab ? 1 : 0}
                activeTab={activeTab}
              />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
}
