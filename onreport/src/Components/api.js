import axios from 'axios';


export const ServiceProvider = ()=>{
    var arra =[];
    fetch('http://18.203.28.35:3300/getRegisterSP')
    .then(response => response.json())
    .then(json =>  {
    var spCd =  json.map( x =>  { return  x.spCd  });
    this.setState({ArrayOfSPs : spCd});
    spCd.push("ALL");
    arra = spCd;
    this.setState({spCd : spCd});
    }
    );
    return arra;
}