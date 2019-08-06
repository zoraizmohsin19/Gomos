import React, { Component } from 'react'
import CPagination from "../layout/Pagination";
import SearchInput from "../layout/SearchInput/SearchInput";
import {Table,FormControl} from 'react-bootstrap';
import axios from "axios";
import SelectionInput from '../layout/SelectionInput';
import './Spdashboard.css'
import URL from "../Common/confile/appConfig.json";
class CustdashBoard extends Component {
  constructor(props){
    super(props);
        this.state      =   {
            'users':[],
            ArrayOfSPs: [],
            spCd: [],
            'total_count':0,
            'filter':{
                'search_query':'',
                'page':1,
                'page_size':15,
                'spCddata':[],
                // 'where' :{
                //     'spCd':'',
                // },
                // 'page_size':1,
                // 'where':{
                //     spCd : {
                //         $in : [1,2],
                //     }
                // },
                //     'name':{
                //         '$in':[1,2]
                //     }
                // },
                'order':{
                    'name':1
                }
            },
            'in_prog':false
        };
        // this.onDeleteClick= this.onDeleteClick.bind(this);
        this.fetch  =   this.fetch.bind(this);
    this.changePage     =   this.changePage.bind(this);
  }
  //ON PAGE LOAD DATA FETCH FROM SERVER FOR ALL SERVICE PROVIDER
componentDidMount() {
  this.fetch();

  fetch(`${URL.IP}:3992/getRegisterSP`)
  .then(response => response.json())
  .then(json =>  {
  var spCd =  json.map( x =>  { return  x.spCd  });
  this.setState({ArrayOfSPs : spCd});
  spCd.push("ALL");
  this.setState({spCd : spCd});
  

 }
  );

}
fetch(){
    var items=[];
    this.setState({'in_prog':true});
    // fetch('http://18.203.28.35:3992/getRegisterSP')
    // .then(response => response.json())
    // .then(json =>  {
        var me = this;
        axios.post(`${URL.IP}:3992/getCustomerData`, {
            body: this.state.filter
           })
           .then(function (result) {
            //  alert(result.data);
            //  console.log(result.data);
            //  console.log(result.data.rows);
             var users_data  =   result.data;
              items   =   result.data.rows;
              me.setState({'users':items,'total_count':users_data.count,'in_prog':false});
   }
    ).catch(error=>{
        this.setState({'users':[],'in_prog':false});
    });

   
}
changePage(page){
    this.state.filter.page  =   page;
    this.setState({"filter":this.state.filter});
    this.fetch();
    }
onDeleteClick(_id){
    // var me = this;
    // // delete('http://18.203.28.35:3992/delRegisterSPbyId?id='+ _id
    // axios.delete('http://18.203.28.35:3992/delRegisterSPbyId?id='+ _id, {
       
    //    })
    //    .then(function (response) {
    //     //  alert(response);
    //     var newuser = me.state.users.filter(
    //         user => user._id !== _id
    //        );
    //        me.setState({users:newuser })
    //    })
    //    .catch(function (error) {
    //      console.log(error);
    //    });
console.log("this is id"+_id)

}
 //This For handler for Service Provider
 handleSp = (e) => {
    // alert(e.target.value);
    if(e.target.value == "ALL"){
        this.state.filter.spCddata = this.state.ArrayOfSPs;
      //  alert( this.state.filter.spCddata+"Hello ");
        this.setState({'filter' :this.state.filter });
        this.fetch();
       
    }
    else{
        var array = [e.target.value];
        this.state.filter.spCddata = array;
        this.setState({ 'filter' :this.state.filter });
        this.fetch();
    }
   
  
   
    }

  render() {
    var state   =   this.state;
    var me          =   this;
     
    // console.log(this.state.users );
    console.log(state.users +"this is data");
    var total_page  =   Math.ceil(this.state.total_count/this.state.filter.page_size);
    // console.log(total_page);
    var page_start_index    =   ((state.filter.page-1)*state.filter.page_size);

    var     sort_options    =   [
        {
            'name':'Customer Name - ascending',
            'value':"name#asc"
        },
        {
            'name':'Customer Name  - descending',
            'value':"name#desc"
        },
        {
            'name':' Email At - ascending',
            'value':"email#asc"
        },
        {
            'name':'Email At - descending',
            'value':"email#desc"
        },
        {
            'name':'Customer Code At - ascending',
            'value':"custCd#asc"
        },
        {
            'name':'Customer Code At - descending',
            'value':"custCd#desc"
        },
        {
            'name':'Service Provider Code At - ascending',
            'value':"spCd#asc"
        },
        {
            'name':'Service Provider Code At - descending',
            'value':"spCd#desc"
        },

        {
            'name':'MQTT Client At - ascending',
            'value':"mqttClient#asc"
        },
        {
            'name':'MQTT Client At - descending',
            'value':"mqttClient#desc"
        },
       
    ];
    var sort_value  =   null;
    var keys    =   Object.keys(state.filter.order);
    if(keys[0] !== undefined){
        sort_value  =   keys[0]+"#"+(state.filter.order[keys[0]]===1?"asc":'desc');
    }
   // console.log("this is entered value"+this.state.filter);
  
    return (
      <div className="container-fluid">
        <div className= 'card mt-4'>
        <div className="row ">
        <div className="col-md-12">
        <label className='ml-3 labelcust'>Customers Dashboard</label>
        
        <button onClick={() =>{ 
             this.props.history.push("/addCustomer");
                }} className="btn btn-md color1 cust-right"><i class="fas fa-plus"></i> Customer</button>
        </div>
        </div>
        <div className="row">
        <div className="col-lg-3 col-md-4 col-sm-6 col-12 mtop-1">
        <SelectionInput
        label="SERVICE PROVIDER :"
        namefor="SERVICE PROVIDER :"
        names = {this.state.spCd}
        defaultDisabled = {null}
        Change = {this.handleSp}
        
        />
        </div>
        <div className='col-lg-9'>
        </div>
        </div>
        <div className="box-body">
            <div className='row'>
                <div className='col-lg-3 col-md-4 col-sm-9'>
                    <div className="form-group">
                <label className="ml-3 font-weight-bold">Sort By</label>
              
                <FormControl className="mgforForm"  onChange={(event)=>{
                                                        var value   =   event.target.value;
                                                        var value_split     =   value.split("#");
                                                        state.filter.order  =  {};
                                                        state.filter.order[value_split[0]] = value_split[1]=="asc"?1:-1;
                                                        this.setState({'fiter':state.filter});
                                                        setTimeout(function(){me.fetch()});
                                                    }
                                                } value={sort_value} componentClass="select" tabIndex={5}>
                                            { 
                                                sort_options.map((option,i)=>{
                                                    return <option value={option.value} key={i}>{option.name}</option>
                                                })
                                            }
                                            
                 </FormControl>
            </div>
        </div>
        <div className='col-lg-6 col-md-4 col-sm-hidden '></div>
        <div className='col-lg-3 col-md-4 d.sm-none d.none'>
            <div className="form-group form-inline">
                <label>&nbsp;</label>
                {/* <input placeholder='Search User' type='search' className='form-control' />
                <button className='form-control btn  btn-primary' > Search </button>  */}
          <SearchInput placeholder={'Search Customer'} value={this.state.filter.search_query} onSubmit={(value)=>{ this.state.filter.page = 1;this.setState({'filter':state.filter});this.fetch();}} onChange={(value)=>{state.filter.search_query = value;this.setState({'filter':state.filter});}}/> 
            </div>
        </div>
    </div>
    </div>
    <div className="row">
        <div className="col-lg-12">
        <div  className="table-responsive">
        <Table  className="table table-hover table-sm table-bordered cust">
        <thead className='bg' style={{background: "gainsboro"}}>
        <tr>
        <th className='text-center clmSl'> SI</th>
        <th className='text-center '>Customer Name</th>
        <th className='text-center '> Customer Code</th>
        <th className='text-center '> Service Provider Code</th>
        <th className='text-center '> Address</th>
        <th className='text-center '>Phone</th>
        <th className='text-center '>Email</th>
        <th className='text-center '>MQTT Client</th>
        <th className='text-center '>Description</th>
        <th className='text-center '>Topic</th>
        <th className='text-center '>Status</th>
        <th className='text-center custAction '>Action</th>
      </tr>
        </thead>
        <tbody>
        { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
      { !state.in_prog && state.users.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
        { !state.in_prog && this.state.users.map( (user,i) => {
              return  <tr key={i}>
              <td className='text-center'>{ page_start_index+i + 1}</td>
              
              <td className=''>{user.name}</td>
              <td className=''>{user.custCd}</td>
              <td className=''>{user.spCd}</td>
              <td className=''>{user.address}</td>
              <td className='text-center'>{user.phone}</td>
              <td className='text-center'>{user.email}</td>
              <td className=''>{user.mqttClient}</td>
              <td className=''>{user.description}</td>
              <td className='text-cente'>{user.topics.topic1}</td>
              <td className='text-cente'>{user.active}</td>
               <td className="btn-group">
               <button  onClick={() =>{ 
                      this.props.history.push(`/EditServiceProvider/${user._id}/${user.name}`);
                }} 
                 className="btn color1  btn-sm" > View</button>
               <button  onClick={() =>{ 
                      this.props.history.push(`/EditServiceProvider/${user._id}/${undefined}`);
                }}   className="btn color2  btn-sm" > Edit</button>
               <button  onClick={this.onDeleteClick.bind(this,user._id) } className="btn color3  btn-sm" > Delete</button>
               </td>
              </tr>
       
            })
              }
          
        </tbody>
       { total_page }
        </Table>
        
        </div>
        <div className='align-right'>
{ total_page > 1 && <CPagination  page={state.filter.page} totalpages={total_page} onPageChange={this.changePage}/>}
        </div>
        </div>
        </div>
        </div>

    </div>
    )
  }
}
export default  CustdashBoard;