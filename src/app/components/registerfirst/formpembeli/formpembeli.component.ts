import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/shared/service/api.service';
import { mimeType } from './mime-type.validator';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';

// declare const $: any;

@Component({
  selector: 'app-formpembeli',
  templateUrl: './formpembeli.component.html',
  styleUrls: ['./formpembeli.component.scss']
})
export class FormpembeliComponent implements OnInit {

  idqrcode: any;
  isUnvalidated = false;
  isLoading = false;
  isSubmitted = false;

  pembeliForm!: FormGroup;

  imgFile1 = '';
  imgFile2 = '';
  imgFile3 = '';
  imgFile4 = '';
  imgFile5 = '';
  imgFile6 = '';
  imgData: any;
  choosenimg = false;

  selectedFiles?: FileList | undefined;
  progressInfos: any[] = [];
  message: string[] = [];
  fileInfos?: Observable<any>;

  videoFile = '';
  videoData: any;
  choosenvideo: any;

  selectedVideoFiles?: FileList | undefined;
  progressInfosVideo: any[] = [];
  messageVideo: string[] = [];
  fileVideoInfos?: Observable<any>;

  arrmask: any[] = [];
  arrmask2: any[] = [];
  maskconfig = {
    guide: false,
    showMask: false,
    mask: this.arrmask
  };
  maskconfig2 = {
    guide: false,
    showMask: false,
    mask: this.arrmask2
  };

  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.idqrcode = this.activatedRoute.snapshot.paramMap.get('idqrcode');
    this.fileInfos = this.apiService.getPembeliImage(this.idqrcode);

    this.apiService.getPembeli(this.idqrcode).subscribe(
      (res: any) => {
        this.isLoading = false;
        const data = res.data;
        if (data) {
          this.pembeliForm.patchValue({
            nama_pembeli: data.nama_pembeli,
            nomor_polisi: data.nomor_polisi,
            merk_mobil: data.merk_mobil,
            no_invoice: data.no_invoice,
            deskripsi: data.deskripsi
          });
        }
        if (data.nama_pembeli !== '') {
          this.router.navigate(['/welcome/' + this.idqrcode]);
        }
      },
      err => {
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Data tidak ditemukan!',
            confirmButtonText: `Isi Ulang Serial Number`,
          }).then((_) => {
            this.router.navigate(['/']);
          });
        }, 1000);
      }
    );

    this.createForm();
    this.mask();
    this.mask2();
  }

  mask(): any {
    for (let i = 0; i < 15; i++) {
      this.arrmask.push(/[a-zA-Z0-9_ ]/);
    }
    return this.arrmask;
  }

  mask2(): any {
    for (let i = 0; i < 100; i++) {
      this.arrmask2.push(/[a-zA-Z0-9_ ]/);
    }
    return this.arrmask2;
  }

  get formControls(): any {
    return this.pembeliForm.controls;
  }

  createForm(): void {
    this.pembeliForm = this.fb.group({
      nama_pembeli: ['', Validators.required],
      nomor_polisi: ['', Validators.required],
      merk_mobil: ['', Validators.required],
      no_invoice: ['', Validators.required],
      deskripsi: [''],
      image: ['', { validators: Validators.required, asyncValidators: [mimeType] }],
      video: [''],
      instagram: [''],
    });
  }

  // mutiple files====================================================
  onVideoChange(event: any): void {
    this.isLoading = true;
    this.messageVideo = [];
    this.progressInfosVideo = [];
    this.selectedVideoFiles = event.target.files;
    this.uploadVideos();
  }
  uploadVideos(): void {
    this.messageVideo = [];

    if (this.selectedVideoFiles) {
      for (let i = 0; i < this.selectedVideoFiles.length; i++) {
        this.onSubmitVideo(i, this.selectedVideoFiles[i]);
      }
    }
  }
  onSubmitVideo(idx: number, file: File): void {
    this.progressInfosVideo[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliVideo(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfosVideo[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Video berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfosVideo[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Gagal upload',
            text: 'Silahkan upload sesuai ketentuan.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
          // const msg = 'Could not upload the file: ' + file.name;
          // this.messageVideo.push(msg);
          // this.fileVideoInfos = this.apiService.getPembeliVideo(this.idqrcode);
        });
    }
  }


  // single File ========================================
  onImageChange1(event: any): void {
    this.isLoading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.value) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile1 = reader.result as string;
      };
    }

    this.uploadImages1();
  }
  uploadImages1(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.onSubmitImage1(i, this.selectedFiles[i]);
      }
    }
  }
  onSubmitImage1(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliImage1(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Foto berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan upload ulang.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
        });
    }
  }

  onImageChange2(event: any): void {
    this.isLoading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.value) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile2 = reader.result as string;
      };
    }
    this.uploadImages2();
  }
  uploadImages2(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.onSubmitImage2(i, this.selectedFiles[i]);
      }
    }
  }
  onSubmitImage2(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliImage2(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Foto berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan upload ulang.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
        });
    }
  }

  onImageChange3(event: any): void {
    this.isLoading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.value) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile3 = reader.result as string;
      };
    }
    this.uploadImages3();
  }
  uploadImages3(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.onSubmitImage3(i, this.selectedFiles[i]);
      }
    }
  }
  onSubmitImage3(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliImage3(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Foto berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan upload ulang.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
        });
    }
  }

  onImageChange4(event: any): void {
    this.isLoading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.value) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile4 = reader.result as string;
      };
    }
    this.uploadImages4();
  }
  uploadImages4(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.onSubmitImage4(i, this.selectedFiles[i]);
      }
    }
  }
  onSubmitImage4(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliImage4(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Foto berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan upload ulang.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
        });
    }
  }

  onImageChange5(event: any): void {
    this.isLoading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.value) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile5 = reader.result as string;
      };
    }
    this.uploadImages5();
  }
  uploadImages5(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.onSubmitImage5(i, this.selectedFiles[i]);
      }
    }
  }
  onSubmitImage5(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliImage5(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Foto berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan upload ulang.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
        });
    }
  }

  onImageChange6(event: any): void {
    this.isLoading = true;
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    const reader = new FileReader();
    if (event.target.value) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile6 = reader.result as string;
      };
    }
    this.uploadImages6();
  }
  uploadImages6(): void {
    this.message = [];

    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.onSubmitImage6(i, this.selectedFiles[i]);
      }
    }
  }
  onSubmitImage6(idx: number, file: File): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    if (file) {
      this.apiService.updatePembeliImage6(this.idqrcode, file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.isLoading = false;
            Swal.fire({
              text: 'Foto berhasil di upload!',
              confirmButtonText: `Kembali`,
            })
              .then((_) => {
              });
          }
        },
        (err: any) => {
          this.progressInfos[idx].value = 0;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan upload ulang.',
            confirmButtonText: `Kembali`,
          }).then((_) => {
          });
        });
    }
  }
  // onVideoChange(event: any): void {
  //   const reader = new FileReader();
  //   if (event.target.value) {
  //     const [file] = event.target.files;
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       this.videoFile = reader.result as string;
  //     };
  //     this.videoData = (event.target.files[0] as File);
  //     this.choosenvideo = true;
  //   }

  //   this.onSubmitVideo();
  // }

  // onSubmitVideo(): void {
  //   this.isLoading = true;
  //   const fd = new FormData();
  //   if (this.videoData) {
  //     fd.append('video', this.videoData, this.videoData.name);
  //     this.apiService.updatePembeliVideo(this.idqrcode, fd)
  //       .subscribe(
  //         (res: any) => {
  //           this.isLoading = false;
  //           Swal.fire({
  //             text: 'Video berhasil di upload!',
  //             confirmButtonText: `Kembali`,
  //           })
  //             .then((_) => {
  //             });
  //         },
  //         () => {
  //           this.isLoading = false;
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Gagal upload',
  //             text: 'Silahkan upload ulang.',
  //             confirmButtonText: `Kembali`,
  //           }).then((_) => {
  //           });
  //         }
  //       );
  //   }
  // }

  onSubmit(formData: any): void {
    const namapembeli = formData.nama_pembeli;
    const nomorpolisi = formData.nomor_polisi;
    const merkmobil = formData.merk_mobil;
    const noinvoice = formData.no_invoice;
    const deskripsi = formData.deskripsi;
    const instagram = formData.instagram;

    this.isSubmitted = true;
    this.isLoading = true;
    if (this.pembeliForm.invalid) {
      this.isLoading = false;
      this.isUnvalidated = true;
      return;
    }

    this.apiService.updatePembeli(this.idqrcode, namapembeli, nomorpolisi, merkmobil, noinvoice, deskripsi, instagram)
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          this.isUnvalidated = false;
          Swal.fire({
            text: 'Terima kasih sudah mendaftar!',
            confirmButtonText: `Kembali ke beranda`,
          })
            .then((result) => {
              console.log(result);
              setTimeout(() => {
                this.router.navigate(['/welcome/' + this.idqrcode]);
              }, 1000);

            });
        },
        (err: any) => {
          this.isLoading = false;
          this.isUnvalidated = true;
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Silahkan isi kembali data dengan benar!',
            confirmButtonText: `Kembali`,
          }).then((_) => {

          });
        }
      );
  }
}
