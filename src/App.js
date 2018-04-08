import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { getAllNameDetails, getAllNames } from './github';
import { cidrSubnet } from 'ip';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      nameMap: {},
      allNamesFromCreditPage: [],
      detailsFromCommitMessages: [],
      inputQuery: '',
      result: 'Type name in above box to find his/her mozillian details'
    }
  }

  componentDidMount() {
    // Fetch data from names.csv file
    getAllNames().then(names => {
      getAllNameDetails().then(details => {
        this.setState({
          allNamesFromCreditPage: names,
          detailsFromCommitMessages: details,
          nameMap: this.getNameMap(names, details)
        });
      });
    });
  }

  getNameMap(names, details) {
    const nameMap = {};
    names.forEach((name) => nameMap[name.toUpperCase()] = true);
    details.forEach((obj) => nameMap[obj.name.toUpperCase()] = obj);
    return nameMap;
  }

  onInputChange = (event) => {
    const input = event.target.value
    this.setState({
      inputQuery: input,
      result: this.state.nameMap[input.toUpperCase()]
              ? this.getDetails(this.state.nameMap[input.toUpperCase()])
              : "Not a mozillian :-/"
    });
    console.log(this.state.nameMap[input.toUpperCase()]);
  }

  getDetails(nameObj){
    return `Name: ${nameObj.name} | Mail ID: ${nameObj.mail} | Citation: ${nameObj.citation}`;
  }

  render() {
    console.log(this.state);
    return (
      <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'georgia' }}>
        IsMozillian?
        <br />
        <input style={{ margin: '20px' }}
         type="text" value={this.state.inputQuery} onChange={ this.onInputChange }/>

         <div>
         {this.state.result}
         </div>
      </div>
    );
  }
}

export default App;
