import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// const data = papa.parse('./synthetic_kcal_state_crop_1_results.csv', {
//   // worker: true,
//   download: true,
//   step: function(row) {
//     // console.log("Row:", row.data);
//   },
//   error: function(err: any) {
//     console.log("ERROR:", err);
//   },
//   complete: function(d) {
//     console.log("All done!", d.data);
//   }
// });


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
