/* eslint-disable react/prop-types */
import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Text,
  VStack,
  Card,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import SocialMedia from "./Social Media/SocialMedia";
import SettingsPage from "./SettingPage";
import PaymentGetways from "./PaymentGetways/Index";
import WebPages from "./WebPages";
import { useState } from "react";

export default function Settings() {
  const { hasPermission } = useHasPermission();
  const [activeTab, setActiveTab] = useState(0);
  if (!hasPermission("SETTING_VIEW")) return <NotAuth />;

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          Settings
        </Text>
        <Text fontSize="sm" color="gray.600">
          Configure system settings, web pages, social media, and payment gateways
        </Text>
      </Box>

      {/* Settings Tabs */}
      <Card>
        <CardBody p={0}>
          <Tabs 
            index={activeTab} 
            onChange={(index) => setActiveTab(index)}
            variant="enclosed"
            colorScheme="blue"
            isFitted={false}
          >
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
                  General Settings
                </Tab>
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
                  Web Pages
                </Tab>
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
                  Social Media
                </Tab>
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
                  Payment Gateways
                </Tab>
              </TabList>
            </Box>

            <TabPanels>
              <TabPanel px={{ base: 4, md: 6 }} py={6}>
                <SettingsPage currentTab={0} activeTab={activeTab} />
              </TabPanel>
              <TabPanel px={{ base: 4, md: 6 }} py={6}>
                <WebPages currentTab={1} activeTab={activeTab} />
              </TabPanel>
              <TabPanel px={{ base: 4, md: 6 }} py={6}>
                <SocialMedia currentTab={2} activeTab={activeTab} />
              </TabPanel>
              <TabPanel px={{ base: 4, md: 6 }} py={6}>
                <PaymentGetways currentTab={3} activeTab={activeTab} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
}
