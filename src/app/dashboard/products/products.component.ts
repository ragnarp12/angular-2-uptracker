import {Component, OnInit, ViewContainerRef, HostListener} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs/Rx';

import {Overlay, overlayConfigFactory} from 'angular2-modal';
import {Modal, BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DestroySubscribers} from 'ng2-destroy-subscribers';
import * as _ from 'lodash';

import {ViewProductModal} from './view-product-modal/view-product-modal.component';
import {EditProductModal} from './edit-product-modal/edit-product-modal.component';
import {BulkEditModal} from './bulk-edit-modal/bulk-edit-modal.component';
import {ProductFilterModal} from './product-filter-modal/product-filter-modal.component';
import {RequestProductModal} from './request-product-modal/request-product-modal.component';
import {ProductService} from '../../core/services/index';
import {ModalWindowService} from "../../core/services/modal-window.service";
import {AccountService} from "../../core/services/account.service";

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
@DestroySubscribers()
export class ProductsComponent implements OnInit {
    private nothingChecked:boolean;
    private searchKey$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public sortBy: string;
    private sortBy$: BehaviorSubject<any> = new BehaviorSubject(null);
    public total: number;
    public products$: Observable<any>;
    public products:any = [];
    public selectedProducts:any = [];
    
    public dashboardLocation;
    public infiniteScroll$: any = new BehaviorSubject(false);
    public selectAll$: any = new BehaviorSubject(0);
    private isRequest:boolean = false;
    public searchKey:string;
    public  searchKeyLast: string;
    public  locationId: string;
    public isGrid: boolean = false;
    public selectAll: boolean= false;
    
    constructor(vcRef: ViewContainerRef,
                overlay: Overlay,
                public modal: Modal,
                private productService: ProductService,
                private modalWindowService: ModalWindowService,
                private accountService: AccountService) {
        overlay.defaultViewContainer = vcRef;
    }
    
    toggleView (){
        this.isGrid = !this.isGrid;
    }
    
    toggleSelectAll(event){
        // 0 = unused, 1 = selectAll, 2 = deselectAll
        this.selectAll$.next(event ? 1 : 2);
    }
    
    ngOnInit() {
        this.productService.totalCount$.subscribe(total => this.total=total);
        
        this.productService.isDataLoaded$
            .delay(500)
            .filter(r=>r)
            .subscribe((r)=>{
                this.isRequest = false;
                this.getInfiniteScroll()
            });

        this.searchKey$.debounceTime(1000)
            .filter(r => (r || r === ''))
            .subscribe(
                (r) => {
                    this.productService.getNextProducts(0, r, this.sortBy);
                    this.productService.current_page = 2;
                }
            );
        this.sortBy$
            .filter(r => r)
            .subscribe(
                (r) => {
                    this.productService.getNextProducts(this.productService.current_page, this.searchKey, r);
                    this.productService.current_page = 2;
                }
            );

        let start_products$ = this.accountService.dashboardLocation$.switchMap(location => {
            if (!location) {
                location = {};
            }
            this.dashboardLocation = location;
            this.productService.location$.next(location);
            this.productService.location=location;
            return this.productService.getProductsLocation(location.id)
        }).subscribe(()=>this.getInfiniteScroll());
        
    ///////////////////////?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        this.products$ = Observable
            .combineLatest(
              this.productService.collection$,
                this.sortBy$,
                this.searchKey$,
                this.selectAll$
            )
        .map(([products, sortBy, searchKey, selectAll]: [any, any, any, any]) => {
            for (let p of products) {
              (selectAll === 1) ? p.selected = true : p.selected = false;
            }
            return products;
        });
    
        this.products$.subscribe(r => this.products = r);
    
        this.infiniteScroll$
            .withLatestFrom(this.products$)
            .filter(([infinite,products]) =>  {
            
                return infinite && !this.isRequest && products.length
            })
            .switchMap((infinite) => {
                
                this.isRequest = true;
                if (this.searchKey == this.searchKeyLast) {
                    ++this.productService.current_page;
                }
                this.searchKeyLast = this.searchKey;
                //TODO remove
                if (6 <= (this.productService.current_page-1) * this.productService.pagination_limit) {
                    return Observable.of(false);
                } else {
                    
                    return this.productService.getNextProducts(this.productService.current_page, this.searchKey, this.sortBy);
                }
            })
            .subscribe(res => {
                this.isRequest = false;
            }, err => {
                
                this.isRequest = false;
            });
    }

    viewProductModal(product) {
        product = Object.assign(product, {location_id: this.dashboardLocation.id});
        this.modal
            .open(ViewProductModal, this.modalWindowService.overlayConfigFactoryWithParams({product: product}))
            .then((resultPromise) => {
                resultPromise.result.then(
                    (res) => {
                        this.editProductModal(res);
                    },
                    (err) => {
                    }
                );
            });
    }

    toggleProductVisibility(product){
        product.status=!product.status;
        //TODO add save to server
    }
    

    editProductModal(product = null) {
        this.modal
        .open(EditProductModal, this.modalWindowService.overlayConfigFactoryWithParams({product: product}));
    }
    
    bulkEditModal(){
        if (!this.nothingChecked) {
            
            this.modal
            .open(BulkEditModal, this.modalWindowService.overlayConfigFactoryWithParams({products: this.selectedProducts}));
        }
    }

    searchFilter(event) {
        // replace forbidden characters
        let value = event.target.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        this.searchKey$.next(value);
    }

    itemsSort(event) {
        let value = event.target.value;
        this.sortBy$.next(value);
    }

    showFiltersModal() {
        this.modal
            .open(ProductFilterModal, this.modalWindowService.overlayConfigFactoryWithParams({}))
            .then((resultPromise) => {
                resultPromise.result.then(
                    (res) => {
                        // this.filterProducts();
                    },
                    (err) => {
                    }
                );
            });
    }

    requestProduct() {
        this.modal
            .open(RequestProductModal, this.modalWindowService.overlayConfigFactoryWithParams({}))
            .then((resultPromise) => {
                resultPromise.result.then(
                    (res) => {
                        // this.filterProducts();
                    },
                    (err) => {
                    }
                );
            });
    }

    getInfiniteScroll() {
        let toBottom = document.body.scrollHeight - document.body.scrollTop - window.innerHeight;
        // console.log('toBottom',toBottom);
        let scrollBottom = toBottom < 285;
        this.infiniteScroll$.next(scrollBottom);
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(event) {
        this.getInfiniteScroll();
    }

    onCheck(){
        this.selectedProducts = _.cloneDeep(this.products)
        .filter(r=>r['selected']);
    }
}
