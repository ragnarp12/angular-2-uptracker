import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { DestroySubscribers } from 'ngx-destroy-subscribers';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import {Modal} from 'angular2-modal';

import { ToasterService } from '../../core/services/toaster.service';
import { SpinnerService } from '../../core/services/spinner.service';
import {VideoModal} from './video-modal/video-modal.component';
import {ModalWindowService} from '../../core/services/modal-window.service';
import {ScannerService} from '../../core/services/scanner.service';
import { BarcodeScannerService } from './barcode-scanner.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
@DestroySubscribers()
export class ScannerComponent implements OnInit {
  file$: Subject<File> = new Subject();
  subscribers: any;
  barCode$: Subject<string>;
  qrCode$: Subject<string>;
  code$: Observable<[string, string]>;
  window: any;
  navigator: any;
    notCamera: boolean = true;

  @Output() searchText = new EventEmitter();

  constructor(
    private ngZone: NgZone,
    public toasterService: ToasterService,
    public spinnerService: SpinnerService,
    public modalWindowService: ModalWindowService,
    public modal: Modal,
    public scannerService: ScannerService,
    public barcodeScannerService: BarcodeScannerService,
  ) {
  }

  ngOnInit() {
    this.subscribers = {};
    this.barCode$ = new Subject();
    this.qrCode$ = new Subject();

    this.navigator = navigator;
    this.window = window;

    this.code$ = Observable.zip(
      this.barCode$,
      this.qrCode$
    );
      if (this.window.location.protocol !== 'http:') {
          this.hasGetUserMedia();
      }

  }

  hasGetUserMedia() {
    this.navigator.getUserMedia = this.navigator.getUserMedia || this.navigator.webkitGetUserMedia || this.navigator.mozGetUserMedia || this.navigator.msGetUserMedia;
    this.navigator.getUserMedia({video: true}, (stream) => {
        console.log('camera');
        this.notCamera = false;
    }, function () {
        console.log('Block camera access');
    });
  }

  addSubscribers() {
    this.subscribers.srcSubscriber = this.code$.subscribe(res => {
      const filteredRes = _.filter(res, null);
      this.ngZone.run(() => {
        if (filteredRes.length) {
          this.searchText.emit(filteredRes[0]);
          if (!this.notCamera) {
              this.scannerService.onStopStrem();
          }
        }
      });
    });
  }

  onChangeFile(file) {
    this.file$.next(file.target.files[0]);
  }

  onOpenVideo() {
   this.modal
      .open(VideoModal, this.modalWindowService.overlayConfigFactoryWithParams({video: ''}, true))
      .then((resultPromise) => {
          resultPromise.result.then(
              (res) => {
                this.file$.next(res);
              },
              (err) => {
              }
          );
      });
  }

  scanBarcode() {
    this.barcodeScannerService.scanBarcode();
  }

  onBarCodeUpdated(code) {
    this.barCode$.next(code);
  }
  onQrCodeUpdated(code) {
    this.qrCode$.next(code);
  }
}
