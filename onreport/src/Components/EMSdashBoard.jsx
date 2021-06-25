import React, { Component } from 'react'
import CPagination from "../layout/Pagination";
import SearchInput from "../layout/SearchInput/SearchInput";
import {Table,FormControl} from 'react-bootstrap';
import axios from "axios";
import './Spdashboard.css'
import URL from "../Common/confile/appConfig.json";

class EMSdashBoard extends Component {
  constructor(props){
    super(props);
        this.state      =   {
            'users':[],
            'total_count':0,
            'filter':{
                'search_query':'',
                'page':1,
                'page_size':15,
                // 'page_size':1,
                // 'where':{
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

}
fetch(){
    var items=[];
    this.setState({'in_prog':true});
    // fetch('http://13.127.10.197/getRegisterSP')
    // .then(response => response.json())
    // .then(json =>  {
        var me = this;
        //axios.post(`${URL.IP}/registerED`, {
        //    body: this.state.filter
         //  })

         axios.get('http://localhost:3992/getRegisterED')
           .then(function (result) {
            //  alert(result.data);
            //  console.log(result.data);
            //  console.log(result.data.rows);
            // var users_data  =   result.data;
             // items   =   result.data.rows;
             items = result.data;
              me.setState({'users':items,'in_prog':false});
   }
    ).catch(error =>{
        this.setState({'users':[],'in_prog':false});
    });
}
changePage(page){
    this.state.filter.page  =   page;
    this.setState({"filter":this.state.filter});
    this.fetch();
    }
onDeleteClick(_id){
    var me = this;
    // delete('http://localhost:3992/delRegisterEDbyId?id='+ _id
    // this is Working 
     axios.delete('http://localhost:3992/delRegisterEDbyId?id='+ _id, {
       
      })
       .then(function (response) {
    //     //  alert(response);
      var newuser = me.state.users.filter(
          user => user._id !== _id
         );
        me.setState({users:newuser })
      })
      .catch(function (error) {
          console.log(error);
     });


}

  render() {
    var state   =   this.state;
    var me          =   this;
     
   
    console.log(state.users +"this is data");
    var total_page  =   Math.ceil(this.state.total_count/this.state.filter.page_size);

    var page_start_index    =   ((state.filter.page-1)*state.filter.page_size);

    var     sort_options    =   [
        {
            'name':'Service Provider Name - ascending',
            'value':"name#asc"
        },
        {
            'name':'Service Provider Name  - descending',
            'value':"name#desc"
        },
        {
            'name':' Service Provider Email At - ascending',
            'value':"email#asc"
        },
        {
            'name':'Service Provider Email At - descending',
            'value':"email#desc"
        },
        {
            'name':'Service Provider Code At - ascending',
            'value':"edCd#asc"
        },
        {
            'name':'Service Provider Code At - descending',
            'value':"edCd#desc"
        },

        {
            'name':'job_status At - ascending',
            'value':"job_status#asc"
        },
        {
            'name':'job_status At - descending',
            'value':"job_status#desc"
        },
        {
            'name':'Date_of_joining At - ascending',
            'value':"Date_of_joining#asc"
        },
        {
            'name':'Date_of_joining At - descending',
            'value':"Date_of_joining#desc"
        },
        {
            'name':'services Offered At - ascending',
            'value':"servicesOffered#asc"
        },
        {
            'name':'services Offered At - descending',
            'value':"servicesOffered#desc"
        }
    ];
    var sort_value  =   null;
    var keys    =   Object.keys(state.filter.order);
    if(keys[0] != undefined){
        sort_value  =   keys[0]+"#"+(state.filter.order[keys[0]]==1?"asc":'desc');
    }
    // console.log("this is entered value"+this.state.filter);
  
    return (
      <div className= "container-fluid">
        <div className= 'card mt-4'>
        <div className="row ">
        <div className="col-md-12">
        <label className='ml-3 labelcust'>Employee Details</label>
        
        <button onClick={() =>{ 
             this.props.history.push("/AddEmployedetails");
                }} className="btn btn-md color1 cust-right"><i class="fas fa-plus">Add Employee Details</i></button>
        </div>
        </div>
        <div className="box-body">
            <div className='row'>
                <div className='col-lg-3 col-md-4 col-sm-9'>
                    <div className="form-group">
                <label className="ml-3 font-weight-bold">Sort By</label>
              
                <FormControl className=" mgforForm"  onChange={(event)=>{
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
            &nbsp;
                {/* <input placeholder='Search User' type='search' className='form-control' />
                <button className='form-control btn  btn-primary' > Search </button>  */}
          <SearchInput placeholder={'Search Employees'} value={this.state.filter.search_query} onSubmit={(value)=>{ this.state.filter.page = 1;this.setState({'filter':state.filter});this.fetch();}} onChange={(value)=>{state.filter.search_query = value;this.setState({'filter':state.filter});}}/> 
            </div>
        </div>
    </div>
    </div>

        <div  className="table-responsive">
        <Table  className="table table-hover table-sm table-bordered cust">
        <thead className='bg' style={{background: "gainsboro"}}>
        <tr>
        <th className='text-center clmSl'> SI</th>
        <th className='text-center Spname'>Employee Name</th>
        <th className='text-center edcd'>Employee Code</th>
        <th className='text-center spad'>Address</th>
        <th className='text-center spPhone'>Phone</th>
        <th className='text-center spemail'>Email</th>
        <th className='text-center Date_of_joining'>Date of Joining</th>
        <th className='text-center job_status'> Job Status</th>
        <th className='text-center spAction'>Action</th>
      </tr>
        </thead>
        <tbody>
       { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
       {!state.in_prog && state.users.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
        { !state.in_prog && this.state.users.map( (user,i) => {
              return  <tr key={i}>
              <td className='text-center'>{ page_start_index+i + 1}</td>
              
              <td className=''>{user.name}</td>
              <td className=''>{user.edCd}</td>
              <td className=''>{user.address}</td>
              <td className='text-center'>{user.phone}</td>
              <td className='text-center'>{user.email}</td>
              <td className=''>{user.Date_of_joining}</td>
              <td className=''>{user.job_status}</td>
               <td className=" btn-group">
               <button  onClick={() =>{ 
                      this.props.history.push(`/EditEmployeeDetails/${user._id}/${"View"}`);
                }} 
                 className="btn color1  btn-sm" > View</button>
               <button  onClick={() =>{ 
                      this.props.history.push(`/EditEmployeeDetails/${user._id}/${"Edit"}`);
                }}   className="btn color2  btn-sm" > Edit</button>
               <button  onClick={this.onDeleteClick.bind(this,user._id) } className="btn color3  btn-sm" > Delete</button>
               </td>
              </tr>
       
            })
              }
          
        </tbody>
       { "Pages: " +total_page }
        </Table>
        
        </div>
        <div className='align-right'>
{ total_page > 1 && <CPagination  page={state.filter.page} totalpages={total_page} onPageChange={this.changePage}/>}
        </div>
        </div>

    </div>
    )
  }
}
export default  EMSdashBoard;