import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          CabinDesign: "",
          CabinType: "",
          CabinTypeDesc: "",
          MusterStation: "",
          MusterStationDesc: "",
          CabinStatus: "",
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
              <Input id="Cabin" {...register("Cabin")} />
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
              <Input id="CabinDesign" {...register("CabinDesign")} />
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
              <Label htmlFor="MusterStationDesc">Muster Station Description</Label>
              <Input id="MusterStationDesc" {...register("MusterStationDesc")} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="CabinStatus">Cabin Status</Label>
              <Input id="CabinStatus" {...register("CabinStatus")} />
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
