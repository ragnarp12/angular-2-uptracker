import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterializeModule } from "angular2-materialize";
import { FileDropModule } from 'angular2-file-drop';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { SelectModule } from 'ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { SelectDropDownModule } from 'ngx-select-dropdown';

import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';

// import { CoreModule } from "../core/core.module";

import { IterablePipe } from "./pipes/iterable/iterable.pipe";
import { InputValueSearch } from "./pipes/input-value-search/input-value-search.pipe";
import { CapitalizeFirstPipe } from "./pipes/capitilizeFirst/capitilizeFirst";
import {CurrencyUsdPipe} from "./pipes/currency-usd/currency-usd.pipe";
import * as directives from "./index";
import { TextMaskModule } from 'angular2-text-mask';
import { AgmCoreModule } from "angular2-google-maps/core";
import { GooglePlacesInputModule, HasClassModule } from "./directives";
import { VendorSearchComponent } from "./components/vendor-search/vendor-search.component";

let directivesArr = [
  directives.IntlPhoneMaskDirective,
  directives.UserDropdownMenuDirective
];

let pipesArr = [
  IterablePipe,
  InputValueSearch,
  CapitalizeFirstPipe,
  CurrencyUsdPipe
];

let componentsArr = [
  VendorSearchComponent
];

// resolvers
import {
  MAIN_RESOLVER_PROVIDERS,
  ACCOUNT_RESOLVER_PROVIDERS
} from './resolves/index';

// modals
import { EditUserModal } from './modals/edit-user-modal/edit-user-modal.component';
import { EditLocationModal } from './modals/edit-location-modal/edit-location-modal.component';
import { ChangePasswordUserModal } from "./modals/change-password-user-modal/change-password-user-modal.component";
import { EditCommentModal } from "./modals/edit-comment-modal/edit-comment-modal.component";
import { UniConfirmModal } from './modals/uni-confirm-modal/uni-confirm-modal.component';
import { APP_DI_CONFIG } from '../../../env';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AddVendorModalComponent } from './modals/add-vendor-modal/add-vendor-modal.component';
import { ChipsInputModule } from './components/chips-input/chips-input.module';
import { ChipsModule } from './components/chips/chips.module';
import {ScannerModule} from "../dashboard/scanner/scanner.module";
import {ProductVariantModule} from "./components/product-variant/product-variant.module";
import {PriceInputModule} from "./components/price-input/price-input.module";

const modalsArr = [
  EditUserModal,
  EditLocationModal,
  ChangePasswordUserModal,
  EditCommentModal,
  UniConfirmModal,
  AddVendorModalComponent
];

const PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  //suppressScrollX: true
};

@NgModule({
  imports: [
    BootstrapModalModule,
    ModalModule,

    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    MaterializeModule,
    FileDropModule,
    TextMaskModule,
    Angular2FontawesomeModule,
    AgmCoreModule.forRoot({
      apiKey: APP_DI_CONFIG.googlePlaces.apiKey,
      libraries: ["places"]
    }),
    GooglePlacesInputModule,
    NguiAutoCompleteModule,
    PerfectScrollbarModule.forRoot(PERFECT_SCROLLBAR_CONFIG),
    SelectModule,
    Daterangepicker,
    NgxDatatableModule,
    CurrencyMaskModule,
    PriceInputModule,
    ScannerModule,
    ProductVariantModule,
    SelectDropDownModule
  ],
  declarations: [
    ...directivesArr,
    ...pipesArr,
    ...modalsArr,
    ...componentsArr
  ],
  exports: [
    BootstrapModalModule,
    ModalModule,

    RouterModule,

    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    Daterangepicker,
    NgxDatatableModule,
    CurrencyMaskModule,
    SelectDropDownModule,

    MaterializeModule,
    FileDropModule,
    TextMaskModule,
    Angular2FontawesomeModule,
    GooglePlacesInputModule,
    NguiAutoCompleteModule,
    PerfectScrollbarModule,

    HasClassModule,
    ChipsInputModule,
    ChipsModule,
    PriceInputModule,
    ScannerModule,
    ProductVariantModule,

    ...directivesArr,
    ...pipesArr,
    ...modalsArr,
    ...componentsArr
  ],
  providers: [
    ...MAIN_RESOLVER_PROVIDERS,
    ...ACCOUNT_RESOLVER_PROVIDERS,
    CurrencyUsdPipe
  ],
  entryComponents: [
    ...modalsArr
  ]
})
export class AppSharedModule {
}
