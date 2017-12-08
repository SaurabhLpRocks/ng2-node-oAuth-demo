import { Component } from '@angular/core';
import { Headers, Http, Request, RequestOptions, Response, XHRBackend } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'app';
  userInfo:any;

  constructor(private http: Http){}

  onLogin(): void {  
    //  window.location.href= 'http://localhost:5000/api/login'; 
     
    console.log('in login com'); 
     
    this.http.get('http://localhost:5000/api/login',null).subscribe
      (res => { 
         console.log('in login service', res);         
      });
      
    }   
}
