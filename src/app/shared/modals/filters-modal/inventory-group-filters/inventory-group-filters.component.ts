import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import * as _ from 'lodash';
import { DestroySubscribers } from 'ngx-destroy-subscribers';
import { Observable } from 'rxjs/Observable';
import { VendorService } from '../../../../core/services/vendor.service';
import { AccountService } from '../../../../core/services/account.service';

@Component({
  selector: 'app-inventory-group-filters',
  templateUrl: './inventory-group-filters.component.html',
})
@DestroySubscribers()
export class InventoryGroupFiltersComponent implements OnInit {
  private subscribers: any = {};
  public filterForm: FormGroup;
  public departmentCollection$: Observable<any> = this.accountService.getDepartments();

  public vendorsCollection = {};
  public autocompleteVendors = {
    autocompleteOptions: {
      data: this.vendorsCollection,
      limit: Infinity,
      minLength: 0,
    }
  };

  public productCategoriesCollection: any = {'': null};
  public autocompleteCategories = {
    autocompleteOptions: {
      data: this.productCategoriesCollection,
      limit: Infinity,
      minLength: 0,
    }
  };

  public accountingCollection = {'': null};
  public autocompleteAccountings = {
    autocompleteOptions: {
      data: this.accountingCollection,
      limit: Infinity,
      minLength: 0,
    }
  };

  constructor(
    private accountService: AccountService,
    private vendorService: VendorService,
  ) {
    this.filterForm = new FormGroup({
      vendors: new FormControl(),
      categories: new FormControl(),
      departments: new FormControl(),
      accountings: new FormControl(),
      myFavorite: new FormControl(),
      orderedFrom: new FormControl(),
      orderedTo: new FormControl(),
      withoutPrice: new FormControl(),
      belowCriticalLevel: new FormControl(),
      aboveFullyStocked: new FormControl(),
      trackingInfo: new FormControl(),
      mostFrequentlyOrdered: new FormControl(),
      hazardous: new FormControl(),
      trackable: new FormControl(),
      taxExempt: new FormControl(),
    });

  }

  get vendorsControl() {
    return this.filterForm.get('vendors');
  }

  get categoriesControl() {
    return this.filterForm.get('categories');
  }

  get departmentsControl() {
    return this.filterForm.get('departments');
  }

  get accountingsControl() {
    return this.filterForm.get('accountings');
  }

  get myFavoriteControl() {
    return this.filterForm.get('myFavorite');
  }

  get orderedFromControl() {
    return this.filterForm.get('orderedFrom');
  }
  get orderedToControl() {
    return this.filterForm.get('orderedTo');
  }
  get withoutPriceControl() {
    return this.filterForm.get('withoutPrice');
  }
  get belowCriticalLevelControl() {
    return this.filterForm.get('belowCriticalLevel');
  }
  get aboveFullyStockedControl() {
    return this.filterForm.get('aboveFullyStocked');
  }
  get mostFrequentlyOrderedControl() {
    return this.filterForm.get('mostFrequentlyOrdered');
  }
  get hazardousControl() {
    return this.filterForm.get('hazardous');
  }
  get trackableControl() {
    return this.filterForm.get('trackable');
  }
  get taxExemptControl() {
    return this.filterForm.get('taxExempt');
  }
  get trackingInfoControl() {
    return this.filterForm.get('trackingInfo');
  }

  ngOnInit() {

    this.subscribers.getVendorsSubscription = this.vendorService.getVendors()
    .subscribe((res: any) => {
      const vendorsData = _.flattenDeep(res.data.vendors);
      vendorsData.map((vendor: any) => {
        this.vendorsCollection[vendor.name] = null;
      });
    });

    this.subscribers.getProductCategoriesSubscription = this.accountService.getProductCategories()
    .subscribe((res: any) => {
      const categoriesData = [...res];
      categoriesData.map((category: any) => {
        this.productCategoriesCollection[category] = null;
      });
    });

    this.subscribers.getProductAccountingSubscription = this.accountService.getProductAccounting()
    .subscribe((res: any) => {
      const accountingsData = [...res];
      accountingsData.map((accounting) =>
        this.accountingCollection[accounting] = null
      );
    });
  }

}
