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
      <div className="bg-slate-900 rounded-lg min-h-[300px] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg font-medium">Preview Not Available</p>
          <p className="text-sm">Preview will be available for {formData.type} messages in the future</p>
        </div>
      </div>
    );
  }

  const hasMedia = formData.mediaUrl && formData.mediaType;
  const isVideo = formData.mediaType === "video";

  // For video, use same layout regardless of orientation
  if (isVideo) {
    return (
      <div className="bg-slate-900 rounded-lg min-h-[400px] relative overflow-hidden">
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
                <div className="bg-slate-700/60 rounded-lg overflow-hidden min-h-[200px] aspect-video relative">
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
                </div>
              </div>
            )}

            {/* Description - left aligned below media */}
            {formData.description && (
              <div className="text-white text-left mt-4 max-w-lg w-full">
                <p className="text-slate-200 text-base leading-relaxed">
                  {formData.description}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons at bottom - full width column */}
          <div className="flex flex-col gap-2 max-w-sm mx-auto w-full mt-auto">
            <button className="bg-white/90 hover:bg-white text-slate-900 py-3 rounded-full font-medium text-sm w-full">
              Close
            </button>
            {formData.deleteable && (
              <button className="bg-red-500/80 hover:bg-red-500 text-white py-3 rounded-full font-medium text-sm w-full">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For images, use different layouts based on orientation
  return (
    <div className="bg-slate-900 rounded-lg min-h-[400px] relative overflow-hidden">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-sm" />
      
      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* For horizontal: image banner on top, for vertical: image left + content right */}
        {formData.mediaOrientation === "horizontal" ? (
          <div className="flex flex-col h-full">
            {/* Image banner on top for horizontal */}
            {hasMedia && (
              <div className="w-full mb-4">
                <div className="bg-slate-700/60 rounded-lg overflow-hidden min-h-[120px] w-full">
                  <img 
                    src={formData.mediaUrl} 
                    alt="Message media"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

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

            {/* Description */}
            <div className="flex-1 text-white mb-4">
              {formData.description && (
                <p className="text-slate-200 text-base leading-relaxed text-left">
                  {formData.description}
                </p>
              )}
            </div>

            {/* Action buttons at bottom - full width column */}
            <div className="flex flex-col gap-2 max-w-sm mx-auto w-full mt-auto">
              <button className="bg-white/90 hover:bg-white text-slate-900 py-3 rounded-full font-medium text-sm w-full">
                Close
              </button>
              {formData.deleteable && (
                <button className="bg-red-500/80 hover:bg-red-500 text-white py-3 rounded-full font-medium text-sm w-full">
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Vertical layout: image on left, content on right */
          <div className="flex h-full gap-6 min-h-[300px]">
            {/* Image on left for vertical */}
            {hasMedia && (
              <div className="flex-shrink-0 w-48">
                <div className="bg-slate-700/60 rounded-lg overflow-hidden min-h-[200px] w-full">
                  <img 
                    src={formData.mediaUrl} 
                    alt="Message media"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Content section on right */}
            <div className="flex-1 text-white flex flex-col min-h-0">
              {/* Header - Left aligned text content */}
              <div className="mb-4">
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

              {/* Description */}
              <div className="flex-1 mb-4">
                {formData.description && (
                  <p className="text-slate-200 text-base leading-relaxed text-left">
                    {formData.description}
                  </p>
                )}
              </div>

              {/* Action buttons - full width column */}
              <div className="flex flex-col gap-2 max-w-sm w-full mt-auto">
                <button className="bg-white/90 hover:bg-white text-slate-900 py-3 rounded-full font-medium text-sm w-full">
                  Close
                </button>
                {formData.deleteable && (
                  <button className="bg-red-500/80 hover:bg-red-500 text-white py-3 rounded-full font-medium text-sm w-full">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};