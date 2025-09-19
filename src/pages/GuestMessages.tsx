import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Filter, Eye, MessageSquare, Users, Bell, ChevronUp, ChevronDown, Plus, Edit, Trash2, BarChart3 } from "lucide-react";
import { listGuestMessages, GuestMessage, createGuestMessage, updateGuestMessage, deleteGuestMessage } from "@/services/guestMessageApi";
import { getGuestMessageSummary, GuestMessageSummary } from "@/services/guestMessageResponseApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MessageFormDialog } from "@/components/MessageFormDialog";

const GuestMessages = () => {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 25,
    total: 0
  });
  const [canAccessAll, setCanAccessAll] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<GuestMessage | null>(null);
  const [messageSummary, setMessageSummary] = useState<GuestMessageSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState<GuestMessage | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, [searchTerm, typeFilter, sortField, sortDirection, pagination.offset]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const filter: Partial<GuestMessage> = {};
      if (typeFilter !== "all") {
        filter.type = typeFilter as "action" | "survey" | "notification";
      }
      if (searchTerm) {
        // Note: In a real implementation, you might want to use text search
        filter.subject = searchTerm;
      }

      const sort = { [sortField]: sortDirection };

      const response = await listGuestMessages({
        limit: pagination.limit,
        offset: pagination.offset,
        filter,
        sort
      });

      setMessages(response.payload.documents);
      setCanAccessAll(response.payload.canAccessAllDocuments);
      setPagination(prev => ({
        ...prev,
        total: response.payload.pagination.total
      }));

    } catch (error) {
      console.error('Failed to fetch guest messages:', error);
      toast({
        title: "Error",
        description: "Failed to load guest messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action': return <MessageSquare className="w-4 h-4" />;
      case 'survey': return <Users className="w-4 h-4" />;
      case 'notification': return <Bell className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'survey': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'notification': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const handleCreateMessage = async (messageData: Omit<GuestMessage, '_id' | 'createdAt' | 'updatedAt' | 'sentBy'>) => {
    try {
      await createGuestMessage(messageData);
      toast({
        title: "Success",
        description: "Message created successfully",
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to create message:', error);
    }
  };

  const handleUpdateMessage = async (messageData: Omit<GuestMessage, '_id' | 'createdAt' | 'updatedAt' | 'sentBy'>) => {
    if (!editingMessage) return;
    try {
      await updateGuestMessage(editingMessage._id, messageData);
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
      setEditingMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteGuestMessage(messageId);
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleViewSummary = async (message: GuestMessage) => {
    setSelectedMessage(message);
    setSummaryLoading(true);
    setMessageSummary(null);
    
    try {
      const result = await getGuestMessageSummary(message._id);
      setMessageSummary(result.payload);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load message summary"
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleViewResponses = (messageId: string) => {
    navigate(`/guest-messages/${messageId}/responses`);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Messages</h1>
          <p className="text-muted-foreground mt-1">Manage and view guest communications</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Message
          </Button>
          {!canAccessAll && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">Limited Access</p>
              <p className="text-xs text-destructive/80">You may not be able to see all messages</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-card border-border shadow-card-shadow">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card className="bg-gradient-card border-border shadow-card-shadow">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Messages ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('subject')}
                      className="h-auto p-0 font-semibold text-left justify-start"
                    >
                      Subject
                      {sortField === 'subject' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('type')}
                      className="h-auto p-0 font-semibold text-left justify-start"
                    >
                      Type
                      {sortField === 'type' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Sent To</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('createdAt')}
                      className="h-auto p-0 font-semibold text-left justify-start"
                    >
                      Created
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading messages...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No guest messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow key={message._id} className="hover:bg-muted/5">
                      <TableCell>
                        <div className={`p-2 rounded-md ${getTypeColor(message.type)}`}>
                          {getTypeIcon(message.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {message.mediaUrl && message.mediaType === 'image' && (
                            <img 
                              src={message.mediaUrl} 
                              alt="Message media" 
                              className="w-12 h-12 object-cover rounded border flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{message.subject}</div>
                            {message.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {message.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getTypeColor(message.type)} capitalize`}>
                          {message.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {message.sentTo ? (
                          <Badge variant="secondary">Room: {message.sentTo}</Badge>
                        ) : (
                          <Badge variant="outline">Broadcast</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </TableCell>
                      <TableCell>
                        {message.mediaUrl && (
                          <Badge variant="outline" className="capitalize">
                            {message.mediaType || 'media'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 onClick={() => handleViewSummary(message)}
                               >
                                 <BarChart3 className="w-4 h-4" />
                               </Button>
                             </DialogTrigger>
                           <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                             <DialogHeader>
                               <DialogTitle className="flex items-center gap-2">
                                 {selectedMessage && getTypeIcon(selectedMessage.type)}
                                 {selectedMessage?.subject} - Summary
                               </DialogTitle>
                             </DialogHeader>
                             {selectedMessage && (
                               <div className="space-y-6">
                                 <div className="grid grid-cols-2 gap-4 text-sm">
                                   <div>
                                     <span className="font-medium">Type:</span>
                                     <Badge variant="outline" className={`ml-2 ${getTypeColor(selectedMessage.type)}`}>
                                       {selectedMessage.type}
                                     </Badge>
                                   </div>
                                   <div>
                                     <span className="font-medium">Sent To:</span>
                                     <span className="ml-2">
                                       {selectedMessage.sentTo ? `Room: ${selectedMessage.sentTo}` : 'Broadcast'}
                                     </span>
                                   </div>
                                 </div>

                                 {summaryLoading ? (
                                   <div className="flex justify-center py-8">
                                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                   </div>
                                 ) : messageSummary ? (
                                   <div className="space-y-4">
                                     <div className="grid grid-cols-3 gap-4">
                                       <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                         <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                           {messageSummary.totalDeliveries}
                                         </div>
                                         <div className="text-sm text-blue-600 dark:text-blue-400">Total Deliveries</div>
                                       </div>
                                       <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                                         <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                           {messageSummary.totalRead}
                                         </div>
                                         <div className="text-sm text-yellow-600 dark:text-yellow-400">Total Read</div>
                                       </div>
                                       <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                         <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                           {messageSummary.totalReplied}
                                         </div>
                                         <div className="text-sm text-green-600 dark:text-green-400">Total Replied</div>
                                       </div>
                                     </div>

                                     {Object.keys(messageSummary.responses).length > 0 && (
                                       <div>
                                         <h4 className="font-medium mb-3">Question Responses</h4>
                                         <div className="space-y-4">
                                           {Object.entries(messageSummary.responses).map(([questionId, responses]) => (
                                             <div key={questionId} className="bg-muted/20 p-4 rounded-md">
                                               <h5 className="font-medium text-sm mb-2">{questionId}</h5>
                                               <div className="space-y-2">
                                                 {Object.entries(responses).map(([option, count]) => (
                                                   <div key={option} className="flex justify-between items-center text-sm">
                                                     <span>{option}</span>
                                                     <Badge variant="secondary">{count}</Badge>
                                                   </div>
                                                 ))}
                                               </div>
                                             </div>
                                           ))}
                                         </div>
                                       </div>
                                     )}

                                     <div className="flex justify-end">
                                       <Button onClick={() => handleViewResponses(selectedMessage._id)}>
                                         View All Responses
                                       </Button>
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="text-center py-8 text-muted-foreground">
                                     Failed to load summary
                                   </div>
                                 )}
                               </div>
                             )}
                           </DialogContent>
                         </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMessage(message)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this message? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMessage(message._id)}>
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
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} messages
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  disabled={pagination.offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Message Dialog */}
      <MessageFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreateMessage}
      />

      {/* Edit Message Dialog */}
      <MessageFormDialog
        open={!!editingMessage}
        onOpenChange={(open) => !open && setEditingMessage(null)}
        message={editingMessage}
        onSave={handleUpdateMessage}
      />
    </div>
  );
};

export default GuestMessages;