import { Component, OnInit, ViewChild, ViewEncapsulation, computed, input } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    redirectURL = input<string>(); // ?redirectURL=/dashboard
    externalToken = input<string>('', { alias: 'token' }); // ?token=abc123 → this.externalToken()
    hasExternalToken = computed(() => !!this.externalToken());

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: [
                'hughes.brian@company.com',
                [Validators.required, Validators.email],
            ],
            password: ['admin', Validators.required],
            rememberMe: [''],
        });

        console.log('Redirect URL:', this.redirectURL());
        console.log('Has external token:', this.hasExternalToken());
        if (this.hasExternalToken()) {
            this.authenticateWithExternalToken();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            () => {
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL =
                    this.redirectURL() || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Correo electrónico o contraseña incorrectos',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }

    /**
     * Authenticate with external token from query params
     * Exchanges external token for our application token
     */
    authenticateWithExternalToken(): void {
        // Hide the alert
        this.showAlert = false;

        const externalToken = this.externalToken();
        console.log('Processing external token:', externalToken);

        // Intercambiar token externo por token de nuestra aplicación
        this._authService.authenticateWithExternalToken(externalToken).subscribe({
            next: (response) => {
                console.log('Authentication successful:', response);
                // response.accessToken = nuestro token de aplicación
                // Se almacena automáticamente en el AuthService
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
