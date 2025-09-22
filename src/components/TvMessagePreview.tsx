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
    <div className="bg-slate-900 rounded-lg aspect-video relative overflow-hidden flex items-center justify-center p-8">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-sm" />
      
      {/* Content container */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className={`flex items-center gap-8 ${isVerticalImage ? 'flex-col' : 'flex-row'}`}>
          {/* Media section - left side for horizontal, top for vertical */}
          {hasMedia && (
            <div className={`flex-shrink-0 ${isVerticalImage ? 'mb-4' : 'mr-8'}`}>
              <div className={`bg-slate-700/60 rounded-lg overflow-hidden ${
                isVerticalImage 
                  ? 'w-full max-w-2xl h-32' 
                  : 'w-64 h-64'
              }`}>
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
                  // Placeholder when media fails to load
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
          <div className={`flex-1 text-white ${isVerticalImage ? 'text-center' : 'text-left'}`}>
            {/* Title */}
            {formData.subject && (
              <h1 className="text-3xl font-bold mb-3">
                {formData.subject}
              </h1>
            )}

            {/* Mock date and category */}
            <div className="text-slate-300 text-sm mb-4 flex items-center gap-2">
              <span>July 10th, 2025</span>
              <span>•</span>
              <span className="text-blue-400">Safety</span>
            </div>

            {/* Description */}
            {formData.description && (
              <p className="text-slate-200 text-lg leading-relaxed mb-6">
                {formData.description}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="flex justify-center mt-8 space-y-3 flex-col items-center">
          <button className="bg-white/90 hover:bg-white text-slate-900 px-8 py-3 rounded-full font-medium text-lg min-w-64">
            Close
          </button>
          {formData.deleteable && (
            <button className="bg-red-500/80 hover:bg-red-500 text-white px-8 py-3 rounded-full font-medium text-lg min-w-64">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};