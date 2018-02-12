import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrderItemStatusFormGroup, OrderItemStatusFormModel } from './order-item-status-form.model';

import * as _ from 'lodash';

export interface ReceiveOrderItemModel {
  id: string;
  status?: OrderItemStatusFormModel[];
  status_line_items?: OrderItemStatusFormModel[];
  inventory_group_id: string;
  quantity?: number;
  item_name?: string;
  location_name?: string;
  location_id?: string;
}

export class OrderItemFormGroup extends FormGroup {

  constructor({ id, inventory_group_id, status_line_items}: ReceiveOrderItemModel) {
    const isStatusLineItemsArray = status_line_items && _.isArray(status_line_items);
    const statusLineItemsFormGroups =
      isStatusLineItemsArray ?
        status_line_items.map(item => new OrderItemStatusFormGroup(item)) : [];

    super({
      id: new FormControl(id, Validators.required),
      inventory_group_id: new FormControl(inventory_group_id, Validators.required),
      status: new FormArray([]),
      status_line_items: new FormArray(statusLineItemsFormGroups),
    });
  }
}