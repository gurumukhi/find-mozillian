const fetch = require('node-fetch');

const API_GITHUB_COMMITS_FETCH = 'https://api.github.com/repos/mozilla/community-data/commits';
const API_GITHUB_FILE_FETCH = 'https://raw.githubusercontent.com/mozilla/community-data/master/credits/names.csv';

function getPagedGithubCommits(pageId) {
  return fetch( API_GITHUB_COMMITS_FETCH + "?page=" + pageId);
}

function getGithubFileContent() {
  return fetch(API_GITHUB_FILE_FETCH);
}

// get all names form the names.csv
function getNamesFromCreditsPage() {
  return new Promise ((resolve, reject) => {
    getGithubFileContent().then((csvContent) => {
      csvContent.blob().then(content => {
        const r = new FileReader();
        r.onload = () => {
          const blobContent = r.result;
          const nameArray = [];
          blobContent.split('\n').forEach(nameRow => {
            nameArray.push(nameRow.split(',',)[0]);
          })
          resolve(nameArray);
        }
        r.readAsText(content);
      }).catch((error) => {
        reject(error);
      });
    }).catch((error) => {
      reject(error);
    });
  })
}

// get all name details from community-data commits
// TODO check with refactoring issue of this fn
function getDetailsFromGithubCommits() {
  return new Promise((resolve, reject) => {
    let numberOfPagesToRequest = 0;
    getPagedGithubCommits(0).then((data) => {
      data.headers.forEach((val, key) => {
        let indexOfFirstPage = val.indexOf("page=");
        if(indexOfFirstPage > -1) {
          let indexOfSecondPage = val.substring(indexOfFirstPage+5, val.length).indexOf("page=");
          if(indexOfSecondPage > -1) {
            let restOfString = val.substring(indexOfFirstPage + indexOfSecondPage + 10, val.length);
            numberOfPagesToRequest = Number(restOfString.substring(0, restOfString.indexOf('>')));
            getCommitsAndProcess(numberOfPagesToRequest).then((data) => {
              resolve(data);
            });
          }
        }
      });
    }); 
  });
}

// For every commit message segregate name, mail id and citation of every mozillian and resolve the content in object
function getCommitsAndProcess(totalPagesToRequest) {
  return new Promise((resolve, reject) => {
    const promiseList = [];
    for( let i=0; i<=totalPagesToRequest; i++) {
      promiseList.push(getPagedGithubCommits(i));
    }

    Promise.all(promiseList).then((responseList) => {
      var objArr = [];
      var processedCount = 0;
      responseList.forEach((resp) => {
        resp.json().then((rowList) => {
          rowList.forEach((row) => {
              let obj = {
                  mail: '',
                  name: '',
                  citation: '',
                  date: ''
              };
              const msg = row.commit.message;
              obj.name = msg.substring(0, msg.indexOf('<')).trim();
              obj.mail = msg.substring(msg.indexOf('<')+1, msg.indexOf('>')).trim();
              obj.citation = msg.substring(msg.indexOf('>')+1, msg.length).trim();
              obj.citation = (obj.citation.indexOf(': "') > -1) ? obj.citation.substring(3, obj.citation.length-1) : obj.citation;
              obj.date = row.commit.committer.date.substring(0, 10);
              if(obj.name && obj.mail && obj.citation) {
                objArr.push(obj);
              }
            });
            if(++processedCount === promiseList.length) {
              resolve([...objArr]);            
            }
        }).catch((error) => {
          console.warn(error);
        });
      });
    }).catch((error) => {
      console.warn(error);
    });
  });
}

module.exports = {getNamesFromCreditsPage, getDetailsFromGithubCommits};