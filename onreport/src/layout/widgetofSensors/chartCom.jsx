import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Chart } from "chart.js";


class Chartcom extends Component {
  state ={
    myChart: null
  }
  render(){
     const{
    type, arrData, arrLabels, legend, xAxisLbl, yAxisLbl,bgColors,borderColors
     } = this.props
    // error
    // genearteGraphs(type, arrData, arrLabels, legend, xAxisLbl, yAxisLbl) {
       var myChart
       console.log(type + "this name of chart");
       if(myChart != null || myChart !== undefined){
       
                  myChart.destroy();
                }
    
        myChart = new Chart("barchart1", {
          type: "line", 
          data: {
            labels: arrLabels,
            datasets: [
              {
                label: legend,
                data: arrData,
                // width: [12, 4, 5, 13, 12, 2, 19,19,10,10],
                // fill: false,
                // borderColor: "rgba(75,192,192,1)",
                // backgroundColor: "rgba(75,192,192,0.4)",
                // pointRadius: 0,
                pointBorderWidth: 3,
                pointBorderColor: "red",
                fontSize: 12,
                borderWidth: 2
              }
              // {
              //   label: "Some Things New",
              //   data: ["10","20","70","90","101",'120',"70","20","100","10"],
              //   width: [12, 4, 5, 13, 12, 2, 19,19,10,10],
              //   // backgroundColor: {bgColors },
              //   // borderColor: {borderColors},
              //   fill: false,
              //   borderColor: "rgba(192,75,192,1)",
              //   backgroundColor: "rgba(192,75,192,0.4)",
                
              //   pointBorderWidth: 3,
              //   pointBorderColor: "green",
              //   fontSize: 12,
              //   borderWidth: 2,
              //   // pointRadius: 0
              // }
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
                {
                  ticks: {
                    beginAtZero: true,
                    fontSize: 12,
                  
                  },
                  scaleLabel: {
                    display: true,
                    labelString: yAxisLbl,
                    fontSize: 12,
                    fontColor: "red"
                  }
                }
              ]
            }
          }
        });
        
     
    //  }

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