import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwiperOptions } from 'swiper';
import { ActivatedRoute, Router } from '@angular/router';
import SwiperCore, { EffectFade, Pagination } from 'swiper/core';
import { ApiService } from 'src/app/shared/service/api.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

SwiperCore.use([EffectFade, Pagination]);

@Component({
    selector: 'app-videopage',
    templateUrl: './videopage.component.html',
    styleUrls: ['./videopage.component.scss'],
})

export class VideopageComponent implements OnInit, OnDestroy {
    subscription1!: Subscription;
    idqrcode: any;
    isUnvalidated = false;
    isLoading = false;
    isSubmitted = false;
    isFilled = false;

    serialNumber = '';
    namaPembeli = '';
    noPol = '';
    merkMobil = '';
    noInvoice = '';
    datebuy = '';
    dategaransi = '';

    config: SwiperOptions = {
        slidesPerView: 1,
        slidesPerColumn: 1,
        spaceBetween: 50,
        pagination: {
            clickable: true,
            type: 'bullets',
        },
        effect: 'fade',
        // loop: true
    };

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private apiService: ApiService) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.idqrcode = this.activatedRoute.snapshot.paramMap.get('idqrcode');
        this.subscription1 = this.apiService.getPembeli(this.idqrcode).subscribe(
            (res: any) => {
                this.isLoading = false;
                const data = res.data;
                // const tglbeli = new Date((data.created_at).slice(0, 10).split('-'));
                const tglbeli = (data.tanggal_pengisian).slice(0, 10).split('-');
                const fixtglbeli = `${tglbeli[2]}-${tglbeli[1]}-${tglbeli[0]}`;
                const yearplus1 = Number(tglbeli[0]) + 2;
                const fixtgljual = `${tglbeli[2]}-${tglbeli[1]}-${yearplus1}`;
                if (data.nama_pembeli === '') {
                    this.isFilled = false;
                } else {
                    this.isFilled = true;
                    this.serialNumber = data._idQrcode.serial_number;
                    this.namaPembeli = data.nama_pembeli;
                    this.noPol = data.nomor_polisi;
                    this.merkMobil = data.merk_mobil;
                    this.noInvoice = data.no_invoice;
                    this.datebuy = fixtglbeli;
                    this.dategaransi = fixtgljual;
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

    }

    ngOnDestroy(): void {
        this.subscription1.unsubscribe();
    }

}
