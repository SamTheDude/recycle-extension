// Script to work out the recyclability of a product 
// based off the back end and the front end information.

"use strict";

// ===== Global Analysis =====
var productAnalysis;
var localInfo;

// ===== Get Product Information =====
function updateProductInfo() {
    chrome.storage.sync.get(['product-analysis'], function (data) {
        productAnalysis = data;
        console.log(data);
    });
}

// Update when script starts.
updateProductInfo();

// Update when product information changes.
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
        if (key == 'product-analysis') {
            updateProductInfo();
        }
    }
});

// ===== Get Local Area Information =====
function updateLocalInfo() {
    chrome.storage.sync.get(['local-info'], function (data) {
        localInfo = data;
    });
}

// Update when script starts.
updateLocalInfo();

// ===== Determine Recyclability Factor =====
function recyclability() {
    let breakdown = productAnalysis["product-analysis"]["product-breakdown"];
    let highHits = breakdown[Object.keys(breakdown)[0]];

    for (let productName in breakdown) {
        let product = breakdown[productName];
        // Find the most likely product.
        if (product['hits'] > highHits['hits']) {
            highHits = product;
        }

        // Find the recyclability.
        let recycleScore = 0;
        let nonRecycleScore = 0;
        let uncertain = 0;
        console.log(product);
        let keywords = product['keywords'];
        for (let keyword in keywords) {
            if (localInfo['local-info']['bin-recyclable'].includes(keyword)) {
                recycleScore += keywords[keyword];
            } else if (localInfo['local-info']['non-bin-recyclable'].includes(keyword)) {
                nonRecycleScore += keywords[keyword];
            } else {
                uncertain += keywords[keyword];
            }
        }

        // Calculate recyclability.
        //alert("Recycle Score:"+ recycleScore + "    nonRecycleScore:"+nonRecycleScore+"     uncertain:"+uncertain);
        //BUG FOUND-->It seems to be unable to calculate the new recycleScores---because it returns 0 as the initialised value
        
        let total = recycleScore + nonRecycleScore + uncertain;
        //console.log(recycleScore + " : " + nonRecycleScore + " : " + uncertain);
        console.log(uncertain);
        let recyclability = recycleScore / (recycleScore + nonRecycleScore);
        let uncertainty = uncertain / total;

        productAnalysis['recyclability'] = { 'score': recyclability, 'uncertainty': uncertainty };




        
        
        
        // Return data.
        return productAnalysis;
    }
}

//Formats the recyclability score such that it can be passed into the css to set the ring rating
function formatRecyclabilityScore(recyclability){
    let degreerotation = recyclability * 1.8;
    degreerotation += 'deg';
    return degreerotation;
}


// ===== Get recyclability information =====
function getRecyclability() {
    let product = recyclability();

    let percentage = product['recyclability']['score'] * 100;
    percentage = Math.round(percentage);

    //Update plugin dials to reflect recyclability score
    document.getElementById("eco-Rating-Percentage").innerHTML = percentage + "%";
    //window.alert(productAnalysis);
    console.log((product['recyclability']['score'] * 360));
    document.documentElement.style.setProperty('--percentage-guess', (product['recyclability']['score'] * 180) + 'deg');
    
//Update Visual Markers on popup
    recyclability = 54;
       
    document.getElementById("eco-Rating-Percentage").textContent = recyclability+'%';
    document.documentElement.style.setProperty('--percentage-guess', formatRecyclabilityScore(recyclability));

    console.log(productAnalysis);
}

setTimeout(getRecyclability, 1000);