import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Save, Loader2, Upload, Image } from "lucide-react";
import { GuestMessage } from "@/services/guestMessageApi";
import { TvMessagePreview } from "./TvMessagePreview";
import { uploadImage, getImageUrl } from "@/services/imageUploadApi";
import { useToast } from "@/components/ui/use-toast";

interface MessageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: GuestMessage | null;
  onSave: (message: Omit<GuestMessage, '_id' | 'createdAt' | 'updatedAt' | 'sentBy'>) => Promise<void>;
}

export const MessageFormDialog = ({ open, onOpenChange, message, onSave }: MessageFormDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    sentTo: "",
    type: "notification" as "action" | "survey" | "notification",
    mediaType: undefined as "image" | "video" | undefined,
    mediaOrientation: "horizontal" as "horizontal" | "vertical",
    mediaUrl: "",
    questions: [] as GuestMessage['questions'],
    tags: [] as string[],
    deleteable: true
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Reset form data when message prop changes
  useEffect(() => {
    if (message) {
      setFormData({
        subject: message.subject || "",
        description: message.description || "",
        sentTo: message.sentTo || "",
        type: message.type || "notification",
        mediaType: message.mediaType || undefined,
        mediaOrientation: message.mediaOrientation || "horizontal",
        mediaUrl: message.mediaUrl || "",
        questions: message.questions || [],
        tags: message.tags || [],
        deleteable: message.deleteable ?? true
      });
    } else {
      setFormData({
        subject: "",
        description: "",
        sentTo: "",
        type: "notification" as "action" | "survey" | "notification",
        mediaType: undefined as "image" | "video" | undefined,
        mediaOrientation: "horizontal" as "horizontal" | "vertical",
        mediaUrl: "",
        questions: [] as GuestMessage['questions'],
        tags: [] as string[],
        deleteable: true
      });
    }
    // Reset file selection when message changes
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [message]);
  
  const [newTag, setNewTag] = useState("");
  const [newQuestion, setNewQuestion] = useState({ question: "", options: [{ text: "", icon: "" }] });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      let finalMediaUrl = formData.mediaUrl;
      
      // Upload image if file is selected
      if (selectedFile) {
        try {
          const uploadResult = await uploadImage(selectedFile);
          finalMediaUrl = getImageUrl(uploadResult.filename);
          
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        } catch (error) {
          console.error('Failed to upload image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      await onSave({
        ...formData,
        mediaType: finalMediaUrl ? formData.mediaType : undefined,
        mediaUrl: finalMediaUrl || undefined,
        description: formData.description || undefined,
        sentTo: formData.sentTo || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      });
      
      // Reset file selection after successful save
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save message:', error);
      toast({
        title: "Error",
        description: "Failed to save message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const addQuestion = () => {
    if (newQuestion.question.trim()) {
      // For action type, only allow 1 question
      if (formData.type === 'action' && formData.questions.length >= 1) {
        return;
      }
      setFormData({
        ...formData,
        questions: [...formData.questions, { ...newQuestion, _id: Date.now().toString() }]
      });
      setNewQuestion({ question: "", options: [{ text: "", icon: "" }] });
    }
  };

  const removeQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q._id !== questionId)
    });
  };

  const addQuestionOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { text: "", icon: "" }]
    });
  };

  const updateQuestionOption = (index: number, field: 'text' | 'icon', value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const removeQuestionOption = (index: number) => {
    if (newQuestion.options.length > 1) {
      setNewQuestion({
        ...newQuestion,
        options: newQuestion.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error", 
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
        // Auto-set media type to image and clear manual URL
        setFormData(prev => ({
          ...prev,
          mediaType: 'image',
          mediaUrl: ''
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {message ? 'Edit Message' : 'Create New Message'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 h-[calc(95vh-120px)] overflow-hidden">
          {/* Preview Pane - Left Side */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-4">TV Preview</h3>
            <div className="flex-1 min-h-0">
              <TvMessagePreview formData={formData} filePreview={filePreview} />
            </div>
          </div>

          {/* Form Pane - Right Side */}
          <div className="flex flex-col overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Message subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sentTo">Sent To (Room ID)</Label>
                      <Input
                        id="sentTo"
                        value={formData.sentTo}
                        onChange={(e) => setFormData({ ...formData, sentTo: e.target.value })}
                        placeholder="Leave empty for broadcast"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="deleteable"
                      checked={formData.deleteable}
                      onCheckedChange={(checked) => setFormData({ ...formData, deleteable: checked })}
                    />
                    <Label htmlFor="deleteable">Message can be deleted</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Media (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </Button>
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSelectedFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile && (
                      <div className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </div>
                    )}
                  </div>

                  {/* OR divider */}
                  {!selectedFile && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="text-sm text-muted-foreground">OR</span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>
                  )}

                  {/* Media URL Section */}
                  {!selectedFile && (
                    <div className="space-y-2">
                      <Label htmlFor="mediaUrl">Media URL</Label>
                      <Input
                        id="mediaUrl"
                        value={formData.mediaUrl}
                        onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  {/* Preview Section */}
                  {(filePreview || formData.mediaUrl) && (
                    <div className="mt-2">
                      {formData.mediaType === 'image' && (
                        <img 
                          src={filePreview || formData.mediaUrl} 
                          alt="Preview" 
                          className="max-w-xs max-h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      {formData.mediaType === 'video' && formData.mediaUrl && (
                        <video 
                          src={formData.mediaUrl} 
                          className="max-w-xs max-h-32 rounded border"
                          controls
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}

                  {(selectedFile || formData.mediaUrl) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Media Type</Label>
                        <Select 
                          value={formData.mediaType || ""} 
                          onValueChange={(value: any) => setFormData({ ...formData, mediaType: value || undefined })}
                          disabled={!!selectedFile} // Disable if file is selected (auto-set to image)
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select media type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Media Orientation</Label>
                        <Select value={formData.mediaOrientation} onValueChange={(value: any) => setFormData({ ...formData, mediaOrientation: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="horizontal">Horizontal</SelectItem>
                            <SelectItem value="vertical">Vertical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Questions (for action/survey types) */}
              {(formData.type === 'action' || formData.type === 'survey') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Questions
                      {formData.type === 'action' && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (Exactly 1 question required)
                        </span>
                      )}
                      {formData.type === 'survey' && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          (Multiple questions allowed)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Existing Questions */}
                    {formData.questions.map((question) => (
                      <div key={question._id} className="bg-muted/20 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{question.question}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question._id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              {option.icon && <span>{option.icon}</span>}
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* New Question Form */}
                    <div className="bg-muted/10 p-4 rounded-md space-y-3">
                      <Input
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="Enter question"
                      />
                      
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {newQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={option.text}
                              onChange={(e) => updateQuestionOption(idx, 'text', e.target.value)}
                              placeholder="Option text"
                              className="flex-1"
                            />
                            <Input
                              value={option.icon}
                              onChange={(e) => updateQuestionOption(idx, 'icon', e.target.value)}
                              placeholder="Icon"
                              className="w-20"
                            />
                            {newQuestion.options.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestionOption(idx)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={addQuestionOption}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addQuestion}
                          disabled={formData.type === 'action' && formData.questions.length >= 1}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter tag"
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button variant="outline" onClick={addTag}>
                      Add Tag
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !formData.subject.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {message ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
