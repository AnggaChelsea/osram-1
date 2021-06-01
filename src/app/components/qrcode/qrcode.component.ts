import { Component, OnInit } from '@angular/core';
import * as kjua from 'kjua-svg';
import jsPDF from 'jspdf';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../shared/service/api.service';
import { ExcelService } from './excel.service';


@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss']
})
export class QrcodeComponent implements OnInit {

  qrForm!: FormGroup;
  totalunprinted = 0;
  numbers: any[] = [];
  snUnique: any[] = [];
  progressVal = 0;
  progressMax = 10;
  url = '';
  imgFile = '';

  excel: any[] = [];

  startTime = 0;
  timeSingleCode = 0;

  // pdf
  columnsPerPage = 6;
  rowsPerPage = 8;
  pageWidth = 210;
  pageHeight = 297;
  // Avery 3490
  cellWidth = 36;
  cellHeight = 36;
  borderTopBottom = ((this.pageHeight - (this.rowsPerPage * this.cellHeight)) / 2);
  serial: any;
  barcodeData: any;

  static getBarcodeData(texts: string, images: string, serialnumber: string, sizes = 400): any {
    return kjua({
      render: 'canvas',
      crisp: true,
      minVersion: 1,
      ecLevel: 'Q',
      size: sizes,
      ratio: undefined,
      fill: '#333333',
      back: '#ffffff',
      text: `https://osram-1.vercel.app/${serialnumber}`,
      // text: `https://cbiprobiled.com/${serialnumber}`,
      rounded: 0,
      quiet: 5,
      mode: 'labelimage',
      mSize: [5],
      mPosX: [50],
      mPosY: [100],
      label: `cbiprobiled.com - ${serialnumber}`,
      // label: `osramindonesia.com/${serialnumber}`,
      fontname: 'Helvetica',
      fontcolor: '#333333',
      // fontcolor: '#ff9818',
      image: images
    });
  }

  constructor(private fb: FormBuilder, private apiService: ApiService, private excelService: ExcelService) { }

  ngOnInit(): void {
    this.apiService.getAllPembeli().subscribe(
      (res: any) => {
        const data = res.data;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < data.length; i++) {
          this.excel.push(this.flatten(data[i]));
        }

        console.log(this.excel);

      },
      (err) => {
        console.log(err);
      }
    );

    this.getAllunprinted();
    this.createForm();
  }

  flatten(data: any, response: any = {}, flatKey = '', onlyLastKey = false): void {
    for (const [key, value] of Object.entries(data)) {
      let newFlatKey: any;
      // tslint:disable-next-line:radix
      if (!isNaN(parseInt(key)) && flatKey.includes('[]')) {
        newFlatKey = (flatKey.charAt(flatKey.length - 1) === '.' ? flatKey.slice(0, -1) : flatKey) + `[${key}]`;
      } else if (!flatKey.includes('.') && flatKey.length > 0) {
        newFlatKey = `${flatKey}.${key}`;
      } else {
        newFlatKey = `${flatKey}${key}`;
      }
      if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
        this.flatten(value, response, `${newFlatKey}.`, onlyLastKey);
      } else {
        if (onlyLastKey) {
          newFlatKey = newFlatKey.split('.').pop();
        }
        if (Array.isArray(response)) {
          response.push({
            [newFlatKey.replace('[]', '')]: value
          });
        } else {
          response[newFlatKey.replace('[]', '')] = value;
        }
      }
    }
    return response;
  }

  flattenObject(obj: any): any {
    const flattened: any = {};

    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, this.flattenObject(obj[key]));
      } else {
        flattened[key] = obj[key];
      }
    });

    return flattened;
  }

  createForm(): void {
    this.qrForm = this.fb.group({
      website: [''],
      generate_number: ['1'],
      img: ['']
    });
  }

  onImageChange(event: any): void {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile = reader.result as string;
        console.log(this.imgFile);
        this.qrForm.patchValue({
          img: reader.result
        });
      };
    }
  }

  getAllunprinted(): void {
    this.apiService.getAllunPrintQrcode().subscribe((res: any) => {
      this.totalunprinted = res.data.length;
      console.log(this.totalunprinted);
    },
      (_) => {
        console.log('unprinted qrcode unavailable');
      }
    );
  }

  onSubmit(formData: any): any {
    const generatenumber = formData.generate_number;
    this.url = formData.website;
    this.imgFile = formData.img;
    this.numbers = Array.from({ length: generatenumber }, (_, i) => i);
    this.progressMax = generatenumber;

    for (let i = 0; i < generatenumber; i++) {
      this.apiService.createQrcode();
    }

    setTimeout(() => {
      this.getAllunprinted();
    }, generatenumber * 10);
  }

  createPDF(): any {
    this.apiService.printQrcode().subscribe((res: any) => {
      for (const data of res.data) {
        console.log(data.serial_number);
        this.snUnique.push(data.serial_number);
      }
      this.progressMax = res.data.length;
      this.generatePDF();
      this.getAllunprinted();
    },
      (err) => {
        console.log(err);
      }
    );
  }

  generatePDF(index = 0, document = new jsPDF(), colPos = 0, rowPos = 0): any {
    if (index === 0) {
      this.startTime = new Date().getTime();
    }
    this.timeSingleCode = (new Date().getTime() - this.startTime) / index;

    this.progressVal = index + 1;

    this.barcodeData = QrcodeComponent.getBarcodeData(this.url, this.imgFile, this.snUnique[index]);
    console.log(this.barcodeData);
    const x = ((this.pageWidth / this.columnsPerPage) / 2) - (this.cellWidth / 2) + (colPos * (this.pageWidth / this.columnsPerPage));
    const y = this.borderTopBottom + (rowPos * this.cellHeight) + 1;
    document.addImage(this.barcodeData, 'JPG', x, y, this.cellWidth - 2, this.cellHeight - 2);
    colPos++;
    if (colPos >= this.columnsPerPage) {
      colPos = 0;
      rowPos++;
    }
    if (rowPos >= this.rowsPerPage && index < this.progressMax - 1) {
      rowPos = 0;
      colPos = 0;
      document.addPage();
    }

    if (index === this.progressMax - 1) {
      // setTimeout(() => {
      document.save(`QR-Codes.pdf`);
      // }, 31000)
    } else {
      requestAnimationFrame(() => this.generatePDF(index + 1, document, colPos, rowPos));
    }
  }

  exportAsXLSX(): void {
    console.log(this.excel);
    this.excelService.exportAsExcelFile(this.excel, 'osram-excel');
  }

}
