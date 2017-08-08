import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { UserService, AccountService } from '../../../core/services/index';
import { InventoryService } from '../../../core/services/inventory.service';
import {
  AttachmentFiles, InventorySearchResults, NewInventoryPackage,
  searchData
} from '../../../models/inventory.model';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { ToasterService } from '../../../core/services/toaster.service';
import { debug } from 'util';
import { APP_DI_CONFIG } from '../../../../../env';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FileUploadService } from '../../../core/services/file-upload.service';

export class AddInventoryModalContext extends BSModalContext {
  inventoryItems: any[] = [];
}

@Component({
  selector: 'app-add-inventory-modal',
  templateUrl: './add-inventory-modal.component.html',
  styleUrls: ['./add-inventory-modal.component.scss']
})
@DestroySubscribers()
export class AddInventoryModal implements OnInit, OnDestroy, CloseGuard, ModalComponent<AddInventoryModalContext> {
  public subscribers: any = {};
  context: AddInventoryModalContext;
  total: number = 0;
  public typeIn$: any = new Subject();
  searchResults$: any = new BehaviorSubject([]);
  searchResults: any[] = [];
  
  checkBoxCandidates:boolean=false;
  checkBoxItems:boolean=false;
  
  public newProductData: any = new InventorySearchResults();
  public items$: Observable<any>;
  public items;
  public loadItems$: Subject<any> = new Subject<any>();
  public addItemsToItems$: Subject<any> = new Subject<any>();
  public deleteFromItems$: Subject<any> = new Subject<any>();
  
  public addCustomProduct: boolean = false;
  
  public saveAdded$: any = new Subject<any>();
  
  public newInventoryPackage: any = new NewInventoryPackage;
  
  public outerPackageList: any[] = this.inventoryService.outerPackageList;
  public innerPackageList: any[] = this.inventoryService.innerPackageList;
  public consumablePackageList: any[] = this.inventoryService.consumablePackageList;
  
  public packageType$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public resultItems$: Observable<any>;
  public checkedProduct$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public checkedProduct: any[] = [];
  
  public showSelect: boolean = true;
  public autocompleteProducts: any =  [];
  public autocompleteProducts$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  
  public file$:Observable<any>;
  public file;
  public loadFile$: Subject<any> = new Subject<any>();
  public addFileToFile$: Subject<any> = new Subject<any>();
  public deleteFromFile$: Subject<any> = new Subject<any>();
  public updateFile$: Subject<any> = new Subject<any>();
  public apiUrl: string;
  public mcds$: ReplaySubject<any> = new ReplaySubject(1);
  public mcds: any;
  
  @ViewChild('step1') step1: ElementRef;
  @ViewChild('step2') step2: ElementRef;
  @ViewChild('step3') step3: ElementRef;
  @ViewChild('step4') step4: ElementRef;
  
  public locations$: Observable<any>;
  
  constructor(
    public dialog: DialogRef<AddInventoryModalContext>,
    public userService: UserService,
    public accountService: AccountService,
    public inventoryService: InventoryService,
    public toasterService: ToasterService,
  ) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
    
    this.typeIn$
    .debounceTime(500)
    .switchMap((key: string) => this.inventoryService.search(key))
    .subscribe((data: searchData) => {
      this.total = data.count;
      this.searchResults$.next(data.results);
      this.searchResults = data.results;
      
      if(this.items.length) {
        this.checkedProduct =[];
        this.outerPackageList = [this.items[0].package_type];
        this.innerPackageList = [this.items[0].sub_package.properties.unit_type];
        this.consumablePackageList = [this.items[0].consumable_unit.properties.unit_type];
        this.newInventoryPackage.sub_package_qty = [this.items[0].sub_package.properties.qty];
        this.newInventoryPackage.consumable_unit_qty = [this.items[0].consumable_unit.properties.qty];
  
        this.checkPackage(this.items[0].package_type);
        this.checkSubPackage(this.items[0].sub_package.properties.unit_type);
        this.checkConsPackage(this.items[0].consumable_unit.properties.unit_type);
      }
      
      if (!this.items.length && this.checkedProduct.length) {
        
        this.checkedProduct =[];
        this.packageType$.next({});
        this.outerPackageList = this.inventoryService.outerPackageList;
        this.innerPackageList = this.inventoryService.innerPackageList;
        this.consumablePackageList = this.inventoryService.consumablePackageList;

        this.checkPackage(null);
        this.checkSubPackage(null);
        this.checkConsPackage(null);
      }
      this.checkedProduct$.next({})
    });
    
    this.saveAdded$
    .switchMap(() => {
      return this.items$
      .switchMap(items => this.inventoryService.addItemsToInventory(items, this.newInventoryPackage))
    })
    .subscribe(newInventory => {
        this.dismissModal()
      }
    );
    
    this.autocompleteProducts$
    .debounceTime(10)
    .switchMap((keywords:string) => this.inventoryService.autocompleteSearch(keywords))
    .subscribe(res => {
      this.autocompleteProducts = res['suggestions'];
    });
    
    this.fileActions();
    this.apiUrl = APP_DI_CONFIG.apiEndpoint;
  }
  
  onSearchTypeIn(event) {
      this.autocompleteProducts$.next(event.target.value);
      this.typeIn$.next(event.target.value);
  }
  selectedAutocompled(keyword) {
    this.typeIn$.next(keyword);
  }
  observableSource(keyword: any) {
    console.log(this.autocompleteProducts);
    return Observable.of(this.autocompleteProducts)
  }
  
  ngOnInit() {
  
    this.loadFile$.next([]);
    
    let addItemsToItems$ = this.addItemsToItems$
    .switchMap((itemsToCheck: any[]) =>
      this.inventoryService.checkIfNotExist(itemsToCheck)
      .let(this.checkExistedProduct(itemsToCheck))
    )
    .switchMap((newItems: any[]) =>
      this.items$.first()
      .map((items: any) => {
        const newNotChosenItems: any[] = newItems.reduce((acc: any[], item) => {
          const {variant_id, product_id} = item;
          let currentItem = _.find(items, {variant_id, product_id});
          if (currentItem) {
            this.toasterService.pop('error', item.name +  `${item.name} is already added`);
          }
          if(!currentItem) {
            item.checked = false;
          }
          return !currentItem ? [...acc, item] : [...acc]
        }, []);
        
        return [...items, ...newNotChosenItems];
      })
      
    );
  
    let deleteFromItems$ = this.deleteFromItems$
    .switchMap((deleteItems) =>
      this.items$.first()
      .map((items: any) =>
        items.filter((el: any) => el.variant_id !== deleteItems.variant_id)
      )
    );
    
    this.items$ = Observable.merge(
      this.loadItems$,
      addItemsToItems$,
      deleteFromItems$
    ).publishReplay(1).refCount();
    
    this.items$.subscribe(res => {
      this.showSelect = false;
      if(res.length) {
        
        this.outerPackageList = [res[0].package_type];
        this.innerPackageList = [res[0].sub_package.properties.unit_type];
        this.consumablePackageList = [res[0].consumable_unit.properties.unit_type];
        this.newInventoryPackage.sub_package_qty = [res[0].sub_package.properties.qty];
        this.newInventoryPackage.consumable_unit_qty = [res[0].consumable_unit.properties.qty];
        
        this.checkPackage(res[0].package_type);
        this.checkSubPackage(res[0].sub_package.properties.unit_type);
        this.checkConsPackage(res[0].consumable_unit.properties.unit_type);
      }
      if(!res.length) {
        this.newInventoryPackage.sub_package_qty = null;
        this.newInventoryPackage.consumable_unit_qty = null;
      }
      if(!res.length && !this.checkedProduct.length) {
        
        this.outerPackageList = this.inventoryService.outerPackageList;
        this.innerPackageList = this.inventoryService.innerPackageList;
        this.consumablePackageList = this.inventoryService.consumablePackageList;

        this.checkPackage(null);
        this.checkSubPackage(null);
        this.checkConsPackage(null);
      }
      setTimeout(()=>{ this.showSelect = true;
      },0.6);
      
      this.items = res;
    });

    // load initial items from context
    this.loadItems$.next(this.context.inventoryItems);
    
    this.resultItems$ = Observable.combineLatest(this.packageType$, this.searchResults$, this.checkedProduct$)
    .map(([packageType,searchResults,checkedProduct]: any) => {
      
      let filteredResults = _.filter(searchResults,packageType);
      
      let checkedResults = searchResults.reduce((acc: any[], item) => {
        let foundedItem = _.find(
          filteredResults,
          { variant_id: item.variant_id, product_id: item.product_id}
        );
        return [...acc,{
          ...item,
          notActive: !foundedItem
        }]
      },[]);
  
      let checkboxResult = checkedResults.reduce((acc: any[], item) => {
        const { variant_id, product_id} = item;
        let foundedItem = _.find(
          checkedProduct,
          { variant_id, product_id}
        );
        return [
          ...acc,
          {
          ...item,
          checked: !!foundedItem
          }
        ];
      },[]);
      
      return checkboxResult;
    });
    
    this.mcds$
    .switchMap((mcds: any) => this.inventoryService.uploadAttachment(mcds))
    .subscribe(res => {
      this.mcds = res;
    });
    
    this.locations$ = this.accountService.locations$
    
  }
  
  ngOnDestroy() {
    this.saveAdded$.unsubscribe();
    this.mcds$.unsubscribe();
    //this.items$.unsubscribe();
  }
  
  checkExistedProduct(itemsToCheck) {
    return (source) =>
      source.map(resItems => {
        
        const existedItems: any[] = _.filter(resItems, 'exists');
        
        const notExistedItems: any[] = _.reject(resItems, 'exists');
        
        const newNotExistedItems: any[] = notExistedItems.reduce((acc: any[], {product_id,variant_id}) => {
          let item = _.find(itemsToCheck,{variant_id,product_id});
          return item ? [...acc,item] : acc
        },[]);
        
        const newExistedItems: any[] = existedItems.reduce((acc: any[], {product_id,variant_id}) => {
          let item = _.find(itemsToCheck,{variant_id,product_id});
          return item ? [...acc,item] : acc
        },[]);
        
        if(newExistedItems.length) {
          newExistedItems.forEach((item: any) => {
            this.toasterService.pop('error',  `${item.name} exists`);
          })
        }
        
        return newNotExistedItems;
      })
  }
  
  dismissModal() {
    this.dialog.dismiss();
  }
  
  closeModal(data) {
    this.dialog.close(data);
  }
  
  addToInventory(items: InventorySearchResults[]) {
    this.addItemsToItems$.next(items);
  }
  
  deleteFromInventory(items: InventorySearchResults[]) {
    items.map((i) => this.deleteFromItems$.next(i));
    this.checkBoxItems = false;
  }
  
  putCheckbox(item) {
    this.showSelect = false;
    item.checked = !item.checked;
    
    if(!this.checkedProduct.length && !this.items.length) {
     
      let packageType = {
        package_type: item.package_type,
        sub_package: {properties: {unit_type: item.consumable_unit.properties.unit_type}},
        consumable_unit: {properties: {unit_type: item.consumable_unit.properties.unit_type}}
      };
  
      this.outerPackageList = [item.package_type];
      this.innerPackageList = [item.consumable_unit.properties.unit_type];
      this.consumablePackageList = [item.consumable_unit.properties.unit_type];
  
      this.checkPackage(item.package_type);
      this.checkSubPackage(item.consumable_unit.properties.unit_type);
      this.checkConsPackage(item.consumable_unit.properties.unit_type);
      
      this.packageType$.next(packageType);
      
    }

    
    let result = _.find(this.checkedProduct,  { variant_id: item.variant_id, product_id: item.product_id});
    
    if(!result && item.checked) {
      this.checkedProduct.push(item);
    }
    if (result && !item.checked) {
      _.remove(this.checkedProduct, result)
    }
    this.checkedProduct$.next(this.checkedProduct);
    
    if(!this.checkedProduct.length && !this.items.length) {
      
      this.outerPackageList = this.inventoryService.outerPackageList;
      this.innerPackageList = this.inventoryService.innerPackageList;
      this.consumablePackageList = this.inventoryService.consumablePackageList;
  
      this.checkPackage(null);
      this.checkSubPackage(null);
      this.checkConsPackage(null);
      this.packageType$.next({});
    }
    
    setTimeout(()=>{ this.showSelect = true
    },0.6);
  }
  
  bulkAdd() {
    this.resultItems$
    .take(1)
    .subscribe((items: InventorySearchResults[]) => {
      // get checked
      let checkedItems = items.filter((item: InventorySearchResults) => item.checked);
      this.addToInventory(checkedItems);
    });
  }
  
  bulkDelete() {
    // get checked
    let checkedItems = this.items.filter((item: InventorySearchResults) => item.checked);
    this.deleteFromInventory(checkedItems);
  }
  
  toggleCustomAdd() {
    this.addCustomProduct = !this.addCustomProduct;
  }
  
  addNewProduct() {
    debugger;
    //this.addToInventory([
    //  new InventorySearchResults(
    //    Object.assign(this.newProductData, {variant_id: 'tmp' + Math.floor(Math.random() * 1000000)})
    //  )
    //]);
    console.log(this.newProductData);
    this.toggleCustomAdd();
  }
  
  selectAllCandidates() {
    console.log(this.checkBoxCandidates);
    this.searchResults$.next(
      this.searchResults.map((item: InventorySearchResults) => {
        item.checked = this.checkBoxCandidates;
        return item;
      })
    );
  }
  
  selectAllItems() {
    this.loadItems$.next(
      this.items.map((item: InventorySearchResults) => {
        item.checked = this.checkBoxItems;
        return item;
      })
    );
  }
  
  saveAdded(){
    this.saveAdded$.next();
  }
  
  nextPackage(value) {
    let formValue = {};
    
    formValue = value.package_type ? {
      ...formValue,
      package_type: value.package_type,
    }: formValue;
  
    formValue = value.sub_package_type ? {
      ...formValue,
      sub_package: {properties: {unit_type: value.sub_package_type}},
    }: formValue;
  
    formValue = value.consumable_unit_type ? {
      ...formValue,
      consumable_unit: {properties: {unit_type: value.consumable_unit_type}}
    }: formValue;
    
    this.packageType$.next(formValue);
  }
  
  checkPackage(e) {
    this.newInventoryPackage.package_type = e;
    this.nextPackage(this.newInventoryPackage);
  }

  checkSubPackage(e) {
    this.newInventoryPackage.sub_package_type = e;
    this.nextPackage(this.newInventoryPackage);
  }

  checkConsPackage(e) {
    this.newInventoryPackage.consumable_unit_type = e;
    this.nextPackage(this.newInventoryPackage);
  }
  
  nextTab() {
    if (this.step1.nativeElement.className == 'active')
      this.step2.nativeElement.click();
    else if (this.step2.nativeElement.className == 'active')
      this.step3.nativeElement.click();
    else this.step4.nativeElement.click();
  }
  
  prevTab() {
    if (this.step4.nativeElement.className == 'active')
      this.step3.nativeElement.click();
    else if (this.step3.nativeElement.className == 'active')
      this.step2.nativeElement.click();
    else this.step1.nativeElement.click();
  }
  
  // File load, add, delete actions
  fileActions(): any {
    let addFileToFile$ = this.addFileToFile$
    .switchMap((file:File)=>this.inventoryService.uploadAttachment(file[0]))
    .switchMap((res:AttachmentFiles) => {
      return this.file$.first()
      .map((file: any) => {
        file = file.concat(res);
        return file;
      });
    });
    
    //let tmpFile;
    //let deleteFromFile$ = this.deleteFromFile$
    //.switchMap((attach: AttachmentFiles) => {
    //  tmpFile = attach;
    //  return this.inventoryService.deleteAttachment(attach);
    //})
    //.filter((status:any)=>status)
    //.switchMap(() => {
    //  this.file$.subscribe((res) => {
    //    console.log('Model Service delete from file ' + res);
    //  });
    //  return this.file$.first()
    //  .map((file: any) => {
    //    return file.filter((el: any) => {
    //      return el.id != tmpFile.id;
    //    });
    //  });
    //});
    
    this.file$ = Observable.merge(
      this.loadFile$,
      this.updateFile$,
      addFileToFile$,
      //deleteFromFile$
    ).publishReplay(1).refCount();
    this.file$.subscribe(res => {
      //console.log('files',res);
      this.file = res;
      //this.hasFiles = res.length > 0;
    });
  }
  
  onMSDCFileUpload(event) {
    this.mcds$.next(event.target.files[0]);
    }
  
  onFileDrop(file: any): void {
    let myReader: any = new FileReader();
    myReader.fileName = file.name;
    this.addFile(file);
  }
  
  onAttachmentUpload(event) {
    this.onFileDrop(event.target.files[0]);
  }
  
  addFile(file) {
    this.addFileToFile$.next([file]);
  }
  
  removeFile(file) {
    console.log(`remove ${file.file_name}`);
    this.deleteFromFile$.next(file);
  }
  
  getType(mime){
    return mime.split('/')[0];
  }
  
}
