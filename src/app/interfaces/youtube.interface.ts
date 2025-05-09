export interface VideoResponse {
    kind:          string;
    etag:          string;
    nextPageToken: string;
    regionCode:    string;
    pageInfo:      PageInfo;
    items:         Item[];
}

export interface Item {
    kind:    string;
    etag:    string;
    id:      {
        kind:       string;
        channelId?: string;
        videoId?:   string;
    };
    snippet: {
        publishedAt:          string;
        channelId:            string;
        title:                string;
        description:          string;
        thumbnails:           {
            default: {
                url:     string;
                width?:  number;
                
                height?: number;
            };
            medium: {
                url:     string;
                width?:  number;
                height?: number;
            };
            high: {
                url:     string;
                width?:  number;
                height?: number;
            };
        };
        channelTitle:         string;
        liveBroadcastContent: string;
        publishTime:          string;
    };
}

export interface PageInfo {
    totalResults:   number;
    resultsPerPage: number;
}
