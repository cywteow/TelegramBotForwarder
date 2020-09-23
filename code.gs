var LOG_EXPIRY_DURATION = 365;
var token = "123456:dfgdfgfd";
var telegramUrl = "https://api.telegram.org/bot" + token;
var telegramWillieChatId = "123";
var telegramSharChatId = "124";
var googleWebAppAPI = "https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxx/exec"


function setupWebApp() {
  PropertiesService.getScriptProperties().setProperty("sheetID", SpreadsheetApp.getActiveSpreadsheet().getId());
}

function getMe(){
  var url = telegramUrl + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setupWebHook() {
  var url = telegramUrl + "/setWebhook?url=" + googleWebAppAPI;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function getSheet() {
  var spreadsheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("sheetID"));
  return spreadsheet.getSheetByName("Log");
}

function doGet(e) {
  if (!validateCredentials(e.parameters["username"], e.parameters["password"])) {
    return ContentService.createTextOutput(JSON.stringify({"result":"fail"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = getSheet().getDataRange().getValues().slice(1).reverse();
  
  return ContentService.createTextOutput(JSON.stringify({"result":"success", "data":data})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  Logger.log(e.postData.contents);
//  var jsonString = e.postData.contents.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
//  Logger.log(jsonString);
  var myObj = JSON.parse(e.postData.contents);
//  if (!validateCredentials(myObj.password)) {
//    return ContentService.createTextOutput(JSON.stringify({"result":"fail"})).setMimeType(ContentService.MimeType.JSON);
//  }
  if(validateCredentials(myObj.password)) {
    Logger.log(myObj);
    if(myObj.type == "SMS"){
      forwardSMS(myObj); 
    }
    else if (myObj.type == "NOTIFICATION"){
      forwardNotification(myObj);
    }
    else if (myObj.type == "GMAIL"){
      forwardGmail(myObj);
    }
  }
  
  
  
  return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
}

function forwardNotification(myObj){
  var text = "Notification ("+myObj.appName+")" + "\n" + myObj.notificationTitle + "\n\n" + myObj.notificationText;
  var url = telegramUrl + "/sendMessage"; 
  var data = {
    'text': text,
    'chat_id' : telegramWillieChatId
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function forwardGmail(myObj){
  var text = "Notification ("+myObj.appName+")" + "\n" + myObj.notificationTitle + "\n\n" + myObj.summaryText;
  var url = telegramUrl + "/sendMessage"; 
  var data = {
    'text': text,
    'chat_id' : telegramWillieChatId
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function forwardSMS(myObj){
  getSheet().appendRow([new Date(), myObj.name, myObj.number, myObj.data]);
  var text = myObj.data + "\n\nFrom " + myObj.name+ " (" + myObj.number + ")";
  var url = telegramUrl + "/sendMessage";
  var telegramChatId;
     
  var data = {
    'text': text,
    'chat_id' : telegramWillieChatId
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
  if(isFilterSMS(myObj.number)){
     data.chat_id = telegramSharChatId;
     options.payload = JSON.stringify(data);
     UrlFetchApp.fetch(url, options);
  }
}

function validateCredentials(password) {
//  if (username != PropertiesService.getScriptProperties().getProperty("username")) {
//    return false;
//  }
  
  if (password != PropertiesService.getScriptProperties().getProperty("password")) {
    return false;
  }
  
  return true;
}

function isFilterSMS(number) {
  var myObj = JSON.parse(PropertiesService.getScriptProperties().getProperty("SharSMSFilter").toLowerCase());
  if(myObj.indexOf(number.toLowerCase())+1 == 0){
    return false;
  }
  else{
    return true;
  }
}

function cleanOldRecords() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var rowsToDelete = 0;
  
  for (var i in data) {
    if (data[i][0] instanceof Date) {
      var dayDifference = getDayDifference(new Date(), data[i][0]);
      if (dayDifference > LOG_EXPIRY_DURATION) {
        rowsToDelete = i;
      } else {
        break;
      }
    }
  }
  
  if (rowsToDelete > 0) {
    sheet.deleteRows(2, rowsToDelete);
  }
}

function getDayDifference(date1, date2) {
  return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
}
