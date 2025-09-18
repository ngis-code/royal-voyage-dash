import { useQuery } from "@tanstack/react-query";
import { getVodItems, VodItem } from "@/services/channelApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Star, Users, Film, Play, RefreshCw, Image, Info, Award, Globe, HardDrive, Monitor, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";

const VideoOnDemand = () => {
  const { selectedLanguage, changeLanguage, getAvailableLanguages, getLocalizedContent } = useLanguage();
  
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

  const getLocalizedTitle = (vodItem: VodItem) => {
    const localizedTitle = getLocalizedContent(
      vodItem.publicityMetadata.Titles, 
      'en', 
      'MasterTitle'
    ) || getLocalizedContent(vodItem.publicityMetadata.Titles, 'en', 'Default');
    return localizedTitle?.Text || vodItem.publicityMetadata.Title;
  };

  const getLocalizedSynopsis = (vodItem: VodItem) => {
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
  };

  const getLocalizedGenres = (vodItem: VodItem) => {
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
    const allLocales = new Set([
      ...vodItem.publicityMetadata.Titles.map(t => t.Locale),
      ...vodItem.publicityMetadata.Synopses.map(s => s.Locale),
      ...vodItem.publicityMetadata.Genres.map(g => g.Locale)
    ]);
    return getAvailableLanguages(Array.from(allLocales).map(locale => ({ Locale: locale })));
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Movie Poster */}
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
                        {getLocalizedSynopsis(vodItem)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {getLocalizedGenres(vodItem).map((genre, index) => (
                          <Badge key={index} variant="outline">
                            {genre.Text}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Available Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableLanguagesForMovie(vodItem).map((language) => (
                          <Badge 
                            key={language.code} 
                            variant={language.code === selectedLanguage ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => changeLanguage(language.code)}
                          >
                            <span className="mr-1">{language.flag}</span>
                            {language.name}
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
        <div className="flex items-center gap-3">
          {vodData?.payload.documents && vodData.payload.documents.length > 0 && (
            <LanguageSelector
              availableLanguages={getAvailableLanguages(
                vodData.payload.documents.flatMap(movie => [
                  ...movie.publicityMetadata.Titles,
                  ...movie.publicityMetadata.Synopses,
                  ...movie.publicityMetadata.Genres
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {vodData?.payload.documents.map((vodItem: VodItem) => {
                const posterImage = getPosterImage(vodItem);
                const mainCast = getMainCast(vodItem);
                const director = getDirector(vodItem);
                const fileSize = getFileSize(vodItem);
                const videoInfo = getVideoInfo(vodItem);
                const audioInfo = getAudioInfo(vodItem);
                const availableLanguages = getAvailableLanguagesForMovie(vodItem);
                const isAvailable = new Date(vodItem.effectiveLicenseDates.LicenseEnd) > new Date();
                const hasSubtitles = vodItem.asset?.SidecarAssetTracks?.length > 0;
                const audioTracks = vodItem.asset?.EmbeddedTracks?.filter(track => track.Type === 'audio') || [];
                const subtitleTracks = vodItem.asset?.SidecarAssetTracks?.filter(track => track.Type === 'subtitle' || track.Type === 'closedcaption') || [];
                
                return (
                  <Card key={vodItem._id} className="group overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm hover:-translate-y-2">
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
                          <Film className="w-20 h-20 mx-auto mb-3 opacity-80" />
                          <p className="text-sm font-medium">No Poster Available</p>
                          <p className="text-xs opacity-80 line-clamp-2 px-4">{getLocalizedTitle(vodItem)}</p>
                        </div>
                      </div>
                      
                      {/* Enhanced overlay with detailed info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {videoInfo && (
                                <Badge className="bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground border-0 font-medium">
                                  {videoInfo.resolution.split(' × ')[1]}p {videoInfo.format}
                                </Badge>
                              )}
                              {fileSize && (
                                <Badge className="bg-gradient-to-r from-secondary/90 to-secondary/70 text-secondary-foreground border-0">
                                  {fileSize}
                                </Badge>
                              )}
                              {audioInfo && (
                                <Badge className="bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white border-0">
                                  {audioInfo.format} {audioInfo.channels}ch
                                </Badge>
                              )}
                              {hasTrailer(vodItem) && (
                                <Badge className="bg-gradient-to-r from-green-500/90 to-green-600/90 text-white border-0">
                                  <Play className="w-3 h-3 mr-1" />
                                  Trailer
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-white/90 text-xs">
                              <div className="flex items-center gap-3">
                                {availableLanguages.length > 1 && (
                                  <div className="flex items-center gap-1">
                                    <Languages className="w-3 h-3" />
                                    <span>{availableLanguages.length} audio</span>
                                  </div>
                                )}
                                {hasSubtitles && (
                                  <div className="flex items-center gap-1">
                                    <Monitor className="w-3 h-3" />
                                    <span>{subtitleTracks.length} subs</span>
                                  </div>
                                )}
                                {vodItem.protectionType && (
                                  <div className="flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    <span>{vodItem.protectionType}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Quality indicators */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between">
                        <div className="flex gap-2">
                          <Badge className={`backdrop-blur-md font-medium ${
                            isAvailable 
                              ? 'bg-green-500/90 text-white border-0' 
                              : 'bg-red-500/90 text-white border-0'
                          }`}>
                            {isAvailable ? 'Available' : 'Expired'}
                          </Badge>
                        </div>
                        
                        <Badge className="bg-black/40 text-white border-white/20 backdrop-blur-md text-xs font-medium">
                          {vodItem.publicityMetadata.Rating}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-6 pb-3">
                      <CardTitle className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {getLocalizedTitle(vodItem)}
                      </CardTitle>
                      <CardDescription className="space-y-2">
                        {/* Primary metadata */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{vodItem.publicityMetadata.ReleaseYear}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatRuntime(vodItem.publicityMetadata.Runtime)}</span>
                          </div>
                          <Badge variant="outline" className="font-medium">
                            {vodItem.publicityMetadata.Category}
                          </Badge>
                        </div>
                        
                        {/* Creative talent */}
                        {director && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span><strong>Director:</strong> {director}</span>
                          </div>
                        )}
                        
                        {mainCast.length > 0 && (
                          <div className="flex items-start gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mt-0.5 text-blue-500" />
                            <span className="line-clamp-2">
                              <strong>Cast:</strong> {mainCast.join(', ')}
                            </span>
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0">
                      <div className="space-y-4">
                        {/* Studio and technical specs */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">{vodItem.publicityMetadata.Studio}</span>
                          {videoInfo && (
                            <Badge variant="secondary" className="font-medium">
                              {videoInfo.resolution.split(' × ')[1]}p
                            </Badge>
                          )}
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                          {getLocalizedGenres(vodItem).slice(0, 3).map((genre, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-medium hover:bg-primary/10 transition-colors">
                              {genre.Text}
                            </Badge>
                          ))}
                          {getLocalizedGenres(vodItem).length > 3 && (
                            <Badge variant="outline" className="text-xs font-medium">
                              +{getLocalizedGenres(vodItem).length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Media features */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            {availableLanguages.length > 1 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Globe className="w-3 h-3 text-blue-500" />
                                <span>{availableLanguages.length} languages</span>
                              </div>
                            )}
                            {hasSubtitles && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Monitor className="w-3 h-3 text-green-500" />
                                <span>{subtitleTracks.length} subtitle tracks</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {fileSize && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <HardDrive className="w-3 h-3 text-purple-500" />
                                <span>{fileSize}</span>
                              </div>
                            )}
                            {audioInfo && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Info className="w-3 h-3 text-orange-500" />
                                <span>{audioInfo.format} {audioInfo.channels}ch</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Availability timeline with progress */}
                        <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-2">
                            <strong>License expires:</strong>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {new Date(vodItem.effectiveLicenseDates.LicenseEnd).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <div className="flex items-center gap-1 text-xs">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className={isAvailable ? 'text-green-600' : 'text-red-600'}>
                                {isAvailable ? 'Active' : 'Expired'}
                              </span>
                            </div>
                          </div>
                          {/* License progress bar */}
                          {(() => {
                            const start = new Date(vodItem.effectiveLicenseDates.LicenseStart);
                            const end = new Date(vodItem.effectiveLicenseDates.LicenseEnd);
                            const now = new Date();
                            const total = end.getTime() - start.getTime();
                            const elapsed = now.getTime() - start.getTime();
                            const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
                            
                            return (
                              <div className="w-full bg-muted/50 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    isAvailable ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            );
                          })()}
                        </div>

                        {/* Synopsis preview */}
                        <div className="bg-gradient-to-br from-background/50 to-muted/20 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {getLocalizedSynopsis(vodItem)}
                          </p>
                        </div>

                        {/* Film metadata */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                          <span>Film #{vodItem.identifiers.FilmNumber}</span>
                          {availableLanguages.length > 1 && (
                            <LanguageSelector
                              availableLanguages={availableLanguages}
                              selectedLanguage={selectedLanguage}
                              onLanguageChange={changeLanguage}
                              compact
                            />
                          )}
                        </div>

                        <MovieDetailDialog vodItem={vodItem} />
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