import React, { Component } from 'react'
import { Chart } from "chart.js";
import './chartcomp.css';

 class chartcomp extends Component {
     constructor(){
         super()
         this.state ={
            barchart:'',
            title: '',
            type: '',
            legend:'',
            yAxisLbl:'',
            xAxisLbl:'',
            arrData: [],
            arrLabels: [],
            fromDate:'',
            toDate:'',
            imageUrl:'',
            bar: "bar",
            pie : "pie",
            line: "line",
            doughnut: "doughnut",
            radar: "radar",
            polarArea : "polarArea",
            bgColors : [],
            borderColors : [],
            yaxisName:'',
            myChart: Chart,
          
         }
     }
  
     //gives random BackgroundColors for each dataSets in the chart each time when the chart is generated.
        getRandomBgColor() {
            var letters = "0123456789ABCDEF";
            var color = "#";
            for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
            //gives random Colors for each dataSets in the chart each time when the chart is generated.
        getRandomBorColor() {
        var letters = "0123456789ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 12)];
        }
        return color;
       }
        
    //Defines the type of chart to be generated and displays the chart.
    getChart(chartType) {
        // console.log(this.state.arrData, this.state.arrLabels, this.state.yaxisName, this.state.fromDate , this.state.toDate)
        // if (this.state.myChart) this.state.myChart.destroy();
        this.state.title = chartType + " " + "chart";
        // if (chartType == "polarArea") {
        // this.setState({title : "Polar Area" + " " + "chart"});
        // }
        // this.state.type = chartType;
        this.state.legend = this.state.yaxisName;
        this.state.xAxisLbl = "Date and Time";
        this.state.yAxisLbl = this.state.yaxisName;
        this.genearteGraphs(
          chartType,
        this.state.arrData, 
        this.state.arrLabels,
        this.state.legend,
        this.state.xAxisLbl,
        this.state.yAxisLbl
        );
    console.log(this.state.arrData, this.state.arrLabels, this.state.legend) 
      
    }
componentDidMount(){
    var arrData = [];
    var arrLabels =[];
    // if(sessionStorage.getItem("dataToSend1")){
    arrData = sessionStorage.getItem("dataToSend1");
    arrLabels= sessionStorage.getItem("dataToSend2");
    var yaxisName = sessionStorage.getItem("yaxisName");
    var fromDate = sessionStorage.getItem("formDate");
    var  toDate = sessionStorage.getItem("toDate");
    arrData =  arrData.split(",");
    arrLabels =  arrLabels.split(",");
    var bgColors =[];
    var borderColors =[];
    for (var i = 0; i <  arrData.length; i++) {
        bgColors.push(this.getRandomBgColor());
        borderColors.push(this.getRandomBorColor());
        // sessionStorage.clear();
    
    }
  
    this.updateState(arrData, arrLabels, yaxisName, fromDate ,toDate ,bgColors, borderColors);
    //   console.log(arrData, arrLabels, yaxisName, fromDate , toDate)
//    console.log(arrData,arrLabels);
       console.log("hello Takreem this is componentDidmount");
  // }    
    
}
componentDidUpdate(){
   this.getChart("line");
}
updateState(arrData, arrLabels, yaxisName, fromDate ,toDate ,bgColors, borderColors){
    this.setState({arrData: arrData,
        arrLabels: arrLabels,
         yaxisName: yaxisName,
         fromDate:fromDate,
         toDate: toDate,
         bgColors: bgColors,
         borderColors: borderColors
        });
        // console.log(arrData, arrLabels, yaxisName, fromDate ,toDate ,bgColors, borderColors+"this i Want");
}     
 //generates the chart object based on the given properties.
 genearteGraphs(type, arrData, arrLabels, legend, xAxisLbl, yAxisLbl) {
  //  if(this.state.myChart != null){
  //    if(this.state.myChart.destroy != undefined)
  //    this.state.myChart.destroy();
  //     this.setState({myChart:null});
  //  }
   console.log(type + "this name of chart");

    this.state.myChart = new Chart("barchart", {
      type: type, 
      data: {
        labels: arrLabels,
        datasets: [
          {
            label: legend,
            data: arrData,
            backgroundColor: this.state.bgColors,
            borderColor: this.state.borderColors,
            pointBorderWidth: 3,
            pointBorderColor: "red",
            fontSize: 100,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        
        scales: {
          xAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontSize: 18,
                tickColor: "red"
              },
              scaleLabel: {
                display: true,
                labelString: xAxisLbl,
                fontSize: 30,
                fontColor: "red"
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontSize: 18
              },
              scaleLabel: {
                display: true,
                labelString: yAxisLbl,
                fontSize: 30,
                fontColor: "red"
              }
            }
          ]
        }
      }
    });
 }
 distroChart(){
 
  this.props.history.push("/Menu");
  // sessionStorage.clear();
 }



  render() {
    
    return (
      <div>
       {/* <button onClick={this.distroChart.bind(this)}>Back</button> */}
      
        <div className="row mb-4">
    
        {/* <div className="col-sm-2">
        <button className="btn btn-lg btn-danger ml-4 pad pie" onClick={this.getChart.bind(this,"pie")}>Pie Chart</button>
        </div>
        <div className="col-sm-2">
        <button className="btn btn-lg btn-danger Radar pad" onClick={this.getChart.bind(this,"radar")}>Radar Chart</button>
        </div>
        <div className="col-sm-2">
        <button className="btn btn-lg btn-danger doughnut  pad" onClick={this.getChart.bind(this,"doughnut")}>Doughnut Chart</button>
        </div>
        <div className="col-sm-2">
        <button className="btn btn-lg btn-danger polarArea pad" onClick={this.getChart.bind(this,"polarArea")}>Polar Area Chart</button>
        </div>
         <div className="col-sm-2">
        <button className="btn btn-lg btn-danger bar pad" onClick={this.getChart.bind(this,"bar")}>Bar Chart</button>
         </div> */}
        {/* <div className="col-sm-2">
        <button className="btn btn-lg btn-danger line pad" onClick={this.getChart.bind(this,"line")}>Line Chart</button>
        </div> */}
        </div>
        
        <div className="cus">
        <p className="text-center" style={{fontWeight: "bolder", color: "black"}}>{this.state.fromDate}&nbsp;to&nbsp; {this.state.toDate}</p>
        <canvas id="barchart"></canvas>
        </div>
      </div>
    )
  }
}
export default chartcomp;