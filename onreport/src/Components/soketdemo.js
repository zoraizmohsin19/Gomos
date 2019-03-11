import React, { Component } from "react";
import socketIOClient from "socket.io-client";
class soketdemo extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: "http://localhost:4001",
      text1: '',
      socket:'',
      appendchild: null,
      chat: [],
    };
  }
  componentDidMount() {
      console.log("Hello Takreem");
      var data1 ='';
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data =>{
    console.log(data);
    this.setState({ response: data , socket: socket});
    data1 = data
    console.log(data);
});


socket.on('new message', (data)=> {
      console.log(data.msg + "values");
      if(data !=0){
      
           this.state.chat.push(data.msg);
         
      // this.setState(prevState  =>({chat: [...prevState.chat , array ]}))
      this.setState({chat: this.state.chat })
      }
  })


console.log("this is soket data: ["+ data1 +"]"); 
   
  }
   onChange = e => this.setState({ [e.target.name]: e.target.value });
  onSubmit(e){
      e.preventDefault();
      console.log(this.state.text1);
      this.state.socket.emit('send message', this.state.text1);
      this.setState({text1: ''})
      this.newfuction();

  }
  newfuction(){
      
    

  }
 
  render() {
      

    //   console.log(response);

    const { response } = this.state;
    return (
    <div>
      <div style={{ textAlign: "center" }}>
        {response
          ? <p>
              The temperature in Florence is: {response} °F
            </p>
          : <p>Loading...</p>}
      </div>
    <div>
    {this.state.chat.map((data) => <div className="card-body">{data}</div> )}
    {/* <div className="card-body">{this.state.chat}</div> */}
<form onSubmit={this.onSubmit.bind(this)}>
 <input type="text"  name= "text1"  onChange={this.onChange}  value= {this.state.text1}/>
 <input type ="submit" name = "submit" value="submit"/>    
</form>
    </div>
    </div>
    );
  }
}
export default soketdemo;