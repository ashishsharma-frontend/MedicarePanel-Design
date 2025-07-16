import { BsChevronDoubleDown } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import { MdOutlineRestartAlt } from "react-icons/md"; // Added for reset icon
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Image,
  Text,
  Button,
  Input,
  Box,
  Collapse,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import imageBaseURL from "../Controllers/image";
import moment from "moment";
import { useLocation } from "react-router-dom";

const DynamicTable = ({ data, onActionClick, minPad, imgLast }) => {
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState(data);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const Uselocation = useLocation();
  const location = Uselocation.pathname.split("/")[1];
  const todayDate = moment().format("DD MMM YYYY");

  // Update filteredData whenever data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Handle filtering and sorting
  useEffect(() => {
    let updatedData = [...data].filter((row) =>
      Object.entries(filters).every(([key, val]) =>
        val
          ? String(row[key]).toLowerCase().includes(String(val).toLowerCase())
          : true
      )
    );

    // Apply sorting if sortConfig is set
    if (sortConfig.key && sortConfig.direction) {
      updatedData.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(updatedData);
  }, [filters, data, sortConfig]);

  const getColumns = (data, imgLast) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const originalColumns = Object.keys(data[0] || {});
    const hasIdColumn = originalColumns.includes("id");
    const desiredColumns = hasIdColumn ? ["id"] : [];
    const hasImageColumn = originalColumns.includes("image");

    if (hasImageColumn && !desiredColumns.includes("image") && !imgLast) {
      desiredColumns.push("image");
    }

    const remainingColumns = originalColumns.filter(
      (column) => !desiredColumns.includes(column)
    );
    const removed = remainingColumns.filter(
      (column) =>
        ![
          "current_cancel_req_status",
          "filterCancelation",
          "filterStatus",
          "serchQuery",
          "file_name",
        ].includes(column)
    );

    return [...desiredColumns, ...removed];
  };

  const columns = useMemo(() => getColumns(data, imgLast), [data, imgLast]);

  // Handle filter input changes
  const handleFilterChange = (column, value) => {
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);
  };

  // Handle sorting on header click
  const handleSort = (column) => {
    if (sortConfig.key === column) {
      // Cycle through asc -> desc -> null
      if (sortConfig.direction === "asc") {
        setSortConfig({ key: column, direction: "desc" });
      } else if (sortConfig.direction === "desc") {
        setSortConfig({ key: null, direction: null });
      } else {
        setSortConfig({ key: column, direction: "asc" });
      }
    } else {
      // First click: sort ascending
      setSortConfig({ key: column, direction: "asc" });
    }
  };

  // Determine the next sort state for hover arrow
  const getNextSortState = (column) => {
    if (sortConfig.key === column) {
      if (sortConfig.direction === "asc") return "desc";
      if (sortConfig.direction === "desc") return "null";
      return "asc";
    }
    return "asc"; // Default for unsorted columns
  };

  function convertToReadableFormat(text) {
    return text.replace(/_/g, " ");
  }

  const handleExportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${location}-${todayDate}.csv`);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${location}-${todayDate}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = data.map((row) =>
      columns.map((column) => row[column] || "N/A")
    );

    doc.autoTable({
      head: [columns.map((col) => convertToReadableFormat(col))],
      body: tableData,
    });

    doc.save(`${location}-${todayDate}.pdf`);
  };

  if (!data || data.length === 0) {
    return (
      <Text
        textAlign="center"
        mt={4}
        w={"100%"}
        padding={"4px"}
        background={"red.100"}
        color={useColorModeValue("#000", "#000")}
      >
        No data found
      </Text>
    );
  }

  return (
    <Box mt={4}>
      {/* Export Button */}
      <Box display="flex" justifyContent="flex-end" mb={4} gap={4}>
        <Button
          colorScheme={"teal"}
          size="sm"
          onClick={() => {
            setShowFilters(!showFilters);
          }}
          rightIcon={<BsChevronDoubleDown />}
        >
          Filters
        </Button>
        <Menu>
          <MenuButton
            colorScheme={"whatsapp"}
            as={Button}
            size="sm"
            rightIcon={<FiDownload />}
          >
            Export
          </MenuButton>
          <MenuList>
            <MenuItem onClick={handleExportCSV}>Export to CSV</MenuItem>
            <MenuItem onClick={handleExportExcel}>Export to Excel</MenuItem>
            <MenuItem onClick={handleExportPDF}>Export to PDF</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Filters */}
      <Collapse in={showFilters} animateOpacity>
        <Box
          display="flex"
          gap={4}
          flexWrap="wrap"
          border="1px solid"
          borderColor="gray.200"
          p={4}
          borderRadius="md"
          maxHeight={showFilters ? "auto" : "0"}
          overflow="hidden"
          transition="max-height 0.3s ease-in-out"
          mb={5}
        >
          {columns.map((column) => (
            <Box key={column} w="200px">
              <Text fontSize="sm" mb={1} fontWeight={600}>
                {convertToReadableFormat(column).toUpperCase()}
              </Text>
              <Input
                size="sm"
                onChange={(e) => handleFilterChange(column, e.target.value)}
              />
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Table */}
      <TableContainer
        border={"1px solid"}
        borderColor={useColorModeValue("gray.100", "gray.600")}
        borderRadius={"lg"}
        padding={3}
      >
        <Table variant="striped" colorScheme="gray" size="sm">
          <Thead background={useColorModeValue("blue.100", "blue.700")}>
            <Tr color={"#000"}>
              {onActionClick && (
                <Th
                  color={useColorModeValue("#000", "#fff")}
                  py={3}
                  textAlign={"center"}
                >
                  Options
                </Th>
              )}
              {columns.map((column) => {
                const nextSortState = getNextSortState(column);
                return (
                  <Th
                    key={column}
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    padding={minPad || "8px 8px"}
                    cursor="pointer"
                    onClick={() => handleSort(column)}
                    position="relative"
                    _hover={{
                      "& .sort-arrow": { opacity: 1 },
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {convertToReadableFormat(column)}
                      {/* Active sort indicator */}
                      {sortConfig.key === column && sortConfig.direction && (
                        <span style={{ marginLeft: "4px" }}>
                          {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                      {/* Hover arrow indicating next sort state */}
                      <Box
                        className="sort-arrow"
                        opacity={0}
                        transition="opacity 0.2s"
                        position="absolute"
                        right="4px"
                        fontSize="12px"
                        display="flex"
                        alignItems="center"
                      >
                        {nextSortState === "asc" && "↑"}
                        {nextSortState === "desc" && "↓"}
                        {nextSortState === "null" && (
                          <MdOutlineRestartAlt size="14px" />
                        )}
                      </Box>
                    </Box>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {onActionClick && (
                  <Td w={5}>
                    {React.cloneElement(onActionClick, { rowData: row })}
                  </Td>
                )}
                {columns.map((column) => (
                  <Td
                    key={column}
                    w={"fit-content"}
                    maxW="250px"
                    overflow={"hidden"}
                    padding={minPad || "8px 8px"}
                    borderRight={0}
                    borderLeft={0}
                    fontSize={"14px"}
                    fontWeight={"500"}
                  >
                    {column === "image" ? (
                      <Image
                        src={`${imageBaseURL}/${row[column]}`}
                        w={8}
                        fallbackSrc="imagePlaceholder.png"
                      />
                    ) : row[column] === null || row[column] === "null" ? (
                      "N/A"
                    ) : column === "created_at" || column === "updated_at" ? (
                      <p>
                        {moment
                          .utc(row[column])
                          .local()
                          .format("DD MMM YY  hh:mm A")}
                      </p>
                    ) : (
                      row[column]
                    )}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DynamicTable;