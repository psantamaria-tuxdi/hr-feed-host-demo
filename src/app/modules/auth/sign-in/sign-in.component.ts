import { Component, OnInit, ViewEncapsulation, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { FuseAlertType } from './../../../../@fuse/components/alert/alert.types';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [FuseAlertComponent, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit {
    /**
     * Query param inputs injected via Angular's withComponentInputBinding:
     * - `redirectURL`: optional redirect path (e.g. `?redirectURL=/dashboard`).
     * - `externalToken`: external SSO token provided as `?token=abc123`.
     */
    redirectURL = input<string>();
    externalToken = input<string>('', { alias: 'token' });

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit(): Promise<void> {
        if (this.externalToken()) {
            if (this._authService.accessToken) {
                await firstValueFrom(this._authService.signOut());
            }

            this.authenticateWithExternalToken();
            return;
        }

        if (!this._authService.accessToken) {
            this.alert = {
                type: 'warning',
                message: 'Sin datos de inicio de sesión',
            };
            this.showAlert = true;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Authenticate with external token from query params
     * Exchanges external token for our application token
     */
    authenticateWithExternalToken(): void {
        // Hide the alert
        this.showAlert = false;

        const externalToken = this.externalToken();

        // Intercambiar token externo por token de nuestra aplicación
        this._authService.authenticateWithExternalToken(externalToken).subscribe({
            next: () => {
                const redirectURL = this.redirectURL() || '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            error: (error) => {
                console.error('Authentication failed:', error);
                this.alert = {
                    type: 'error',
                    message: 'Sesión inválida o expirada',
                };
                this.showAlert = true;
            }
        });
    }
}
