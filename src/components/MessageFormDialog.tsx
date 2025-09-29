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
import { uploadImage, getImageUrl, deleteImage, uploadVideo, convertVideoToM3U8, deleteVideo, deleteHlsVideo, updateImage, updateVideo } from "@/services/imageUploadApi";
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
      let uploadedFilename: string | null = null;
      let uploadedVideoFilename: string | null = null;
      let convertedHlsFilename: string | null = null;
      const oldMediaUrl = message?.mediaUrl;
      
      // Upload file if selected
      if (selectedFile) {
        try {
          const isEditing = Boolean(message);
          const existingUrl = message?.mediaUrl;
          const shouldUpdateFile = isEditing && existingUrl && !existingUrl.includes('://');
          
          if (selectedFile.type.startsWith('image/')) {
            let uploadResult;
            if (shouldUpdateFile) {
              // Extract filename from existing URL (remove path prefix if present)
              const filename = existingUrl.includes('/') ? existingUrl.split('/').pop()! : existingUrl;
              uploadResult = await updateImage(filename, selectedFile);
            } else {
              uploadResult = await uploadImage(selectedFile);
            }
            finalMediaUrl = uploadResult.filename;
            uploadedFilename = uploadResult.filename;
            
            toast({
              title: "Success",
              description: "Image uploaded successfully",
            });
          } else if (selectedFile.type.startsWith('video/')) {
            // Upload video first
            let uploadResult;
            if (shouldUpdateFile && existingUrl.startsWith('/videos/')) {
              // Extract filename from existing URL
              const filename = existingUrl.split('/').pop()!;
              uploadResult = await updateVideo(filename, selectedFile);
            } else {
              uploadResult = await uploadVideo(selectedFile);
            }
            uploadedVideoFilename = uploadResult.filename;
            
            toast({
              title: "Success",
              description: "Video uploaded successfully",
            });

            // Try to convert to HLS
            try {
              const videoUrl = `/videos/${uploadResult.filename}`;
              const segmentCount = Math.max(2, Math.min(10, Math.ceil(selectedFile.size / (50 * 1024 * 1024))));
              
              const conversionResult = await convertVideoToM3U8(
                `${import.meta.env.VITE_STATIC_SERVER_URL}${videoUrl}`, 
                segmentCount
              );
              
              if (conversionResult.status === 200 && conversionResult.payload.videoVersions.length > 0) {
                const hlsPath = conversionResult.payload.videoVersions[0].path;
                finalMediaUrl = hlsPath;
                convertedHlsFilename = hlsPath;
                
                toast({
                  title: "Success",
                  description: "Video converted to HLS successfully",
                });

                // Delete the original uploaded video to save space
                if (uploadedVideoFilename) {
                  try {
                    await deleteVideo(uploadedVideoFilename);
                    uploadedVideoFilename = null; // Clear since we've deleted it
                  } catch (deletionError) {
                    console.warn('Failed to delete original video after HLS conversion:', deletionError);
                  }
                }
              } else {
                // Fallback to original video
                finalMediaUrl = videoUrl;
                uploadedFilename = uploadResult.filename;
                
                toast({
                  title: "Warning",
                  description: "Video uploaded but HLS conversion failed. Using original video.",
                  variant: "default",
                });
              }
            } catch (conversionError) {
              console.warn('Video conversion failed:', conversionError);
              // Fallback to original video
              finalMediaUrl = `/videos/${uploadResult.filename}`;
              uploadedFilename = uploadResult.filename;
              
              toast({
                title: "Warning",
                description: "Video uploaded but HLS conversion failed. Using original video.",
                variant: "default",
              });
            }
          }
        } catch (error) {
          console.error('Failed to upload file:', error);
          toast({
            title: "Error",
            description: "Failed to upload file. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      try {
        await onSave({
          ...formData,
          mediaType: finalMediaUrl ? formData.mediaType : undefined,
          mediaUrl: finalMediaUrl || undefined,
          description: formData.description || undefined,
          sentTo: formData.sentTo || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined
        });
        
        // If we're updating and there's a new file, delete the old one
        if (message && (uploadedFilename || convertedHlsFilename) && oldMediaUrl && oldMediaUrl !== finalMediaUrl) {
          try {
            const oldFilename = oldMediaUrl.includes('/') ? oldMediaUrl.split('/').pop() : oldMediaUrl;
            if (oldFilename) {
              // Check if old file is HLS or regular media
              if (oldMediaUrl.endsWith('.m3u8')) {
                await deleteHlsVideo(oldFilename);
              } else if (oldMediaUrl.startsWith('/videos/')) {
                await deleteVideo(oldFilename);
              } else {
                await deleteImage(oldFilename);
              }
            }
          } catch (deleteError) {
            console.warn('Failed to delete old file:', deleteError);
            toast({
              title: "Warning",
              description: "Failed to delete old file, but message was saved successfully.",
              variant: "default",
            });
          }
        }
        
        // Reset file selection after successful save
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        onOpenChange(false);
      } catch (saveError) {
        // If message save fails but we uploaded files, clean them up
        if (uploadedFilename) {
          try {
            if (selectedFile?.type.startsWith('image/')) {
              await deleteImage(uploadedFilename);
            } else if (selectedFile?.type.startsWith('video/')) {
              await deleteVideo(uploadedFilename);
            }
          } catch (cleanupError) {
            console.warn('Failed to cleanup uploaded file:', cleanupError);
          }
        }
        if (uploadedVideoFilename) {
          try {
            await deleteVideo(uploadedVideoFilename);
          } catch (cleanupError) {
            console.warn('Failed to cleanup uploaded video:', cleanupError);
          }
        }
        if (convertedHlsFilename) {
          try {
            await deleteHlsVideo(convertedHlsFilename);
          } catch (cleanupError) {
            console.warn('Failed to cleanup converted HLS:', cleanupError);
          }
        }
        throw saveError; // Re-throw to trigger the error handling below
      }
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
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: "Error",
          description: "Please select an image or video file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 100MB for videos, 10MB for images)
      const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Error", 
          description: `File size must be less than ${file.type.startsWith('video/') ? '100MB' : '10MB'}`,
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
        // Auto-set media type and clear manual URL
        setFormData(prev => ({
          ...prev,
          mediaType: file.type.startsWith('image/') ? 'image' : 'video',
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
                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <Label>Upload Image or Video</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
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
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile && (
                      <div className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({Math.round(selectedFile.size / (1024 * 1024))} MB)
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
