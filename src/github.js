const fetch = require('node-fetch');

function getCommits(pageId) {
  return fetch("https://api.github.com/repos/mozilla/community-data/commits?page="+pageId);
}

 function getFileContent() {
  return fetch('https://raw.githubusercontent.com/mozilla/community-data/master/credits/names.csv');
}

// get all names form the names.csv
function getAllNames() {
  return new Promise ((resolve, reject) => {
    getFileContent().then((csvContent) => {
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
      })
    });
  })
}

function getCommitsAndProcess(totalPagesToRequest) {
    return new Promise((resolve, reject) => {
        const promiseList = [];
        for( let i=0; i<=totalPagesToRequest; i++) {
            promiseList.push(fetch('https://api.github.com/repos/mozilla/community-data/commits?page='+i));
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
                      failed: 0,
                      worked: 0
                  };
                  const msg = row.commit.message;
                  obj.name = msg.substring(0, msg.indexOf('<')).trim();
                  obj.mail = msg.substring(msg.indexOf('<')+1, msg.indexOf('>')).trim();
                  obj.citation = msg.substring(msg.indexOf('>')+1, msg.length).trim();
                  obj.citation = (obj.citation.indexOf(': "') > -1) ? obj.citation.substring(3, obj.citation.length-1) : obj.citation;
                  if(obj.name && obj.mail && obj.citation) {
                    objArr.push(obj);
                  }
                });
                if(++processedCount === promiseList.length) {
                  // console.log('resolving with length ', objArr.length);
                  resolve([...objArr]);            
                }
        });
      });
    });
  });
}

// get all name details from community-data commits
function getAllNameDetails() {
      return new Promise((resolve, reject) => {
        let numberOfPagesToRequest = 0;
      getCommits(0).then((data) => {
        data.headers.forEach((val, key) => {
          console.log(val);
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

module.exports = {getAllNames, getAllNameDetails};