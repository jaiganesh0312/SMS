import React, { useState, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Pagination,
    Spinner,
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";
import { Icon } from "@iconify/react";

export default function DataTable({
    data = [],
    columns = [],
    loading = false,
    searchable = true,
    searchPlaceholder = "Search...",
    searchKeys = [],
    pagination = true,
    itemsPerPage = 10,
    onRowAction,
    rowActions = [],
    emptyContent = "No data found",
    selectedKeys = new Set(),
    onSelectionChange,
    selectionMode = "none"
}) {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchable || !filterValue) return data;

        return data.filter(item => {
            // If searchKeys specified, only search those fields
            if (searchKeys.length > 0) {
                return searchKeys.some(key => {
                    const value = key.split('.').reduce((obj, k) => obj?.[k], item);
                    return String(value).toLowerCase().includes(filterValue.toLowerCase());
                });
            }

            // Otherwise search all string fields
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(filterValue.toLowerCase())
            );
        });
    }, [data, filterValue, searchable, searchKeys]);

    // Paginate data
    const pages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        if (!pagination) return filteredData;

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, page, itemsPerPage, pagination]);

    // Render cell content
    const renderCell = (item, columnKey) => {
        const column = columns.find(col => col.key === columnKey);
        if (!column) return null;

        // If custom render function provided
        if (column.render) {
            return column.render(item);
        }

        // Get value from nested key
        const value = columnKey.split('.').reduce((obj, key) => obj?.[key], item);

        // If it's an actions column
        if (columnKey === 'actions' && rowActions.length > 0) {
            return (
                <div className="flex items-center gap-2">
                    {rowActions.map((action, index) => (
                        action.isDropdown ? (
                            <Dropdown key={index}>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                    >
                                        <Icon icon="mdi:dots-vertical" className="text-lg" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Actions">
                                    {action.items.map((dropItem, dropIndex) => (
                                        <DropdownItem
                                            key={dropIndex}
                                            startContent={dropItem.icon && <Icon icon={dropItem.icon} />}
                                            color={dropItem.color}
                                            onPress={() => dropItem.onClick(item)}
                                        >
                                            {dropItem.label}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <Button
                                key={index}
                                isIconOnly={action.isIconOnly}
                                size="sm"
                                variant={action.variant || "light"}
                                color={action.color}
                                onPress={() => action.onClick(item)}
                                startContent={action.icon && !action.isIconOnly && <Icon icon={action.icon} />}
                            >
                                {action.isIconOnly ? <Icon icon={action.icon} /> : action.label}
                            </Button>
                        )
                    ))}
                </div>
            );
        }

        return value;
    };

    const topContent = useMemo(() => {
        if (!searchable) return null;

        return (
            <div className="flex items-center justify-between gap-3 mb-4">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder={searchPlaceholder}
                    startContent={<Icon icon="mdi:magnify" />}
                    value={filterValue}
                    onClear={() => setFilterValue("")}
                    onValueChange={setFilterValue}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {filteredData.length}
                </div>
            </div>
        );
    }, [filterValue, searchable, searchPlaceholder, filteredData.length]);

    const bottomContent = useMemo(() => {
        if (!pagination || pages <= 1) return null;

        return (
            <div className="flex w-full justify-center mt-4">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
            </div>
        );
    }, [pagination, page, pages]);

    return (
        <div>
            {topContent}
            <Table
                aria-label="Data table"
                selectionMode={selectionMode}
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                bottomContent={bottomContent}
                classNames={{
                    wrapper: "border border-gray-200 dark:border-gray-800",
                }}
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            align={column.align || "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={paginatedData}
                    isLoading={loading}
                    loadingContent={<Spinner />}
                    emptyContent={emptyContent}
                >
                    {(item) => (
                        <TableRow key={item.id || Math.random()}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
