import { Injectable } from '@angular/core';

import { Restangular } from 'ngx-restangular';

import { OrderListBaseService } from '../../classes/order-list-base.service';
import { OrderItemsTableService } from './order-items-table.service';
import { OrdersService } from '../../orders.service';

@Injectable()
export class ReceivedItemsListService extends OrderListBaseService {

  protected idName = 'id';

  constructor(
    private restangular: Restangular,
    private orderItemsTableService: OrderItemsTableService,
    private ordersService: OrdersService,
  ) {
    super(orderItemsTableService, ordersService);
    this.orderItemsTableService.addCollectionStreamToEntittesStream(this.getCollectionRequest$);
  }

  getRequest(params) {
    return this.restangular.one('pos', '6').all('items').customGET('', params);
  }
}
