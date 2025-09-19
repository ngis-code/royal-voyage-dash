import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2, Wifi, AlertTriangle, Search, X } from "lucide-react";
import {
  listTvConfigurations,
  createTvConfiguration,
  updateTvConfiguration,
  deleteTvConfiguration,
  TvConfiguration,
} from "@/services/tvConfigurationApi";
import { TvConfigurationFormDialog } from "@/components/TvConfigurationFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Devices() {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<TvConfiguration | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<TvConfiguration | null>(null);
  const [macAddressFilter, setMacAddressFilter] = useState("");
  const [roomIdFilter, setRoomIdFilter] = useState("");
  const queryClient = useQueryClient();

  // Build filter object
  const filter: Record<string, any> = {};
  if (macAddressFilter.trim()) {
    filter._id = macAddressFilter.trim();
  }
  if (roomIdFilter.trim()) {
    filter.room_id = roomIdFilter.trim();
  }

  const { data: devicesResponse, isLoading } = useQuery({
    queryKey: ["tv-configurations", filter],
    queryFn: () => listTvConfigurations({ 
      sort: { createdAt: "desc" },
      filter: Object.keys(filter).length > 0 ? filter : undefined
    }),
  });

  const createMutation = useMutation({
    mutationFn: ({ macAddress, serial_id, room_id }: { macAddress: string; serial_id: string; room_id: string }) =>
      createTvConfiguration(macAddress, { serial_id, room_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv-configurations"] });
      setFormDialogOpen(false);
      setEditingDevice(null);
      toast({
        title: "Success",
        description: "TV configuration created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create TV configuration",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ macAddress, serial_id, room_id }: { macAddress: string; serial_id: string; room_id: string }) =>
      updateTvConfiguration(macAddress, { serial_id, room_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv-configurations"] });
      setFormDialogOpen(false);
      setEditingDevice(null);
      toast({
        title: "Success",
        description: "TV configuration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update TV configuration",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (macAddress: string) => deleteTvConfiguration(macAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv-configurations"] });
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
      toast({
        title: "Success",
        description: "TV configuration deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete TV configuration",
      });
    },
  });

  const handleFormSubmit = async ({ macAddress, serial_id, room_id }: { macAddress: string; serial_id: string; room_id: string }) => {
    if (editingDevice) {
      await updateMutation.mutateAsync({ macAddress, serial_id, room_id });
    } else {
      await createMutation.mutateAsync({ macAddress, serial_id, room_id });
    }
  };

  const handleEdit = (device: TvConfiguration) => {
    setEditingDevice(device);
    setFormDialogOpen(true);
  };

  const handleDelete = (device: TvConfiguration) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deviceToDelete) {
      deleteMutation.mutate(deviceToDelete._id);
    }
  };

  const clearFilters = () => {
    setMacAddressFilter("");
    setRoomIdFilter("");
  };

  const devices = devicesResponse?.payload?.documents || [];
  const canAccessAll = devicesResponse?.payload?.canAccessAllDocuments ?? false;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">TV Device Management</h1>
          <p className="text-muted-foreground">Manage TV configurations for all cabins</p>
        </div>
        <Button onClick={() => setFormDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Device
        </Button>
      </div>

      {!isLoading && devicesResponse && !canAccessAll && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Limited Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              You don't have access to all TV configurations. Some devices may not be visible.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                placeholder="Filter by MAC address..."
                value={macAddressFilter}
                onChange={(e) => setMacAddressFilter(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="roomId">Room/Cabin ID</Label>
              <Input
                id="roomId"
                placeholder="Filter by room/cabin ID..."
                value={roomIdFilter}
                onChange={(e) => setRoomIdFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!macAddressFilter && !roomIdFilter}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            TV Configurations ({devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <Wifi className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No TV configurations found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first TV device configuration.
              </p>
              <Button onClick={() => setFormDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Serial ID</TableHead>
                  <TableHead>Room/Cabin ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device._id}>
                    <TableCell className="font-mono">{device._id}</TableCell>
                    <TableCell>{device.serial_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.room_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(device.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(device)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(device)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TvConfigurationFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) {
            setEditingDevice(null);
          }
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDevice}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete TV Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the TV configuration for device{" "}
              <span className="font-mono font-semibold">{deviceToDelete?._id}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}