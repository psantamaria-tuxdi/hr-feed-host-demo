import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User | null> = new ReplaySubject<User | null>(1);

    private readonly userKey = 'hr-feed.user';

    constructor() {
        this.loadFromStorage();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
        localStorage.setItem(this.userKey, JSON.stringify(value));
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    reset() {
        this._user.next(null);
        localStorage.removeItem(this.userKey);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    // /**
    //  * Update the user
    //  *
    //  * @param user
    //  */
    // update(user: User): Observable<any> {
    //     return this._httpClient.patch<User>('api/common/user', { user }).pipe(
    //         map((response) => {
    //             this._user.next(response);
    //         })
    //     );
    // }

    private loadFromStorage(): void {
        const user = localStorage.getItem(this.userKey);
        if (user) {
            try {
                this._user.next(JSON.parse(user));
            } catch (e) {
                console.error('Error parsing user from localStorage', e);
                localStorage.removeItem(this.userKey);
            }
        }
    }
}
