import React, { Component } from 'react';
import swal from 'sweetalert';
import axios from "axios";
import "./aggregatorScreen.css"
import { Table, DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import "react-input-range/lib/css/index.css";
import CPagination from "../../layout/Pagination";
import URL from "../../Common/confile/appConfig.json";
import TextInputGroup from '../../layout/TextInputGroup'
class aggregatorScreen extends Component {
  constructor() {
    super();
    this.state = {
      cust_search_query: "",
      subcust_search_query: "",
      assets_search_query: "",
      device_search_query: "",
      sensors_search_query: "",
      channel_search_query: "",
      show: false,

      Menu: {
        spCd: [],
        selectedSpCd: "",
        mainDataInfo: [],
        temDataInfo: [],
        displayDataInfo: [],
        'total_count': 0,
        'page_size': 100,
        'page': 1,
        // search_query:"",
        selectedEntitiesValues: [],
        startTime: "",
        endTime: "",
        selectAllFlag: false,
        error: ""
      }
    }
    this.changePage = this.changePage.bind(this);
  }
  onChange = e => this.setState({ [e.target.name]: e.target.value });
  handleSubmit() {
    var me = this;
    let startTime = moment(me.state.Menu.startTime);
    let endTime = moment(me.state.Menu.endTime);
    console.log("startTime", me.state.Menu.startTime);
    console.log("endTime", me.state.Menu.endTime);
    let totalHours = endTime.diff(startTime, 'hours');
    console.log("totalHours", totalHours);
    if (Math.sign(totalHours) === -1 || totalHours === 0 || totalHours === NaN || me.state.Menu.startTime === "" || me.state.Menu.startTime === null || me.state.Menu.endTime === "" || me.state.Menu.endTime === null) {
      me.state.Menu.error = "Range Is Not Valid";
      me.setState({ Menu: me.state.Menu });
      me.errorganerator();
      return;
    }
    if(me.state.Menu.selectedEntitiesValues.length  === 0){
      me.state.Menu.error = "Please Select Devices To Process";
      me.setState({ Menu: me.state.Menu });
      me.errorganerator();
      return;
    }
    me.apiForAggregator()



  }
  apiForAggregator(){
    let me  = this;
    axios.post(`${URL.IP}:3992/apiAggregator`, {startRenge: moment(me.state.Menu.startTime).toISOString(),
      endRenge: moment(me.state.Menu.endTime).toISOString(),macArray:me.state.Menu.selectedEntitiesValues })
    .then(json => {
      // if(json["data"] == "success"){

      //   swal("Success!", "You Send Action!", "success");ActivesaveForManualOver
      // 
      //alert("result")
      console.log("Server Info",json)
    });
  }
  handleClose() {
    this.setState({ show: false });
  }
  async changePage(page) {
    let me = this;
    me.state.Menu.page = page;
    // me.state.Menu.temDataInfo = await this.paginate(me.state.Menu.mainDataInfo);
    me.searchFilter();
    me.setState({ Menu: me.state.Menu });
  }
  paginate(array) {
    let me = this;
    let newPage = me.state.Menu.page;
    --newPage; // because pages logically start with 1, but technically with 0
    return array.slice(newPage * me.state.Menu.page_size, (newPage + 1) * me.state.Menu.page_size);
  }
  async searchFilter() {
    let me = this;
    try {
      me.state.Menu.selectAllFlag = false;
      me.state.Menu.temDataInfo = me.state.Menu.mainDataInfo.map(item => item);
      // console.log(this.state.device_search_query);
      me.state.Menu.temDataInfo = me.state.Menu.temDataInfo.filter(element => {
        return element.spCd.toLowerCase().indexOf(me.state.Menu.selectedSpCd.toLowerCase()) !== -1;
      });

      me.state.Menu.temDataInfo = me.state.Menu.temDataInfo.filter(element => {
        return element.CustomerName.toLowerCase().indexOf(me.state.cust_search_query.toLowerCase()) !== -1;
      });

      me.state.Menu.temDataInfo = me.state.Menu.temDataInfo.filter(element => {
        return element.SubCustomerName.toLowerCase().indexOf(me.state.subcust_search_query.toLowerCase()) !== -1;
      });
      me.state.Menu.temDataInfo = me.state.Menu.temDataInfo.filter(element => {
        return element.AssetName.toLowerCase().indexOf(me.state.assets_search_query.toLowerCase()) !== -1;
      });

      me.state.Menu.temDataInfo = me.state.Menu.temDataInfo.filter(element => {
        let output = this.getOpAndOperand(me.state.sensors_search_query);
        if (output.operand !== '') {
          return eval(element.sensorsLength + " " + output.op + " " + output.operand);
        } else {
          return true;
        }
      });
      me.state.Menu.temDataInfo = me.state.Menu.temDataInfo.filter(element => {
        let output = this.getOpAndOperand(me.state.channel_search_query);
        if (output.operand !== '') {
          return eval(element.channelLength + " " + output.op + " " + output.operand);
        } else {
          return true;
        }
      });
      me.state.Menu.total_count = me.state.Menu.temDataInfo.length;
      me.state.Menu.displayDataInfo = await this.paginate(me.state.Menu.temDataInfo);
      me.setState({ Menu: me.state.Menu })
    }
    catch (err) {
      me.state.Menu.error = "Not Valid Expression For Filter";
      me.setState({ Menu: me.state.Menu });
      me.errorganerator();
    }

  }
  getOpAndOperand(data) {
    let Operators = [">", "<", "="];
    let output = data.split("");
    let op = ''
    let operand = '';
    for (let i = 0; i < output.length; i++) {
      if (Operators.includes(output[i])) {
        op += output[i]
      }
    }
    if (op.length > 0) {

      for (let k = op.length; k < output.length; k++) {
        operand += output[k];
      }
    } else {
      op += "==";
      for (let k = 0; k < output.length; k++) {
        operand += output[k];
      }
    }
    return { op, operand }
  }
  errorganerator() {
    swal("Oops", this.state.Menu.error, "error")
  }
  // //THIS IS COMMON METHOD FOR INPUT FIELD FOR SETTING STATE
  //ON PAGE LOAD DATA FETCH FROM SERVER FOR ALL SERVICE PROVIDER
  componentDidMount() {
let me = this;
    let data = JSON.parse(sessionStorage.getItem("userDetails"));
  if(data[0].userType !== "Admin"){me.state.Menu.error = "You Are Not Admin";me.setState({Menu: me.state.Menu}); me.errorganerator();me.props.history.push("/NevMenu")}
 
    
    fetch(`${URL.IP}:3992/getRegisterSP`)
      .then(response => response.json())
      .then(json => {

        let spCd = json.map(x => { return x.spCd });
        spCd.unshift("ALL")
        this.state.Menu.spCd = spCd;
        this.setState({ Menu: this.state.Menu });
      }
      );
    axios.post(`${URL.IP}:3992/adminAggregator`, {})
      .then(async (json) => {
        console.log(json);
        json["data"].map(item => item["flag"] = false);
        this.state.Menu.mainDataInfo = json["data"];
        // this.state.Menu.temDataInfo = await this.paginate(json["data"]);
        // this.state.Menu.total_count = json["data"].length;
        this.setState({ Menu: this.state.Menu });
        this.searchFilter();
      });
  }
  customerCall(e) {
    let me = this;
    me.state.Menu[e.target.name] = e.target.value;

    me.setState({ Menu: me.state.Menu })
  }

  //This For handler for Service Provider
  handleSp = (value) => {
    var me = this;
    if (value !== "ALL") {
      // me.state.Menu.search_query = value;
      me.state.Menu.selectedSpCd = value;
    } else {
      // me.state.Menu.search_query = "";
      me.state.Menu.selectedSpCd = "";
    }


    me.setState({ Menu: me.state.Menu });
    me.searchFilter();
  }
  async selectAll(value) {
    let me = this;
    me.state.Menu.selectAllFlag = !me.state.Menu.selectAllFlag;
    console.log(me.state.Menu.selectedEntitiesValues);
    if (me.state.Menu.selectAllFlag == true) {
      me.state.Menu.selectedEntitiesValues = me.state.Menu.temDataInfo.map(item => { return item.mac });
      me.state.Menu.temDataInfo.map(item => item["flag"] = true);
      // me.state.Menu.temDataInfo = await me.paginate(me.state.Menu.mainDataInfo);
    }
    else {
      me.state.Menu.selectedEntitiesValues = []
      me.state.Menu.temDataInfo.map(item => item.flag = false);
      // me.state.Menu.temDataInfo = await me.paginate(me.state.Menu.mainDataInfo);

    }
    me.setState({ Menu: me.state.Menu })
  }
  selectItem(value) {
    let me = this;
    let Menu = me.state.Menu
    console.log(value);
    let index = Menu.temDataInfo.findIndex(item => item.mac === value);
    console.log(index);
    if (Menu.selectedEntitiesValues.filter(item => item == value).length == 0) {
      Menu.temDataInfo[index].flag = !Menu.temDataInfo[index].flag;

      Menu.selectedEntitiesValues.push(value);
    } else {
      Menu.temDataInfo[index].flag = !Menu.temDataInfo[index].flag;

      Menu.selectedEntitiesValues.splice(Menu.selectedEntitiesValues.findIndex(item => item == value), 1);
    }
    console.log(Menu.selectedEntitiesValues)
    me.setState({ Menu: Menu })
  }

  render() {
    const { Menu } = this.state;
    let total_page = Math.ceil(Menu.total_count / Menu.page_size);
    let page_start_index = ((Menu.page - 1) * Menu.page_size);
    return (
      <div className=" container">

        <div className="row">
          <div className="card2">
            <div className=" divbac ">
              {/* <form onSubmit={this.onSubmit} > */}
              <div className="row">
                <form onSubmit={(e) => { e.preventDefault(); Menu.page = 1; this.setState({ Menu: Menu }); this.searchFilter() }}>
                <div className="col-sm-2 col-md-2">
                  <label></label>
                  <div className="">
                    <DropdownButton className="" id="dromp1"
                      onSelect={this.handleSp}
                      // bsStyle={""}
                      title={Menu.selectedSpCd || "SERVICE PROVIDER"}>
                      {Menu.spCd.map((item) =>
                        <MenuItem key={item} eventKey={item}>{item}</MenuItem>
                      )}
                    </DropdownButton>
                  </div>
                </div>
                <div className="col-sm-2">
                  {/* <label className="text-center">SERVICE PROVIDER</label> */}
                  <TextInputGroup
                    label=""
                    name_input_class=""
                    value={this.state.cust_search_query}
                    name="cust_search_query"
                    id="customer"
                    type="text"
                    placeholder="CUSTOMER"
                    disabledvalue={false}
                    name_error={""}
                    onChange={this.onChange}
                  />
                </div>
                <div className="col-sm-2">
                  <TextInputGroup
                    label=""
                    name_input_class=""
                    value={this.state.subcust_search_query}
                    name="subcust_search_query"
                    id="SUB-CUSTOMER"
                    type="text"
                    placeholder="SUB CUSTOMER"
                    disabledvalue={false}
                    name_error={""}
                    onChange={this.onChange}
                  />
                </div>
                <div className="col-sm-2">
                  <TextInputGroup
                    label=""
                    name_input_class=""
                    value={this.state.assets_search_query}
                    name="assets_search_query"
                    id="ASSETS"
                    type="text"
                    placeholder="ASSETS"
                    disabledvalue={false}
                    name_error={""}
                    onChange={this.onChange}
                  />
                </div>
                <div className="col-sm-2">
                  <TextInputGroup
                    label=""
                    name_input_class=""
                    value={this.state.sensors_search_query}
                    name="sensors_search_query"
                    id="sensors_search_query"
                    type="text"
                    placeholder="SENSOR"
                    disabledvalue={false}
                    name_error={""}
                    onChange={this.onChange}
                  />
                </div>
                <div className="col-sm-2">
                  <label></label>
                  <div class="input-group">
                    <input type="text" class="form-control"
                      value={this.state.channel_search_query}
                      name="channel_search_query"
                      id="channel_search_query"
                      placeholder="CHANNEL"
                      onChange={this.onChange}
                    />
                    <div class="input-group-btn">
                      <button class="btn btn-primary" type="submit" >
                        <i class="glyphicon glyphicon-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                </form>
              </div>
              <div className="table-responsive">
                <Table className="table table-hover table-sm table-bordered ">
                  <thead className='bg' style={{ background: "gainsboro" }}>
                    <tr>
                      <th className='text-center '>SI</th>
                      <th className='text-center '>SERVICE PROVIDER</th>
                      <th className='text-center '>CUSTOMER</th>
                      <th className='text-center '>SUB CUSTOMER</th>
                      <th className='text-center '>ASSETS</th>
                      <th className='text-center '>DEVICE NAME</th>
                      <th className='text-center '>MAC</th>
                      <th className='text-center '>SENSOR</th>
                      <th className='text-center '>CHANNEL</th>
                      <th className='text-center '>SELECT ALL <input type="checkbox" name="Header" onClick={this.selectAll.bind(this)}
                        checked={this.state.Menu.selectAllFlag} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
                  {!state.in_prog && state.DataArray.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>} */}
                    {Menu.displayDataInfo.map((user, i) => {
                      return (<tr key={i}>
                        <td className='text-center'>{page_start_index + i + 1}</td>
                        <td className='text-center'>{user.ServiceName}</td>
                        <td className='text-center'>{user.CustomerName}</td>
                        <td className='text-center'>{user.SubCustomerName}</td>
                        <td className='text-center'>{user.AssetName}</td>
                        <td className='text-center'>{user.DeviceName}</td>
                        <td className='text-center'>{user.mac}</td>
                        <td className='text-center'>{user.sensorsLength}</td>
                        <td className='text-center'>{user.channelLength}</td>
                        <td className='text-center '><input type="checkbox" name="Bsname" onClick={this.selectItem.bind(this, user.mac)}
                          checked={user.flag} /></td>
                      </tr>
                      )
                    })
                    }
                  </tbody>
                  <tr>
                  <td colspan = {10}>
                  {"Pages: " + total_page}
                 </td>
                 </tr>
                </Table>
                <div>
                  <div className="col-sm-4">
                    <div className='align-left'>
                      {total_page > 1 && <CPagination page={Menu.page} totalpages={total_page} onPageChange={this.changePage} />}
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className='align-center'>
                      <button className=" btn  btn-success" onClick={(e) => { this.setState({ show: true }) }}>Action</button>
                    </div>
                  </div>
                  <div className="col-sm-4">

                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
        <Modal show={this.state.show} onHide={this.handleClose.bind(this)}
          dialogClassName=""
          aria-labelledby="example-custom-modal-styling-title">
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title" ></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="pad-2">
                <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
                  <label>START RANGE :</label>
                </div>
                <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9">
                  <DatePicker id="startRenge"
                    selected={Menu.startTime}
                    onChange={e => {
                      Menu.startTime = e
                      this.setState({ Menu: Menu })
                    }}
                    showTimeSelect
                    showMonthDropdown
                    showYearDropdown
                    selectsStart
                    startDate={Menu.startTime}
                    endDate={Menu.endTime}
                   timeFormat="HH"
                    timeIntervals={60}
                    dateFormat="MMMM DD, YYYY HH:mm"
                    // dateFormat="LLL"

                    // className={className12["ON" + item + "Classerror"]}
                    placeholderText="Please Select Start Date"
                  />
                </div>
              </div>
              <div className="pad-2">
                <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
                  <label>END RANGE :</label>
                </div>
                <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9">
                  <DatePicker id="endRenge"
                    selected={Menu.endTime}
                    onChange={e => {
                      Menu.endTime = e;
                      this.setState({ Menu: Menu })
                    }}
                    showTimeSelect
                    showMonthDropdown
                    showYearDropdown
                   
                    selectsEnd
                    startDate={Menu.startTime}
                    endDate={Menu.endTime}
                    timeFormat="HH"
                    dateFormat="MMMM DD, YYYY HH:mm"

                  
                    timeIntervals={60}
                    // className={className12["ON" + item + "Classerror"]}
                    placeholderText="Please Select Start Date"
                  />
                </div>
              </div>
              <div className="pad-2">
                <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
                  <label>No Devices selected :</label>
                </div>
                <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9">
                  <label>{this.state.Menu.selectedEntitiesValues.length}</label>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-sm " onClick={this.handleClose.bind(this)}>Cancel</button>
            <button className="btn btn-sm btn-success" onClick={this.handleSubmit.bind(this)} >Submit</button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default aggregatorScreen;

