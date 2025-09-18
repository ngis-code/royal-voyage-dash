import { useQuery } from "@tanstack/react-query";
import { getVodItems, VodItem } from "@/services/channelApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Star, Users, Film, Play, RefreshCw, Image, Info, Award, Globe, HardDrive, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const VideoOnDemand = () => {
  const { data: vodData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['vod-items'],
    queryFn: getVodItems,
    refetchOnWindowFocus: false,
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

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getEnglishTitle = (vodItem: VodItem) => {
    const englishTitle = vodItem.publicityMetadata.Titles.find(
      title => title.Locale === 'en' || title.Locale === 'en-US'
    );
    return englishTitle?.Text || vodItem.publicityMetadata.Title;
  };

  const getEnglishSynopsis = (vodItem: VodItem) => {
    const englishSynopsis = vodItem.publicityMetadata.Synopses.find(
      synopsis => (synopsis.Locale === 'en' || synopsis.Locale === 'en-US') && 
      synopsis.SourceType === 'TabletSynopsis'
    );
    return englishSynopsis?.Text || 
           vodItem.publicityMetadata.Synopses.find(s => s.Locale === 'en' || s.Locale === 'en-US')?.Text ||
           'No synopsis available';
  };

  const getEnglishGenres = (vodItem: VodItem) => {
    return vodItem.publicityMetadata.Genres.filter(
      genre => genre.Locale === 'en' || genre.Locale === 'en-US'
    ).slice(0, 3);
  };

  const getMainCast = (vodItem: VodItem) => {
    return vodItem.publicityMetadata.Cast
      .filter(actor => actor.Role === 'Actor')
      .slice(0, 3)
      .map(actor => actor.Name);
  };

  const getDirector = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata.Crew) return null;
    const director = vodItem.publicityMetadata.Crew.find(
      crew => crew.Role === 'Director'
    );
    return director?.Name;
  };

  const getPosterImage = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata.Assets) return null;
    
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
    if (!vodItem.publicityMetadata.Assets) return false;
    return vodItem.publicityMetadata.Assets.some(
      asset => asset.AssetType.includes('Trailer') && asset.FileType === 'Video'
    );
  };

  const getAllCast = (vodItem: VodItem) => {
    return vodItem.publicityMetadata.Cast
      .filter(actor => actor.Role === 'Actor')
      .slice(0, 10);
  };

  const getAllCrew = (vodItem: VodItem) => {
    if (!vodItem.publicityMetadata.Crew) return [];
    return vodItem.publicityMetadata.Crew.slice(0, 10);
  };

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl">{getEnglishTitle(vodItem)}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Movie Poster */}
            <div className="space-y-4">
              <div className="aspect-[2/3] bg-gradient-to-br from-muted/50 to-muted rounded-lg overflow-hidden">
                {posterImage ? (
                  <img 
                    src={`https://assets.swankmp.net/${posterImage.Location}`}
                    alt={`${getEnglishTitle(vodItem)} poster`}
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
              
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  {vodItem.publicityMetadata.Rating}
                </Badge>
                {hasTrailer(vodItem) && (
                  <Button variant="outline" className="w-full gap-2">
                    <Play className="w-4 h-4" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>

            {/* Movie Details */}
            <div className="md:col-span-2">
              <ScrollArea className="h-[60vh]">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-foreground">Studio</div>
                        <div className="text-muted-foreground">{vodItem.publicityMetadata.Studio}</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Release Year</div>
                        <div className="text-muted-foreground">{vodItem.publicityMetadata.ReleaseYear}</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Runtime</div>
                        <div className="text-muted-foreground">{formatRuntime(vodItem.publicityMetadata.Runtime)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Category</div>
                        <div className="text-muted-foreground">{vodItem.publicityMetadata.Category}</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Synopsis</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {getEnglishSynopsis(vodItem)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {getEnglishGenres(vodItem).map((genre, index) => (
                          <Badge key={index} variant="outline">
                            {genre.Text}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">License Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-foreground">Available From</div>
                          <div className="text-muted-foreground">
                            {new Date(vodItem.effectiveLicenseDates.LicenseStart).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Available Until</div>
                          <div className="text-muted-foreground">
                            {new Date(vodItem.effectiveLicenseDates.LicenseEnd).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cast" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Cast
                        </h4>
                        <div className="space-y-3">
                          {getAllCast(vodItem).map((actor, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-foreground">{actor.Name}</div>
                              <div className="text-muted-foreground text-xs">{actor.PartName}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Crew
                        </h4>
                        <div className="space-y-3">
                          {getAllCrew(vodItem).map((crew, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-foreground">{crew.Name}</div>
                              <div className="text-muted-foreground text-xs">{crew.Role}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Video Information
                        </h4>
                        {videoInfo ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Resolution:</span>
                              <span className="text-foreground">{videoInfo.resolution}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Aspect Ratio:</span>
                              <span className="text-foreground">{videoInfo.aspectRatio}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frame Rate:</span>
                              <span className="text-foreground">{videoInfo.frameRate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Format:</span>
                              <span className="text-foreground">{videoInfo.format}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No video information available</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          File Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">File Size:</span>
                            <span className="text-foreground">{getFileSize(vodItem) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Format:</span>
                            <span className="text-foreground">{vodItem.mediaFileInfo?.General?.Format || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Protection:</span>
                            <span className="text-foreground">{vodItem.protectionType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Film Number:</span>
                            <span className="text-foreground">#{vodItem.identifiers.FilmNumber}</span>
                          </div>
                        </div>
                        
                        {audioInfo && (
                          <div className="mt-4">
                            <h5 className="font-medium text-foreground mb-2">Audio Track</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Format:</span>
                                <span className="text-foreground">{audioInfo.format}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Channels:</span>
                                <span className="text-foreground">{audioInfo.channels}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Bit Rate:</span>
                                <span className="text-foreground">{audioInfo.bitRate}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="assets" className="space-y-4 mt-6">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Available Assets
                    </h4>
                    {vodItem.publicityMetadata.Assets && vodItem.publicityMetadata.Assets.length > 0 ? (
                      <div className="space-y-3">
                        {vodItem.publicityMetadata.Assets.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <div className="font-medium text-foreground text-sm">{asset.Name}</div>
                              <div className="text-muted-foreground text-xs">{asset.AssetType} • {asset.FileType}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {asset.Locale}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional assets available</p>
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (error) {
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
              Failed to Load VOD Content
            </CardTitle>
            <CardDescription>
              Unable to connect to the VOD service. Please check your connection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
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
          <p className="text-muted-foreground">
            {vodData?.payload.documents.length || 0} movies available in your library
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isFetching} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
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
          {vodData?.payload.documents.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Movies Found</h3>
                <p className="text-muted-foreground mb-4">
                  Your VOD library is empty. Import content to get started.
                </p>
                <Button className="gap-2">
                  <Play className="w-4 h-4" />
                  Import Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vodData?.payload.documents.map((vodItem: VodItem) => {
                const posterImage = getPosterImage(vodItem);
                const director = getDirector(vodItem);
                
                return (
                  <Card key={vodItem._id} className="group overflow-hidden hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/20">
                    {/* Movie Poster */}
                    <div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                      {posterImage ? (
                        <img 
                          src={`https://assets.swankmp.net/${posterImage.Location}`}
                          alt={`${getEnglishTitle(vodItem)} poster`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center ${posterImage ? 'hidden' : ''}`}>
                        <div className="text-center">
                          <Film className="w-16 h-16 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">No Poster Available</p>
                        </div>
                      </div>
                      
                      {/* Overlay with play button and trailer indicator */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-center">
                          <MovieDetailDialog vodItem={vodItem} />
                          {hasTrailer(vodItem) && (
                            <p className="text-xs text-white/80">Trailer Available</p>
                          )}
                        </div>
                      </div>

                      {/* Rating badge */}
                      <Badge variant="secondary" className="absolute top-3 right-3 bg-black/70 text-white border-0">
                        {vodItem.publicityMetadata.Rating}
                      </Badge>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                        {getEnglishTitle(vodItem)}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {vodItem.publicityMetadata.Studio} • {vodItem.publicityMetadata.ReleaseYear}
                        {director && (
                          <span className="block text-xs mt-1">
                            Directed by {director}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {getEnglishSynopsis(vodItem)}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {getEnglishGenres(vodItem).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre.Text}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatRuntime(vodItem.publicityMetadata.Runtime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Available until {new Date(vodItem.effectiveLicenseDates.LicenseEnd).toLocaleDateString()}
                          </span>
                        </div>

                        {getMainCast(vodItem).length > 0 && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-xs leading-relaxed">
                              {getMainCast(vodItem).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Film #{vodItem.identifiers.FilmNumber}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3" />
                          {vodItem.protectionType}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoOnDemand;