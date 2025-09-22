import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createChannel, updateChannel, Channel, CreateChannelRequest } from "@/services/channelApi"
import { uploadImage, updateImage, getImageUrl, deleteImage } from "@/services/imageUploadApi"
import { X, Upload, Image as ImageIcon } from "lucide-react"

interface ChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel?: Channel
  onSuccess: () => void
}

export const ChannelDialog = ({ open, onOpenChange, channel, onSuccess }: ChannelDialogProps) => {
  const [formData, setFormData] = useState<CreateChannelRequest>({
    name: channel?.name || "",
    category: channel?.category || "",
    channelType: channel?.channelType || "ip",
    description: channel?.description || "",
    imgUrl: channel?.imgUrl || "",
    status: channel?.status || "active",
    // IP fields
    ip: channel?.ip || "",
    ipBroadcastType: channel?.ipBroadcastType || "udp",
    port: channel?.port || "",
    // RF fields
    majorNumber: channel?.majorNumber || "",
    minorNumber: channel?.minorNumber || "",
    rfBroadcastType: channel?.rfBroadcastType || "cable",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Update form data when channel prop changes
  useEffect(() => {
    if (channel) {
      setFormData({
        name: channel.name,
        category: channel.category,
        channelType: channel.channelType,
        description: channel.description,
        imgUrl: channel.imgUrl,
        status: channel.status,
        // IP fields
        ip: channel.ip || "",
        ipBroadcastType: channel.ipBroadcastType || "udp",
        port: channel.port || "",
        // RF fields
        majorNumber: channel.majorNumber || "",
        minorNumber: channel.minorNumber || "",
        rfBroadcastType: channel.rfBroadcastType || "cable",
      })
      setImagePreview(channel.imgUrl ? getImageUrl(channel.imgUrl) : "")
    } else {
      // Reset form for new channel
      setFormData({
        name: "",
        category: "",
        channelType: "ip",
        description: "",
        imgUrl: "",
        status: "active",
        // IP fields
        ip: "",
        ipBroadcastType: "udp",
        port: "",
        // RF fields
        majorNumber: "",
        minorNumber: "",
        rfBroadcastType: "cable",
      })
      setImagePreview("")
    }
    setSelectedFile(null)
  }, [channel, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalFormData = { ...formData }

      // Handle image upload
      if (selectedFile) {
        if (channel && formData.imgUrl) {
          // Update existing image
          const uploadResponse = await updateImage(formData.imgUrl, selectedFile)
          finalFormData.imgUrl = uploadResponse.filename
        } else {
          // Upload new image
          const uploadResponse = await uploadImage(selectedFile)
          finalFormData.imgUrl = uploadResponse.filename
        }
      }

      if (channel) {
        await updateChannel(channel._id, finalFormData)
        toast({
          title: "Success",
          description: "Channel updated successfully",
        })
      } else {
        await createChannel(finalFormData)
        toast({
          title: "Success",
          description: "Channel created successfully",
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${channel ? 'update' : 'create'} channel`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateChannelRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview("")
    setFormData(prev => ({ ...prev, imgUrl: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {channel ? 'Edit Channel' : 'Create New Channel'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {channel ? 'Update channel information' : 'Add a new channel to your IPTV lineup'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Channel Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="bg-card border-border"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-foreground">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                className="bg-card border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channelType" className="text-foreground">Channel Type</Label>
              <Select value={formData.channelType} onValueChange={(value) => handleChange('channelType', value as "ip" | "rf")}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="rf">RF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value as "active" | "inactive")}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="bg-card border-border"
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-foreground">Channel Image</Label>
            {imagePreview || formData.imgUrl ? (
              <div className="space-y-2">
                <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview || (formData.imgUrl ? getImageUrl(formData.imgUrl) : "")} 
                    alt="Channel preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="border-border bg-card"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Change Image
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload channel image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {formData.channelType === "ip" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ip" className="text-foreground">IP Address</Label>
                  <Input
                    id="ip"
                    value={formData.ip || ""}
                    onChange={(e) => handleChange('ip', e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="port" className="text-foreground">Port</Label>
                  <Input
                    id="port"
                    value={formData.port || ""}
                    onChange={(e) => handleChange('port', e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ipBroadcastType" className="text-foreground">IP Broadcast Type</Label>
                <Select value={formData.ipBroadcastType} onValueChange={(value) => handleChange('ipBroadcastType', value)}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="multicast">Multicast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formData.channelType === "rf" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="majorNumber" className="text-foreground">Major Number</Label>
                  <Input
                    id="majorNumber"
                    value={formData.majorNumber || ""}
                    onChange={(e) => handleChange('majorNumber', e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="minorNumber" className="text-foreground">Minor Number</Label>
                  <Input
                    id="minorNumber"
                    value={formData.minorNumber || ""}
                    onChange={(e) => handleChange('minorNumber', e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rfBroadcastType" className="text-foreground">RF Broadcast Type</Label>
                <Select value={formData.rfBroadcastType} onValueChange={(value) => handleChange('rfBroadcastType', value)}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="cable">Cable</SelectItem>
                    <SelectItem value="antenna">Antenna</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary text-white">
              {loading ? 'Saving...' : (channel ? 'Update Channel' : 'Create Channel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}