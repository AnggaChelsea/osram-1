import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Navigation, SwiperOptions } from 'swiper';
import SwiperCore, { EffectFade, Pagination } from 'swiper/core';

SwiperCore.use([Navigation, EffectFade, Pagination]);

@Component({
    selector: 'app-youtube',
    templateUrl: './youtube.component.html',
    styleUrls: ['./youtube.component.scss']
})
export class YoutubeComponent implements OnInit {

    isMobile = false;
    config: SwiperOptions = {
        slidesPerView: 1,
        slidesPerColumn: 1,
        spaceBetween: 50,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
        pagination: {
            clickable: true,
            type: 'bullets',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        // loop: true
    };
    constructor() { }

    ngOnInit(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        console.log(w);
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
}
