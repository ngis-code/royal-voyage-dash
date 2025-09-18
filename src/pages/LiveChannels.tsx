import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Play, Users, Signal, Tv } from "lucide-react"
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

// Mock data for development
const mockChannels = [
  {
    id: 1,
    name: "RC Sports HD",
    category: "Sports",
    status: "active",
    viewers: 1420,
    quality: "1080p",
    bandwidth: "8.5 Mbps",
    thumbnail: "https://picsum.photos/400/225?random=1"
  },
  {
    id: 2,
    name: "RC News 24/7",
    category: "News",
    status: "active",
    viewers: 890,
    quality: "720p",
    bandwidth: "5.2 Mbps",
    thumbnail: "https://picsum.photos/400/225?random=2"
  },
  {
    id: 3,
    name: "RC Entertainment",
    category: "Entertainment",
    status: "maintenance",
    viewers: 0,
    quality: "1080p",
    bandwidth: "0 Mbps",
    thumbnail: "https://picsum.photos/400/225?random=3"
  },
  {
    id: 4,
    name: "RC Movies Premium",
    category: "Movies",
    status: "active",
    viewers: 2150,
    quality: "4K",
    bandwidth: "15.8 Mbps",
    thumbnail: "https://picsum.photos/400/225?random=4"
  },
  {
    id: 5,
    name: "RC Kids Zone",
    category: "Kids",
    status: "active",
    viewers: 670,
    quality: "720p",
    bandwidth: "4.1 Mbps",
    thumbnail: "https://picsum.photos/400/225?random=5"
  },
  {
    id: 6,
    name: "RC Documentary",
    category: "Documentary",
    status: "offline",
    viewers: 0,
    quality: "1080p",
    bandwidth: "0 Mbps",
    thumbnail: "https://picsum.photos/400/225?random=6"
  }
]

const LiveChannels = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Live</Badge>
      case "maintenance":
        return <Badge className="bg-warning text-warning-foreground">Maintenance</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredChannels = mockChannels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || channel.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Channels</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your IPTV channel lineup</p>
        </div>
        <Button className="bg-gradient-primary text-white shadow-glow hover:shadow-professional transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Channel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Channels</CardTitle>
            <Tv className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockChannels.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Streams</CardTitle>
            <Signal className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {mockChannels.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Live broadcasting</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Viewers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {mockChannels.reduce((sum, channel) => sum + channel.viewers, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all channels</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Bandwidth Usage</CardTitle>
            <Play className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {mockChannels.reduce((sum, channel) => {
                return sum + parseFloat(channel.bandwidth.replace(' Mbps', ''))
              }, 0).toFixed(1)} Mbps
            </div>
            <p className="text-xs text-muted-foreground">Current usage</p>
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
          <Card key={channel.id} className="bg-gradient-card border-border shadow-card-shadow hover:shadow-professional transition-all duration-300 group overflow-hidden">
            <div className="relative">
              <img 
                src={channel.thumbnail} 
                alt={channel.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                {getStatusBadge(channel.status)}
              </div>
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem>Edit Channel</DropdownMenuItem>
                    <DropdownMenuItem>View Analytics</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Channel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {channel.status === "active" && (
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
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quality</p>
                    <p className="font-medium text-card-foreground">{channel.quality}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Viewers</p>
                    <p className="font-medium text-card-foreground">{channel.viewers.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">{channel.bandwidth}</span>
                  <Button size="sm" variant="outline" className="border-border">
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default LiveChannels