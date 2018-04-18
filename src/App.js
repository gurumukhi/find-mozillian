import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { getAllNameDetails, getAllNames } from './github';
import { cidrSubnet } from 'ip';
import { storeInDB, fetchFromDB } from './db-storage';

/*
 TODOs: 
    1. No more undefined after clearing input box
    2. Better UI
 */

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

dataNotOld (date) {
    const now = new Date();
    const expiryDate = new Date(date);
    expiryDate.setDate(date.getDate() + 1);
    if(now < expiryDate) {
        console.log('useful data found');
    } else {
        console.log('useless data found');
    }
    return now < expiryDate;
}

componentDidMount() {
    fetchFromDB().then(data => {
    if(data && data.dataDate && this.dataNotOld(data.dataDate)) {
        this.setDataInState(data);
    } else {
        // const names = ['ram', 'not ram'];
        // const details = [{
        // name: 'ram2',
        // mail: 'vaishnav.rd@gmail.com2',
        // citation: 'good bwoy2'
        // }, {
        // name: 'ram',
        // mail: 'vaishnav.rd@gmail.com',
        // citation: 'good bwoy'
        // }];
        
        // Fetch data from names.csv file
        console.log('GETTING NAMES FROM FILE');
        getAllNames().then(names => {
            console.log('GETTING DETAILS FROM GIT SERVER');
            getAllNameDetails().then(details => {
                console.log('now storing names in db');
                storeInDB(names, details, new Date()).then(data2 => {
                    this.setDataInState(data2);
                    }).catch(error => {
                    console.log('couldnt store data in db');
                    this.setDataInState({names, details});
                });
            // this.setState({
            //     allNamesFromCreditPage: names,
            //     detailsFromCommitMessages: details,
            //     nameMap: this.getNameMap(names, details)
            // });
            });
        });
    }
});
    }

setDataInState(data) {
    console.log('got data from db');
    this.setState({
    allNamesFromCreditPage: data.names,
    detailsFromCommitMessages: data.details,
    nameMap: this.getNameMap(data.names, data.details)
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
    result: this.findDetailsForName(input)
    });
    // console.log(this.state.nameMap[input.toUpperCase()]);
}

findDetailsForName (input) {
    console.log('checking');
    if(this.state.nameMap[input.toUpperCase()]) {
        return this.getDetails(this.state.nameMap[input.toUpperCase()])
    }

    let matchingNames = 0;
    let output = '';
    console.log(this.state.allNamesFromCreditPage);
    for(let i=0; i< this.state.allNamesFromCreditPage.length; i++) {
        if (this.state.allNamesFromCreditPage[i].toUpperCase().indexOf(input.toUpperCase()) > -1) {
            matchingNames += 1;
            output += this.getDetails(this.state.nameMap[this.state.allNamesFromCreditPage[i].toUpperCase()])
                     + '______________';
        }
        if(matchingNames > 3) {
            output += '+ SEVERAL OTHERS';
            break;
        }
    }

    if(!matchingNames) {
        return "Not a mozillian :-/";
    }

    return output;
}

getDetails(nameObj){
    return `Name: ${nameObj.name} | Mail ID: ${nameObj.mail} | Citation: ${nameObj.citation}`;
}

render() {
    // console.log(this.state);
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
