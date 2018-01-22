import { NgModule } from '@angular/core';

import { AppSharedModule } from '../../../../shared/shared.module';
import { OrderTableComponent } from './order-table.component';
import { OrderTableHeaderActionComponent } from './components/order-table-header-action.component';
import { OrderTableItemActionComponent } from './components/order-table-item-action/order-table-item-action.component';
import { OrderTableService } from './order-table.service';


@NgModule({
  declarations: [
    OrderTableComponent,
    OrderTableHeaderActionComponent,
    OrderTableItemActionComponent,
  ],
  exports: [OrderTableComponent],
  imports: [
    AppSharedModule,
  ],
  providers: [
  ],
})
export class OrderTableModule {

}
