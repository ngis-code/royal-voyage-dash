// Channel API service for IPTV system
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY

export interface Channel {
  _id: string
  _permissions: string[]
  category: string
  channelType: "ip" | "rf"
  createdAt: string
  description: string
  imgUrl: string
  status: "active" | "inactive"
  // IP channel fields
  ip?: string
  ipBroadcastType?: string
  port?: string
  // RF channel fields
  majorNumber?: string
  minorNumber?: string
  rfBroadcastType?: string
  name: string
  updatedAt: string
}

export interface ChannelResponse {
  status: number
  payload: {
    documents: Channel[]
    canAccessAllDocuments: boolean
    pagination: {
      offset: number
      limit: number
      total: number
    }
  }
}

export interface CreateChannelRequest {
  category: string
  channelType: "ip" | "rf"
  description: string
  imgUrl: string
  name: string
  status: "active" | "inactive"
  // IP channel fields
  ip?: string
  ipBroadcastType?: string
  port?: string
  // RF channel fields
  majorNumber?: string
  minorNumber?: string
  rfBroadcastType?: string
}

export interface HealthResponse {
  status: number;
  payload: {
    status: string;
    timestamp: string;
    services: {
      mongo: { status: string };
      redis: { status: string };
    };
    optionalServices: {
      typesense: { status: string };
    };
  };
}

export interface VodItem {
  _id: string
  _createdBy: string
  _permissions: string[]
  asset: {
    MediaFileInfoLocation: string
    Location: string
    EmbeddedTracks: Array<{
      TrackNumber: number
      Type: string
      Description: string
      IsoCode: string
      Format: string
      NumberOfChannels: number | null
    }>
    SidecarAssetTracks: Array<{
      Location: string
      Type: string
      Description: string
      IsoCode: string
      Format: string
      NumberOfChannels: number | null
    }>
  }
  createdAt: string
  drmKeyInfo: any
  effectiveLicenseDates: {
    LicenseStart: string
    LicenseEnd: string
  }
  filmVersion: string
  identifiers: {
    FilmNumber: string
  }
  lastIngestedAt: string
  mediaFileInfo: {
    General: {
      SwankProductNumber: number
      FilmVersion: string
      FileSizeInMb: number
      FileSizeBytes: number
      DateCreated: string
      DateModified: string
      Location: string
      Format: string
      FileRuntime: string
      BitRateMode: string
      BitRate: string
    }
    VideoTracks: any[]
    AudioTracks: any[]
    SubtitleTracks: any[]
    ClosedCaptionTracks: any[]
  }
  protectionType: string
  publicityMetadata: {
    Title: string
    SwankTitle: string
    Type: string
    OriginalType: string
    ReleaseYear: number
    Runtime: number
    Remove: boolean
    Color: string
    LastModified: string
    ParentProductNumber: any
    Studio: string
    Category: string
    Subcategory: any
    Rating: string
    SeasonNumber: any
    EpisodeNumber: any
    SequenceNumber: any
    EarliestAvailabilityDateSortBy: string
    Identifiers: Array<{
      Name: string
      Value: string
      OriginalType: string
    }>
    Titles: Array<{
      Locale: string
      Text: string
      SourceType: string
    }>
    Synopses: Array<{
      Locale: string
      Text: string
      SourceType: string
    }>
    Genres: Array<{
      Locale: string
      Text: string
    }>
    Tags: Array<{
      Locale: string
      Text: string
      SourceType: string
    }>
    Cast: Array<{
      PartName: string
      Name: string
      DisplayOrder: number
      Role: string
    }>
    Crew: Array<{
      Name: string
      DisplayOrder: number
      Role: string
    }>
    Ratings: Array<{
      Authority: string
      Value: string
    }>
    Assets: Array<{
      Name: string
      AssetType: string
      FileType: string
      Location: string
      Locale: string
    }>
    Episodes: any[]
  }
  raw?: {
    Title: string
    PublicityMetadataLocation: string
    Identifiers: {
      FilmNumber: string
    }
    DRMKeyInfo: any
    EffectiveLicenseDates: {
      LicenseStart: string
      LicenseEnd: string
    }
    ProtectionType: string
    FilmVersion: string
    Asset: any
    StreamingManifests: any
  }
  resolvedAssets?: any
}

export interface VodResponse {
  status: number
  payload: {
    documents: VodItem[]
    canAccessAllDocuments: boolean
    pagination: {
      offset: number
      limit: number
      total: number
    }
  }
}

// Get all channels
export const getChannels = async (): Promise<ChannelResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      databaseId: 'royaltv_main',
      collectionId: 'channels',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch channels: ${response.statusText}`)
  }

  return response.json()
}

// Create a new channel
export const createChannel = async (channelData: CreateChannelRequest): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/channels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(channelData),
  })

  if (!response.ok) {
    throw new Error(`Failed to create channel: ${response.statusText}`)
  }

  return response.json()
}

// Update a channel
export const updateChannel = async (channelId: string, channelData: Partial<CreateChannelRequest>): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/channels/${channelId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(channelData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update channel: ${response.statusText}`)
  }

  return response.json()
}

// Delete a channel
export const deleteChannel = async (channelId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/channels/${channelId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete channel: ${response.statusText}`)
  }

  return response.json()
}

// Get all VOD items
export const getVodItems = async (): Promise<VodResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      databaseId: 'royaltv_main',
      collectionId: 'vod_imports',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch VOD items: ${response.statusText}`)
  }

  return response.json()
}

// Health check
export const getHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
};