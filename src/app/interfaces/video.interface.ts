export interface Video {
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    videoId: string;
    url: string;
    thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
    };
}