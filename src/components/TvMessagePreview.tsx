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
  const isVerticalImage = hasMedia && formData.mediaOrientation === "vertical";

  return (
    <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-sm" />
      
      {/* Content container - full height layout */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* For horizontal: image banner on top, for vertical: image left + content right */}
        {formData.mediaOrientation === "horizontal" ? (
          <div className="flex flex-col h-full">
            {/* Image banner on top for horizontal */}
            {hasMedia && (
              <div className="w-full mb-6">
                <div className="bg-slate-700/60 rounded-lg overflow-hidden h-32 w-full">
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
                    <video 
                      src={formData.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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

            {/* Text content section */}
            <div className="flex-1 text-white text-center flex flex-col justify-center">
              {/* Title */}
              {formData.subject && (
                <h1 className="text-2xl font-bold mb-2">
                  {formData.subject}
                </h1>
              )}

              {/* Mock date and category */}
              <div className="text-slate-300 text-sm mb-3 flex items-center justify-center gap-2">
                <span>July 10th, 2025</span>
                <span>•</span>
                <span className="text-blue-400">Safety</span>
              </div>

              {/* Description */}
              {formData.description && (
                <p className="text-slate-200 text-base leading-relaxed mb-4">
                  {formData.description}
                </p>
              )}
            </div>

            {/* Action buttons at bottom */}
            <div className="flex justify-center gap-3 mt-4">
              <button className="bg-white/90 hover:bg-white text-slate-900 px-6 py-2 rounded-full font-medium text-sm">
                Close
              </button>
              {formData.deleteable && (
                <button className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-full font-medium text-sm">
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Vertical layout: image on left, content on right */
          <div className="flex h-full gap-6">
            {/* Image on left for vertical */}
            {hasMedia && (
              <div className="flex-shrink-0 w-48">
                <div className="bg-slate-700/60 rounded-lg overflow-hidden h-full w-full">
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
                    <video 
                      src={formData.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
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

            {/* Content section on right */}
            <div className="flex-1 text-white flex flex-col justify-center">
              {/* Title */}
              {formData.subject && (
                <h1 className="text-2xl font-bold mb-2">
                  {formData.subject}
                </h1>
              )}

              {/* Mock date and category */}
              <div className="text-slate-300 text-sm mb-3 flex items-center gap-2">
                <span>July 10th, 2025</span>
                <span>•</span>
                <span className="text-blue-400">Safety</span>
              </div>

              {/* Description */}
              {formData.description && (
                <p className="text-slate-200 text-base leading-relaxed mb-4">
                  {formData.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 mt-4">
                <button className="bg-white/90 hover:bg-white text-slate-900 px-6 py-2 rounded-full font-medium text-sm w-48">
                  Close
                </button>
                {formData.deleteable && (
                  <button className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-2 rounded-full font-medium text-sm w-48">
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