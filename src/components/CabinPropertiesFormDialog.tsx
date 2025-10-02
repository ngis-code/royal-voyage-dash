import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CabinProperties } from "@/services/cabinPropertiesApi";

interface CabinPropertiesFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<CabinProperties>) => void;
  property?: CabinProperties | null;
}

export function CabinPropertiesFormDialog({
  open,
  onOpenChange,
  onSubmit,
  property,
}: CabinPropertiesFormDialogProps) {
  const { register, handleSubmit, reset } = useForm<Partial<CabinProperties>>();

  useEffect(() => {
    if (open) {
      if (property) {
        reset(property);
      } else {
        reset({
          Cabin: "",
          Deck: "",
          DeckDesc: "",
          CabinDesign: undefined,
          CabinType: "",
          CabinTypeDesc: "",
          MusterStation: "",
          MusterStatusDesc: "",
          CabinStatus: "",
          Starboard: undefined,
          VZone: "",
        });
      }
    }
  }, [open, property, reset]);

  const handleFormSubmit = (data: Partial<CabinProperties>) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? "Edit Cabin Property" : "Create Cabin Property"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Cabin">Cabin</Label>
              <Input id="Cabin" {...register("Cabin")} disabled={!!property} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Deck">Deck</Label>
              <Input id="Deck" {...register("Deck")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="DeckDesc">Deck Description</Label>
              <Input id="DeckDesc" {...register("DeckDesc")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="CabinDesign">Cabin Design</Label>
              <Select
                value={property?.CabinDesign || ""}
                onValueChange={(value) => {
                  reset({ ...property, CabinDesign: value as "P" | "C" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P">P - Passenger</SelectItem>
                  <SelectItem value="C">C - Crew</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="CabinType">Cabin Type</Label>
              <Input id="CabinType" {...register("CabinType")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="CabinTypeDesc">Cabin Type Description</Label>
              <Input id="CabinTypeDesc" {...register("CabinTypeDesc")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="MusterStation">Muster Station</Label>
              <Input id="MusterStation" {...register("MusterStation")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="MusterStatusDesc">Muster Status Description</Label>
              <Input id="MusterStatusDesc" {...register("MusterStatusDesc")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="CabinStatus">Cabin Status</Label>
              <Input id="CabinStatus" {...register("CabinStatus")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Starboard">Side</Label>
              <Select
                value={property?.Starboard || ""}
                onValueChange={(value) => {
                  reset({ ...property, Starboard: value as "0" | "1" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - Starboard</SelectItem>
                  <SelectItem value="1">1 - Portside</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="VZone">VZone</Label>
              <Input id="VZone" {...register("VZone")} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{property ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
