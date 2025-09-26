import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AdDocument, listAds, deleteAd } from "@/services/adApi";
import AdFormDialog from "@/components/AdFormDialog";
import { PermissionError } from "@/lib/apiErrorHandler";

export default function Ads() {
  const [ads, setAds] = useState<AdDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<AdDocument | undefined>();

  const loadAds = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      
      // Build filter
      const filter: any = {};
      if (searchTerm && filterField !== "all") {
        filter[filterField] = searchTerm;
      }

      // Build sort
      const sort: Record<string, 'asc' | 'desc'> = {};
      if (sortField) {
        sort[sortField] = sortOrder;
      }

      const response = await listAds({
        limit,
        offset,
        filter,
        sort
      });

      setAds(response.payload.documents);
      setTotal(response.payload.pagination.total);
    } catch (error) {
      if (error instanceof PermissionError) {
        // Permission error is already handled by the error handler
        return;
      }
      console.error("Error loading ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [currentPage, searchTerm, filterField, sortField, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (field: string) => {
    setFilterField(field);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleDelete = async (ad: AdDocument) => {
    try {
      await deleteAd(ad._id, ad.ad_url);
      toast({
        title: "Success",
        description: "Ad deleted successfully",
      });
      loadAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const handleEdit = (ad: AdDocument) => {
    setSelectedAd(ad);
    setIsFormDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedAd(undefined);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadAds();
  };

  const totalPages = Math.ceil(total / limit);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ad Management</h1>
          <p className="text-muted-foreground">Manage advertising content and campaigns</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ad
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ads ({total})</CardTitle>
          <CardDescription>
            Filter and search through all advertising content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterField} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="_id">Ad ID</SelectItem>
                <SelectItem value="campaign_id">Campaign ID</SelectItem>
                <SelectItem value="advertiser_id">Advertiser ID</SelectItem>
                <SelectItem value="ad_format">Ad Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("_id")}
                  >
                    <div className="flex items-center gap-2">
                      Ad ID
                      {getSortIcon("_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("campaign_id")}
                  >
                    <div className="flex items-center gap-2">
                      Campaign ID
                      {getSortIcon("campaign_id")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("advertiser_id")}
                  >
                    <div className="flex items-center gap-2">
                      Advertiser ID
                      {getSortIcon("advertiser_id")}
                    </div>
                  </TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading ads...
                    </TableCell>
                  </TableRow>
                ) : ads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No ads found
                    </TableCell>
                  </TableRow>
                ) : (
                  ads.map((ad) => (
                    <TableRow key={ad._id}>
                      <TableCell className="font-mono text-sm">
                        {ad._id}
                      </TableCell>
                      <TableCell>{ad.campaign_id || "-"}</TableCell>
                      <TableCell>{ad.advertiser_id || "-"}</TableCell>
                      <TableCell>
                        {ad.ad_format && (
                          <Badge variant={ad.ad_format === "image" ? "default" : "secondary"}>
                            {ad.ad_format}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {ad.ad_url && (
                          <div className="flex items-center gap-2">
                            {ad.ad_format === "image" ? (
                              <img 
                                src={ad.ad_url} 
                                alt="Ad preview" 
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <Eye className="h-4 w-4" />
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                              {ad.ad_url}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ad.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ad)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the ad.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(ad)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum <= totalPages) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={pageNum === currentPage}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  })}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AdFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSuccess={handleFormSuccess}
        ad={selectedAd}
      />
    </div>
  );
}