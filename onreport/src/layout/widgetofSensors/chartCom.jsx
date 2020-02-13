import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Chart } from "chart.js";


class Chartcom extends Component {
  state = {
    body: { myChart: {} }

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

  getIdForChart(chartAxis, keysofBsName) {
    let array = [{ businessName: "Values", axisY: "first-y-axis" },
    { businessName: "Min", axisY: "first-y-axis" },
    { businessName: "Max", axisY: "second-y-axis" },
    { businessName: "Avg", axisY: "first-y-axis" },
    { businessName: "Durations", axisY: "first-y-axis" },
    { businessName: "Count", axisY: "second-y-axis" }];
    let temp = chartAxis.concat(array)
    //  console.log(temp)
    let index = temp.findIndex(item => item.businessName === keysofBsName);
    return temp[index].axisY
  }
  render() {
    const { chartAxis, arrData, arrLabels, legend, xAxisLbl, yAxisLbl, bgColors, borderColors } = this.props
    var backgroundColor = [
      'rgba(255, 222, 0, 0.2)',
      'rgba(0, 255, 0, 0.2)',
      'rgba(255, 0, 255, 0.2)',
      'rgba(255, 0, 0, 0.2)',
      'rgba(255, 128, 0, 0.2)',
      'rgba(0, 255, 255, 0.2)',
      'rgba(0, 0, 255, 0.2)',
      'rgba(168, 98, 255, 0.2)',
      'rgba(98, 255, 167, 0.2)',
      'rgba(255, 189, 220, 0.2)',
      'rgba(121, 56, 45, 0.2)',
      'rgba(178, 89, 22, 0.2)',
      'rgba(67, 230, 188, 0.2)',
      'rgba(98, 255, 21, 0.2)',
      'rgba(129, 121, 255, 0.2)',

    ];
    var borderColor = [
      'rgba(255, 222, 0, 1)',
      'rgba(0, 255, 0, 1)',
      'rgba(255, 0, 255, 1)',
      'rgba(255, 0, 0, 1)',
      'rgba(255, 128, 0, 1)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 0, 255, 1)',
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

    if (arrData !== undefined && arrData.length !== 0 && arrData !== null && legend !== null) {
      var axisY = ["first-y-axis", "second-y-axis", "thired-y-axis"]
      var labelName = [];
      var keysofBsName = Object.keys(arrData[0])
      // console.log(keysofBsName)
      // var labelName1 = legend.primaryLegend;
      // var labelName2 = legend.seconderyLegend;

      for (var i = 0; i < keysofBsName.length; i++) {
        //   console.log(this.getIdForChart(chartAxis,keysofBsName[i]));

        // if (this.getIdForChart(chartAxis, keysofBsName[i]) === "second-y-axis") {
        //   labelName2 += keysofBsName[i] + " ; ";
        // }
        // else {
        //   labelName1 += keysofBsName[i] + " ; ";
        // }
        var json = {};
        json["label"] = keysofBsName[i];
        json["data"] = [];
        //  json["fill"]  = false;
        json["backgroundColor"] = backgroundColor[i];
        //json["yAxisID"] = (axisY[i])?axisY[i] : '';
        json["yAxisID"] = this.getIdForChart(chartAxis, keysofBsName[i])
        json["borderColor"] = borderColor[i];
        json["pointBorderWidth"] = .1;
        // json["pointBorderColor"]  = this.getRandomBackgroundColor();
        json["fontSize"] = 7;
        json["borderWidth"] = 1.2;
        for (var k = 0; k < arrData.length; k++) {
          json["data"].push(arrData[k][keysofBsName[i]])

        }
        dataArray.push(json)
      }
      // console.log(dataArray)
      var me = this;
      // console.log(me.state.body.myChart) 
      // console.log(type + "this name of chart");

      if (me.state.body.myChart != null && me.state.body.myChart !== undefined && me.state.body.myChart instanceof Chart) {

        me.state.body.myChart.destroy();
      }
      let yAxesArray = [
        // {
        //   // stacked: true,
        //   position: "left",
        //   type: 'linear',
        //   id: axisY[0],
        //   scaleLabel: {
        //     display: true,
        //     labelString: labelName1,
        //     fontSize: 13,
        //     fontColor: "red"
        //   }
        // }, {
        //   // stacked: false,
        //   position: "right",
        //   type: 'linear',
        //   id: axisY[axisY.length - 1],
        //   scaleLabel: {
        //     display: true,
        //     labelString: labelName2,
        //     fontSize: 13,
        //     fontColor: "red"
        //   },
        //   ticks: {
        //     beginAtZero: true,
        //     fontSize: 11,

        //   }
        // },
        // {
        //   // stacked: false,
        //   position: "right",
        //   type: 'linear',
        //   id: "thired-y-axis",
        //   scaleLabel: {
        //     display: true,
        //     labelString: labelName2,
        //     fontSize: 13,
        //     fontColor: "red"
        //   },
        //   ticks: {
        //     beginAtZero: true,
        //     fontSize: 11,

        //   }
        // }
      ];
      for(let i =0 ; i< legend.length; i++){
        // console.log( "This is Called ",legend[i].position);

        // console.log( "This is Called ",legend[i].axis)
        // console.log( "This is Called ",legend[i].legend)

        yAxesArray.push({
          // stacked: true,
          position: legend[i].position,
          type: 'linear',
          id: legend[i].axis,
          scaleLabel: {
            display: true,
            labelString: legend[i].legend,
            fontSize: 13,
            fontColor: "red"
          }
        })

      }
      me.state.body.myChart = new Chart("barchart1", {
        type: "line",
        data: {
          labels: arrLabels,
          datasets:
            dataArray

        },
        options: {
          spanGaps: true,
          responsive: true,
          maintainAspectRatio: false,
          tooltips: {
            mode: 'label'
          },
          legend: {
            labels: {
              boxWidth: 10
            }
          },
          scales: {
            xAxes: [
              {

                // stacked: true,
                ticks: {
                  beginAtZero: true,
                  fontSize: 11,
                  tickColor: "red"
                },
                scaleLabel: {

                  display: true,
                  labelString: xAxisLbl,
                  fontSize: 13,
                  fontColor: "red"
                }
              }
            ],
            yAxes:yAxesArray
          }
        }
      });

      //  me.setState({body: me.state.body})
      //  }
    }




    return (
      // <div >
      <canvas id="barchart1"></canvas>
      // </div>

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