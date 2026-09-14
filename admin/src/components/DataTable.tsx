import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type SortingState,
    getSortedRowModel,
    type ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react"

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (newPage: number) => void;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    pagination?: PaginationState;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search records...",
    pagination
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        ...(pagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    const isServerSearch = typeof onSearchChange === "function";

    return (
        <div className="space-y-6">
            {(searchKey || isServerSearch) && (
                <div className="flex items-center justify-between">
                    <div className="relative w-72 sm:w-80">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={isServerSearch ? (searchValue ?? "") : ((table.getColumn(searchKey!)?.getFilterValue() as string) ?? "")}
                            onChange={(event) => {
                                const val = event.target.value;
                                if (isServerSearch) {
                                    onSearchChange(val);
                                } else if (searchKey) {
                                    table.getColumn(searchKey)?.setFilterValue(val);
                                }
                            }}
                            className="pl-10 pr-9 h-10 w-full bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 focus-visible:ring-violet-500/50 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/80"
                        />
                        {(isServerSearch ? (searchValue && searchValue.length > 0) : ((table.getColumn(searchKey!)?.getFilterValue() as string)?.length > 0)) && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (isServerSearch) onSearchChange("");
                                    else if (searchKey) table.getColumn(searchKey)?.setFilterValue("");
                                }}
                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-2xl">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-zinc-200 dark:border-white/5 hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-xs font-bold uppercase tracking-widest text-zinc-500 h-14 pl-6">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 pl-6 text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    {pagination ? (
                        `Showing ${data.length} of ${pagination.total} records (Page ${pagination.page} of ${pagination.pages || 1})`
                    ) : (
                        `Showing ${table.getState().pagination.pageSize} rows per page`
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination ? pagination.onPageChange(pagination.page - 1) : table.previousPage()}
                        disabled={pagination ? pagination.page <= 1 : !table.getCanPreviousPage()}
                        className="h-8 w-8 p-0 border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination ? pagination.onPageChange(pagination.page + 1) : table.nextPage()}
                        disabled={pagination ? pagination.page >= pagination.pages : !table.getCanNextPage()}
                        className="h-8 w-8 p-0 border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
