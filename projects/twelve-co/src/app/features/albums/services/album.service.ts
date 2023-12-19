import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 } from 'uuid';
import { environment } from '../../../../environments/environment';
import { MediaItem } from '../model';

@Injectable({ providedIn: 'root' })
export class AlbumService {
    private SearchAlbumStatus = new BehaviorSubject(false);
    private CurrentAlbumMediaStatus = new BehaviorSubject(false);

    constructor(
        private _http: HttpClient,
    ) {
    }

    createNewMedia(name: string, mediaUrl: string, mediaType: string, mediaOriginalSize: number, mediaSize: string, mediaHeight: number, mediaWidth: number) {
        const newMedia: MediaItem = {
            id: v4(),
            name: name,
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            mediaSize: mediaSize,
            mediaOriginalSize: mediaOriginalSize,
            mediaHeight: mediaHeight,
            mediaWidth: mediaWidth,
            date: new Date(),
        };
        return newMedia;
    }

    getAlbumList(id: string) {
        const req = new HttpRequest('GET', `${ environment.emailUrl }/albums/list/${ id }`, {
            responseType: 'json',
        });
        return this._http.request(req);
    }

    getSearchAlbumStatus(): Observable<boolean> {
        return this.SearchAlbumStatus.asObservable();
    }

    setSearchAlbumStatus(status: boolean) {
        this.SearchAlbumStatus.next(status);
    }

    getCurrentAlbumMediaStatus(): Observable<boolean> {
        return this.CurrentAlbumMediaStatus.asObservable();
    }

    updateCurrentAlbumMediaStatus(status: boolean) {
        this.CurrentAlbumMediaStatus.next(status);
    }

    addNewAlbumCategory(formData: any) {
        const req = new HttpRequest('POST', `${ environment.emailUrl }/albums/add`, formData, {
            responseType: 'json',
        });
        return this._http.request(req);
    }

    upload(file: File, userID: string, albumID: string): Observable<HttpEvent<any>> {
        const formData: FormData = new FormData();
        formData.append('userID', userID);
        formData.append('albumID', albumID);
        formData.append('albumMedia', file);
        const req = new HttpRequest('POST', `${ environment.emailUrl }/albums/add-media`, formData, {
            reportProgress: true,
            responseType: 'json',
        });
        return this._http.request(req);
    }

    updateFileCounter(data: any) {
        const req = new HttpRequest('POST', `${ environment.emailUrl }/albums/update-album`, data, {
            responseType: 'json',
        });
        return this._http.request(req);
    }

    getMediasByAlbumID(albumID: string, userID: string): Observable<any> {
        return this._http.get(`${ environment.emailUrl }/albums/medias/list/${ albumID }/${ userID }`);
    }


}
