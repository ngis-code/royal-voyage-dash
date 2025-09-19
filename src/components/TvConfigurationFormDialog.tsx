import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TvConfiguration } from "@/services/tvConfigurationApi";

const formSchema = z.object({
  macAddress: z.string().min(1, "MAC Address is required").regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC Address format"),
  serial_id: z.string().min(1, "Serial ID is required"),
  room_id: z.string().min(1, "Room ID is required"),
});

const editFormSchema = z.object({
  macAddress: z.string().optional(),
  serial_id: z.string().min(1, "Serial ID is required"),
  room_id: z.string().min(1, "Room ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface TvConfigurationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
  initialData?: TvConfiguration | null;
  isLoading?: boolean;
}

export function TvConfigurationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: TvConfigurationFormDialogProps) {
  const isEditing = !!initialData;
  const currentSchema = isEditing ? editFormSchema : formSchema;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      macAddress: "",
      serial_id: "",
      room_id: "",
    },
  });

  // Reset form when dialog opens with new data
  React.useEffect(() => {
    if (open) {
      form.reset({
        macAddress: initialData?._id || "",
        serial_id: initialData?.serial_id || "",
        room_id: initialData?.room_id || "",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit TV Configuration" : "Add New TV Configuration"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="macAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MAC Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="AA:BB:CC:DD:EE:FF" 
                      {...field} 
                      disabled={!!initialData} // Disable when editing
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serial_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter serial ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="room_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter room/cabin ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}