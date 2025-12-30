"use client";

import AlertDialog from "@repo/ui/components/AlertDialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Globe, Lock, MoreHorizontal, Search, Trash } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { deleteGroup, getGroups } from "@/app/actions/admin-groups";

interface Group {
  id: string;
  name: string;
  slug: string;
  privacy_level: string;
  members_count: number;
  created_at: string;
}

interface GroupsDataTableProps {
  initialData?: {
    groups: Group[];
    totalPages: number;
    total: number;
  };
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50] as const;

export function GroupsDataTable({ initialData }: GroupsDataTableProps) {
  const [groups, setGroups] = React.useState<Group[]>(initialData?.groups ?? []);
  const [loading, setLoading] = React.useState(!initialData);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [totalPages, setTotalPages] = React.useState(initialData?.totalPages ?? 1);
  const [totalCount, setTotalCount] = React.useState(initialData?.total ?? 0);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  
  // Dialog states
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchGroups = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGroups(page, rowsPerPage, {
        search: search || undefined,
      });
      setGroups(result.groups as Group[]);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  React.useEffect(() => {
    if (isInitialLoad && initialData) {
      setIsInitialLoad(false);
      return;
    }
    
    const timer = setTimeout(() => {
        fetchGroups();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchGroups, search, isInitialLoad, initialData]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
        const result = await deleteGroup(deleteId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Group deleted successfully");
            setGroups((prev) => prev.filter((g) => g.id !== deleteId));
            setDeleteId(null);
            // Optionally refresh list if needed, but filtering locally is faster UI feedback
        }
    } catch (error) {
        toast.error("An error occurred while deleting the group");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search and Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Badge variant="outline" className="h-9 px-3 whitespace-nowrap">
              {loading ? "..." : `${totalCount} groups`}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows:</span>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead className="w-[200px]">Slug</TableHead>
                <TableHead className="w-[150px]">Privacy</TableHead>
                <TableHead className="w-[100px]">Members</TableHead>
                <TableHead className="w-[150px]">Created At</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(rowsPerPage, 5) }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No groups found
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => {
                    const isPrivate = group.privacy_level === "private";
                    return (
                        <TableRow key={group.id}>
                        <TableCell>
                            <div className="font-medium">{group.name}</div>
                        </TableCell>
                        <TableCell>
                            <div className="text-muted-foreground text-sm">/{group.slug}</div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                                <span className="capitalize">{group.privacy_level}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {group.members_count}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(group.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setDeleteId(group.id)} className="text-red-600 cursor-pointer">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Group
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((pageNum, idx) => (
              pageNum === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
              ) : (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              )
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
       <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the group and remove all data associated with it."
        onConfirm={confirmDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
      />
    </>
  );
}
