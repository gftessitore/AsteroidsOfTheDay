import { Component } from '@angular/core';
import { NasaService } from './nasa.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AsteroidsOfTheDay';
  days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  selectedDay: string;
  startDate: any;
  endDate: any;
  neoData: any;
  dailyNeoData: any = {};
  dataToBeDisplayed: any;
  top5ByMagnitude: any;
  kmMinDiameter: number;
  kmMaxDiameter: number;
  maxBubbleWidth: number = 100;
  diamFactor: number = 40;
  minDiam: any = {
    width: 0, 
    height: 0, 
    top: 0,
    left: 0
  };
  maxDiam: any = {
    width: 0, 
    height: 0, 
    top: 0,
    left: 0
  };
  minWidth: number = 0;
  maxWidth: number = 100000;
  chart: any = [];
  customTooltips: any;

  constructor(nasaSvc: NasaService) {
    let startDate = new Date();
    let dow = startDate.getDay();
    this.selectedDay = this.days[dow-1];

    while(dow>1){
      startDate.setDate(startDate.getDate() - 1);
      dow = startDate.getDay();
    }

    this.startDate = startDate;
    let endDate = new Date();
    endDate.setDate(startDate.getDate() + 6);
    this.endDate = endDate;

    nasaSvc.getAsteroids(this.startDate, this.endDate).subscribe((data) => {
      this.neoData = data;
      let dailyDate = this.startDate;
      this.dailyNeoData.mon = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      dailyDate.setDate(dailyDate.getDate()+1);
      this.dailyNeoData.tue = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      dailyDate.setDate(dailyDate.getDate()+1);
      this.dailyNeoData.wed = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      dailyDate.setDate(dailyDate.getDate()+1);
      this.dailyNeoData.thu = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      dailyDate.setDate(dailyDate.getDate()+1);
      this.dailyNeoData.fri = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      dailyDate.setDate(dailyDate.getDate()+1);
      this.dailyNeoData.sat = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      dailyDate.setDate(dailyDate.getDate()+1);
      this.dailyNeoData.sun = this.neoData.near_earth_objects[`${dailyDate.toISOString().substr(0, 10)}`];
      startDate = new Date();
      dow = startDate.getDay();
      //this.selectedDay = this.days[dow-1];
      //this.dataToBeDisplayed = this.dailyNeoData[this.selectedDay];
      this.selectDay(this.days[dow-1]);
    });

    this.customTooltips = function(tooltip) {
			// Tooltip Element
			var tooltipEl = document.getElementById('chartjs-tooltip');

			if (!tooltipEl) {
				tooltipEl = document.createElement('div');
				tooltipEl.id = 'chartjs-tooltip';
				tooltipEl.innerHTML = '<table></table>';
				this._chart.canvas.parentNode.appendChild(tooltipEl);
			}

			// Hide if no tooltip
			if (tooltip.opacity === 0) {
				tooltipEl.style.opacity = '0';
				return;
			}

			// Set caret Position
			tooltipEl.classList.remove('above', 'below', 'no-transform');
			if (tooltip.yAlign) {
				tooltipEl.classList.add(tooltip.yAlign);
			} else {
				tooltipEl.classList.add('no-transform');
			}

			function getBody(bodyItem) {
				return bodyItem.lines;
			}

			// Set Text
			if (tooltip.body) {
				var titleLines = tooltip.title || [];
				var bodyLines = tooltip.body.map(getBody);

				var innerHtml = '<thead>';

				titleLines.forEach(function(title) {
					innerHtml += '<tr><th>' + title + '</th></tr>';
				});
				innerHtml += '</thead><tbody>';

				bodyLines.forEach(function(body, i) {
					var colors = tooltip.labelColors[i];
					var style = 'background:' + colors.backgroundColor;
					style += '; border-color:' + colors.borderColor;
					style += '; border-width: 2px';
					var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
					innerHtml += '<tr><td>' + span + body + '</td></tr>';
				});
				innerHtml += '</tbody>';

				var tableRoot = tooltipEl.querySelector('table');
				tableRoot.innerHTML = innerHtml;
			}

			var positionY = this._chart.canvas.offsetTop;
			var positionX = this._chart.canvas.offsetLeft;

			// Display, position, and set styles for font
			tooltipEl.style.opacity = '1';
			tooltipEl.style.left = positionX + tooltip.caretX + 'px';
			tooltipEl.style.top = positionY + tooltip.caretY + 'px';
			tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
			tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
			tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
			tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
		};
  }

  selectDay(day){
    this.selectedDay = day;
    this.dataToBeDisplayed = this.dailyNeoData[day];
    this.top5ByMagnitude = this.dataToBeDisplayed.sort((a, b) => (a.absolute_magnitude_h > b.absolute_magnitude_h ? -1 : 1)).slice(0, 5);
    let maxMagnitude = this.top5ByMagnitude[0].absolute_magnitude_h;
    let minMagnitude = this.top5ByMagnitude[4].absolute_magnitude_h;
    let magRange = maxMagnitude-minMagnitude;
    this.top5ByMagnitude.forEach(element => {
      element.relative_magnitude = (element.absolute_magnitude_h-minMagnitude)/magRange;
      let w = Math.round(30*element.relative_magnitude);
      if (w < 3) { w = 3; }
      if (w % 2 === 1) { w = w + 1; }
      if (w === 29) { w = 27; }
      element.filledAreaWidth = w.toString()+'px';
      element.filledAreaLeft = Math.round((30 - w)/2)+'px';
      element.filledAreaTop = Math.round(12 + (30 - w)/2)+'px';
    });
    this.kmMinDiameter = 999999;
    this.kmMaxDiameter = 0;
    for(let i=0; i<this.dataToBeDisplayed.length; i++)
    {
      let mediumDiam = (parseFloat(this.dataToBeDisplayed[i].estimated_diameter.kilometers.estimated_diameter_max) + parseFloat(this.dataToBeDisplayed[i].estimated_diameter.kilometers.estimated_diameter_min))/2;
      if(mediumDiam > this.kmMaxDiameter) { 
        this.kmMaxDiameter = mediumDiam;
      }
      if(mediumDiam < this.kmMinDiameter) { 
        this.kmMinDiameter = mediumDiam;
      }
    }
    // console.log(`Min km: ${this.kmMinDiameter}`);
    // console.log(`Max km: ${this.kmMaxDiameter}`);

    this.diamFactor = this.maxBubbleWidth/(2*this.kmMaxDiameter);

    let minWidth = 2*this.diamFactor * this.kmMinDiameter;
    if (minWidth < this.minWidth) { minWidth = this.minWidth; }
    this.minDiam = {
      width: `${minWidth}px`, 
      height: `${minWidth}px`, 
      top: `${-1*((minWidth)/2.0 - 13)+2}px`,
      left: `${-1*((minWidth)/2.0 - 4)-1}px`
    };

    let maxWidth = 2*this.diamFactor * this.kmMaxDiameter;
    if (maxWidth > this.maxWidth) { maxWidth = this.maxWidth; }
    this.maxDiam = {
      width: `${maxWidth}px`, 
      height: `${maxWidth}px`, 
      top: `${-1*((maxWidth)/2.0 - 13)+2}px`,
      left: `${-1*((maxWidth)/2.0 - 3)-1}px`
    };

    // CHART:
    let chartData = [];
    let maxSpeed = 0;
    let maxDist = 0;
    for(let i=0; i<this.dataToBeDisplayed.length; i++){
      chartData.push({
        x: parseFloat(this.dataToBeDisplayed[i].close_approach_data[0].relative_velocity.kilometers_per_second),
        y: parseFloat(this.dataToBeDisplayed[i].close_approach_data[0].miss_distance.astronomical),
        r: this.diamFactor * (this.dataToBeDisplayed[i].estimated_diameter.kilometers.estimated_diameter_max + this.dataToBeDisplayed[i].estimated_diameter.kilometers.estimated_diameter_min)/2, 
        magnitude: this.dataToBeDisplayed[i].absolute_magnitude_h,
        diameter: (this.dataToBeDisplayed[i].estimated_diameter.kilometers.estimated_diameter_max + this.dataToBeDisplayed[i].estimated_diameter.kilometers.estimated_diameter_min)/2, 
        name: this.dataToBeDisplayed[i].name.replace('(', '').replace(')', '')
      });
      if (parseFloat(this.dataToBeDisplayed[i].close_approach_data[0].relative_velocity.kilometers_per_second) > maxSpeed) {
        maxSpeed = parseFloat(this.dataToBeDisplayed[i].close_approach_data[0].relative_velocity.kilometers_per_second);
      }
      if (parseFloat(this.dataToBeDisplayed[i].close_approach_data[0].miss_distance.astronomical) > maxDist){
        maxDist = parseFloat(this.dataToBeDisplayed[i].close_approach_data[0].miss_distance.astronomical);
      }
    }
    if (this.chart.ctx) { this.chart.destroy(); }
    this.chart = new Chart('canvas', {
      type: 'bubble',
      data: {
          datasets: [{
              label: 'asteroids of the day',
              fill: true, 
              borderColor: "#27fab0",
              backgroundColor: "#27fab010",
              data: chartData
          }]
      },
      options: {
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
                var legend = new Array();
                const item: any = data.datasets[0].data[tooltipItem.index];
                legend.push(`Name: ${item.name}`);
                legend.push(`Diameter: ${parseFloat(item.diameter).toFixed(2)} km`);
                legend.push(`Magnitude: ${parseFloat(item.magnitude).toFixed(2)} h`);
                legend.push(`Distance: ${parseFloat(item.y).toFixed(2)} au`);
                legend.push(`Velocity: ${parseFloat(item.x).toFixed(2)} km/s`);
                return legend;
            }
          },
          backgroundColor: '#00000020',
          borderWidth: 1,
          cornerRadius: 0,
          caretSize: 0, 
          displayColors: false, 
          borderColor: '#ffffff',
          xPadding: 20,
          yPadding: 20,
          bodySpacing: 7
        },
        responsive: true,
        legend: {
          display: false
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'VELOCITY (km/s)', 
                  fontColor: '#fff'
                },
                type: 'linear',
                position: 'bottom',
                ticks: {
                  suggestedMin: 0,
                  suggestedMax: maxSpeed * 1.1
                },
                gridLines: {
                  display: false
                }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'DISTANCE (au)', 
                fontColor: '#fff'
              },
              type: 'linear',
              ticks: {
                suggestedMin: 0,
                suggestedMax: maxDist * 1.1,
                padding: 0
              },
              gridLines: {
                display: true
              }
          }]
        }
      }
    });
  }
}
