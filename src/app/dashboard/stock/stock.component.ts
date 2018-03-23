import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { UserService, AccountService } from '../../core/services/index';
import { ModalWindowService } from '../../core/services/modal-window.service';
import { UpdateStockModal } from './update-stock-modal/update-stock-modal.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  public sort: string = '';
  public filter: string = '';
  public products: Array<any> = [];
  public panelActive: boolean = false;
  constructor(
    public modal: Modal,
    public modalWindowService: ModalWindowService,
  ) {
    this.products = [
      { title: 'Gloves Tender Touch Nitrile Sempecare', countBy: '1 Box (100)', currentQTY: 100, actualQTY: '-', reason: 'N/A' },
      { title: 'Gloves Tender Touch Nitrile Sempecare', countBy: '1 Box (100)', currentQTY: 80, actualQTY: '-', reason: 'N/A' },
      { title: '20GM Maximum cure sealant a-flouo', countBy: '1 Box (100)', currentQTY: 20, actualQTY: '-', reason: 'N/A' },
      { title: '5GM Light bond medium pst-push-fluo', countBy: '1 Box (100)', currentQTY: 8, actualQTY: '-', reason: 'N/A' },
      { title: 'A2 Tips', countBy: '1 Box (100)', currentQTY: 12, actualQTY: '-', reason: 'N/A' },
    ]
  }

  ngOnInit() {}

  sortAlphabet() {}

  filterChange() {}

  actualChange(event) {
    let active = false;
    this.products.forEach(product => {
      if (parseInt(product.actualQTY) > 0) active = true;
    })
    this.panelActive = active;
  }

  openSuccessModal() {
    this.modal
    .open(UpdateStockModal, this.modalWindowService.overlayConfigFactoryWithParams({'product': []}))
    .then((resultPromise) => {
      resultPromise.result.then(
        (res) => {},
        (err) => {}
      );
    });
  }
}
