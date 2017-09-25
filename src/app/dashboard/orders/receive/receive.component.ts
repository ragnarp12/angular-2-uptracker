import { Component, OnInit, AfterViewInit} from '@angular/core';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { AccountService } from '../../../core/services/account.service';
import { Router } from '@angular/router';
import { PastOrderService } from '../../../core/services/pastOrder.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { Observable } from 'rxjs/Observable';
import {
  ItemModel, OrderModel, ReceiveProductsModel, StatusModel,
  StorageLocationModel
} from '../../../models/receive-products.model';
import * as _ from 'lodash';
import { ToasterService } from '../../../core/services/toaster.service';
// import event = google.maps.event;

@Component({
  selector: 'app-order-detail',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
@DestroySubscribers()
export class ReceiveComponent implements OnInit {
  public subscribers: any = {};
  public searchKey:string= "";
  public locationArr: any = [];
  public inventoryGroupArr: any = [];
  public orders$: Observable<any>;
  
  public receiveProducts: any = new ReceiveProductsModel;
  public statusList: any = this.pastOrderService.statusList;
  
  constructor(
    public accountService: AccountService,
    public inventoryService: InventoryService,
    public router: Router,
    public pastOrderService: PastOrderService,
    public toasterService: ToasterService,
  ) {
  
  }
  
  ngOnInit() {
    this.inventoryService.getNextInventory();
    this.orders$ = this.pastOrderService.ordersToReceive$;
  }
  
  addSubscribers() {
    this.subscribers.locationSubscription = this.accountService.locations$.subscribe(r => this.locationArr = r );
    this.subscribers.inventoryArrSubscription = this.inventoryService.collection$.subscribe(r => this.inventoryGroupArr = r);
    
    this.subscribers.ordersSubscription = this.orders$
    .subscribe(res => {
      console.log(res);
      this.receiveProducts = new ReceiveProductsModel(res);
      this.receiveProducts.orders = this.receiveProducts.orders.map(order => {
        order = new OrderModel(order);
        order.items = order.items.map((item: any) => {
          const quantity = item.quantity;
          item.item_id = item.id;
          item.inventory_group_id = item.inventory_group.id;
          if (item.inventory_group_id) {item.existInvGroup = true};
          item = new ItemModel(item);
          item.status = [new StatusModel()];
          item.status[0].qty = quantity;
          item.status[0].type = 'receive';
          item.status[1] = new StatusModel();
          item.status[1].qty = 0;
          item.status[1].type = 'pending';
          item.storage_locations = [new StorageLocationModel()];
          return item;
        });
        return order;
      });
      console.log(this.receiveProducts);
    });
  }

  remove(product, status) {
    let removedStatus = _.remove(product.status, status);
    this.onchangeStatusQty(product, status, status.qty);
  }
 
  save() {
    this.receiveProducts.orders.map((order) => {
      order.items.map(item => {
        item.status.map(status => {
          if (status.type === 'receive' || status.type === 'partial receive') {
            status.primary_status = true;
          }
          return status;
        });
      });
    });
    
    this.pastOrderService.onReceiveProducts(this.receiveProducts);
  }
  
  addProduct() {
    //product = product.status.push(new StatusModel({qty: 0, type: 'pending'}));
  }
  
  changeLocation(location, status) {
    status.location_id = location.id;
    status.location_name = location.name;
  }
  
  changeStatus(setStatus, product, curStatus) {
    curStatus.showStatusSelect = false;
    if (setStatus !== curStatus.type) {
      const filteredStatus = _.find(product.status, {'type': setStatus});
      const findIncreaseStatus = _.find(product.status, {'type': 'quantity increase'});
      const findDecreaseStatus = _.find(product.status, {'type': 'quantity decrease'});
      const findReceiveStatus = _.find(product.status, {'type': 'receive'});
      let quantityStatus: boolean = false;
      let receiveStatus: boolean = false;
      
      if ((findIncreaseStatus && setStatus === 'quantity decrease' && curStatus.type !== 'quantity increase')
        || (findDecreaseStatus && setStatus === 'quantity increase' && curStatus.type !== 'quantity decrease')) {
        this.toasterService.pop('error', `You can set either quantity decrease or quantity increase status`);
        quantityStatus = true;
      }
  
      if (findReceiveStatus && setStatus === 'partial receive' && curStatus.type !== 'receive'){
        this.toasterService.pop('error', `You can set either receive or partial receive status`);
        receiveStatus = true;
      }
      
      if (curStatus.type === 'pending' && (!filteredStatus || filteredStatus.type === 'partial receive') && !quantityStatus && !receiveStatus) {
        product.status.push(new StatusModel({type: 'pending', qty: '0', tmp_id: 'tmp' + Math.floor(Math.random() * 1000000)}));
        curStatus.type = setStatus;
      } else if (filteredStatus && (filteredStatus.type !== 'partial receive') && !quantityStatus && !receiveStatus) {
        this.toasterService.pop('error', `Status ${setStatus} exists for this product`);
      } else if ((!filteredStatus || filteredStatus.type === 'partial receive') && !quantityStatus && !receiveStatus) {
        curStatus.type = setStatus;
      }
      
    }
    // used setTimeout because materialize-select doesn't change the text
    setTimeout(() => { curStatus.showStatusSelect = true; }, 0.1);
    console.log(product.status);
    this.onchangeStatusQty(product, curStatus, curStatus.qty);
  }
  onchangeStatusQty(product, status, newValue) {
    status.qty = newValue;
    const pendingSum  = product.status.reduce((sum, currentStatus) => {

      if (currentStatus.type === 'pending') {
        return +sum;
      } else {
        return +sum + Number(currentStatus.qty);
      }
    }, 0);
    product.status.map(currentStatus => {
      if (currentStatus.type === 'pending') {
        currentStatus.qty = product.quantity - +pendingSum;
        if (currentStatus.qty < 0) {
            this.toasterService.pop('error', `The full amount should not be more than ${product.quantity}`);
            status.qty = Number(status.qty) + Number(currentStatus.qty);
            currentStatus.qty = 0;
        }
      }
      if (status.type === 'receive' && Number(status.qty) !== Number(product.quantity)) {
        status.type = 'partial receive';
      }
      if (status.type === 'partial receive' && Number(status.qty) === Number(product.quantity)) {
        status.type = 'receive';
        _.remove(product.status, {'type': 'partial receive'});
      }
      return currentStatus;
    });
  }
}
