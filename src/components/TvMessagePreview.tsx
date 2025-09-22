import { GuestMessage } from "@/services/guestMessageApi";

interface TvMessagePreviewProps {
  formData: {
    subject: string;
    description: string;
    type: "action" | "survey" | "notification";
    mediaType?: "image" | "video";
    mediaOrientation: "horizontal" | "vertical";
    mediaUrl: string;
    deleteable: boolean;
    tags?: string[];
  };
}

export const TvMessagePreview = ({ formData }: TvMessagePreviewProps) => {
  // Only show preview for notification type
  if (formData.type !== "notification") {
    return (
      <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg font-medium">Preview Not Available</p>
          <p className="text-sm">Preview will be available for {formData.type} messages in the future</p>
        </div>
      </div>
    );
  }

  const hasMedia = formData.mediaUrl && formData.mediaType;
  const isVideo = formData.mediaType === "video";

  return (
    <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-sm" />
      
      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header - Left aligned text content */}
        <div className="text-white mb-4">
          {/* Title */}
          {formData.subject && (
            <h1 className="text-2xl font-bold mb-2 text-left">
              {formData.subject}
            </h1>
          )}

          {/* Date and tags */}
          <div className="text-slate-300 text-sm mb-3 flex items-center gap-2 text-left">
            <span>July 10th, 2025</span>
            {formData.tags && formData.tags.length > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-400">{formData.tags.join(", ")}</span>
              </>
            )}
          </div>
        </div>

        {/* Media section - centered in available space */}
        <div className="flex-1 flex flex-col items-center justify-center mb-4">
          {hasMedia && (
            <div className="w-full max-w-md">
              <div className="bg-slate-700/60 rounded-lg overflow-hidden aspect-video relative">
                {formData.mediaType === 'image' ? (
                  <img 
                    src={formData.mediaUrl} 
                    alt="Message media"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : formData.mediaType === 'video' ? (
                  <>
                    <video 
                      src={formData.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Play button overlay for video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-600/50 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <div className="w-8 h-8 border-2 border-current rounded mb-2 mx-auto" />
                      <p className="text-xs">Media</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description - centered below media */}
          {formData.description && (
            <div className="text-white text-center mt-4 max-w-lg">
              <p className="text-slate-200 text-base leading-relaxed">
                {formData.description}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons at bottom - side by side */}
        <div className="flex justify-center gap-3">
          <button className="bg-white/90 hover:bg-white text-slate-900 px-8 py-3 rounded-full font-medium text-sm min-w-[120px]">
            Close
          </button>
          {formData.deleteable && (
            <button className="bg-red-500/80 hover:bg-red-500 text-white px-8 py-3 rounded-full font-medium text-sm min-w-[120px]">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};