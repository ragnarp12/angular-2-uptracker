import { Component, OnInit, ViewChild } from '@angular/core';

import { Modal } from 'angular2-modal/plugins/bootstrap';
import { DestroySubscribers } from 'ng2-destroy-subscribers';

import { ModalWindowService } from '../../core/services/modal-window.service';
import { ReportsFilterModal } from './reports-filter-modal/reports-filter-modal.component';

declare var AmCharts: any;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
@DestroySubscribers()
export class ReportsComponent implements OnInit {

  @ViewChild('myTable') table: any;

  chart: any;
  chartData: Array<any>;
  productTable: Array<any>;
  productHistory: Array<any>;
  productColumn: Array<any>;
  historyColumn: Array<any>;
  customClasses: any;
  priceList: Array<any>;
  reportList: Array<any>;
  selectedPrice: any;
  selectedReport: any;

  constructor(
    public modal: Modal,
    public modalWindowService: ModalWindowService
  ) {
  }

  ngOnInit() {
    this.chartData = this.generatechartData();

    this.chart = AmCharts.makeChart("chartdiv", {
      theme: "light",
      type: "serial",
      marginRight: 80,
      autoMarginOffset: 20,
      marginTop: 20,
      dataProvider: this.chartData,
      valueAxes: [{
        id: "v0",
        autoGridCount: false,
        axisAlpha: 0.2,
        gridAlpha: 0,
        gridCount: 5,
        unit: '$'
      }, {
        id: "v1",
        axisAlpha: 0.1
      }],
      // gridAboveGraphs: false,
      graphs: [{
        id: "forum",
        useNegativeColorIfDown: false,
        balloonText: "[[category]]<br><b>change: [[value]]</b>",
        bullet: "round",
        bulletBorderAlpha: 1,
        bulletBorderColor: "#ffffff",
        dashLength: 10,
        hideBulletsCount: 50,
        lineThickness: 2,
        lineColor: "#9a9c9e",
        showBalloon: false,
        title: "Forum Price",
        valueField: "forum"
      }],
      chartScrollbar: {
        scrollbarHeight: 5,
        backgroundAlpha: 0.1,
        backgroundColor: "#868686",
        offset: 50,
        oppositeAxis: false,
        selectedBackgroundColor: "#67b7dc",
        selectedBackgroundAlpha: 1
      },
      categoryField: "date",
      categoryAxis: {
        parseDates: true,
        axisAlpha: 0.2,
        gridAlpha: 0
      },
      balloon: {
        borderThickness: 0,
        cornerRadius: 3,
        fillAlpha: 1,
        fillColor: "#404851",
        shadowColor: "#ffffff"
      },
      export: {
        enabled: false
      }
    });

    this.productHistory = [
      {index: 0, checked: false, vendor: 'ABC Inc', pkgType: '12 Pack', currentPrice: '$110', avgPrice: '$100', consumableType: 'Type A', consumablePkg: '12', consumablePrice: '$1.00', consumableAvg: '$1.15'},
      {index: 1, checked: false, vendor: 'Anvil Corp', pkgType: '12 Pack', currentPrice: '$110', avgPrice: '$100', consumableType: 'Type A', consumablePkg: '12', consumablePrice: '$1.00', consumableAvg: '$1.15'},
      {index: 2, checked: false, vendor: 'Bamboo Systems', pkgType: '12 Pack', currentPrice: '$110', avgPrice: '$100', consumableType: 'Type A', consumablePkg: '24', consumablePrice: '$1.00', consumableAvg: '$1.15'},
      {index: 3, checked: false, vendor: 'Cosco', pkgType: '12 Pack', currentPrice: '$110', avgPrice: '$100', consumableType: 'Type A', consumablePkg: '9', consumablePrice: '$1.00', consumableAvg: '$1.15'}
    ]
    this.historyColumn = [
      {prop: 'vendor', name: 'Vendor'},
      {prop: 'pkgType', name: 'Package Type'},
      {prop: 'currentPrice', name: 'Current Price/pkg'},
      {prop: 'avgPrice', name: 'Avg Price/pkg'},
      {prop: 'consumableType', name: 'Consumable Unit type'},
      {prop: 'consumablePkg', name: 'Consumable Units/pkg'},
      {prop: 'consumablePrice', name: 'Consumable Unit Price'},
      {prop: 'consumableAvg', name: 'Consumable Unit Avg'}
    ]
    this.productTable = [
      {index: 0, checked: false, name: 'Scalpel Group', price: '$117', avgPrice: '$87', discount: 'Bogo', vendor: 'Multiple', department: 'Surgical', category: 'Tools', location: 'Miami, FL', history: this.productHistory},
      {index: 1, checked: false, name: 'Ball Clasp', price: '$120', avgPrice: '$110', discount: 'Bogo', vendor: 'Acme Inc', department: 'Surgical', category: 'Tools', location: 'Miami, FL', history: this.productHistory},
      {index: 2, checked: false, name: 'Nunchucks', price: '$80', avgPrice: '$88', discount: 'Bogo', vendor: 'Ninja Inc', department: 'Stealth', category: 'Tools', location: 'Miami, FL', history: this.productHistory}
    ]
    this.productColumn = [
      {prop: 'name', name: 'Product Name'},
      {prop: 'price', name: 'Price'},
      {prop: 'avgPrice',  name: 'Avg Price'},
      {prop: 'discount', name: 'Discount'},
      {prop: 'vendor', name: 'Vendor'},
      {prop: 'department', name: 'Department'},
      {prop: 'category', name: 'Category'},
      {prop: 'location', name: 'Location'}
    ]
    this.customClasses = {
      sortAscending: 'fa fa-angle-down',
      sortDescending: 'fa fa-angle-up'
    };
    this.priceList = [
      {id: 0, name: 'Price of product when reconciled'},
      {id: 1, name: 'Price of product when ordered'},
      {id: 2, name: 'Price of product when received'},
      {id: 3, name: 'Date Changed'}
    ]
    this.reportList = [
      {id: 0, name: 'Products'},
      {id: 1, name: 'Inventory groups'}
    ]

    this.chart.addListener("dataUpdated", () => this.zoomChart);
  }

  generatechartData() {
    var _chartData = [];
    var firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - 10);
    var y0 = 250;
    var y1 = 250;
    var y2 = 250;
    var y3 = 250;
    var forum = 250;

    for (var i = 0; i < 10; i++) {
      // we create date objects here. In your data, you can have date strings
      // and then set format of your dates using chart.dataDateFormat property,
      // however when possible, use date objects, as this will speed up chart rendering.
      var newDate = new Date(firstDate);
      newDate.setDate(newDate.getDate() + i);

      forum += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
      y0 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
      y1 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
      y2 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
      y3 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);

      _chartData.push({
        date: newDate,
        forum,
        y0,
        y1,
        y2,
        y3
      });
    }

    return _chartData;
  }

  getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i< 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  zoomChart() {
    if (this.chart.zoomToIndexes) {
      this.chart.zoomToIndexes(130, this.chartData.length - 1);
    }
  }

  showFiltersModal() {
    this.modal
    .open(ReportsFilterModal, this.modalWindowService.overlayConfigFactoryWithParams({}))
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

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  toggleHistory(row) {
    if (row.checked) {
      const gId = row.index.toString();
      const lineColor = this.getRandomColor();

      const a = {
        id: "v" + gId,
        autoGridCount: false,
        axisAlpha: 0.2,
        gridAlpha: 0,
        gridCount: 5,
        unit: '$',
      }
      this.chart.valueAxes.push(a);

      const g = {
        id: "g" + gId,
        useNegativeColorIfDown: false,
        balloonFunction: function(graphDataItem, graph) {
          var value = graphDataItem.values.value;
          var origin = graphDataItem.values.value;
          var offset = '';
          if (graphDataItem.index > 0) {
            value = value - graph.data[graphDataItem.index - 1].dataContext[`y${gId}`]
            if (value > 0) {
              offset = '$' + value;
            } else {
              offset = '-$' + (-value);
            }
          }
          return "<div style='padding-left:25px;padding-right:25px;padding-top:10px;padding-bottom:10px;'><span style='color:white;font-family:Roboto;font-size:20px;font-weight:bold;'>$" +
            origin + "</span>" + "<br><span style='color:white;font-family:Roboto;font-size:12px;font-weight:100;'>Change " +
            offset + "</span><br><br><span style='color:white;font-family:Roboto;font-size:12px;font-weight:100;'>Discount: 30%</span>" +
            "<br><span style='color:white;font-family:Roboto;font-size:12px;font-weight:100;'>Vendor: " + row.vendor + "</span></div>";
        },
        bullet: "round",
        bulletBorderAlpha: 1,
        bulletBorderColor: lineColor,
        hideBulletsCount: 50,
        lineThickness: 2,
        lineColor: lineColor,
        title: row.vendor,
        valueField: "y" + gId
      }
      this.chart.graphs.push(g);
      this.chart.validateData();
    } else {
      let removeIndex = 0;
      this.chart.graphs.forEach((graph, index) => {
        if (graph.id === `g${row.index}`) {
          removeIndex = index;
        }
      })
      this.chart.graphs.splice(removeIndex, 1);
      this.chart.valueAxes.splice(removeIndex, 1);
      this.chart.validateData();
    }
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }

  onPage(event) {
    // console.log('paged!', event);
  }

  onPrice(event) {
  }

  onReport(event) {
  }

  onSort(event) {
    this.productTable.forEach((product) => {
      if (product.checked) {
        product.checked = false;
        product.history.forEach((history) => {
          history.checked = false;
        })
      }
    })
  }
}
