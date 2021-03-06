import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Chart } from "chart.js";
import dateFormat from "dateformat";


class Chartcom extends Component {
  constructor(){
    super();
    this.state = {
      body: { myChart: {} }
    };
    // this.formatComment = this.formatComment.bind(this);
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

  commentCallback(tooltipItem, data) {
    const {arrComments} = this.props;
      let index = tooltipItem[ 0 ].index
      let comment = [];
      let tempComment = [];
      if ( arrComments[ index ].length !== 0 ){
          comment.push( "Comment:" )
          var me = this;
          for ( let i = 0 ; i < arrComments[ index ].length ; i++ ){
              if (arrComments[ index ][ i ].deleted === false ){
                  let tempDate = dateFormat(arrComments[ index ][ i ].createdTime, "dd-mmm-yy")
                  tempComment = me.formatComment(  tempDate + ": " + arrComments[ index ][ i ].comment , 50 )
                  comment = comment.concat( tempComment )
              }
          }
      }
      // else {
      //     comment = "No comments"
      // }
      return comment ;
  }
  /* takes a string phrase and breaks it into separate phrases 
   no bigger than 'maxwidth', breaks are made at complete words.*/
  formatComment(str, maxwidth) {
    var sections = [];
    var words = str.split(" ");
    var temp = "";

    words.forEach(function(item, index){
        if(temp.length > 0)
        {
            var concat = temp + ' ' + item;

            if(concat.length > maxwidth){
                sections.push(temp);
                temp = "";
            }
            else{
                if(index == (words.length-1))
                {
                    sections.push(concat);
                    return;
                }
                else{
                    temp = concat;
                    return;
                }
            }
        }

        if(index == (words.length-1))
        {
            sections.push(item);
            return;
        }

        if(item.length < maxwidth) {
            temp = item;
        }
        else {
            sections.push(item);
        }

    });

    return sections;
  }

  render() {
    const { chartOptions, chartAxis, arrData, arrComments, arrLabels, legend, xAxisLbl, yAxisLbl, bgColors, borderColors } = this.props
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
        json["fill"]  = ( chartOptions.areaFill === true ) ? true : false ;
        json["backgroundColor"] = backgroundColor[i];
        // json["backgroundColor"] = false;
        //json["yAxisID"] = (axisY[i])?axisY[i] : '';
        json["yAxisID"] = this.getIdForChart(chartAxis, keysofBsName[i])
        json["borderColor"] = borderColor[i];
        json["pointBorderWidth"] = .1;
        // json["pointBorderColor"]  = this.getRandomBackgroundColor();
        json["fontSize"] = 7;
        json["borderWidth"] = ( chartOptions.areaFill === true ) ? 1.2 : 2 ;
        for (var k = 0; k < arrData.length; k++) {
          json["data"].push(arrData[k][keysofBsName[i]])

        }
        dataArray.push(json)
      }
       console.log("This is chart.js data",dataArray)
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
          },
          gridLines: {
            display: ( chartOptions.displayGridlines === true ) ? true : false 
          }
        })

      }
      console.log("This is Option of chart.js", yAxesArray)
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
            mode: 'index',
            footerFontSize: 10,
            //footerFontColor: "#F00",
            callbacks: {
              // label: function(tooltipItem, data) {
              //     var label = data.datasets[tooltipItem.datasetIndex].label || '';

              //     if (label) {
              //         label += ': ';
              //     }
              //     label += Math.round(tooltipItem.yLabel * 100) / 100;
              //     return label;
              // }
              footer:this.commentCallback.bind(this)
            }
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