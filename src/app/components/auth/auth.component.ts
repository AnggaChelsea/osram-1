import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})

export class AuthComponent implements OnInit, OnDestroy {

    subscription!: Subscription;
    loginForm: any = FormGroup;
    isSubmitted = false;
    isUnvalidated = false;
    isLoading = false;

    arrmask: any[] = [];

    maskconfig = {
        guide: false,
        showMask: false,
        mask: this.arrmask
    };

    constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required]
        });
        this.mask();
    }
    get formControls(): any {
        return this.loginForm.controls;
    }


    mask(): any {
        for (let i = 0; i < 8; i++) {
            this.arrmask.push(/[a-zA-Z0-9_ ]/);
        }
        return this.arrmask;
    }

    login(): any {
        this.isSubmitted = true;
        this.isLoading = true;
        if (this.loginForm.invalid) {
            this.isLoading = false;
            return;
        }
        this.subscription = this.authService.userValidate(this.loginForm.value).subscribe(
            (res: any) => {
                this.isLoading = false;
                this.isUnvalidated = false;
                localStorage.setItem('ACCESS_TOKEN', res);
                this.router.navigateByUrl('/qrcode');
            },
            (err: any) => {
                this.isLoading = false;
                this.isUnvalidated = true;
            }
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

}
