import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { listGuestMessagesResponses, GuestMessageResponseDocument } from "@/services/guestMessageResponseApi";
import { useToast } from "@/hooks/use-toast";

const GuestMessageResponses = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<GuestMessageResponseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 25,
    total: 0
  });
  const [canAccessAll, setCanAccessAll] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (messageId) {
      fetchResponses();
    }
  }, [messageId, pagination.offset]);

  const fetchResponses = async () => {
    if (!messageId) return;

    try {
      setLoading(true);
      const result = await listGuestMessagesResponses({
        messageId,
        limit: pagination.limit,
        offset: pagination.offset,
        sort: { createdAt: 'desc' }
      });

      setResponses(result.payload.documents);
      setCanAccessAll(result.payload.canAccessAllDocuments);
      setPagination(prev => ({
        ...prev,
        total: result.payload.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load guest message responses"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'answered': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/guest-messages')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Guest Messages
        </Button>
        <h1 className="text-2xl font-bold">Guest Message Responses</h1>
      </div>

      {!canAccessAll && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ You may not have access to all responses. Some data might be filtered based on your permissions.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Responses</span>
            <span className="text-sm font-normal text-muted-foreground">
              {pagination.total} total responses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No responses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    responses.map((response) => (
                      <TableRow key={response._id}>
                        <TableCell className="font-medium">
                          {response._createdBy}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(response.status)}>
                            {response.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {response.responses && response.responses.length > 0 ? (
                            <div className="space-y-1">
                              {response.responses.map((resp, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{resp.questionId}:</span> {resp.response}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No responses</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(response.createdAt.toString())}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(response.updatedAt.toString())}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={pagination.offset === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestMessageResponses;