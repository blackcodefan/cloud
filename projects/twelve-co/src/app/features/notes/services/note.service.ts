import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Note, NoteBlobData, NoteSave, NoteSaveMember } from '../model/note.model';

@Injectable({
    providedIn: 'root',
})
export class NoteService {
    baseHref = environment.apiUrl;
    noteHref = `${ this.baseHref }notes`;
    data = [
        {
            'headerText': 'officia aute aliquip id anim nisi',
            'body': 'In laborum laborum amet occaecat nisi. Minim qui amet duis ad dolore eu duis labore. Ex consequat ut fugiat anim mollit. Veniam sint exercitation ex ipsum proident id eiusmod commodo sunt aute in esse. Et pariatur cupidatat minim deserunt anim. Ullamco irure consequat eu id esse excepteur.',
        },
        {
            'headerText': 'magna dolore irure sit sit exercitation',
            'body': 'Dolore ea laborum aliquip laboris velit ad qui. Exercitation incididunt cupidatat ullamco aliqua sit enim consequat pariatur commodo sint reprehenderit. Duis labore adipisicing nisi in enim irure consectetur. Deserunt culpa aliqua nostrud labore tempor magna pariatur sunt occaecat voluptate dolore. Ut dolore pariatur minim dolore cupidatat excepteur eiusmod aliquip mollit aliquip sunt reprehenderit minim. Culpa excepteur nisi laboris fugiat proident ut.',
        },
        {
            'headerText': 'do aliquip voluptate minim qui eiusmod',
            'body': 'Laboris veniam id esse id quis ad adipisicing. Sunt pariatur ea minim voluptate laboris exercitation sit nisi. Adipisicing non adipisicing nulla anim adipisicing sint occaecat commodo esse et. Mollit laboris cillum dolore aute. Minim velit cupidatat amet cillum Lorem aliqua labore nostrud aliquip amet. Consequat consequat consequat laborum est aliqua quis culpa in culpa incididunt laborum commodo.',
        },
        {
            'headerText': 'laboris irure magna cupidatat anim est',
            'body': 'Mollit irure amet culpa labore minim proident. Nostrud laborum minim ea sit cillum culpa consectetur reprehenderit eu aliquip elit irure magna ad. Voluptate sint commodo tempor do aute. Laboris qui deserunt sint voluptate. Sint est dolore eu cupidatat dolor eu dolor. Proident laboris nostrud aliqua eu ex Lorem do non laboris laborum dolore.',
        },
        {
            'headerText': 'duis amet labore do esse officia',
            'body': 'Et aliquip exercitation voluptate ad aute excepteur velit. Tempor reprehenderit consectetur eiusmod exercitation reprehenderit. Ipsum veniam in irure cupidatat ad consequat amet minim reprehenderit minim anim dolore. Do dolor consequat mollit laboris amet dolor aliquip veniam deserunt. Adipisicing qui ipsum veniam ea amet. Ut consectetur eu esse nulla elit ex tempor cillum sunt consequat cupidatat nisi magna.',
        },
        {
            'headerText': 'et ipsum Lorem veniam ut nostrud',
            'body': 'Reprehenderit minim qui magna tempor deserunt id ullamco. Officia commodo officia reprehenderit est est ut reprehenderit reprehenderit duis non ipsum labore aliquip laboris. Eiusmod minim cupidatat dolor quis duis et fugiat esse irure cillum. Aliquip do esse irure non commodo consequat eu et voluptate magna amet sit. Sit ex duis exercitation pariatur elit. Pariatur eiusmod voluptate et reprehenderit enim.',
        },
        {
            'headerText': 'reprehenderit reprehenderit laboris velit qui consectetur',
            'body': 'Ipsum nulla tempor magna incididunt. Et duis esse Lorem est irure dolor ex commodo non voluptate nulla ex. Sint aliquip dolor nisi reprehenderit. Adipisicing ut nisi ut laborum eu proident sit non velit officia nulla ad eiusmod. Ea cillum cillum eu pariatur excepteur duis amet incididunt voluptate occaecat ea. Veniam culpa officia mollit eiusmod eiusmod excepteur ullamco ex eiusmod et sunt incididunt nostrud.',
        },
        {
            'headerText': 'in dolor aute eiusmod nostrud aute',
            'body': 'Do dolor ut elit amet aliqua nisi quis ex nulla. In quis exercitation ut aliquip. Enim ullamco enim irure non. Eiusmod nostrud consequat mollit ea eiusmod enim aliqua elit cillum magna aute exercitation proident irure. Exercitation laboris sit eu tempor. Ipsum est tempor ipsum labore magna veniam.',
        },
        {
            'headerText': 'anim dolore Lorem ipsum reprehenderit reprehenderit',
            'body': 'Commodo ea pariatur deserunt officia nulla eu et qui Lorem aliqua aute velit pariatur minim. Consectetur veniam quis aliqua id ullamco labore eiusmod ullamco ex. Consequat magna ea duis aliqua adipisicing incididunt aliqua incididunt id sit. Mollit aute sint ullamco eiusmod ad enim et sit sint cillum mollit non. Excepteur voluptate laborum reprehenderit id commodo anim anim minim non irure nulla officia et nisi. Quis dolor esse cupidatat dolore sunt non proident consequat.',
        },
        {
            'headerText': 'aliquip tempor officia nulla ullamco sit',
            'body': 'Do duis quis et dolor adipisicing. Non eiusmod consectetur dolor qui irure. Sunt sint enim minim occaecat nulla labore aliquip fugiat aliqua laboris voluptate aute adipisicing. Eu ipsum Lorem mollit aute est enim cillum culpa enim cupidatat aliqua. Non incididunt Lorem labore tempor. Laboris fugiat ut ut pariatur.',
        },
    ];

    constructor(private httpClient: HttpClient) {
    }

    /**
     * fetches notes for given user
     */
    fetchNotesForCurrentAccount(): Observable<Array<Note>> {
        return this.httpClient.get<Array<Note>>(this.noteHref);
    }

    /**
     * fetches media for a given note
     * @param id
     */
    getMediaFromNotes(id: string | undefined): Observable<Array<NoteBlobData>> {
        return of();

    }

    /*
      MultipartFile[] attachments;
    private String title;
    private String content;
    private List<NoteMember> members;

     */
    /*
    public class NoteMember implements Serializable {
    private Long id; // if the invitee is an existing account;
    private String email; // if the invitee is an email; maybe do??

     */

    saveNote(note: NoteSave) {
        return this.httpClient.post(this.noteHref, note);

    }
}
