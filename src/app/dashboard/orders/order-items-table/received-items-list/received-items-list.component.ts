import { Component, OnDestroy, OnInit } from '@angular/core';

import { DestroySubscribers } from 'ngx-destroy-subscribers';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { OrderListType } from '../../models/order-list-type';
import { OrderItem } from '../../models/order-item';
import { OrderStatusAlreadyValues } from '../../models/order-status';
import { ReceivedItemsListService } from '../services/received-items-list.service';
import { FavoritedItemsListService } from '../services/favorited-items-list.service';
import { FlaggedItemsListService } from '../services/flagged-items-list.service';

@Component({
  selector: 'app-received-items-list',
  templateUrl: './received-items-list.component.html',
  styleUrls: ['./received-items-list.component.scss']
})
@DestroySubscribers()
export class ReceivedItemsListComponent implements OnInit, OnDestroy {
  public subscribers: any = {};
  public listName: string = OrderListType.received;
  public tableHeaderReceived: any = [
    {name: 'Order #', className: 's1', alias: 'po_number', filterBy: true, },
    {name: 'Product Name', className: 's2', alias: 'item_name', filterBy: true, wrap: 2, },
    {name: 'Status', className: 's1', alias: 'status', filterBy: false, showChevron: true, },
    {name: 'Location', className: 's1', alias: 'location_name', filterBy: true, },
    {name: 'Placed', className: 's1', alias: 'placed_date', filterBy: true, },
    {name: 'Received', className: 's1', alias: 'received_date', filterBy: true, },
    {name: 'Reconciled', className: 's1', alias: 'reconciled_date', filterBy: true, },
    {name: 'Qty', className: 's1 bold underline-text right-align', aliasArray: ['received_quantity', 'quantity'], join: '/'},
    {name: 'Pkg Price', className: 's1', alias: 'package_price'},
    {name: 'Total', className: 's1 bold underline-text right-align', alias: 'total'},
    {name: '', className: 's1', actions: true},
  ];

  public sortBy$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public orders$: Observable<OrderItem[]>;

  constructor(
    public pastOrderService: ReceivedItemsListService,
    private favoritedItemsListService: FavoritedItemsListService,
    private flaggedItemsListService: FlaggedItemsListService,
  ) {

  }

  ngOnInit() {
    this.orders$ = this.pastOrderService.collection$
    .map((orders) => orders.map((order) => ({...order, status: OrderStatusAlreadyValues.receive})));
  }

  addSubscribers() {
    this.subscribers.getReceivedProductSubscription = this.pastOrderService.getCollection()
    .subscribe();
  }

  ngOnDestroy() {
    console.log('for unsubscribing');
  }

  sortByHeaderUpdated(event) {
    this.sortBy$.next(event.alias);
  }

  onFavorite(item) {
    this.favoritedItemsListService.postItem(item);
  }

  onFlagged(item) {
    this.flaggedItemsListService.putItem(item);
  }

}
