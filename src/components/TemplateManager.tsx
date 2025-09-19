import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, MessageSquare, Users, Bell } from "lucide-react";
import { listGuestMessageTemplates, GuestMessageTemplate, createGuestMessageTemplate, updateGuestMessageTemplate, deleteGuestMessageTemplate } from "@/services/templateApi";
import { useToast } from "@/hooks/use-toast";
import { TemplateFormDialog } from "@/components/TemplateFormDialog";

interface TemplateManagerProps {
  onUseTemplate: (template: GuestMessageTemplate) => void;
}

const TemplateManager = ({ onUseTemplate }: TemplateManagerProps) => {
  const [templates, setTemplates] = useState<GuestMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GuestMessageTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await listGuestMessageTemplates();
      setTemplates(response.documents);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch templates",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: Omit<GuestMessageTemplate, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createGuestMessageTemplate(templateData);
      await fetchTemplates();
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    } catch (error) {
      // Error already handled by handleApiError
    }
  };

  const handleUpdateTemplate = async (templateData: Omit<GuestMessageTemplate, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTemplate) {
        await updateGuestMessageTemplate(editingTemplate._id, templateData);
        await fetchTemplates();
        setEditingTemplate(null);
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      }
    } catch (error) {
      // Error already handled by handleApiError
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteGuestMessageTemplate(templateId);
      await fetchTemplates();
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      // Error already handled by handleApiError
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <MessageSquare className="h-4 w-4" />;
      case 'survey':
        return <Users className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'action':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'survey':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'notification':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Message Templates</h3>
          </div>
          <div className="text-sm text-muted-foreground">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Message Templates</h3>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No templates found. Create your first template to get started.</p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {templates.map((template) => (
                <Card key={template._id} className="min-w-[280px] flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <h4 className="font-medium text-sm truncate">{template.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this template? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTemplate(template._id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <Badge className={`mb-2 ${getTypeColor(template.type)}`}>
                      {template.type}
                    </Badge>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{template.subject}</p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    
                    {template.tags?.length && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && <span className="text-xs text-muted-foreground">+{template.tags.length - 2}</span>}
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <TemplateFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          template={null}
          onSave={handleCreateTemplate}
        />

        <TemplateFormDialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          template={editingTemplate}
          onSave={handleUpdateTemplate}
        />
      </CardContent>
    </Card>
  );
};

export default TemplateManager;