import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AdDocument, createAd, updateAd } from "@/services/adApi";
import { convertVideoToM3U8, deleteImage, deleteVideo, deleteHlsVideo, updateImage, uploadImage } from "@/services/imageUploadApi";
import { useRef, useState, useEffect } from "react";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

interface AdFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  ad?: AdDocument;
}

export default function AdFormDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  ad
}: AdFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    _id: ad?._id || "",
    campaign_id: ad?.campaign_id || "",
    advertiser_id: ad?.advertiser_id || "",
    ad_format: ad?.ad_format || undefined,
    ad_url: ad?.ad_url || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(ad?.ad_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form data when ad prop changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        _id: ad?._id || "",
        campaign_id: ad?.campaign_id || "",
        advertiser_id: ad?.advertiser_id || "",
        ad_format: ad?.ad_format || undefined,
        ad_url: ad?.ad_url || "",
      });
      if(ad?.ad_url && ad.ad_url.startsWith('http')) {
        setPreviewUrl(ad.ad_url || null);
      }else{
        const adUrl = ad.ad_url.startsWith('/') ? ad.ad_url : `/${ad.ad_url}`;
        setPreviewUrl(`${import.meta.env.VITE_STATIC_SERVER_URL}${adUrl}` || null);
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [ad, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Determine format based on file type
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, ad_format: 'image' }));
      } else if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, ad_format: 'video' }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, ad_url: "", ad_format: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalAdUrl = formData.ad_url;
      let fileName = "";

      // Delete old HLS video if we're updating and have a new file or URL
      if (ad && ad.ad_url && (selectedFile || (formData.ad_url && formData.ad_url !== ad.ad_url))) {
        // Check if old URL is an HLS video
        if (ad.ad_url.includes('/hls/')) {
          const oldFilename = ad.ad_url.split('/').pop()?.split('.')[0];
          if (oldFilename) {
            try {
              await deleteHlsVideo(oldFilename);
            } catch (error) {
              console.warn('Failed to delete old HLS video:', error);
            }
          }
        }
      }

      // Handle file upload/update
      if (selectedFile) {
        if (ad?.ad_url && !ad.ad_url.startsWith('http')) {
          // Update existing file
          const filename = ad.ad_url.split('/').pop();
          if (filename) {
            const uploadResponse = await updateImage(filename, selectedFile);
            fileName = uploadResponse.filename;
            finalAdUrl = `${import.meta.env.VITE_STATIC_SERVER_URL}/videos/${uploadResponse.filename}`;
          }
        } else {
          // Upload new file
          const uploadResponse = await uploadImage(selectedFile);
          fileName = uploadResponse.filename;
          finalAdUrl = `/videos/${uploadResponse.filename}`;

          // Delete old file if exists and it's from our storage
          if (ad?.ad_url && !ad.ad_url.startsWith('http')) {
            const oldFilename = ad.ad_url.split('/').pop();
            if (oldFilename) {
              try {
                await deleteImage(oldFilename);
              } catch (error) {
                console.warn('Failed to delete old file:', error);
                toast({
                  title: "Warning",
                  description: "Failed to delete old file, but continuing with update",
                  variant: "default",
                });
              }
            }
          }
        }

        // If it's a video file, try to convert it to m3u8
        if (selectedFile.type.startsWith('video/')) {
          try {
            // Calculate segment count based on file size (rough estimate)
            const fileSizeMB = selectedFile.size / (1024 * 1024);
            const segmentCount = Math.max(2, Math.min(10, Math.ceil(fileSizeMB / 10)));

            const conversionResponse = await convertVideoToM3U8(`${import.meta.env.VITE_STATIC_SERVER_URL}${finalAdUrl}`, segmentCount);

            if (conversionResponse.payload.videoVersions.length > 0) {
              const m3u8Version = conversionResponse.payload.videoVersions[0];
              const fileName = m3u8Version.path.split('/').pop().split('.').slice(0, -1).join('.');
              finalAdUrl = `/hls/${fileName}/${m3u8Version.path}`;
            }

            // Delete the original uploaded video file after conversion
            try {
              await deleteVideo(fileName);
            } catch (error) {
              console.warn('Failed to delete original video file after conversion:', error);
              toast({
                title: "Warning",
                description: "Failed to delete original video file after conversion",
                variant: "default",
              });
            }
          } catch (error) {
            console.warn('Video conversion failed:', error);
            toast({
              title: "Warning",
              description: "Video conversion failed, using original video file",
              variant: "default",
            });
            // Continue with original video URL
          }
        }
      }

      const adData: Partial<Omit<AdDocument, '_id' | 'createdAt' | 'updatedAt'>> & { _id?: string } = {
        campaign_id: formData.campaign_id || undefined,
        advertiser_id: formData.advertiser_id || undefined,
        ad_format: formData.ad_format || undefined,
        ad_url: finalAdUrl || undefined,
        _id: formData._id || undefined,
      };

      if (ad) {
        await updateAd(ad._id, adData);
        toast({
          title: "Success",
          description: "Ad updated successfully",
        });
      } else {
        const createData = {
          _id: formData._id || undefined,
          campaign_id: formData.campaign_id || undefined,
          advertiser_id: formData.advertiser_id || undefined,
          ad_format: formData.ad_format || undefined,
          ad_url: finalAdUrl || undefined,
        };
        await createAd(createData);
        toast({
          title: "Success",
          description: "Ad created successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{ad ? "Edit Ad" : "Create New Ad"}</DialogTitle>
          <DialogDescription>
            {ad ? "Update the ad information below" : "Fill in the details to create a new ad"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad_id">Ad ID (optional)</Label>
            <Input
              id="ad_id"
              value={formData._id}
              onChange={(e) => setFormData(prev => ({ ...prev, _id: e.target.value }))}
              placeholder="Leave empty for auto-generation"
              disabled={!!ad}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_id">Campaign ID</Label>
            <Input
              id="campaign_id"
              value={formData.campaign_id}
              onChange={(e) => setFormData(prev => ({ ...prev, campaign_id: e.target.value }))}
              placeholder="Marketing campaign group ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advertiser_id">Advertiser ID</Label>
            <Input
              id="advertiser_id"
              value={formData.advertiser_id}
              onChange={(e) => setFormData(prev => ({ ...prev, advertiser_id: e.target.value }))}
              placeholder="Advertiser identifier"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad_format">Ad Format</Label>
            <Select
              value={formData.ad_format}
              onValueChange={(value: "image" | "video") => setFormData(prev => ({ ...prev, ad_format: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ad format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ad Media</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="flex-1"
              />
              {previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  Remove
                </Button>
              )}
            </div>

            {previewUrl && (
              <div className="mt-2">
                {formData.ad_format === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Ad preview"
                    className="w-full max-w-xs h-32 object-cover rounded-md border"
                  />
                ) : (
                  <HlsVideoPlayer
                    src={previewUrl}
                    controls
                    className="w-full max-w-xs h-32 rounded-md border"
                  />
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Or enter a direct URL:
            </div>
            <Input
              value={formData.ad_url}
              onChange={(e) => setFormData(prev => ({ ...prev, ad_url: e.target.value }))}
              placeholder="https://example.com/ad-media.jpg"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : ad ? "Update Ad" : "Create Ad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}