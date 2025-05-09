import { Video } from "../interfaces/video.interface";
import { Item } from "../interfaces/youtube.interface";

export class VideoMapper {
    static mapVideoItem( item: Item ): Video {
        return {
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            title: item.snippet.title,
            description: item.snippet.description,
            videoId: item.id.videoId || "",
            url: item.snippet.thumbnails.default.url,
            thumbnails: {
                default: { url: item.snippet.thumbnails.default.url },
                medium: { url: item.snippet.thumbnails.medium.url },
                high: { url: item.snippet.thumbnails.high.url }
            }
        };
    }

    static mapVideoList( items: Item[] ): Video[] {
        return items.map(this.mapVideoItem);
    }
}