import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DbService } from '../services/db.service';
import { Chart, BarElement, BarController, CategoryScale, LinearScale } from 'chart.js';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements AfterViewInit {

  @ViewChild('barCanvas') barCanvas: ElementRef;
  @ViewChild('barHorizontalCanvas') barHorizontalCanvas: ElementRef;

  public start: String = '';
  public end: String = '';

  barChart: any;
  barHorizontalChart: any;

  constructor(private dbService: DbService) {

  }

  ionViewDidEnter() {
    Chart.register(BarElement, BarController, CategoryScale, LinearScale);

    this.start = (new Date(this.getToday()+' 12:00:00')).toISOString();
    this.end = this.start;
    this.search();
  }

  ngAfterViewInit() {

  }

  search() {
    console.log(this.start);
    console.log(this.end);
    let startUnixDate = parseInt(((new Date(this.getDateFormat(this.start) + ' 00:00:00')).getTime() / 1000).toFixed(0));
    let endUnixDate = parseInt(((new Date(this.getDateFormat(this.end) + ' 23:59:59')).getTime() / 1000).toFixed(0));
    console.log(startUnixDate);
    console.log(endUnixDate);

    //this.drawBarChart([], []);
    //this.drawBarHorizontalChart([], []);

    this.dbService.getDataToChart(startUnixDate, endUnixDate).then((data) => {
      console.log(data);

      let categories = {};
      let tasks = {};

      for (let i = 0; i < data.length; i++) {
        if (!(data[i].category_id in categories)) {
          let category_name = (data[i].category_id == 0 ? '--' : data[i].category_name);
          categories[data[i].category_id] = { 'name': category_name, 'time': 0 };
        }
        categories[data[i].category_id].time += data[i].seconds;

        if (!(data[i].task_id in tasks)) {
          let task_name = data[i].task_name;
          tasks[data[i].task_id] = { 'name': task_name, 'time': 0 };
        }
        tasks[data[i].task_id].time += data[i].seconds;
      }

      let dataCategories = [], labelsCategories = [];
      for (let key in categories) {
          labelsCategories.push(categories[key].name);
          dataCategories.push(categories[key].time);
      }

      for (let i = 0; i < dataCategories.length; i++) {
        dataCategories[i] = dataCategories[i]/3600;
      }

      let dataTasks = [], labelsTasks = [];
      for (let key in tasks) {
          labelsTasks.push(tasks[key].name);
          dataTasks.push(tasks[key].time);
      }

      for (let i = 0; i < dataTasks.length; i++) {
        dataTasks[i] = dataTasks[i]/3600;
      }

      this.drawBarChart(dataCategories, labelsCategories);
      this.drawBarHorizontalChart(dataTasks, labelsTasks);

    });
  }

  drawBarChart(data, labels) {

    if (this.barChart) {
        this.barChart.destroy();
    }
    
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        //labels: ['BJP', 'INC', 'AAP', 'CPI', 'CPI-M', 'NCP'],
        datasets: [{
          data: data,
          //data: [200, 50, 30, 15, 20, 34],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      }
    });

  }

  drawBarHorizontalChart(data, labels) {

    if (this.barHorizontalChart) {
        this.barHorizontalChart.destroy();
    }

    this.barHorizontalChart = new Chart(this.barHorizontalCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        //labels: ['BJP', 'INC', 'AAP', 'CPI', 'CPI-M', 'NCP'],
        datasets: [{
          data: data,
          //data: [200, 50, 30, 15, 20, 34],
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
      }
    });
  }

  getToday() {
    let today = new Date();
    return today.getFullYear() + "-" + ("0"+(today.getMonth()+1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
  }

  getDateFormat(d) {
    return d.substr(0,10);
  }

}
