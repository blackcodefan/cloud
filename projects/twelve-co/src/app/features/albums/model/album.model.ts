export interface albumCatItem {
    _id: string,
    name: string,
    originalSize: number,
    size: string,
    counter: number
}

export interface albumMemberItem {
    name: string,
    email: string
}

export interface AlbumItem {
    id: string,
    name: string,
    originalSize: number,
    size: string,
    counter: number,
    mediaList: Array<MediaItem>
}

export interface MediaItem {
    id: string,
    name: string,
    mediaUrl: string,
    mediaSize: string,
    mediaOriginalSize: number,
    mediaType: string,
    mediaHeight: number,
    mediaWidth: number,
    date: Date,
}
