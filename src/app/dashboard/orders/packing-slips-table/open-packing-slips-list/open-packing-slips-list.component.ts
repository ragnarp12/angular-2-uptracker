import { Component, OnDestroy, OnInit } from '@angular/core';

import { DestroySubscribers } from 'ngx-destroy-subscribers';

import { Observable } from 'rxjs/Observable';

import { OrderListType } from '../../models/order-list-type';
import { OrderItem } from '../../models/order-item';
import { PastOrderService } from '../../../../core/services/pastOrder.service';
import { OpenPackingSlipsListService } from '../services/open-packing-slips-list.service';

@Component({
  selector: 'app-open-packing-slips-list',
  templateUrl: './open-packing-slips-list.component.html',
  styleUrls: ['./open-packing-slips-list.component.scss'],
})
@DestroySubscribers()
export class OpenPackingSlipsListComponent implements OnInit, OnDestroy {
  public subscribers: any = {};

  public listName: string = OrderListType.open;
  public tableHeader: any = [
    {name: 'Packing Slip #', className: 's2', alias: 'packing_slip_number', filterBy: true, },
    {name: 'Vendor', className: 's2', alias: 'vendor_name', filterBy: true, wrap: 2, },
    {name: 'Status', className: 's1', alias: 'status', filterBy: true, showChevron: true, },
    {name: 'Location', className: 's2', alias: 'location_name', filterBy: true, },
    {name: 'Date', className: 's1', alias: 'date', filterBy: true, },
    {name: 'Received By', className: 's2', alias: 'received_by', filterBy: true, },
    {name: '# of Items', className: 's1', alias: 'item_count'},
    {name: '', className: 's1', actions: true},
  ];

  public packingSlips$: Observable<OrderItem[]>;

  constructor(
    public pastOrderService: PastOrderService,
    public openPackingSlipsListService: OpenPackingSlipsListService,
  ) {

  };

  ngOnInit() {
    this.packingSlips$ = this.openPackingSlipsListService.collection$;
  };

  addSubscribers() {
    this.subscribers.getAllCollectionSubscription = this.openPackingSlipsListService.getCollection()
    .subscribe();
  };

  ngOnDestroy() {
    console.log('for unsubscribing');
  };

  sortByHeaderUpdated(event) {
    this.pastOrderService.updateSortBy(event.alias);
  }

  onFilterBy(value) {
    this.pastOrderService.updateFilterBy(value);
  }

}
