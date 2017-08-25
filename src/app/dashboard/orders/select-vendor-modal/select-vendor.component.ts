import { Component, OnInit } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { PastOrderService } from '../../../core/services/pastOrder.service';

export class InfoModalContext extends BSModalContext {
  public vendors: any[];
}


@Component({
  selector: 'select-vendor-modal',
  templateUrl: './select-vendor.component.html',
  styleUrls: ['./select-vendor.component.scss']
})
export class SelectVendorModal implements OnInit, CloseGuard, ModalComponent<InfoModalContext> {
  context;
  public selectedVendor: string = '';

  constructor(
    public dialog: DialogRef<InfoModalContext>,
  ) {
    this.context = dialog.context.vendors;
    dialog.setCloseGuard(this);
  }
  ngOnInit() {
    this.selectedVendor = this.context[0].vendor_name;
  }
  
  dismissModal() {
    this.dialog.dismiss();
  }

  onchooseVendor() {
    this.dialog.close(this.selectedVendor);
  }
}