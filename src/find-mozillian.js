const browserStorage = require('./browser-storage');
const githubApi = require('./github-api');

const { storeInBrowser, fetchDataFromBrowser } = browserStorage;
const { getNamesFromCreditsPage, getDetailsFromGithubCommits } = githubApi;

/**
 * ToDos:
 * 1. Use authenticated github api
 * 
 * More!
 * 1. To use external indexedDB api?
 * 2. Not to use node-fetch?
 *
 */

// local variable
let _data = {
  allNamesFromCreditPage: [],
  detailsFromCommitMessages: [],
  nameMap: {}
};

const mozillianObjectTemplate = {
  'name': '',
  'details': {
    'mail': '',
    'citation': '',
    'dateAddedOnCreditPage': ''
  },
  'noDetailsReason': ''
};

const outputObjectTemplate = {
  'matchingResults': [], // aray of MozillianObjectTemplate
  'moreMatchesAvailable': false
};

// main entry method of the module
function findMozillian (queryText) {
  return new Promise((resolve, reject) => {
    setLocalVariableValue().then( () => {
      resolve(getDetailsIfMozillian(queryText));
    }).catch((error) => {
      reject(error);
    });
  });
}

// Get data from browser or from github server and set into local variable
function setLocalVariableValue() {
  return new Promise((resolve, reject) => {
    fetchDataFromBrowser().then(data => {
      if(data && data.dataDate && !hasDataExpired(data.dataDate)) {
        console.log('oh good, thanks! data from browser is sufficient');
        resolve(setDataInLocalVariable(data));
      } else {
        fetchDataAndStoreInLocalVariable(data2).then( () => {
          resolve(setDataInLocalVariable(data2));
        }).catch((error) => {
          reject(error);
        });
      }
    }).catch(err => {
      fetchDataAndStoreInLocalVariable(data3).then( () => {
        resolve(setDataInLocalVariable(data3));
      }).catch((error) => {
        reject(error);
      });
    });
  });
}

// First time data is fetched from github server and stored in browser for further consumption
function fetchDataAndStoreInLocalVariable() {
  return new Promise((resolve, reject) => {
    getNamesFromCreditsPage().then(names => {
      getDetailsFromGithubCommits().then(details => {
        storeInBrowser(names, details, new Date()).then(data2 => {
          console.log(data2);
          _data = setDataInLocalVariable(data2);
        }).catch(error => {
          console.warn(error);
          _data = setDataInLocalVariable({
              names, 
              details
          });
        });
        }).catch(err => {
            console.warn(err);
        });
    }).catch(err => {
        console.warn(err);
    });
  });
}

// Returns object with result, and flags exactMatch & allResultsFetched
function getDetailsIfMozillian (input) {
  console.log('lets see what is output');
  // let output = {
  //   ...outputObjectTemplate
  // };
  let output = Object.assign ({}, outputObjectTemplate);

/*
const mozillianObjectTemplate = {
  'name': '',
  'details': {
    'mail': '',
    'citation': '',
    'dateAddedOnCreditPage': ''
  },
  'noDetailsReason': ''
};

const outputObjectTemplate = {
  'matchingResults': [{
    'name': '',
    'details': {
      'mail': '',
      'citation': '',
      'dateAddedOnCreditPage': ''
    },
    'noDetailsReason': ''
  }],
  'moreMatchesAvailable': false
};
*/
output.matchingResults = [];
  if(_data.nameMap[input.toUpperCase()]) {
    let obj = _data.nameMap[input.toUpperCase()];
    if(obj === true) {
      output.matchingResults.push({
        'name': input,
        'noDetailsReason': 'Mozillian from more than 5 years'
      });
    } else {
      output.matchingResults.push({
        'name': obj.name,
        'details': {
          'mail': obj.mail,
          'citation': obj.citation,
          'dateAddedOnCreditPage': obj.date
        }
      });
    }
  } else {
    let matchingNames = 0;
    for(let i=0; i< _data.allNamesFromCreditPage.length; i++) {
      if (_data.allNamesFromCreditPage[i].toUpperCase().indexOf(input.toUpperCase()) > -1) {
          matchingNames += 1;
          let obj = _data.nameMap[_data.allNamesFromCreditPage[i].toUpperCase()];
          if(obj === true) {
            output.matchingResults.push({
              'name': _data.allNamesFromCreditPage[i],
              'noDetailsReason': 'Mozillian from more than 5 years'
            });
          } else {
            output.matchingResults.push({
              'name': obj.name,
              'details': {
                'mail': obj.mail,
                'citation': obj.citation,
                'dateAddedOnCreditPage': obj.date
              }
            });
          }
      }
      if(matchingNames > 3) {
          output.moreMatchesAvailable = true;
          break;
      }
    }
  }

  return output;
}

//util method
function getNameMap(names, details) {
    const nameMap = {};
    names.forEach((name) => nameMap[name.toUpperCase()] = true);
    details.forEach((obj) => nameMap[obj.name.toUpperCase()] = obj);
    return nameMap;
}

function setDataInLocalVariable(data) {
  _data = {
      allNamesFromCreditPage: data.names,
      detailsFromCommitMessages: data.details,
      nameMap: getNameMap(data.names, data.details)
  }
};

function hasDataExpired (date) {
    const now = new Date();
    const expiryDate = new Date(date);
    expiryDate.setDate(date.getDate() + 1);
    return now > expiryDate;
}

module.exports = {findMozillian};