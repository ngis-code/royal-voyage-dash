import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tv, Signal, Settings, Plus, RefreshCw } from "lucide-react"
import { getChannels, getHealth, Channel } from "@/services/channelApi"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)
  const [healthData, setHealthData] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchChannels()
    fetchHealth()
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

  const fetchHealth = async () => {
    try {
      setHealthLoading(true)
      const response = await getHealth()
      setHealthData(response.payload)
    } catch (error) {
      console.error('Failed to fetch health:', error)
      setHealthData(null)
    } finally {
      setHealthLoading(false)
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
            <Settings className={`h-4 w-4 ${healthData?.status === 'ok' ? 'text-success' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {healthLoading ? "..." : (healthData?.status === 'ok' ? "Healthy" : "Issues")}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthData?.status === 'ok' ? "All services operational" : "Some services down"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-gradient-card border-border shadow-card-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-card-foreground">System Information</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchHealth}
              disabled={healthLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${healthData?.services?.mongo?.status === 'up' ? 'bg-success' : 'bg-destructive'}`}></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Database (MongoDB)</p>
                <p className="text-xs text-muted-foreground">
                  {healthLoading ? "Checking..." : (healthData?.services?.mongo?.status === 'up' ? "Connected and operational" : "Connection failed")}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${healthData?.services?.redis?.status === 'up' ? 'bg-success' : 'bg-destructive'}`}></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Cache (Redis)</p>
                <p className="text-xs text-muted-foreground">
                  {healthLoading ? "Checking..." : (healthData?.services?.redis?.status === 'up' ? "Connected and operational" : "Connection failed")}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${healthData?.optionalServices?.typesense?.status === 'up' ? 'bg-success' : healthData?.optionalServices?.typesense?.status === 'down' ? 'bg-destructive' : 'bg-muted'}`}></div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Search (Typesense)</p>
                <p className="text-xs text-muted-foreground">
                  {healthLoading ? "Checking..." : (
                    healthData?.optionalServices?.typesense?.status === 'up' ? "Connected and operational" : "Optional service"
                  )}
                </p>
              </div>
            </div>
            {healthData && healthData.timestamp && (
              <div className="mt-4 p-3 bg-muted/10 border border-muted/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Last checked: {new Date(healthData.timestamp).toLocaleString()}
                </p>
              </div>
            )}
            {(!healthData || healthData.status !== 'ok') && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">System Health Issue</p>
                <p className="text-xs text-destructive/80 mt-1">
                  One or more backend services are experiencing issues
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={fetchHealth}
                >
                  Refresh Status
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