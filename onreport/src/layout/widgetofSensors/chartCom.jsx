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
                // backgroundColor: {bgColors },
                // borderColor: {borderColors},
                pointBorderWidth: 3,
                pointBorderColor: "red",
                fontSize: 12,
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