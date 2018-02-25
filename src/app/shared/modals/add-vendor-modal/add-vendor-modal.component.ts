import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef} from 'angular2-modal';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Vendor} from '../../../models/inventory.model';
import {InventoryService} from '../../../core/services/inventory.service';
import {DestroySubscribers} from 'ng2-destroy-subscribers';
import {AccountVendorModel} from '../../../models/account-vendor.model';
import {NewVendorModel} from '../../../models/new-vendor.model';
import {VendorService} from '../../../core/services/vendor.service';
import {Router} from '@angular/router';
import {PhoneMaskService} from '../../../core/services/phone-mask.service';

export class AddVendorModalContext extends BSModalContext {

}

@Component({
  selector: 'app-add-vendor-modal',
  templateUrl: './add-vendor-modal.component.html',
  styleUrls: ['./add-vendor-modal.component.scss']
})
@DestroySubscribers()
export class AddVendorModalComponent implements OnInit {
  public subscribers: any = {};

  public autocompleteVendors$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public autocompleteVendors: any = [];
  public vendor: Vendor = new Vendor();
  public vendorDirty: boolean = false;
  public vendorValid: boolean = false;
  public vendorModel: NewVendorModel;
  public step: number = 1;
  public uploadName: string = '';

  public phoneMask: any = this.phoneMaskService.defaultTextMask;
  public selectedPhoneCountry: any = this.phoneMaskService.defaultCountry;
  public selectedFaxCountry: any = this.phoneMaskService.defaultCountry;

  constructor(
    public dialog: DialogRef<AddVendorModalContext>,
    public inventoryService: InventoryService,
    public vendorService: VendorService,
    public router: Router,
    public phoneMaskService: PhoneMaskService,
  ) {
    this.vendorModel = new NewVendorModel();
    dialog.setCloseGuard(this);
  }

  ngOnInit() {
  }

  dismissModal() {
    this.uploadName = '';
    this.vendorModel = new NewVendorModel();
    this.vendor = new Vendor();
    this.dialog.dismiss();
  }

  closeModal(data) {
    this.dialog.close(data);
  }

  addSubscribers() {
    this.subscribers.autocompleteVendorsSubscription = this.autocompleteVendors$
      .switchMap((key: string) => this.inventoryService.autocompleteSearchVendor(key)).publishReplay(1).refCount()
      .subscribe((vendors: any) => this.autocompleteVendors = vendors);
  }

  onSearchVendor(event) {
    this.vendorDirty = true;
    this.vendorValid = !!(event.target.value);
    this.autocompleteVendors$.next(event.target.value);
  }

  observableSourceVendor(keyword: any) {
    return Observable.of(this.autocompleteVendors).take(1);
  }

  selectedAutocompledVendor(vendor) {
    if (!(this.vendor && !vendor.vendor_id && this.vendor.vendor_name === vendor)) {
      this.vendor = (vendor.vendor_id) ? vendor : {vendor_name: vendor, vendor_id: null};
    }
  }

  nextStep() {
    if (this.vendor.vendor_id) {
      this.router.navigate(['/vendors/edit/' + this.vendor.vendor_id]);
      return this.dismissModal();
    }
    if (this.vendor && this.vendor.vendor_name) {
      this.vendorModel.name = this.vendor.vendor_name;
      this.step++;
    }
  }

  cancel() {
    this.step = 1;
  }

  prevStep() {
    this.step--;
  }

  onCountryChange($event) {
    this.selectedPhoneCountry = $event;
  }

  onFaxCountryChange($event) {
    this.selectedFaxCountry = $event;
  }

  onSubmit() {
    return this.vendorService.addAccountVendor(this.vendorModel)
      .subscribe(res => {
        console.log(res);
          this.router.navigate(['/vendors/edit/' + res.vendor_id]);
          return this.dismissModal();
      });
  }

  uploadLogo(file: any) {
    this.uploadName = file.target.files[0].name;
    let reader = new FileReader();

    reader.onload = (e: any) => this.vendorModel.logo = e.target.result;
    reader.readAsDataURL(file.target.files[0]);
  }
}
