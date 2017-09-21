import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { CartService } from '../../../../core/services/cart.service';
import { ToasterService } from '../../../../core/services/toaster.service';

export class AddInventory2OrderModalContext extends BSModalContext {
  public data: any;
}

@Component({
  selector: 'add-inventory-2order-modal',
  templateUrl: './add-inventory-2order-modal.component.html',
  styleUrls: ['./add-inventory-2order-modal.component.scss']
})
@DestroySubscribers()
export class AddInventory2OrderModal implements OnInit, CloseGuard, ModalComponent<AddInventory2OrderModalContext> {
  context: AddInventory2OrderModalContext;
  public quantity: string = '1';
  public vendor: any = {id: "", vendor_id: ""};
  public location: string = '';
  public valid: boolean = false;
  public isAuto: boolean = true;
  public unit_type: string = 'package';
  public last_unit_type: string = 'package';
  
  constructor(
    public dialog: DialogRef<AddInventory2OrderModalContext>,
    public cartService: CartService,
    public toasterService: ToasterService,
  ) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
  }
  
  ngOnInit() {
  
  }
  
  saveOrder() {

  }
  
  dismissModal() {
    this.dialog.dismiss();
  }
  
  closeModal(data) {
    this.dialog.close(data);
  }
  
}