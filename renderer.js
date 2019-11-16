// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var chartColors = {
			red: 'rgb(255, 99, 132)',
			orange: 'rgb(255, 159, 64)',
			yellow: 'rgb(255, 205, 86)',
			green: 'rgb(75, 192, 192)',
			blue: 'rgb(54, 162, 235)',
			purple: 'rgb(153, 102, 255)',
			grey: 'rgb(201, 203, 207)'
		};
var color = Chart.helpers.color;

const tableify = require('tableify')



const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
//const port = new SerialPort("/dev/tty.usbmodem14301", { baudRate: 9600 })
var port = null

const parser = new Readline()
//port.pipe(parser)

//parser.on('data', line => console.log(`> ${line}`))
/*
SerialPort.list((err, ports) => {
  console.log('ports', ports);
  if (err) {
    document.getElementById('error').textContent = err.message
    return
  } else {
    document.getElementById('error').textContent = ''
  }

  if (ports.length === 0) {
    document.getElementById('error').textContent = 'No ports discovered'
  }

  var dropdown = document.getElementById("portlist");

  for (var i = 0; i < ports.length; ++i) {
      // Append the element to the end of Array list
      dropdown[dropdown.length] = new Option(ports[i]['comName'] + ' (' + ports[i]['manufacturer'] + ')', ports[i]['comName']);
  }

  //tableHTML = tableify(ports)
  //document.getElementById('ports').innerHTML = tableHTML


})
*/
// Promise approach
SerialPort.list().then(ports => {

  var dropdown = document.getElementById("portlist");

  ports.forEach(function(port) {
    console.log(port.path);
    console.log(port.pnpId);
    console.log(port.manufacturer);
    dropdown[dropdown.length] = new Option(port.path + ' (' + port.manufacturer + ')', port.path);

  });
});

document.getElementById('portlist').addEventListener('change', function(){

	var e = document.getElementById("portlist");
	var v = e.options[e.selectedIndex].value;

	console.log(v);

	port = new SerialPort(v, { baudRate: 9600 })
  port.pipe(parser)
  parser.on('data', line => updateData(`${line}`))

  //console.log(this.value);
});

document.getElementById('displaynumber').addEventListener('change', function(){

  //config.data.datasets.splice(0, 1);

  //console.log(this.value);
});

document.getElementById('export').addEventListener('click', function(){

  var content = "";
  var file_name = new Date().getTime() + '.csv';
  var headers = '';

  for (var n = 0; n < i; ++n) {
    var line = ','+n;

    for (var p = 0; p < chart.data.datasets.length; ++p) {
      line += ',' + chart.data.datasets[p].data[n];
      if(n==0)
        headers += ',Sensor ' + p;
    }
    if(line.charAt(0) == ','){
      line = line.substr(1);
    }
    console.log('here'+line.trim());

    content += line.replace(/\s+/g, '').trim() + '\r\n';
  }

  if(headers.charAt(0) == ','){
    headers = 'interval,' + headers.substr(1)  + '\n';
  }

  console.log(content);
  content =  headers + content;


  var fs = require('fs');
  try {
    fs.writeFileSync(file_name, content, 'utf-8');
    const shell = require('electron').shell;
    const path = require('path');

    shell.openItem(path.join(__dirname, file_name));
  }
  catch(e) { alert('Failed to save the file !'); }

  console.log(fs);
});


var chart = null;
var lastMeasureTimes = [];

var i = 0;
function randomScalingFactor(){
  return Math.abs((Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100));
}
//port.write('ROBOT POWER ON\n')
function updateData(d){

  d = d;

  //console.log(d);

  if (d.indexOf(',') > -1){

    d = d.split(",");

    // new dataset?
    if(d.length != chart.data.datasets.length){

      var colorNames = Object.keys(chartColors);
      var colorName = colorNames[chart.data.datasets.length % colorNames.length];
      var newColor = window.chartColors[colorName];
      var newDataset = {
        label: 'Sensor ' + (chart.data.datasets.length+1),
        backgroundColor: newColor,
        borderColor: newColor,
        data: [],
        fill: false,
				lineTension: 0,
      };

      chart.data.datasets.push(newDataset);

      console.log("new sensor log");
    }

    console.log(d);

    // update the x axis
  	chart.data.labels.push(i);

    //values for y
    for (var n = 0; n < d.length; ++n) {
      chart.data.datasets[n].data.push(d[n]);

      // remove the last label
      var e = document.getElementById("displaynumber");
      var v = e.options[e.selectedIndex].value;

      if(v>0){
        if(chart.data.datasets[0].data.length>v){
          chart.data.labels.splice(-1, 1);
          chart.data.datasets.forEach(function(dataset) {
          				dataset.data.shift();
          			});
        }
      }

    }

  /*
  	chart.data.datasets.forEach(function(dataset) {
  		dataset.data.push(randomScalingFactor());
  	});
  */
    i=i+1;

    chart.update({
        preservation: true
    });

    //tableHTML = tableify(chart.data.datasets[0].data)
    //document.getElementById('data').innerHTML = tableHTML
  }

}



function drawChart() {

    chart = new Chart($('.chart'), {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'Sensor 1',
					backgroundColor: window.chartColors.red,
					borderColor: window.chartColors.red,
					data: [
					],
					fill: false,
					lineTension: 0,
				}, {
					label: 'Sensor 2',
					fill: false,
					backgroundColor: window.chartColors.blue,
					borderColor: window.chartColors.blue,
					data: [
					],
					lineTension: 0,
				}]
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: 'Sensor Data'
				},
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Reading #'
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Value'
						}
					}]
				}
			}
		});

}

$(() => {
  drawChart();
})
