import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import axios from "axios";
import URL from "../../../Common/confile/appConfig.json";
class Comment extends Component {
  constructor() {
    super();
    this.state = {
      submitBtn: false,
      commentFlagArr:[],
      CommentInfo:{},
      SaveCommentInfo:{},
      newComment:  {
        "deleted": false,
        "user": "system",
        "comment": "",
        "createdTime":new Date().toISOString(),
        "updatedTime": new Date().toISOString()
    },
    }
  }
    handleClose(){
        this.state.newComment.comment = "";
        this.setState({newComment:this.state.newComment})
        this.props.CommentInfo.show = !this.props.CommentInfo.show
        this.props.CommentStateUpdate(this.props.CommentInfo)
    }
    componentWillMount(){
     // console.log("This is called componentWillMount",this.props)
      let tempData = JSON.parse(sessionStorage.getItem("userDetails"))
    
      var me = this;
    
      me.state.newComment.user =  tempData[0].userId
      let obj =[]
      this.setState({CommentInfo: JSON.parse(JSON.stringify(me.props.CommentInfo)), SaveCommentInfo:JSON.parse(JSON.stringify(me.props.CommentInfo))});
      if( this.props.CommentInfo != undefined && this.props.CommentInfo.comment != undefined && this.props.CommentInfo.comment.length > 0){
        this.props.CommentInfo.comment.map( (item , i) =>{
      obj.push({editFlag: false});
      })
      
      me.setState({commentFlagArr: obj , newComment : me.state.newComment,CommentInfo: JSON.parse(JSON.stringify(me.props.CommentInfo))});
    }
    }
    componentWillReceiveProps(newProps){
      // let tempData = JSON.parse(sessionStorage.getItem("userDetails"))
    
       var me = this;
      // console.log("tempData", tempData)
      // me.state.newComment.user =  tempData[0].userId
      let obj =[]
      this.setState({CommentInfo: JSON.parse(JSON.stringify(newProps.CommentInfo)), SaveCommentInfo:JSON.parse(JSON.stringify(newProps.CommentInfo))});
      if(newProps.CommentInfo != undefined && newProps.CommentInfo.comment != undefined && newProps.CommentInfo.comment.length > 0){
        newProps.CommentInfo.comment.map( (item , i) =>{
      obj.push({editFlag: false});
      })
      
 
      me.setState({commentFlagArr: obj , CommentInfo: JSON.parse(JSON.stringify(newProps.CommentInfo))});
    }
    }
    // componentWillReceiveProps(newProps){
    //   console.log("This is called componentWillReceiveProps", newProps)

    // }
   onUpdate(value){
     var me = this;
     me.state.CommentInfo.comment = value;
     me.props.CommentStateUpdate(me.props.CommentInfo)
   }
   cancelComment(index){
var me  = this;
    me.state.CommentInfo.comment[index] = me.state.SaveCommentInfo.comment[index];
    
    me.setState({CommentInfo:me.state.CommentInfo })

    me.onEditClose(index);
   }
   onDelete(index){
     var me = this;
    me.state.CommentInfo.comment.splice(index, 1);
    this.onSubmit()

   }
   getLatestComment(){
    var me = this;
    if(me.state.CommentInfo.factId !== undefined){

    
    axios.get(`${URL.IP}:3992/comment/byfactId?factId=`+me.state.CommentInfo.factId)
    .then(json => {
    //  console.log("This is json Called", json)
       let comment = json["data"][0].data;
       let _id = json["data"][0]._id;
       let createdTime = json["data"][0].createdTime;
       let updatedTime = json["data"][0].updatedTime;
       let factId  = json["data"][0].factId;
       let obj = [];
       comment.map( (item , i) =>{
        obj.push({editFlag: false});
        })
       me.state.CommentInfo.comment =  comment;
        me.setState({commentFlagArr: obj,CommentInfo:  me.state.CommentInfo, SaveCommentInfo:JSON.parse(JSON.stringify(comment))});
      //  console.log("This is comment", comment);
      //  console.log("This is CommentInfo", me.state.CommentInfo)
       if(comment !== undefined){
        me.props.CommentUpdateRowTable(factId ,comment,_id,createdTime,updatedTime);
          // this.onUpdate(comment)  
     //  this.onUpdate(comment)
       }
    })
    .catch(error => {
      console.log("This is json error", error)

    })
  }
   }
   onSubmit(){
     let me = this;
     let commentArray = [];
    //  console.log("This is props ", me.state.CommentInfo)
     commentArray =  JSON.parse(JSON.stringify(me.state.CommentInfo.comment));
     if(me.state.newComment.comment.length > 0){
      let data = JSON.parse(JSON.stringify(me.state.newComment));
      commentArray.push(data)
    }
    // console.log("This is called", commentArray)
     
      if(me.state.CommentInfo._id == undefined){
      
        let tempData ={
          factId: me.state.CommentInfo.factId,
          DeviceName:  me.state.CommentInfo.DeviceName,
          DeviceTime:  new Date(me.state.CommentInfo.DeviceTime).toISOString(),
          data:  commentArray,
          createdTime: me.state.CommentInfo.createdTime,
          updatedTime: me.state.CommentInfo.updatedTime,
        }
      //  console.log("This is comment Data For BackEnd", tempData)
        me.setState({submitBtn: true})
        axios.post(`${URL.IP}:3992/comment/save`, tempData)
        .then(json => {
          me.state.newComment.comment = "";
         me.setState({newComment: me.state.newComment});
     //   console.log("This is json", json);
        me.setState({submitBtn: false});
        // this.handleClose()
        // this.props.startProcess();
        this.getLatestComment();
        })
        .catch(error => {
          me.setState({submitBtn: false})
    console.log("This is error for comment",error)
  
        })       

      }else{
        let tempData ={
          _id: me.state.CommentInfo._id,
          factId: me.state.CommentInfo.factId,
          DeviceName:  me.state.CommentInfo.DeviceName,
          DeviceTime:  new Date(me.state.CommentInfo.DeviceTime).toISOString(),
          data:  commentArray,
          createdTime: me.state.CommentInfo.createdTime,
          updatedTime: me.state.CommentInfo.updatedTime,
        }
      //  console.log("This is comment Data For BackEnd", tempData)
        me.setState({submitBtn: true})
        axios.post(`${URL.IP}:3992/comment/update`, tempData)
        .then(json => {
          me.state.newComment.comment = "";
         me.setState({newComment: me.state.newComment});
        console.log("This is json", json);
        me.setState({submitBtn: false});
        this.getLatestComment()
        })
        .catch(error => {
          me.setState({submitBtn: false})
    console.log("This is error for comment",error)
  
        })       
      }
   
     console.log("this is commentArray",commentArray)
   }
   onEdit(index){
    const {commentFlagArr} = this.state;
    commentFlagArr[index].editFlag = true;
    this.setState({commentFlagArr: commentFlagArr})
   }
   onEditClose(index){
    const {commentFlagArr} = this.state;
    commentFlagArr[index].editFlag = false;
    this.setState({commentFlagArr: commentFlagArr})
   }
    render() {
      const {commentFlagArr} = this.state;
      // console.log("commentState", this.state)
      //   console.log( "this is commentFlagArr Info",commentFlagArr);
       
        if(this.props.CommentInfo !== undefined){
        let  disableCommentTran = (this.props.nevInfo == "Normal")? true: false;
        // console.log("This is disableCommentTran",disableCommentTran)
        // console.log("this.props.nevInfo", this.props.nevInfo)
        return (
            <div>
               <Modal show={this.props.CommentInfo.show} onHide={this.handleClose.bind(this)}
          dialogClassName=""
          aria-labelledby="example-custom-modal-styling-title">
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title" ></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row" >
                <div className="col-sm-12 col-xs-12">
                <div className ="outerContainer">
                 {(this.state.CommentInfo.comment != undefined) && (this.state.CommentInfo.comment.length > 0) && this.state.CommentInfo.comment.map((item , i )=> {
                  return <div className ="outerareaOfComment" key ={i}>
                   {item.DeviceTime != undefined ?<b>DeviceTime : {moment(item.DeviceTime).format("DD-MMM-YY HH:mm:ss")}</b>: "" }
                 {disableCommentTran?  <span style={{float:"right"}}>{ commentFlagArr[i].editFlag != undefined && ( commentFlagArr[i].editFlag )? <span><a className="fontSize16  saveComment"  onClick={()=> {this.onEditClose(i);this.onSubmit()}} > <i class="far fa-save"> </i></a><a className= "fontSize16 cancelcomment " onClick ={()=> {this.cancelComment(i)}}> <i class="fas fa-times"></i></a></span>: <a  className= "fontSize16  commentPencel" onClick={()=> { this.onEdit(i)}} > <i class="fas fa-pencil-alt"></i></a> }&nbsp; <a className= "fontSize16 commentCross" onClick ={()=> {this.onDelete(i)}} ><i class="fas fa-trash-alt"></i></a></span>: null}
                     <div>
                    { commentFlagArr[i].editFlag != undefined && ( commentFlagArr[i].editFlag )? <div> <textarea class="form-control" onChange ={(e)=>{ 
                       this.state.CommentInfo.comment[i].comment = e.target.value;
                       this.setState({CommentInfo:  this.state.CommentInfo})
                      }} value= {item.comment}  rows="5" id="comment"></textarea>
                      </div> : <div className="commentBox"><p>{item.comment}</p></div> }
                      </div>
                      <div className="col-sm-6 col-xs-6"><span style= {{float:"left"}}><i>{item.user}</i> </span></div>
                      <div className="col-sm-6 col-xs-6"><span style= {{float:"right"}}><i>{moment(item.createdTime).format("DD-MMM-YY HH:mm")}</i> </span></div>
                      </div>
                 })}
                </div>
                </div>
            
            </div>
          </Modal.Body>
          <Modal.Footer>
        {disableCommentTran? <div>  <textarea class="form-control" onChange={(e)=> { this.state.newComment.comment = e.target.value; 
          this.setState({newComment : this.state.newComment})}} value= {this.state.newComment.comment} rows="2" id="comment"></textarea>
           <br/> 
            <button className="btn btn-sm " onClick={ () =>{ 
             
               this.handleClose()}}>Cancel</button>
            <button className="btn btn-sm btn-success" disabled ={this.state.submitBtn} onClick={() =>{this.onSubmit()}} >Save</button></div>: null
        }
          </Modal.Footer>
        </Modal>
            </div>
        );
        }else{
            return null
        }
    }
}

export default Comment;