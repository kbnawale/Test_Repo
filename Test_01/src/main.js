let myInterval = 0;
let apiKey = "406OBJDKF54YSVVX";
let apiFunction = "TIME_SERIES_INTRADAY";
/* List of symbols which can be altered */
let tickers = ['AAPL','GOOGL','BABA','MSFT'];

let stockDataObject = {
    headings:['symbol', 'open', 'high', 'low', 'close', 'volume'],
    data:[]
};

let sucessDataArray = [];

$(window).on('load', function(){
    $("#indicator").show();
    stockPriceTicker(tickers, apiFunction, apiKey);
    /* Making ajax call every after 1 minute or 60000 milliseconds */
    myInterval = setInterval(function(){
        sucessDataArray = [];
        stockDataObject.data = [];
        $("#indicator").show();
        stockPriceTicker(tickers, apiFunction, apiKey);
    }, 60000);
});

function stockPriceTicker(tickersArr, functionType, key){
    console.log("display stock data");
    let urlArray = tickersArr.map(function(val,ind){
        return "https://www.alphavantage.co/query?function="+functionType+"&symbol="+val+"&interval=1min&outputsize=compact&apikey="+key;
    });
    ajaxRequest(urlArray);
}

/**
 * 
 * @param {array of urls} urls 
 */

function ajaxRequest (urls) {
    if (urls.length > 0) {
        $.ajax({
            method: 'GET',
            url: urls.pop(),
            dataType: "json"
        })
        .done(function (data) {
            if(data != null){
                console.log("data: ",data);
                if(data['Meta Data'] == undefined){
                    console.log(data);
                }else{
                    sucessDataArray.push(data);
                }                
            }
            ajaxRequest(urls);
        })
        .fail(function(){
            alert("ERR_INTERNET_DISCONNECTED!");
        })
    }else{
        $("#indicator").hide();
        processData(sucessDataArray);
    }
}

/**
 * 
 * @param {array of stock data received from service response} stockDataArray 
 */
function processData(stockDataArray){
    for(let i=0; i<stockDataArray.length; i++){
        let tempObj = {};
        tempObj.symbol = stockDataArray[i]['Meta Data']['2. Symbol'];
        let lastRefreshed = stockDataArray[i]['Meta Data']['3. Last Refreshed'];
        tempObj.open = stockDataArray[i]['Time Series (1min)'][lastRefreshed]['1. open'];
        tempObj.high = stockDataArray[i]['Time Series (1min)'][lastRefreshed]['2. high'];
        tempObj.low = stockDataArray[i]['Time Series (1min)'][lastRefreshed]['3. low'];
        tempObj.close = stockDataArray[i]['Time Series (1min)'][lastRefreshed]['4. close'];
        let lastVolume = stockDataArray[i]['Time Series (1min)'][lastRefreshed]['5. volume'];
        tempObj.volume = numberWithCommas(lastVolume);
        stockDataObject.data.push(tempObj);
    }
    //console.log("stockDataObject: ",stockDataObject);
    displayStockData(stockDataObject);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
  }

  /**
   * 
   * @param {processed stock data in the form of object} dataObject 
   */
function displayStockData(dataObject){
    let table = $('#stock-table');
    table.children('thead').remove();
    table.children('tbody').remove();
    if(dataObject["headings"].length > 0){
        let tRow = $('<tr>');
        for(let i=0; i<dataObject["headings"].length; i++){
            tRow.append($("<th>").text(dataObject["headings"][i]));
        }
        table.append($('<thead>').append(tRow));
    }
    if (dataObject["data"].length > 0) {
        let tBody = $('<tbody>');
        for (let i = 0; i < dataObject["data"].length; i++) {
            let tRow = $('<tr>');
            let allKeys = Object.keys(dataObject["data"][i]);
            colspanCount = allKeys.length;
            for (let j = 0; j < allKeys.length; j++) {
                let tData = $("<td>");
                if(allKeys[j] !== "symbol" && allKeys[j] !== "volume"){
                    tData.append("$"+dataObject["data"][i][dataObject["headings"][j]]);
                }else{
                    tData.append(dataObject["data"][i][dataObject["headings"][j]]);
                }  
                tRow.append(tData);
            }
            tBody.append(tRow);
        }
        table.append(tBody);
    }
}