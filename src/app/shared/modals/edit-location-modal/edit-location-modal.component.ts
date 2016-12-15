import { Component, OnInit, NgZone } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';

import { AccountService, ToasterService, UserService, PhoneMaskService, FileUploadService, ModalWindowService } from '../../../core/services/index';
import { LocationModel } from '../../../models/index';
import { LocationService } from "../../../core/services/location.service";

export class EditLocationModalContext extends BSModalContext {
  public location: any;
}

@Component({
  selector: 'app-edit-location-modal',
  //TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
  // Remove when solved.
  /* tslint:disable */
  templateUrl: './edit-location-modal.component.html',
  styleUrls: ['./edit-location-modal.component.scss']
})
@DestroySubscribers()
export class EditLocationModal implements OnInit, CloseGuard, ModalComponent<EditLocationModalContext> {
  private subscribers: any = {};
  context: EditLocationModalContext;
  public location: LocationModel;
  public states$: Observable<any> = new Observable<any>();
  public locationTypes$: Observable<any> = new Observable<any>();
  public typeDirty: boolean = false;
  public stateDirty: boolean = false;
  public locationFormPhone: string = null;
  public locationFormFax: string = null;
  public phoneMask: any = this.phoneMaskService.defaultTextMask;
  // default country for phone input
  public selectedCountry: any = this.phoneMaskService.defaultCountry;
  public selectedFaxCountry: any = this.phoneMaskService.defaultCountry;

  uploadedImage;
  fileIsOver: boolean = false;
  options = {
    readAs: 'DataURL'
  };

  constructor(
      public zone: NgZone,
      public dialog: DialogRef<EditLocationModalContext>,
      private toasterService: ToasterService,
      private userService: UserService,
      private accountService: AccountService,
      private phoneMaskService: PhoneMaskService,
      private fileUploadService: FileUploadService,
      private modalWindowService: ModalWindowService,
      private locationService: LocationService
  ) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
    this.location = new LocationModel();
  }

  ngOnInit(){
    let locationData = this.context.location || {};
    this.location = new LocationModel(locationData);
    if (this.context.location){
      this.location.street_1 = this.location.address.street_1;
      this.location.street_2 = this.location.address.street_2;
      this.location.city = this.location.address.city;
      this.location.zip_code = this.location.address.postal_code;
      this.location.state = this.location.address.state;
      this.uploadedImage = this.location.image;

      this.locationFormPhone = this.phoneMaskService.getPhoneByIntlPhone(this.location.phone);
      this.selectedCountry = this.phoneMaskService.getCountryArrayByIntlPhone(this.location.phone);

      this.locationFormFax = this.phoneMaskService.getPhoneByIntlPhone(this.location.fax);
      this.selectedFaxCountry = this.phoneMaskService.getCountryArrayByIntlPhone(this.location.fax);
    }
    
    this.states$ = this.accountService.getStates().take(1);
    this.locationTypes$ = this.accountService.getLocationTypes().take(1);
  }

  dismissModal(){
    this.dialog.dismiss();
  }

  closeModal(data){
    this.dialog.close(data);
  }

  changeState(){
    this.stateDirty = true;
  }

  changeType(){
    this.typeDirty = true;
  }

  onCountryChange($event) {
    this.selectedCountry = $event;
  }

  onFaxCountryChange($event) {
    this.selectedFaxCountry = $event;
  }

  // upload by input type=file
  changeListener($event): void {
    this.readThis($event.target);
  }

  readThis(inputValue: any): void {
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.onFileDrop(myReader.result);
    };
    myReader.readAsDataURL(file);
  }

  // upload by filedrop
  fileOver(fileIsOver: boolean): void {
    this.fileIsOver = fileIsOver;
  }

  onFileDrop(imgBase64: string): void {
    var img = new Image();
    img.onload = () => {
      let resizedImg: any = this.fileUploadService.resizeImage(img, {resizeMaxHeight: 250, resizeMaxWidth: 250});
      let orientation = this.fileUploadService.getOrientation(imgBase64);
      let orientedImg = this.fileUploadService.getOrientedImageByOrientation(resizedImg, orientation);

      this.zone.run(() => {
        this.uploadedImage = orientedImg;
      });
    };
    img.src = imgBase64;
  }

  onSubmit(){
    this.location.account_id = this.userService.selfData.account_id;
    this.location.phone = this.selectedCountry[2] + ' ' + this.locationFormPhone;
    this.location.fax = this.locationFormFax ?  this.selectedFaxCountry[2] + ' ' + this.locationFormFax : null;
    let address = {
      location: this.location.state + ' ' + this.location.city + ' ' + this.location.street_1 + ' ' + this.location.street_2
    };
    this.location.image = this.uploadedImage;
    if (!this.location.image){
      // TODO: move logic to location service;
      // this.locationService.getLocationStreetView(address).subscribe(res => {
      //   debugger;
      // },err => {
      //   debugger;
      // });
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        var reader = new FileReader();
        reader.onloadend = () => {

          this.location.image = reader.result;
          // this.checkGoogleStreetImage();
          this.addLocation(this.location);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', this.accountService.getLocationStreetView(address));
      xhr.send();
    } else {
      this.addLocation(this.location);
    }
  }

  checkGoogleStreetImage(){
    if (this.accountService.googleStreetEmptyImage == this.location.image)
      console.log('+');
    else console.log('-');
    debugger;
  }

  addLocation(data){
    this.accountService.addLocation(data).subscribe(
        (res: any) => {
          this.dismissModal();
        }
    );
  }

  deleteLocation(data){
    this.modalWindowService.confirmModal('Delete Location?', 'Are you sure you want to delete the location?', this.deleteLocationFunc.bind(this));
  }

  deleteLocationFunc(){
    this.subscribers.deleteUserSubscription = this.accountService.deleteLocation(this.location).subscribe((res: any) => {
      this.dismissModal();
    });
  }
}
