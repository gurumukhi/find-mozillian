// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
// import { cidrSubnet } from 'ip';
// import { storeInDB, fetchFromDB } from './db-storage';
// import { getAllNameDetails, getAllNames } from './github';
const db = require('./db-storage');
const gh = require('./github');

const { storeInDB, fetchFromDB } = db;
const { getAllNameDetails, getAllNames } = gh;

// local var
const _data = {};

function setLocalVariable(data) {
    _data = {
        allNamesFromCreditPage: data.names,
        detailsFromCommitMessages: data.details,
        nameMap: getNameMap(data.names, data.details)
    }
};

function prepare() {
    fetchFromDB().then(data => {
    if(data && data.dataDate && dataNotOld(data.dataDate)) {
        _data = setLocalVariable(data);
        // console.log('data already available');
    } else {
        // callFallback();

        // Fetch data from names.csv file
        // console.log('GETTING NAMES FROM FILE');
        getAllNames().then(names => {
            // console.log('GETTING DETAILS FROM GIT SERVER');
            getAllNameDetails().then(details => {
                // console.log('now storing names in db');
                storeInDB(names, details, new Date()).then(data2 => {
                    _data = setLocalVariable(data2);
                    // console.log('data store in db now');
                    }).catch(error => {
                        console.log('using data directly as it couldnt be saved in db coz of' + error);
                        _data = {
                            names, 
                            details
                        }
                    });
                }).catch(err => {
                    console.log('fat gaya while getting names form csv kyuki : '+err);
                });
            }).catch(err => {
                console.log('fat gaya while getting commits kyuki : '+err);
            });
        }
    }).catch(err => {
        console.log('fat gaya while getting commits kyuki : '+err);
        // callFallback();

        // Fetch data from names.csv file
        // console.log('GETTING NAMES FROM FILE');
        getAllNames().then(names => {
            // console.log('GETTING DETAILS FROM GIT SERVER');
            getAllNameDetails().then(details => {
                // console.log('now storing names in db');
                storeInDB(names, details, new Date()).then(data2 => {
                    _data = setLocalVariable(data2);
                    // console.log('data store in db now');
                    }).catch(error => {
                        console.log('using data directly as it couldnt be saved in db coz of' + error);
                        _data = {
                            names, 
                            details
                        }
                    });
                }).catch(err => {
                    console.log('fat gaya while getting names form csv kyuki : '+err);
                });
            }).catch(err => {
                console.log('fat gaya while getting commits kyuki : '+err);
            });
    });
}

// function callFallback() {
    
// }

//util method
function getNameMap(names, details) {
    const nameMap = {};
    names.forEach((name) => nameMap[name.toUpperCase()] = true);
    details.forEach((obj) => nameMap[obj.name.toUpperCase()] = obj);
    return nameMap;
}

/////// main entry method
async function findMozillian (iname) {
    await prepare();
    return await findDetailsForName(iname);
}

function findDetailsForName (input) {
    // console.log(input);
    // console.log(_data);
    // console.log('checking');
    if(_data.nameMap[input.toUpperCase()]) {
        return getDetails(_data.nameMap[input.toUpperCase()])
    }

    let matchingNames = 0;
    let output = '';
    // console.log(_data.allNamesFromCreditPage);
    for(let i=0; i< _data.allNamesFromCreditPage.length; i++) {
        if (_data.allNamesFromCreditPage[i].toUpperCase().indexOf(input.toUpperCase()) > -1) {
            matchingNames += 1;
            output += getDetails(_data.nameMap[_data.allNamesFromCreditPage[i].toUpperCase()])
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

function getDetails(nameObj){
    return `Name: ${nameObj.name} | Mail ID: ${nameObj.mail} | Citation: ${nameObj.citation}`;
}

function dataNotOld (date) {
    const now = new Date();
    const expiryDate = new Date(date);
    expiryDate.setDate(date.getDate() + 1);
    if(now < expiryDate) {
    //     console.log('useful data found');
    // } else {
    //     console.log('useless data found');
    }
    return now < expiryDate;
}

module.exports = {findMozillian};