import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, Signal, Tv, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getChannels, deleteChannel, Channel } from "@/services/channelApi"
import { ChannelDialog } from "@/components/ChannelDialog"

const LiveChannels = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<Channel | undefined>()
  const { toast } = useToast()

  // Fetch channels from API
  useEffect(() => {
    fetchChannels()
  }, [toast])

  const getStatusBadge = (channel: Channel) => {
    // Determine status based on channel data - you can customize this logic
    const isActive = channel.channelType === "ip" 
      ? (channel.ip && channel.port)
      : (channel.majorNumber && channel.minorNumber)
    if (isActive) {
      return <Badge className="bg-success text-success-foreground">Live</Badge>
    }
    return <Badge variant="destructive">Offline</Badge>
  }

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || channel.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const activeChannels = channels.filter(c => 
    c.channelType === "ip" 
      ? (c.ip && c.port)
      : (c.majorNumber && c.minorNumber)
  ).length

  const handleCreateChannel = () => {
    setEditingChannel(undefined)
    setDialogOpen(true)
  }

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel)
    setDialogOpen(true)
  }

  const handleDeleteChannel = (channel: Channel) => {
    setChannelToDelete(channel)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!channelToDelete) return

    try {
      await deleteChannel(channelToDelete._id)
      toast({
        title: "Success",
        description: "Channel deleted successfully",
      })
      fetchChannels()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete channel",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setChannelToDelete(undefined)
    }
  }

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await getChannels()
      setChannels(response.payload.documents)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      toast({
        title: "Error",
        description: "Failed to load channels. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading channels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Channels</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your IPTV channel lineup</p>
        </div>
        <Button onClick={handleCreateChannel} className="bg-gradient-primary text-white shadow-glow hover:shadow-professional transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Channels</CardTitle>
            <Tv className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{channels.length}</div>
            <p className="text-xs text-muted-foreground">Loaded from API</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Streams</CardTitle>
            <Signal className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{activeChannels}</div>
            <p className="text-xs text-muted-foreground">Live broadcasting</p>
          </CardContent>
        </Card>

      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Button variant="outline" className="border-border bg-card">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChannels.map((channel) => (
          <Card key={channel._id} className="bg-gradient-card border-border shadow-card-shadow hover:shadow-professional transition-all duration-300 group overflow-hidden">
            <div className="relative">
              <img 
                src={channel.imgUrl.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${channel.imgUrl}` : channel.imgUrl}
                alt={channel.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Set a default placeholder if image fails to load
                  e.currentTarget.src = 'https://via.placeholder.com/400x225/1a1a1a/white?text=No+Image'
                }}
              />
              <div className="absolute top-3 left-3">
                {getStatusBadge(channel)}
              </div>
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => handleEditChannel(channel)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Channel
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteChannel(channel)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Channel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {((channel.channelType === "ip" && channel.ip && channel.port) || 
                (channel.channelType === "rf" && channel.majorNumber && channel.minorNumber)) && (
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/70 px-2 py-1 rounded-md flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs">LIVE</span>
                  </div>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-card-foreground">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground">{channel.category}</p>
                </div>
                
                {channel.channelType === "ip" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-medium text-card-foreground">{channel.ip || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Port</p>
                      <p className="font-medium text-card-foreground">{channel.port || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {channel.channelType === "rf" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Major Number</p>
                      <p className="font-medium text-card-foreground">{channel.majorNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Minor Number</p>
                      <p className="font-medium text-card-foreground">{channel.minorNumber || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium text-card-foreground">{channel.channelType?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Broadcast</p>
                    <p className="font-medium text-card-foreground">
                      {channel.channelType === "ip" 
                        ? (channel.ipBroadcastType?.toUpperCase() || 'N/A')
                        : (channel.rfBroadcastType?.toUpperCase() || 'N/A')
                      }
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">{channel.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Updated: {new Date(channel.updatedAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" className="border-border">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ChannelDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        channel={editingChannel}
        onSuccess={fetchChannels}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Channel</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{channelToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default LiveChannels