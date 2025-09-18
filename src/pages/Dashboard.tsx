import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tv, Signal, Settings, Plus } from "lucide-react"
import { getChannels, Channel } from "@/services/channelApi"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      setLoading(true)
      const response = await getChannels()
      setChannels(response.payload.documents)
      setApiConnected(true)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      setApiConnected(false)
      toast({
        title: "Connection Error",
        description: "Unable to connect to channel API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const activeChannels = channels.filter(c => c.status === "active").length
  const totalChannels = channels.length

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">IPTV Dashboard</h1>
          <p className="text-muted-foreground mt-1">Royal Caribbean Broadcasting Control Center</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-border"
            onClick={() => navigate('/channels')}
          >
            <Tv className="w-4 h-4 mr-2" />
            Manage Channels
          </Button>
          <Button 
            className="bg-gradient-primary text-white shadow-glow hover:shadow-professional transition-all duration-300"
            onClick={() => navigate('/channels')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Channels</CardTitle>
            <Tv className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loading ? "..." : totalChannels}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalChannels === 0 ? "No channels configured" : "Configured channels"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Channels</CardTitle>
            <Signal className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loading ? "..." : activeChannels}
            </div>
            <p className="text-xs text-muted-foreground">Live broadcasts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">API Status</CardTitle>
            <Signal className={`h-4 w-4 ${apiConnected ? 'text-success' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loading ? "..." : (apiConnected ? "Connected" : "Disconnected")}
            </div>
            <p className="text-xs text-muted-foreground">Backend connection</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">System Status</CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {loading ? "..." : "Online"}
            </div>
            <p className="text-xs text-muted-foreground">Frontend operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader>
            <CardTitle className="text-card-foreground">Channel Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="animate-pulse h-4 bg-muted rounded"></div>
                <div className="animate-pulse h-4 bg-muted rounded"></div>
                <div className="animate-pulse h-4 bg-muted rounded"></div>
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-6">
                <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No channels configured yet</p>
                <Button 
                  onClick={() => navigate('/channels')}
                  className="bg-gradient-primary text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Channel
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {channels.slice(0, 3).map((channel) => (
                  <div key={channel._id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        channel.status === 'active' ? 'bg-success' : 'bg-muted'
                      }`}></div>
                      <span className="font-medium text-card-foreground">{channel.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {channel.channelType.toUpperCase()} • {channel.status}
                    </span>
                  </div>
                ))}
                {channels.length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => navigate('/channels')}
                  >
                    View All {channels.length} Channels
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader>
            <CardTitle className="text-card-foreground">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${apiConnected ? 'bg-success' : 'bg-destructive'}`}></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">API Connection</p>
                <p className="text-xs text-muted-foreground">
                  {apiConnected ? "Connected to backend API" : "Connection failed"}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Frontend Status</p>
                <p className="text-xs text-muted-foreground">Application running normally</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Channel Management</p>
                <p className="text-xs text-muted-foreground">Ready for configuration</p>
              </div>
            </div>
            {!apiConnected && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">Connection Issue</p>
                <p className="text-xs text-destructive/80 mt-1">
                  Check your API configuration and network connection
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={fetchChannels}
                >
                  Retry Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard