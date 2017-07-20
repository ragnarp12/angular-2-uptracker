import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';
import { UserService, AccountService } from '../../../core/services/index';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventorySearchResults, searchData } from '../../../models/inventory.model';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { ToasterService } from '../../../core/services/toaster.service';

export class AddInventoryModalContext extends BSModalContext {
  inventoryItems: any[] = [];
}

@Component({
  selector: 'app-add-inventory-modal',
  templateUrl: './add-inventory-modal.component.html',
  styleUrls: ['./add-inventory-modal.component.scss']
})
@DestroySubscribers()
export class AddInventoryModal implements OnInit, CloseGuard, ModalComponent<AddInventoryModalContext> {
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
  
  constructor(
    public dialog: DialogRef<AddInventoryModalContext>,
    public userService: UserService,
    public accountService: AccountService,
    public inventoryService: InventoryService,
    public toasterService: ToasterService
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
    });
  }
  
  onSearchTypeIn(event) {
    this.typeIn$.next(event.target.value);
  }
  
  ngOnInit() {
    
    let addItemsToItems$ = this.addItemsToItems$
    .switchMap((itemsToCheck: any[]) =>
      this.inventoryService.checkIfNotExist(itemsToCheck)
      //add to let rxjs
      .map(resItems => {
    
        const existedItems: any[] = _.filter(resItems, 'exists');
    
        const notExistedItems: any[] = _.reject(resItems, 'exists');
    
        const newNotExistedItems: any[] = notExistedItems.reduce((acc: any[], {product_id,vendor_variant_id}) => {
          let item = _.find(itemsToCheck,{vendor_variant_id,product_id});
          return item ? [...acc,item] : acc
        },[]);
    
        const newExistedItems: any[] = existedItems.reduce((acc: any[], {product_id,vendor_variant_id}) => {
          let item = _.find(itemsToCheck,{vendor_variant_id,product_id});
          return item ? [...acc,item] : acc
        },[]);
    
        if(newExistedItems.length) {
          newExistedItems.forEach((item: any) => {
            this.toasterService.pop('', item.name + ' already exists');
          })
        }
    
        return newNotExistedItems;
      })
      //add to let rxjs
    )
    .switchMap((newItems: any[]) =>
      this.items$.first()
      .map((items: any) => [...items,...newItems])
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
      this.items = res;
    });

    // load initial items from context
    this.loadItems$.next(this.context.inventoryItems);
  }
  
  dismissModal() {
    this.dialog.dismiss();
  }
  
  closeModal(data) {
    this.dialog.close(data);
  }
  
  addToInventory(items: InventorySearchResults[]) {
    this.addItemsToItems$.next(items);
    
    
    //items.map((i) => this.addItemsToItems$.next(i));
    
    //Observable.zip(...checkItemsExist$)
    //.subscribe(a=>{debugger});
  
    //items.map((item: InventorySearchResults) => {
    //  item.checked = false;
    //  return item;
    //});
    //this.checkBoxCandidates = false;
    
  }
  
  deleteFromInventory(items: InventorySearchResults[]) {
    items.map((i) => this.deleteFromItems$.next(i));
    this.checkBoxItems = false;
  }
  
  bulkAdd() {
    this.searchResults$
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
    this.addToInventory([
      new InventorySearchResults(
        Object.assign(this.newProductData, {variant_id: 'tmp' + Math.floor(Math.random() * 1000000)})
      )
    ]);
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
    debugger;
    
    // TODO move subscription to constructor
    // TODO add remove functionality
    //let onlyFreshlyAdded = this.items.filter(function(e){return this.indexOf(e)<0;},this.context.inventoryItems);
    //this.inventoryService.addItemsToInventory(onlyFreshlyAdded)
    //.subscribe((newItems:any[])=>{
    //  this.inventoryService.addCollectionToCollection$.next(newItems);
    //  this.dismissModal();
    //});
    let onlyFreshlyAdded = this.items$
    //.map(items => items.filter(function(e){return this.indexOf(e)<0;},this.context.inventoryItems))
    .switchMap(onlyFreshlyAdded =>
      this.inventoryService.addItemsToInventory(onlyFreshlyAdded)
    ).subscribe((newItems:any[])=>{
      debugger;
      this.inventoryService.addCollectionToCollection$.next(newItems);
      this.dismissModal();
    });
  }
}
