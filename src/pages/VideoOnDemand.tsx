import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVodItems, VodItem, importVod, deleteVodItem, updateVodItem, createCustomVideo, CreateCustomVideoRequest } from "@/services/channelApi";
import { PermissionError } from "@/lib/apiErrorHandler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Star, Users, Film, Play, RefreshCw, Image, Info, Award, Globe, HardDrive, Monitor, Languages, Search, ChevronDown, Download, MoreVertical, Trash2, Edit, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";

const VideoOnDemand = () => {
  const { selectedLanguage, changeLanguage, getAvailableLanguages, getLocalizedContent } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<VodItem | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [vodItemToDelete, setVodItemToDelete] = useState<VodItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState<string | null>(null);
  
  // Custom videos state
  const [customVideoToDelete, setCustomVideoToDelete] = useState<VodItem | null>(null);
  const [customDeleteDialogOpen, setCustomDeleteDialogOpen] = useState(false);
  const [isUpdatingCustomVisibility, setIsUpdatingCustomVisibility] = useState<string | null>(null);
  const [showAddCustomVideo, setShowAddCustomVideo] = useState(false);
  const [editingCustomVideo, setEditingCustomVideo] = useState<VodItem | null>(null);
  const [showEditCustomVideo, setShowEditCustomVideo] = useState(false);
  const [newCustomVideo, setNewCustomVideo] = useState<CreateCustomVideoRequest>({
    id: '',
    custom_import: true,
    visible_on_tv: false,
    visible_crew_only: false,
    title: { en: '', es: '', fr: '', de: '' },
    description: { en: '', es: '', fr: '', de: '' },
    media: { full_video_url: '' },
    rating: { system: 'MPAA', value: '' }
  });
  
  const { data: vodData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['vod-items'],
    queryFn: getVodItems,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on permission errors (403)
      if (error instanceof PermissionError) {
        return false;
      }
      // Don't retry more than 2 times for other errors
      return failureCount < 2;
    },
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "VOD library refreshed",
        description: "Content has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh VOD library. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportVod = async () => {
    if (!importUrl.trim()) {
      toast({
        title: "Import URL required",
        description: "Please enter a valid import URL.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await importVod(importUrl);
      
      // Check if the import was successful
      if (response.ok === false) {
        toast({
          title: "Import failed",
          description: `Import failed with ${response.errors || 0} error(s). ${response.processed || 0} items processed, ${response.upserted || 0} items added.`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "VOD import started",
        description: "The import process has been initiated successfully.",
      });
      setImportUrl("");
      // Refresh the VOD list after successful import
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import VOD content. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteVod = (vodItem: VodItem) => {
    setVodItemToDelete(vodItem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vodItemToDelete) return;

    try {
      await deleteVodItem(vodItemToDelete._id);
      toast({
        title: "Success",
        description: "VOD item deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete VOD item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVodItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleVisibility = async (vodItem: VodItem) => {
    setIsUpdatingVisibility(vodItem._id);
    try {
      await updateVodItem(vodItem._id, { 
        visible_on_tv: !vodItem.visible_on_tv 
      });
      toast({
        title: "Success",
        description: `VOD item ${!vodItem.visible_on_tv ? 'enabled' : 'disabled'} on TV`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update VOD item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVisibility(null);
    }
  };

  // Custom video handlers
  const handleAddCustomVideo = async () => {
    if (!newCustomVideo.id.trim() || !newCustomVideo.title.en.trim() || !newCustomVideo.media.full_video_url.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in ID, English title, and video URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCustomVideo(newCustomVideo);
      toast({
        title: "Success",
        description: "Custom video added successfully",
      });
      setNewCustomVideo({
        id: '',
        custom_import: true,
        visible_on_tv: false,
        visible_crew_only: false,
        title: { en: '', es: '', fr: '', de: '' },
        description: { en: '', es: '', fr: '', de: '' },
        media: { full_video_url: '' },
        rating: { system: 'MPAA', value: '' }
      });
      setShowAddCustomVideo(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add custom video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomVideo = (customVideo: VodItem) => {
    setCustomVideoToDelete(customVideo);
    setCustomDeleteDialogOpen(true);
  };

  const confirmDeleteCustomVideo = async () => {
    if (!customVideoToDelete) return;

    try {
      await deleteVodItem(customVideoToDelete._id);
      toast({
        title: "Success",
        description: "Custom video deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete custom video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCustomVideoToDelete(null);
      setCustomDeleteDialogOpen(false);
    }
  };

  const handleToggleCustomVideoVisibility = async (customVideo: VodItem) => {
    setIsUpdatingCustomVisibility(customVideo._id);
    try {
      await updateVodItem(customVideo._id, { 
        visible_on_tv: !customVideo.visible_on_tv 
      });
      toast({
        title: "Success",
        description: `Custom video ${!customVideo.visible_on_tv ? 'enabled' : 'disabled'} on TV`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update custom video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingCustomVisibility(null);
    }
  };

  const handleToggleCrewVisibility = async (vodItem: VodItem) => {
    try {
      await updateVodItem(vodItem._id, { 
        visible_crew_only: !vodItem.visible_crew_only 
      });
      toast({
        title: "Success",
        description: `Video ${!vodItem.visible_crew_only ? 'restricted to crew only' : 'made public'}`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomVideo = (customVideo: VodItem) => {
    setEditingCustomVideo(customVideo);
    setNewCustomVideo({
      id: customVideo.id || '',
      custom_import: true,
      visible_on_tv: customVideo.visible_on_tv || false,
      visible_crew_only: customVideo.visible_crew_only || false,
      title: customVideo.title || { en: '', es: '', fr: '', de: '' },
      description: customVideo.description || { en: '', es: '', fr: '', de: '' },
      media: { 
        full_video_url: customVideo.media?.full_video_url || '',
        poster_image_url: customVideo.media?.poster_image_url || '',
        trailer_url: customVideo.media?.trailer_url || ''
      },
      rating: customVideo.rating || { system: 'MPAA', value: '' }
    });
    setShowEditCustomVideo(true);
  };

  const handleUpdateCustomVideo = async () => {
    if (!editingCustomVideo || !newCustomVideo.id.trim() || !newCustomVideo.title.en.trim() || !newCustomVideo.media.full_video_url.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in ID, English title, and video URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete the old video and create a new one with updated data
      await deleteVodItem(editingCustomVideo._id);
      await createCustomVideo(newCustomVideo);
      
      toast({
        title: "Success",
        description: "Custom video updated successfully",
      });
      setNewCustomVideo({
        id: '',
        custom_import: true,
        visible_on_tv: false,
        visible_crew_only: false,
        title: { en: '', es: '', fr: '', de: '' },
        description: { en: '', es: '', fr: '', de: '' },
        media: { full_video_url: '' },
        rating: { system: 'MPAA', value: '' }
      });
      setShowEditCustomVideo(false);
      setEditingCustomVideo(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update custom video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLocalizedTitle = (vodItem: VodItem) => {
    // Handle custom videos
    if (vodItem.custom_import && vodItem.title) {
      return vodItem.title.en || vodItem.title.es || vodItem.title.fr || vodItem.title.de || 'Untitled';
    }
    
    // Handle Swank videos
    if (vodItem.publicityMetadata) {
      const localizedTitle = getLocalizedContent(
        vodItem.publicityMetadata.Titles, 
        'en', 
        'MasterTitle'
      ) || getLocalizedContent(vodItem.publicityMetadata.Titles, 'en', 'Default');
      return localizedTitle?.Text || vodItem.publicityMetadata.Title;
    }
    
    return 'Untitled';
  };

  const getLocalizedSynopsis = (vodItem: VodItem) => {
    // Handle custom videos
    if (vodItem.custom_import && vodItem.description) {
      return vodItem.description.en || vodItem.description.es || vodItem.description.fr || vodItem.description.de || 'No description available';
    }
    
    // Handle Swank videos
    if (vodItem.publicityMetadata?.Synopses) {
      // Prefer TabletSynopsis for better display, then Default, then any available
      const tabletSynopsis = getLocalizedContent(
        vodItem.publicityMetadata.Synopses, 
        'en', 
        'TabletSynopsis'
      );
      
      if (tabletSynopsis) return tabletSynopsis.Text;
      
      const defaultSynopsis = getLocalizedContent(
        vodItem.publicityMetadata.Synopses, 
        'en', 
        'Default'
      );
      
      if (defaultSynopsis) return defaultSynopsis.Text;
      
      // Fallback to any available synopsis
      const anySynopsis = getLocalizedContent(vodItem.publicityMetadata.Synopses, 'en');
      return anySynopsis?.Text || 'No synopsis available';
    }
    
    return 'No synopsis available';
  };

  const getLocalizedGenres = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Genres) return [];
    
    const availableGenres = vodItem.publicityMetadata.Genres;
    
    // Get unique genres to avoid duplicates
    const uniqueGenres = availableGenres.filter((genre, index, self) => 
      index === self.findIndex(g => g.Text === genre.Text && g.Locale === genre.Locale)
    );
    
    // Get genres in selected language first
    const localizedGenres = uniqueGenres.filter(genre => genre.Locale === selectedLanguage);
    
    // If no exact match, try base language
    if (localizedGenres.length === 0 && selectedLanguage.includes('-')) {
      const baseLanguage = selectedLanguage.split('-')[0];
      const baseGenres = uniqueGenres.filter(genre => genre.Locale === baseLanguage);
      if (baseGenres.length > 0) return baseGenres.slice(0, 3);
    }
    
    // If still no match, fallback to English
    if (localizedGenres.length === 0) {
      const englishGenres = uniqueGenres.filter(genre => 
        genre.Locale === 'en' || genre.Locale === 'en-US'
      );
      if (englishGenres.length > 0) return englishGenres.slice(0, 3);
    }
    
    return localizedGenres.slice(0, 3);
  };

  const getAvailableLanguagesForMovie = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata) return [];
    
    const allLocales = new Set([
      ...vodItem.publicityMetadata.Titles.map(t => t.Locale),
      ...vodItem.publicityMetadata.Synopses.map(s => s.Locale),
      ...vodItem.publicityMetadata.Genres.map(g => g.Locale)
    ]);
    return getAvailableLanguages(Array.from(allLocales).map(locale => ({ Locale: locale })));
  };

  const getMainCast = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Cast) return [];
    return vodItem.publicityMetadata.Cast
      .filter(actor => actor.Role === 'Actor')
      .slice(0, 3)
      .map(actor => actor.Name);
  };

  const getDirector = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Crew) return null;
    const director = vodItem.publicityMetadata.Crew.find(
      crew => crew.Role === 'Director'
    );
    return director?.Name;
  };

  const getPosterImage = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Assets) return null;
    
    // Look for One Sheet (poster) first, then Thumbnail
    const poster = vodItem.publicityMetadata.Assets.find(
      asset => asset.AssetType === 'One Sheet' && asset.FileType === 'Image'
    );
    
    if (poster) return poster;
    
    const thumbnail = vodItem.publicityMetadata.Assets.find(
      asset => asset.AssetType === 'Thumbnail' && asset.FileType === 'Image'
    );
    
    return thumbnail;
  };

  const hasTrailer = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Assets) return false;
    return vodItem.publicityMetadata.Assets.some(
      asset => asset.AssetType.includes('Trailer') && asset.FileType === 'Video'
    );
  };

  const getAllCast = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Cast) return [];
    return vodItem.publicityMetadata.Cast
      .filter(actor => actor.Role === 'Actor')
      .slice(0, 10);
  };

  const getAllCrew = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata?.Crew) return [];
    return vodItem.publicityMetadata.Crew.slice(0, 10);
  };

  // Filter Swank videos (non-custom)
  const swankMovies = vodData?.payload.documents.filter((vodItem: VodItem) => !vodItem.custom_import) || [];
  
  // Filter custom videos
  const customVideos = vodData?.payload.documents.filter((vodItem: VodItem) => vodItem.custom_import) || [];
  
  const filteredSwankMovies = swankMovies.filter((vodItem: VodItem) => {
    if (!searchQuery) return true;
    
    const title = getLocalizedTitle(vodItem).toLowerCase();
    const studio = vodItem.publicityMetadata?.Studio?.toLowerCase() || '';
    const year = vodItem.publicityMetadata?.ReleaseYear?.toString() || '';
    const category = vodItem.publicityMetadata?.Category?.toLowerCase() || '';
    const director = getDirector(vodItem)?.toLowerCase() || '';
    const cast = getMainCast(vodItem).join(' ').toLowerCase();
    const genres = getLocalizedGenres(vodItem).map(g => g.Text.toLowerCase()).join(' ');
    
    const query = searchQuery.toLowerCase();
    
    return title.includes(query) || 
           studio.includes(query) || 
           year.includes(query) || 
           category.includes(query) ||
           director.includes(query) ||
           cast.includes(query) ||
           genres.includes(query);
  });

  const filteredCustomVideos = customVideos.filter((vodItem: VodItem) => {
    if (!searchQuery) return true;
    
    const title = getLocalizedTitle(vodItem).toLowerCase();
    const rating = vodItem.rating?.value?.toLowerCase() || '';
    const description = getLocalizedSynopsis(vodItem).toLowerCase();
    
    const query = searchQuery.toLowerCase();
    
    return title.includes(query) || 
           rating.includes(query) || 
           description.includes(query);
  });

  const getFileSize = (vodItem: VodItem) => {
    if (!vodItem.mediaFileInfo?.General?.FileSizeInMb) return null;
    const sizeMb = vodItem.mediaFileInfo.General.FileSizeInMb;
    return sizeMb >= 1000 ? `${(sizeMb / 1000).toFixed(1)} GB` : `${sizeMb} MB`;
  };

  const getVideoInfo = (vodItem: VodItem) => {
    const videoTrack = vodItem.mediaFileInfo?.VideoTracks?.[0];
    if (!videoTrack) return null;
    
    return {
      resolution: `${videoTrack.Width} × ${videoTrack.Height}`,
      aspectRatio: videoTrack.DisplayAspectRatio,
      frameRate: videoTrack.FrameRate,
      format: videoTrack.Format
    };
  };

  const getAudioInfo = (vodItem: VodItem) => {
    const audioTrack = vodItem.mediaFileInfo?.AudioTracks?.[0];
    if (!audioTrack) return null;
    
    return {
      format: audioTrack.Format,
      channels: audioTrack.Channels,
      bitRate: audioTrack.BitRate
    };
  };

  const MovieDetailDialog = ({ vodItem }: { vodItem: VodItem }) => {
    const posterImage = getPosterImage(vodItem);
    const videoInfo = getVideoInfo(vodItem);
    const audioInfo = getAudioInfo(vodItem);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="mb-2 gap-2">
            <Play className="w-5 h-5" />
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>{getLocalizedTitle(vodItem)}</span>
              <LanguageSelector
                availableLanguages={getAvailableLanguagesForMovie(vodItem)}
                selectedLanguage={selectedLanguage}
                onLanguageChange={changeLanguage}
                compact
              />
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
            {/* Left Column - Poster and Quick Info */}
            <div className="space-y-4">
              <div className="aspect-[2/3] bg-gradient-to-br from-muted/50 to-muted rounded-lg overflow-hidden">
                {posterImage ? (
                  <img 
                    src={`https://assets.swankmp.net/${posterImage.Location}`}
                    alt={`${getLocalizedTitle(vodItem)} poster`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${posterImage ? 'hidden' : ''}`}>
                  <div className="text-center">
                    <Film className="w-16 h-16 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No Poster</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Info Card */}
              <Card className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Studio:</span>
                      <span className="font-medium text-right">{vodItem.publicityMetadata?.Studio || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year:</span>
                      <span className="font-medium">{vodItem.publicityMetadata?.ReleaseYear || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="font-medium">{formatRuntime(vodItem.publicityMetadata?.Runtime || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <Badge variant="secondary">{vodItem.publicityMetadata?.Rating || 'Not Rated'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{vodItem.publicityMetadata?.Category || 'Movie'}</span>
                    </div>
                    {getDirector(vodItem) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Director:</span>
                        <span className="font-medium text-right">{getDirector(vodItem)}</span>
                      </div>
                    )}
                  </div>
                  
                  {hasTrailer(vodItem) && (
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-3">
                      <Play className="w-4 h-4" />
                      Watch Trailer
                    </Button>
                  )}
                </div>
              </Card>

              {/* License Info */}
              {vodItem.effectiveLicenseDates && (
                <Card className="p-3">
                  <h4 className="font-medium mb-2 text-sm">License Period</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span>{new Date(vodItem.effectiveLicenseDates.LicenseStart).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span>{new Date(vodItem.effectiveLicenseDates.LicenseEnd).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Columns - Tabbed Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview" className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <ScrollArea className="h-[65vh]">
                    <div className="space-y-6 pr-4">
                      {/* Synopsis */}
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Synopsis</h4>
                        <p className="text-sm leading-relaxed">
                          {getLocalizedSynopsis(vodItem)}
                        </p>
                      </div>

                      {/* Genres */}
                      <div>
                        <h4 className="font-semibold mb-3">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {getLocalizedGenres(vodItem).map((genre, index) => (
                            <Badge key={index} variant="outline">
                              {genre.Text}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Main Cast (Top 6) */}
                      <div>
                        <h4 className="font-semibold mb-3">Main Cast</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getAllCast(vodItem).slice(0, 6).map((actor, index) => (
                            <div key={index} className="flex flex-col border rounded-lg p-3">
                              <span className="font-medium">{actor.Name}</span>
                              <span className="text-sm text-muted-foreground">{actor.PartName}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Crew */}
                      <div>
                        <h4 className="font-semibold mb-3">Key Crew</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getAllCrew(vodItem).slice(0, 6).map((crew, index) => (
                            <div key={index} className="flex flex-col border rounded-lg p-3">
                              <span className="font-medium">{crew.Name}</span>
                              <span className="text-sm text-muted-foreground">{crew.Role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="cast" className="mt-4">
                  <ScrollArea className="h-[65vh]">
                    <div className="space-y-6 pr-4">
                      {/* Full Cast */}
                      <div>
                        <h4 className="font-semibold text-lg mb-4">Full Cast</h4>
                        <div className="space-y-2">
                          {getAllCast(vodItem).map((actor, index) => (
                            <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{actor.Name}</div>
                                <div className="text-sm text-muted-foreground">{actor.PartName}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                #{actor.DisplayOrder}
                              </Badge>
                            </div>
                          ))}
                          {getAllCast(vodItem).length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No cast information available</p>
                          )}
                        </div>
                      </div>

                      {/* Full Crew */}
                      <div>
                        <h4 className="font-semibold text-lg mb-4">Full Crew</h4>
                        <div className="space-y-2">
                          {getAllCrew(vodItem).map((crew, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{crew.Name}</div>
                                <div className="text-sm text-muted-foreground">{crew.Role}</div>
                              </div>
                            </div>
                          ))}
                          {getAllCrew(vodItem).length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No crew information available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="technical" className="mt-4">
                  <ScrollArea className="h-[65vh]">
                    <div className="space-y-4 pr-4">
                      {vodItem.mediaFileInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Video Specifications */}
                          {vodItem.mediaFileInfo.VideoTracks?.[0] && (
                            <Card className="p-4">
                              <h5 className="font-semibold mb-3 flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                Video Specifications
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Format:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.VideoTracks[0].Format}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Resolution:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.VideoTracks[0].Width} × {vodItem.mediaFileInfo.VideoTracks[0].Height}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Aspect Ratio:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.VideoTracks[0].DisplayAspectRatio}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Frame Rate:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.VideoTracks[0].FrameRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bit Rate:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.VideoTracks[0].BitRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Color Space:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.VideoTracks[0].ColorSpace}</span>
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* Audio Specifications */}
                          {vodItem.mediaFileInfo.AudioTracks?.[0] && (
                            <Card className="p-4">
                              <h5 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Audio Specifications
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Format:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.AudioTracks[0].Format}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Channels:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.AudioTracks[0].Channels}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bit Rate:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.AudioTracks[0].BitRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Sampling Rate:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.AudioTracks[0].SamplingRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Channels:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.AudioTracks[0].ChannelPositions}</span>
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* File Information */}
                          {vodItem.mediaFileInfo.General && (
                            <Card className="p-4">
                              <h5 className="font-semibold mb-3 flex items-center gap-2">
                                <HardDrive className="w-4 h-4" />
                                File Information
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Format:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.General.Format}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>File Size:</span>
                                  <span className="font-medium">{getFileSize(vodItem)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bit Rate:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.General.BitRate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Duration:</span>
                                  <span className="font-medium">{vodItem.mediaFileInfo.General.FileRuntime ? Math.round(parseInt(vodItem.mediaFileInfo.General.FileRuntime) / 60) : 'N/A'} min</span>
                                </div>
                              </div>
                            </Card>
                          )}

                          {/* Subtitles & Captions */}
                          {vodItem.asset?.SidecarAssetTracks && vodItem.asset.SidecarAssetTracks.length > 0 && (
                            <Card className="p-4">
                              <h5 className="font-semibold mb-3 flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                Available Subtitles
                              </h5>
                              <div className="space-y-2 text-sm">
                                {vodItem.asset.SidecarAssetTracks.map((track, index) => (
                                  <div key={index} className="flex justify-between">
                                    <span>{track.Description}:</span>
                                    <Badge variant="outline" className="text-xs">{track.Format}</Badge>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="metadata" className="mt-4">
                  <ScrollArea className="h-[65vh]">
                    <div className="space-y-6 pr-4">
                      {/* International Ratings */}
                      {vodItem.publicityMetadata?.Ratings && vodItem.publicityMetadata.Ratings.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            International Ratings
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {vodItem.publicityMetadata.Ratings.slice(0, 12).map((rating, index) => (
                              <div key={index} className="flex justify-between border rounded-lg p-3">
                                <span className="text-sm font-medium">{rating.Authority.split('-')[0]}</span>
                                <Badge variant="secondary" className="text-xs">{rating.Value}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* System Identifiers */}
                      {vodItem.publicityMetadata?.Identifiers && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            System Identifiers
                          </h4>
                          <div className="space-y-2">
                            {vodItem.publicityMetadata.Identifiers.map((identifier, index) => (
                              <div key={index} className="flex justify-between border rounded-lg p-3">
                                <span className="font-medium">{identifier.Name}</span>
                                <code className="text-sm bg-muted px-2 py-1 rounded">{identifier.Value}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags & Keywords */}
                      {vodItem.publicityMetadata?.Tags && vodItem.publicityMetadata.Tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Tags & Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {vodItem.publicityMetadata.Tags
                              .filter((tag, index, self) => 
                                index === self.findIndex(t => t.Text === tag.Text && t.Locale === selectedLanguage)
                              )
                              .slice(0, 20)
                              .map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag.Text}
                                </Badge>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (error) {
    const isPermissionError = error instanceof PermissionError || 
                              (error as any)?.message?.includes("permission") ||
                              (error as any)?.message?.includes("You do not have permission");
    
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Video on Demand</h1>
            <p className="text-muted-foreground">Manage your movie and content library</p>
          </div>
          <Button onClick={handleRefresh} disabled={isFetching} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Film className="w-5 h-5" />
              {isPermissionError ? "Access Denied" : "Failed to Load VOD Content"}
            </CardTitle>
            <CardDescription>
              {isPermissionError 
                ? "You do not have permission to use this module. Please contact your administrator." 
                : "Unable to connect to the VOD service. Please check your connection."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isPermissionError && (
              <Button onClick={handleRefresh} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Video on Demand</h1>
          <p className="text-muted-foreground">Manage your VOD library and import new content</p>
        </div>
        <div className="flex items-center gap-4">
          {swankMovies.length > 0 && (
            <LanguageSelector
              availableLanguages={getAvailableLanguages(
                swankMovies.flatMap(movie => [
                  ...(movie.publicityMetadata?.Titles || []),
                  ...(movie.publicityMetadata?.Synopses || []),
                  ...(movie.publicityMetadata?.Genres || [])
                ]).map(item => ({ Locale: item.Locale }))
              )}
              selectedLanguage={selectedLanguage}
              onLanguageChange={changeLanguage}
            />
          )}
          <Button onClick={handleRefresh} disabled={isFetching} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="swank" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="swank">Swank Videos</TabsTrigger>
          <TabsTrigger value="custom">Custom Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="swank" className="space-y-6">
          {/* Import VOD Section */}
          <div className="flex items-center gap-2 p-4 rounded-lg border bg-card">
            <div className="flex-1">
              <Input
                placeholder="Enter import URL (e.g., http://172.27.16.32:8080/swank-Disk-02/lab/Manifest.json)"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={isImporting}
              />
            </div>
            <Button 
              onClick={handleImportVod}
              disabled={isImporting || !importUrl.trim()}
              className="gap-2"
            >
              <Download className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
              {isImporting ? 'Importing...' : 'Import VOD'}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {swankMovies.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Swank Movies Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Your Swank VOD library is empty. Import content to get started.
                    </p>
                    <Button className="gap-2">
                      <Play className="w-4 h-4" />
                      Import Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Search Bar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search Movies
                      </CardTitle>
                      <CardDescription>
                        Filter through {swankMovies.length} available Swank movies
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search by title, director, cast, genre, studio, or year..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Movies Grid */}
                  {filteredSwankMovies.length === 0 && searchQuery ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Swank movies found</h3>
                        <p className="text-muted-foreground mb-4">
                          No Swank movies match your search criteria. Try adjusting your search terms.
                        </p>
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear search
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredSwankMovies.map((vodItem: VodItem) => {
                        const posterImage = getPosterImage(vodItem);
                        const mainCast = getMainCast(vodItem);
                        const director = getDirector(vodItem);
                        const fileSize = getFileSize(vodItem);
                        const videoInfo = getVideoInfo(vodItem);
                        const isAvailable = vodItem.effectiveLicenseDates ? new Date(vodItem.effectiveLicenseDates.LicenseEnd) > new Date() : true;
                        
                        return (
                          <Card 
                            key={vodItem._id} 
                            className="group overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm hover:-translate-y-2 cursor-pointer"
                            onClick={() => setSelectedMovie(vodItem)}
                          >
                            <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40">
                              {posterImage ? (
                                <img 
                                  src={`https://assets.swankmp.net/${posterImage.Location}`}
                                  alt={`${getLocalizedTitle(vodItem)} poster`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center backdrop-blur-sm ${posterImage ? 'hidden' : ''}`}>
                                <div className="text-center text-primary-foreground">
                                  <Film className="w-16 h-16 mx-auto mb-2 opacity-80" />
                                  <p className="text-sm font-medium px-4">No Poster Available</p>
                                </div>
                              </div>
                              
                              {/* Status and Quality indicators */}
                              <div className="absolute top-4 left-4 right-4 flex justify-between">
                                <Badge className={`backdrop-blur-md font-medium ${
                                  isAvailable 
                                    ? 'bg-green-500/90 text-white border-0' 
                                    : 'bg-red-500/90 text-white border-0'
                                }`}>
                                  {isAvailable ? 'Available' : 'Expired'}
                                </Badge>
                                
                                <Badge className="bg-black/40 text-white border-white/20 backdrop-blur-md text-xs font-medium">
                                  {vodItem.publicityMetadata?.Rating}
                                </Badge>
                              </div>

                              {/* Hover overlay with technical info */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="absolute bottom-4 left-4 right-4">
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {videoInfo && (
                                      <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">
                                        {videoInfo.resolution.split(' × ')[1]}p
                                      </Badge>
                                    )}
                                    {fileSize && (
                                      <Badge className="bg-secondary/90 text-secondary-foreground border-0 text-xs">
                                        {fileSize}
                                      </Badge>
                                    )}
                                    {hasTrailer(vodItem) && (
                                      <Badge className="bg-green-500/90 text-white border-0 text-xs">
                                        <Play className="w-2 h-2 mr-1" />
                                        Trailer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <CardHeader className="p-4">
                              <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                {getLocalizedTitle(vodItem)}
                              </CardTitle>
                              <CardDescription className="space-y-2">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{vodItem.publicityMetadata?.ReleaseYear}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatRuntime(vodItem.publicityMetadata?.Runtime || 0)}</span>
                                  </div>
                                </div>
                                
                                {director && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    <strong>Director:</strong> {director}
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-1">
                                  {getLocalizedGenres(vodItem).slice(0, 2).map((genre, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {genre.Text}
                                    </Badge>
                                  ))}
                                </div>
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-foreground">{vodItem.publicityMetadata?.Studio || 'Unknown Studio'}</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border shadow-lg z-50">
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleVisibility(vodItem);
                                        }}
                                        disabled={isUpdatingVisibility === vodItem._id}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center">
                                          <Tv className="w-4 h-4 mr-2" />
                                          TV Visibility
                                        </div>
                                        <Switch
                                          checked={vodItem.visible_on_tv || false}
                                          onCheckedChange={() => {}}
                                        />
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleCrewVisibility(vodItem);
                                        }}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center">
                                          <Users className="w-4 h-4 mr-2" />
                                          Crew Only
                                        </div>
                                        <Switch
                                          checked={vodItem.visible_crew_only || false}
                                          onCheckedChange={() => {}}
                                        />
                                      </DropdownMenuItem>
                                      <Separator />
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteVod(vodItem);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete VOD Item
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                
                                <div className="flex items-center justify-between gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {vodItem.publicityMetadata?.Category || 'Movie'}
                                  </Badge>
                                  
                                  <div className="flex gap-1">
                                    <Badge 
                                      variant={vodItem.visible_on_tv ? "default" : "outline"} 
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <Tv className="w-3 h-3" />
                                      {vodItem.visible_on_tv ? 'On TV' : 'Hidden'}
                                    </Badge>
                                    
                                    {vodItem.visible_crew_only && (
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs flex items-center gap-1"
                                      >
                                        <Users className="w-3 h-3" />
                                        Crew Only
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                <MovieDetailDialog vodItem={vodItem} />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Movie Details */}
                  {selectedMovie && (
                    <Card className="mt-8">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">{getLocalizedTitle(selectedMovie)}</CardTitle>
                          <CardDescription className="text-lg">
                            {selectedMovie.publicityMetadata?.Studio} • {selectedMovie.publicityMetadata?.ReleaseYear}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <LanguageSelector
                            availableLanguages={getAvailableLanguagesForMovie(selectedMovie)}
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={changeLanguage}
                            compact
                          />
                          <Button variant="outline" onClick={() => setSelectedMovie(null)}>
                            Clear Selection
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {getLocalizedSynopsis(selectedMovie)}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete VOD Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{vodItemToDelete ? getLocalizedTitle(vodItemToDelete) : ''}"? 
                  This action cannot be undone and will permanently remove the VOD item from your library.
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
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Custom Videos
                  </CardTitle>
                  <CardDescription>
                    Add and manage your custom video content
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddCustomVideo(true)}
                  className="gap-2"
                >
                  <Film className="w-4 h-4" />
                  Add Custom Video
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(showAddCustomVideo || showEditCustomVideo) && (
                <div className="border rounded-lg p-4 mb-6 space-y-4">
                  <h3 className="font-semibold">{showEditCustomVideo ? 'Edit Custom Video' : 'Add New Custom Video'}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Video ID</label>
                      <Input
                        placeholder="e.g., movie_001"
                        value={newCustomVideo.id}
                        onChange={(e) => setNewCustomVideo({...newCustomVideo, id: e.target.value})}
                      />
                    </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Video URL *</label>
                      <Input
                        placeholder="https://example.com/video.mp4"
                        value={newCustomVideo.media.full_video_url}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          media: {...newCustomVideo.media, full_video_url: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Poster Image URL</label>
                      <Input
                        placeholder="https://example.com/poster.jpg"
                        value={newCustomVideo.media.poster_image_url || ''}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          media: {...newCustomVideo.media, poster_image_url: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Trailer URL</label>
                    <Input
                      placeholder="https://example.com/trailer.mp4"
                      value={newCustomVideo.media.trailer_url || ''}
                      onChange={(e) => setNewCustomVideo({
                        ...newCustomVideo, 
                        media: {...newCustomVideo.media, trailer_url: e.target.value}
                      })}
                    />
                  </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (English)</label>
                      <Input
                        placeholder="Movie title"
                        value={newCustomVideo.title.en}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          title: {...newCustomVideo.title, en: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (Spanish)</label>
                      <Input
                        placeholder="Título en español"
                        value={newCustomVideo.title.es}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          title: {...newCustomVideo.title, es: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (French)</label>
                      <Input
                        placeholder="Titre français"
                        value={newCustomVideo.title.fr}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          title: {...newCustomVideo.title, fr: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (German)</label>
                      <Input
                        placeholder="Deutscher Titel"
                        value={newCustomVideo.title.de}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          title: {...newCustomVideo.title, de: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description (English)</label>
                    <Input
                      placeholder="Movie description"
                      value={newCustomVideo.description.en}
                      onChange={(e) => setNewCustomVideo({
                        ...newCustomVideo, 
                        description: {...newCustomVideo.description, en: e.target.value}
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Trailer URL (Optional)</label>
                      <Input
                        placeholder="https://example.com/trailer.mp4"
                        value={newCustomVideo.media.trailer_url || ''}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          media: {...newCustomVideo.media, trailer_url: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Poster URL (Optional)</label>
                      <Input
                        placeholder="https://example.com/poster.jpg"
                        value={newCustomVideo.media.poster_image_url || ''}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          media: {...newCustomVideo.media, poster_image_url: e.target.value}
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <Input
                        placeholder="PG-13"
                        value={newCustomVideo.rating.value}
                        onChange={(e) => setNewCustomVideo({
                          ...newCustomVideo, 
                          rating: {...newCustomVideo.rating, value: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <label htmlFor="visible_on_tv" className="text-sm font-medium cursor-pointer">
                          Visible on TV
                        </label>
                        <p className="text-xs text-muted-foreground">Show this video on the TV interface</p>
                      </div>
                      <Switch
                        id="visible_on_tv"
                        checked={newCustomVideo.visible_on_tv}
                        onCheckedChange={(checked) => setNewCustomVideo({
                          ...newCustomVideo,
                          visible_on_tv: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <label htmlFor="visible_crew_only" className="text-sm font-medium cursor-pointer">
                          Crew Only Access
                        </label>
                        <p className="text-xs text-muted-foreground">Restrict access to crew members only</p>
                      </div>
                      <Switch
                        id="visible_crew_only"
                        checked={newCustomVideo.visible_crew_only}
                        onCheckedChange={(checked) => setNewCustomVideo({
                          ...newCustomVideo,
                          visible_crew_only: checked
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={showEditCustomVideo ? handleUpdateCustomVideo : handleAddCustomVideo}>
                      {showEditCustomVideo ? 'Update Video' : 'Add Video'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddCustomVideo(false);
                        setShowEditCustomVideo(false);
                        setEditingCustomVideo(null);
                        setNewCustomVideo({
                          id: '',
                          custom_import: true,
                          visible_on_tv: false,
                          visible_crew_only: false,
                          title: { en: '', es: '', fr: '', de: '' },
                          description: { en: '', es: '', fr: '', de: '' },
                          media: { full_video_url: '' },
                          rating: { system: 'MPAA', value: '' }
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : customVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No custom videos yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first custom video to get started
                  </p>
                  <Button onClick={() => setShowAddCustomVideo(true)} className="gap-2">
                    <Film className="w-4 h-4" />
                    Add Custom Video
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCustomVideos.map((customVideo: VodItem) => (
                    <Card key={customVideo._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted">
                        {customVideo.media?.poster_image_url ? (
                          <img 
                            src={customVideo.media.poster_image_url}
                            alt={`${customVideo.title?.en} poster`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${customVideo.media?.poster_image_url ? 'hidden' : ''}`}>
                          <Film className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border shadow-lg z-50">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCustomVideo(customVideo);
                                }}
                                className="flex items-center"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Video
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCustomVideoVisibility(customVideo);
                                }}
                                disabled={isUpdatingCustomVisibility === customVideo._id}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <Tv className="w-4 h-4 mr-2" />
                                  TV Visibility
                                </div>
                                <Switch
                                  checked={customVideo.visible_on_tv || false}
                                  onCheckedChange={() => {}}
                                />
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCrewVisibility(customVideo);
                                }}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  Crew Only
                                </div>
                                <Switch
                                  checked={customVideo.visible_crew_only || false}
                                  onCheckedChange={() => {}}
                                />
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomVideo(customVideo);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Video
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                            {getLocalizedTitle(customVideo)}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getLocalizedSynopsis(customVideo)}
                          </p>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="secondary">
                              {customVideo.rating?.value || 'Not Rated'}
                            </Badge>
                            <Badge variant={customVideo.visible_on_tv ? "default" : "outline"}>
                              {customVideo.visible_on_tv ? 'On TV' : 'Hidden'}
                            </Badge>
                            {customVideo.visible_crew_only && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Crew Only
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Video Delete Dialog */}
      <AlertDialog open={customDeleteDialogOpen} onOpenChange={setCustomDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customVideoToDelete ? getLocalizedTitle(customVideoToDelete) : ''}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCustomVideo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoOnDemand;