import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/apiErrorHandler";
import { getApiHeaders } from "@/lib/apiHeaders";
import { deleteHlsVideo } from "./imageUploadApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AdDocument {
    /**
     * Ad ID
     */
    _id: string;
    createdAt: string;
    updatedAt: string;
    /**
     * marketing campaign group
     */
    campaign_id?: string;
    /**
     * Advertiser ID
     */
    advertiser_id?: string;
    /**
     * The format of ad - image or video
     */
    ad_format?: "image" | "video";
    /**
     * The url of image/video ad
     */
    ad_url?: string;
}

export interface Response<T> {
    status: number;
    payload: T;
}

export interface ListDocumentsResponse<T> {
    status: number;
    payload: {
        documents: T[];
        canAccessAllDocuments: boolean;
        pagination: {
            offset: number;
            limit: number;
            total: number;
        };
    };
}

export async function listAds(params: {
    limit?: number;
    offset?: number;
    filter?: Partial<AdDocument>;
    sort?: Record<string, 'asc' | 'desc'>
}): Promise<ListDocumentsResponse<AdDocument>> {
    const sortParameter: Record<string, 1 | -1> | undefined = params.sort
        ? Object.fromEntries(Object.entries(params.sort).map(([k, v]) => [k, v === 'asc' ? 1 : -1]))
        : undefined;

    const response = await fetch(`${API_BASE_URL}/api/databases/list-documents`, {
        method: 'POST',
        credentials: 'include',
        headers: getApiHeaders(),
        body: JSON.stringify({
            databaseId: "royaltv_main",
            collectionId: "ads",
            limit: params.limit ?? 25,
            offset: params.offset ?? 0,
            ...params.filter,
            $sort: sortParameter
        })
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function createAd(message: Omit<AdDocument, 'createdAt' | 'updatedAt'> & { _id: string | undefined }): Promise<Response<AdDocument>> {
    const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/ads/${message?._id ? message._id : ''}`, {
        method: 'POST',
        credentials: 'include',
        headers: getApiHeaders(),
        body: JSON.stringify(message)
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function updateAd(adId: string, update: Partial<Omit<AdDocument, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Response<AdDocument>> {
    const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/ads/${adId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getApiHeaders(),
        body: JSON.stringify(update)
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    return response.json();
}

export async function deleteAd(adId: string, videoUrl: string | undefined): Promise<void> {
    let videoDeletionError: string | null = null;
    try {
        await deleteHlsVideo(videoUrl ? videoUrl.split('/').pop() || '' : '');
    } catch (err) {
        videoDeletionError = JSON.stringify(err);
        console.error('Error deleting HLS video:', err);
    }

    const response = await fetch(`${API_BASE_URL}/api/databases/royaltv_main/ads/${adId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getApiHeaders()
    });

    if (videoDeletionError) {
        toast({
            variant: "destructive",
            title: "Video Deletion Error",
            description: videoDeletionError,
        });
    }

    if (!response.ok) {
        await handleApiError(response);
    }
}