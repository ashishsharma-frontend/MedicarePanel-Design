/* eslint-disable react/prop-types */
import admin from "../../Controllers/admin";
import {
  FormControl,
  FormLabel,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Card,
  CardBody,
  Text,
  VStack,
} from "@chakra-ui/react";

import WysiwygEditor from "./Wsywig";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import Loading from "../../Components/Loading";

const getWebPages = async () => {
  const res = await GET(admin.token, `get_web_pages`);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

function WebPages({ currentTab, activeTab }) {
  const { data, isLoading } = useQuery({
    queryFn: getWebPages,
    queryKey: ["web-pages"],
    enabled: currentTab == activeTab,
  });

  if (isLoading) return <Loading />;
  
  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.600" mb={2}>
          Web Pages
        </Text>
        <Text fontSize="sm" color="gray.600">
          Edit and manage website content pages
        </Text>
      </Box>

      {/* Web Pages Tabs */}
      <Card>
        <CardBody p={0}>
          <Tabs variant="enclosed" colorScheme="blue" isFitted={false}>
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
                {data?.map((item) => (
                  <Tab 
                    key={item.id} 
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
                    {item.title}
                  </Tab>
                ))}
              </TabList>
            </Box>

            <TabPanels>
              {data?.map((item) => (
                <TabPanel key={item.id} px={{ base: 4, md: 6 }} py={6}>
                  <WebPage page={item.page_id} name={item.title} />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
}

export default WebPages;

const WebPage = ({ page, name }) => {
  const getWebPage = async () => {
    const res = await GET(admin.token, `get_web_page/page/${page}`);
    if (res.response !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  };
  
  const { data, isLoading } = useQuery({
    queryFn: getWebPage,
    queryKey: ["web-page", page],
  });

  return (
    <Box>
      <FormControl isRequired>
        <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700" mb={4}>
          {name}
        </FormLabel>
        {isLoading ? (
          <Skeleton w="full" h={20} />
        ) : (
          data && <WysiwygEditor value={data} />
        )}
      </FormControl>
    </Box>
  );
};
