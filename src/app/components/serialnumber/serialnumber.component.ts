import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';

@Component({
  selector: 'app-serialnumber',
  templateUrl: './serialnumber.component.html',
  styleUrls: ['./serialnumber.component.scss']
})
export class SerialnumberComponent implements OnInit, OnDestroy {

  subscription1!: Subscription;

  isUnvalidated = false;
  isLoading = false;
  isSubmitted = false;
  serialNumberForm!: FormGroup;

  arrmask: any[] = [];

  maskconfig = {
    guide: false,
    showMask: false,
    mask: this.arrmask
  };

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.createForm();
    this.mask();
  }

  mask(): any {
    for (let i = 0; i < 11; i++) {
      this.arrmask.push(/[a-zA-Z0-9_]/);
    }
    return this.arrmask;
  }

  createForm(): void {
    this.serialNumberForm = this.fb.group({
      serial_number: ['', Validators.required]
    });
  }

  onSubmit(formData: any): void {
    // const serialnumber = formData.serial_number;
    this.isSubmitted = true;
    this.isLoading = true;
    if (this.serialNumberForm.invalid) {
      this.isLoading = false;
      this.isUnvalidated = true;
      return;
    }
    this.subscription1 = this.apiService.validateQrcode(this.serialNumberForm.value).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.isUnvalidated = false;
        this.router.navigateByUrl('/' + res.data.serial_number);
      },
      (err: any) => {
        this.isLoading = false;
        this.isUnvalidated = true;
      }
    );
  }

  ngOnDestroy(): void{
    this.subscription1.unsubscribe();
  }

}
