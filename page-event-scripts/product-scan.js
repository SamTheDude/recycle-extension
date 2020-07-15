// Script to grab the product info from an amazon page.

"use strict";

// ===== Scraping Functions =====
// Gets all the product information and returns it as an object.
function getProductInfo() {
    // Get all the product information.
    let ASIN = getASIN();
    let title = getTitle();
    let description = getDesc();

    // Return empty object if all the information is empty.
    if(ASIN == "" && title == "" && description == ""){
        console.log("No Product found.");
        return {};
    }else{
        // Return all the data as a JSON object.
    return {
        "product-information":
        {
            "ASIN": ASIN,
            "title": title,
            "description": description
        }
    };
    }
}

// Checks for the ASIN on the Amazon page.
function getASIN() {
    let tableRows = document.getElementsByTagName("td");
    let ASIN = "";

    for (let i = 0; i < tableRows.length; i++) {
        let node = tableRows[i];
        if (node.innerHTML == "ASIN") {
            let tableRow = node.parentElement.childNodes;

            for (let j = 0; j < tableRow.length; j++) {
                let tableItem = tableRow[j];
                if (node != tableItem) {
                    ASIN = tableItem.innerHTML;
                }
            }
        }
    }

    let labels = document.getElementsByTagName("bdi");
    for (let i = 0; i < labels.length; i++) {
        let label = labels[i];
        if (label.innerHTML == "ASIN") {
            let ASINarea = label.parentElement.parentElement.innerHTML;

            ASIN = ASINarea.substr(ASINarea.length - 10, ASINarea.length - 1);
        }
    }

    return ASIN;
}

function getTitle() {
    let title = document.getElementById("productTitle");
    return getCleanText(title);
}

function getDesc() {
    let description = document.getElementById("productDescription");
    return getCleanText(description);
}

// ===== Text Manipulation Functions =====

function getCleanText(object) {
    let rawText = getHTMLObjectText(object);
    return stripNewlines(rawText);
}

function stripNewlines(text) {
    return text.replace(/(\r\n|\n|\r)/gm, "");
}

function getHTMLObjectText(object) {
    try {
        return object.textContent || object.innerText || "";
    } catch (e) {
        console.log(e);
        return "";
    }
}


// ===== Store Product Information ====
let productInfo = getProductInfo();

// Check if the product information can actually be found.
if (productInfo != {}) {
    // Store the products information in the extension storage.
    chrome.storage.sync.set(productInfo, function () {
        console.log('Product information saved');

        // Testing to see if the information is saved.
        chrome.storage.sync.get(["product-information"], function(data){
            console.log(data);
        })
    });
}