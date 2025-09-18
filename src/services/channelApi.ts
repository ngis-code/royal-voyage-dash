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