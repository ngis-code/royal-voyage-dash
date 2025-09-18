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
    ip: channel?.ip || "",
    ipBroadcastType: channel?.ipBroadcastType || "udp",
    port: channel?.port || "",
  })
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
        ip: channel.ip,
        ipBroadcastType: channel.ipBroadcastType,
        port: channel.port,
      })
    } else {
      // Reset form for new channel
      setFormData({
        name: "",
        category: "",
        channelType: "ip",
        description: "",
        imgUrl: "",
        ip: "",
        ipBroadcastType: "udp",
        port: "",
      })
    }
  }, [channel, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (channel) {
        await updateChannel(channel._id, formData)
        toast({
          title: "Success",
          description: "Channel updated successfully",
        })
      } else {
        await createChannel(formData)
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
            <Label htmlFor="imgUrl" className="text-foreground">Image URL</Label>
            <Input
              id="imgUrl"
              value={formData.imgUrl}
              onChange={(e) => handleChange('imgUrl', e.target.value)}
              placeholder="/images/channel.png"
              className="bg-card border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ip" className="text-foreground">IP Address</Label>
              <Input
                id="ip"
                value={formData.ip}
                onChange={(e) => handleChange('ip', e.target.value)}
                required
                className="bg-card border-border"
              />
            </div>
            <div>
              <Label htmlFor="port" className="text-foreground">Port</Label>
              <Input
                id="port"
                value={formData.port}
                onChange={(e) => handleChange('port', e.target.value)}
                required
                className="bg-card border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channelType" className="text-foreground">Channel Type</Label>
              <Select value={formData.channelType} onValueChange={(value) => handleChange('channelType', value)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="cable">Cable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ipBroadcastType" className="text-foreground">Broadcast Type</Label>
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
          </div>

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