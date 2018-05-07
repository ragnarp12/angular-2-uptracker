import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { DialogRef, ModalComponent } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ngx-destroy-subscribers';
import { Observable } from 'rxjs/Rx';
import { VendorModel } from '../../models';
import { UserService, AccountService, SubtractService } from '../../core/services';


export class SubInventoryModalContext extends BSModalContext {
  public product: any;
}

@Component({
  selector: 'sub-inventory-modal',
  //TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
  // Remove when solved.
  /* tslint:disable */
  templateUrl: './sub-inventory-modal.component.html',
  styleUrls: ['./sub-inventory-modal.component.scss']
})
@DestroySubscribers()
export class SubInventoryModal implements OnInit, ModalComponent<SubInventoryModalContext> {
  public context: SubInventoryModalContext;
  public subscribers: any = {};
  public searchText: string = '';
  public modalState: number = 0;
  public location: number = 0;
  public inventories: Array<any> = [];
  public inventory: any = {}
  public productVariant: number = 0

  public subtracting: string = 'Box';
  public stockMini: number = 30;
  public stockMiniLimit: number = 30;
  public stockShelf: number = 133;
  public stockShelfLimit: number = 133;
  public stockSterlization: number = 2;
  public stockSterlizationLimit: number = 2;

  constructor(
    public dialog: DialogRef<SubInventoryModalContext>,
    public userService: UserService,
    public accountService: AccountService,
    public subtractService: SubtractService,
  ) {
    this.context = dialog.context;
  }

  ngOnInit() {}

  searchProducts(event) {
    this.subtractService.searchInventory(this.searchText, 10, 1).subscribe(res => {
      this.inventories = res;
    });
  }

  toGoModal(state, index) {
    this.modalState = state;
    if (index !== undefined) {
      this.inventory = this.inventories[index];
      console.log('INVENTORY:   ', this.inventory);
    }
  }

  goBackToFirst() {
    this.modalState = 0;
  }

  productChange(event) {}

  locationSort(event) {
    this.stockMini = Math.round(100 * Math.random());
    this.stockMiniLimit = this.stockMini;
    this.stockShelf = Math.round(100 * Math.random());
    this.stockShelfLimit = this.stockShelf;
    this.stockSterlization = Math.round(100 * Math.random());
    this.stockSterlizationLimit = this.stockSterlization;
  }

  subtractingSort(event) {}

  stockMiniClick(value) {
    if (value === this.stockMini && value > this.stockMiniLimit) {
      setTimeout(() => {
        this.stockMini = this.stockMiniLimit;
      })
    } else if (value !== this.stockMini) {
      this.stockMini += value;
    }
  }

  stockShelfClick(value) {
    if (value === this.stockShelf && value > this.stockShelfLimit) {
      setTimeout(() => {
        this.stockShelf = this.stockShelfLimit;
      })
    } else if (value !== this.stockShelf) {
      this.stockShelf += value;
    }
  }

  stockSterlizationClick(value) {
    if (value === this.stockSterlization && value > this.stockSterlizationLimit) {
      setTimeout(() => {
        this.stockSterlization = this.stockSterlizationLimit;
      })
    } else if (value !== this.stockSterlization) {
      this.stockSterlization += value;
    }
  }

  toBackInitial() {
    this.modalState = 0;
    this.searchText = '';
  }

  dismissModal() {
    this.dialog.dismiss();
  }

  closeModal(data) {
    this.dialog.close(data);
  }
}
