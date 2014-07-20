/**
*
* a quick and dirty script to extract email from mbox or other text file
* by:  purwa astawa <purwa@crazyslug.net>
*
*
**/

var fs = require('fs'),
    S = require('string'),
    prompt =  require('prompt');

//this will executed on user prompt
var gimmeEmail = function(filename){
  makeTempFile(filename, processTempFile);
}

//read original mbox and save any string containing "from, to, cc, and bcc" to a new temp file
var makeTempFile = function(filename, callback){
  fs.readFile(filename, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
    //get the line that containing these words: "from, to, cc, bcc"
    line = data.match(/(?:From\:\s|From\s|To\:\s|To\s|Cc\:\s|Cc\s|Bcc\:\s|Bcc\s*)(?:.*)/g);
    //write it to new file.
    fs.writeFile(filename+".temp", line, function(err){
      if(err){
         console.log(err);
      }else{
        callback(filename+".temp");
      }
    });
  });

}

//process the temporary file
var processTempFile = function(filename){
  fs.readFile(filename, 'utf8', function (err,data) {
    if (err) {
          return console.log(err);
      }
    //find anything that resemble an email address,
    result = data.match(/(([^<>()[\]\\.,;:\s@\"'%]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g);

    //process the result
    processData(result, filename);

  });
};

// do the stuff here
function processData(data, filename){

  // clean all duplicates
  var noDupe = cleanDupe(data);

  // convert to csv, this is for cleaning regex
  var tempCSV = S(noDupe).toCSV('\n').s;

  // remove all no-reply or noreply  and other strange address
  var result = cleanData(tempCSV);
  //console.log(result);

  //write the result to csv
  fs.writeFile(filename+".csv", result, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
  });
}



// find and remove any duplicates,
function cleanDupe(arr){

  var i,
      len=arr.length,
      out=[],
      obj={};

  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out;

}

//remove no-reply and noreply email addresses and other strange email
function cleanData(arrData){

    noNoreply = arrData.replace(/^"(noreply|no-reply)+(@.*)/gm, '');

    noStrangeEmail = noNoreply.replace(/((^".*)+(([0-9]{6,}.*)|([A-Z]{4,}.*)))|(^"([A-Z]{2,})([0-9].*)|(^"[0-9]{2,}.*))/gm, '');
    
    noEmptyLine = noStrangeEmail.replace(/^\s/gm, '');
    
    return  noEmptyLine;
}

//start the prompt
prompt.start();

prompt.get(['filename'], function (err, result) {
  console.log('Command-line input received:');
  console.log('filename: ' + result.filename);
  gimmeEmail(result.filename);

});


