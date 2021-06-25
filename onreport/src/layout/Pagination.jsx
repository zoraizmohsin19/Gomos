import React from 'react';
// import {connect} from 'react-redux';
// import { withRouter } from 'react-router';
import {Pagination} from 'react-bootstrap';



class CPagination extends React.Component {
    constructor(props){
        super(props);
        this.pageChange         =       this.pageChange.bind(this);
  
        this.firstPage          =       this.firstPage.bind(this);
        this.previousPage       =       this.previousPage.bind(this);
  
        this.nextPage           =       this.nextPage.bind(this);
        this.lastPage           =       this.lastPage.bind(this);
      }
  
      pageChange(event){
        var page = parseInt(event.target.innerHTML);
        if(page != this.props.total_page){
          this.props.onPageChange(page);
        }
      }
  
      // handler for 'first' button
      firstPage(event) {
        if (this.props.page  != 1) {
          this.props.onPageChange(1);
        }
      }
      // handler for 'Previous' button
      previousPage(event) {
        var page    =   this.props.page;
        if(page != 1){
          this.props.onPageChange(this.props.page - 1);
        }
      }
      // handler for 'Next' button
      nextPage(event) {
        if(this.props.page != this.props.totalpages ){
          this.props.onPageChange(this.props.page + 1);
        }
      }
      // handler for 'Last' button
      lastPage(event) {
        if(this.props.page != this.props.totalpages) {
          this.props.onPageChange(this.props.totalpages);
        }
      }
  
      render() {
        var total_page  =   this.props.totalpages;
        var page      =   this.props.page;
  
        var pagination_item  =   [];
  
        var key   =   1;
        for(var i=0;i<total_page;i++){
          // Start : Adds First & Previous buttons
          if(i == 0 && total_page != 1){
              pagination_item.push(<Pagination.Item disabled={page == 1 ? true :false } key={key++} onClick={this.firstPage}>First</Pagination.Item>);
              pagination_item.push(<Pagination.Item disabled={page == 1 ? true :false } key={key++} onClick={this.previousPage}>{'<<'}</Pagination.Item>);
          }
          // End : Adds First & Previous buttons
          
          // Start : if user is on page number 1
          if ( i == 0 && page == 1) {
              pagination_item.push(<Pagination.Item active={i+1 === page} key={key++} onClick={this.pageChange}>{i+1}</Pagination.Item>);
              if(total_page != 1){
                  pagination_item.push(<Pagination.Item active={i+2 === page} key={key++} onClick={this.pageChange}>{i+2}</Pagination.Item>);
              }
              if(total_page >=3){
                  pagination_item.push(<Pagination.Item active={i+3 === page} key={key++} onClick={this.pageChange}>{i+3}</Pagination.Item>);
              }
          }
          // End : if user is on page number 1
  
  
          // Start : if user is on page number 2 or more than 2
          if ( i == 1 && page > 1) {
              if(page == 3){
                pagination_item.push(<Pagination.Item active={false} key={key++ } onClick={this.pageChange}>1</Pagination.Item>);
              }
              pagination_item.push(<Pagination.Item active={false} key={key++ } onClick={this.pageChange}>{page - 1 }</Pagination.Item>);
              pagination_item.push(<Pagination.Item active={true} key={key++} onClick={this.pageChange}>{page}</Pagination.Item>);
              // true : total page is not nore than 2
              if(page != total_page){
                  pagination_item.push(<Pagination.Item active={false} key={key++} onClick={this.pageChange}>{page + 1 }</Pagination.Item>);
              }
              if(page == total_page -2){
                  pagination_item.push(<Pagination.Item active={false} key={key++ } onClick={this.pageChange}>{total_page}</Pagination.Item>);
              }
          }
          // End : if user is on page number 2 or more than 2
          
          
          // Start : Adds ...  in left side
          if (i == 0 && page > 3 ) {
              pagination_item.push(<Pagination.Item active={i+1 === page} key={key++} onClick={this.pageChange}>{1}</Pagination.Item>);
              pagination_item.push(<Pagination.Item disabled={true} key={key++} >...</Pagination.Item>);
          }
          // Start : Adds ...  in right side
          if ((i == total_page -2) && (page < total_page - 2)) {
              pagination_item.push(<Pagination.Item disabled={true} key={key++} >...</Pagination.Item>);
              pagination_item.push(<Pagination.Item active={i+1 === page} key={key++} onClick={this.pageChange}>{total_page}</Pagination.Item>);
          }
          // End : Adds ...
          
          // Start : Adds Next & Last buttons
          if(i == total_page -1 && total_page != 1){
              pagination_item.push(<Pagination.Item  disabled={page == total_page ? true :false } key={key++} onClick={this.nextPage}>{'>>'}</Pagination.Item>);
              pagination_item.push(<Pagination.Item  disabled={page == total_page ? true :false } key={key++} onClick={this.lastPage}>Last</Pagination.Item>);
          }
          // Start : Adds Next & Last buttons
        }
  
        return <Pagination bsSize="small" className ="custmpage" >{pagination_item}</Pagination>
      }

}

export default CPagination;