import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  CabinProperties,
  listCabinProperties,
  createCabinProperty,
  updateCabinProperty,
  deleteCabinProperty,
} from "@/services/cabinPropertiesApi";
import { CabinPropertiesFormDialog } from "@/components/CabinPropertiesFormDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CabinPropertiesPage() {
  const [properties, setProperties] = useState<CabinProperties[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("Cabin");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<CabinProperties | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<CabinProperties | null>(null);

  const itemsPerPage = 25;

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const filter: Partial<CabinProperties> = {};

      if (searchTerm && filterField !== "all") {
        filter[filterField as keyof CabinProperties] = searchTerm as any;
      }

      const response = await listCabinProperties({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        filter,
        sort: { [sortField]: sortDirection },
      });

      setProperties(response.payload.documents);
      setTotalPages(Math.ceil(response.payload.pagination.total / itemsPerPage));
    } catch (error) {
      console.error("Failed to fetch cabin properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentPage, sortField, sortDirection, searchTerm, filterField]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreateProperty = async (data: Partial<CabinProperties>) => {
    try {
      await createCabinProperty(data);
      toast({
        title: "Success",
        description: "Cabin property created successfully",
      });
      fetchProperties();
    } catch (error) {
      console.error("Failed to create cabin property:", error);
    }
  };

  const handleUpdateProperty = async (data: Partial<CabinProperties>) => {
    if (!editingProperty) return;

    try {
      await updateCabinProperty(editingProperty._id, data);
      toast({
        title: "Success",
        description: "Cabin property updated successfully",
      });
      fetchProperties();
      setEditingProperty(null);
    } catch (error) {
      console.error("Failed to update cabin property:", error);
    }
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteCabinProperty(propertyToDelete._id);
      toast({
        title: "Success",
        description: "Cabin property deleted successfully",
      });
      fetchProperties();
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Failed to delete cabin property:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cabin Properties</h1>
          <p className="text-muted-foreground">Manage cabin properties and configurations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cabin Property
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={filterField} onValueChange={setFilterField}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            <SelectItem value="Cabin">Cabin</SelectItem>
            <SelectItem value="Deck">Deck</SelectItem>
            <SelectItem value="CabinType">Cabin Type</SelectItem>
            <SelectItem value="CabinStatus">Cabin Status</SelectItem>
            <SelectItem value="MusterStation">Muster Station</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("Cabin")}>
                <div className="flex items-center gap-2">
                  Cabin
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("Deck")}>
                <div className="flex items-center gap-2">
                  Deck
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("CabinType")}>
                <div className="flex items-center gap-2">
                  Cabin Type
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("MusterStation")}>
                <div className="flex items-center gap-2">
                  Muster Station
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("CabinStatus")}>
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center gap-2">
                  Created
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No cabin properties found
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">{property.Cabin}</TableCell>
                  <TableCell>
                    <div>
                      <div>{property.Deck}</div>
                      {property.DeckDesc && (
                        <div className="text-xs text-muted-foreground">{property.DeckDesc}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{property.CabinType}</div>
                      {property.CabinTypeDesc && (
                        <div className="text-xs text-muted-foreground">{property.CabinTypeDesc}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{property.MusterStation}</div>
                      {property.MusterStationDesc && (
                        <div className="text-xs text-muted-foreground">{property.MusterStationDesc}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{property.CabinStatus}</TableCell>
                  <TableCell>{formatDate(property.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProperty(property);
                          setIsFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPropertyToDelete(property);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <CabinPropertiesFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingProperty(null);
        }}
        onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
        property={editingProperty}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the cabin property "{propertyToDelete?.Cabin}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
