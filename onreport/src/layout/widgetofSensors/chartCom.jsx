import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Chart } from "chart.js";


class Chartcom extends Component {
  state ={
    body:{ myChart: {}}
   
  }
  // getRandomBackgroundColor() {
  //   var letters = "0123456789ABCDEF";
  //   var color = "#";
  //   for (var i = 0; i < 6; i++) {
  //   color += letters[Math.floor(Math.random() * 12)];
  //   }
  //   return color;
  //   }
  //   getRandomBordergroundColor() {
  //     var letters = "0123456789ABCDEF";
  //     var color = "#";
  //     for (var i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 12)];
  //     }
  //     return color;
  //     }
  getIdForChart(chartAxis, keysofBsName){
   let index =  chartAxis.findIndex(item => item.businessName === keysofBsName);
   return chartAxis[index].axisY
  }
  render(){
     const{chartAxis,arrData, arrLabels, legend, xAxisLbl, yAxisLbl,bgColors,borderColors } = this.props
    var   backgroundColor = [ 
         'rgba(255, 99, 132, 0.2)',
         'rgba(54, 162, 235, 0.2)',
         'rgba(255, 206, 86, 0.2)',
         'rgba(75, 192, 192, 0.2)',
         'rgba(153, 102, 255, 0.2)',
         'rgba(255, 159, 64, 0.2)',
         'rgba(111, 123, 78, 0.2)',
         'rgba(168, 98, 255, 0.2)',
         'rgba(98, 255, 167, 0.2)',
         'rgba(255, 189, 220, 0.2)',
         'rgba(121, 56, 45, 0.2)',
         'rgba(178, 89, 22, 0.2)',
         'rgba(67, 230, 188, 0.2)',
         'rgba(98, 255, 21, 0.2)',
         'rgba(129, 121, 255, 0.2)',
        
    ];
    var borderColor =[
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(111, 123, 78, 1)',
      'rgba(168, 98, 255, 1)',
      'rgba(98, 255, 167, 1)',
      'rgba(255, 189, 220, 1)',
      'rgba(121, 56, 45, 1)',
      'rgba(178, 89, 22, 1)',
      'rgba(67, 230, 188, 1)',
      'rgba(98, 255, 21, 1)',
      'rgba(129, 121, 255, 1)',
  ];
      var dataArray = []
       // console.log("This is Chart componenet data ")
       // console.log(arrData);
    
       if( arrData !== undefined && arrData.length !== 0 && arrData !== null){
        var axisY = ["first-y-axis", "first-y-axis", "second-y-axis"]
        var labelName = [];
        var keysofBsName = Object.keys(arrData[0])
        // console.log(keysofBsName)
         var  labelName1 = '';
         var labelName2 = '';
         
        for(var i = 0 ; i< keysofBsName.length; i++){
          console.log(this.getIdForChart(chartAxis,keysofBsName[i]));
      
          if(this.getIdForChart(chartAxis,keysofBsName[i]) === "second-y-axis"){
            labelName2 += keysofBsName[i] + " ; ";
          }
          else{
            labelName1 += keysofBsName[i] + " ; ";
          }
          var json = {};
          json["label"]  = keysofBsName[i];
          json["data"]  = [];
          // json["fill"]  = false;
          json["backgroundColor"]  =  backgroundColor[i];
          //json["yAxisID"] = (axisY[i])?axisY[i] : '';
           json["yAxisID"] = this.getIdForChart(chartAxis,keysofBsName[i])
          json["borderColor"]  =  borderColor[i];
          json["pointBorderWidth"]  = 3;
          // json["pointBorderColor"]  = this.getRandomBackgroundColor();
          json["fontSize"]  = 12;
          json["borderWidth"]  = 2;
          for(var k = 0 ; k < arrData.length ; k++){
            json["data"].push(arrData[k][keysofBsName[i]])
            
          }
          dataArray.push(json)
        }
// console.log(dataArray)
var me   = this;
// console.log(me.state.body.myChart) 
  // console.log(type + "this name of chart");

  if( me.state.body.myChart != null &&  me.state.body.myChart !== undefined && me.state.body.myChart instanceof Chart ){
  
   me.state.body.myChart.destroy();
           }
   me.state.body.myChart = new Chart("barchart1", {
     type: "line", 
     data: {
       labels: arrLabels,
       datasets: 
         dataArray
       
     },
     options: {
       responsive: true,
       maintainAspectRatio: true,
       tooltips: {
         mode: 'label'
       },
       scales: {
         xAxes: [
           {
             
             // stacked: true,
             ticks: {
               beginAtZero: true,
               fontSize: 12,
               tickColor: "red"
             },
             scaleLabel: {
              
                display: true,
               labelString: xAxisLbl,
               fontSize: 12,
               fontColor: "red"
             }
           }
         ],
         yAxes: [
           // {
           //   // stacked: true,
           //   ticks: {
           //     beginAtZero: true,
           //     fontSize: 12,
             
           //   },
           //   scaleLabel: {
           //     display: true,
           //     labelString: "Values",
           //     fontSize: 12,
           //     fontColor: "red"
           //   }
           // },
           {
             // stacked: true,
             position: "left",
             type: 'linear',
             id: axisY[0],
             scaleLabel: {
                   display: true,
                   labelString:labelName1.substring(0, labelName1.length - 2),
                   fontSize: 12,
                   fontColor: "red"
                 }
           }, {
             // stacked: false,
             position: "right",
             type: 'linear',
             id: axisY[axisY.length-1],
             scaleLabel: {
              display: true,
              labelString: labelName2.substring(0, labelName2.length - 2),
              fontSize: 12,
              fontColor: "red"
            },
             ticks: {
                   beginAtZero: true,
                   fontSize: 12,
                 
                 }
           }
         ]
       }
     }
   });
   
//  me.setState({body: me.state.body})
//  }
       }
     

    

    return (
        <div >
         <canvas id="barchart1"></canvas>
        </div>
            
    );
  };

  }

   
  Chartcom.propTypes = {
    type: PropTypes.string.isRequired,
    arrData: PropTypes.array.isRequired,
    arrLabels: PropTypes.array.isRequired,
    legend: PropTypes.string.isRequired,
    xAxisLbl: PropTypes.string.isRequired,
    yAxisLbl: PropTypes.string.isRequired,
    // bgColors: PropTypes.array.isRequired,
    borderColors: PropTypes.array.isRequired


  };
export default Chartcom;