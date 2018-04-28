import {NgModule} from '@angular/core';

import {AddProductFromVendorStep1Component} from './step1/add-product-from-vendor-step1.component';
import {AddProductFromVendorStep2Component} from './step2/add-product-from-vendor-step2.component';
import {AddProductFromVendorComponent} from "./add-product-from-vendor.component";
import {AppSharedModule} from '../../../shared/shared.module';
import {VendorProductVariantsModule} from "../vendor-product-variants/vendor-product-variants.module";

@NgModule({
  declarations: [
    AddProductFromVendorStep1Component,
    AddProductFromVendorStep2Component,
    AddProductFromVendorComponent
  ],
  imports: [
    AppSharedModule,
    VendorProductVariantsModule
  ],
  providers: [],
  entryComponents: [
    AddProductFromVendorStep1Component,
    AddProductFromVendorStep2Component,
    AddProductFromVendorComponent
  ]
})
export class AddProductFromVendorModule {
}
