/*
  Project started: 23/3/2024
  Project end: 20/4/2024
*/

//! Alert: Poor documentation with grammatical errors!

import htmlAttributes from './htmlAttributes.js'

let allChanges;

//Attributes filter
const attrContainer = document.querySelector('#root #Filter .filterer');

function createAttrCtrlStructure() {
    //For each element in the 'htmlAttributes' array, an HTML structure will be created along with a paragraph that holds the attribute name and a switcher
    for(let attr of htmlAttributes) {
        //The parent of the HTML structure
        const attrVisbility = document.createElement('div');
        attrVisbility.classList.add('attribute-visibility');

        const attrName = document.createElement('label');
        attrName.setAttribute('for', '')
        attrName.classList.add('attr-name');
        //it's visibility in 'showHTML' is true by default
        attrName.innerHTML = attr;

        //The switcher parent
        const attrVisibilityControle = document.createElement('label');
        attrVisibilityControle.classList.add('controller');

        //Toggling the switcher on/off will show/hide the attribute info in the 'element-checker' box
        const switcher = document.createElement('input');
        switcher.setAttribute('class', 'switcher');
        switcher.setAttribute('data-attr', attr);
        switcher.setAttribute('checked', '');
        switcher.type = 'checkbox';
        

        //Reput the modification to the attributes filter
        loadChanges(attr, switcher);

        //The Switcher toggling animation
        const slider = document.createElement('span');
        slider.classList.add('slider');
        slider.classList.add('round');

        //Adding the HTML structure to the body
        attrContainer.appendChild(attrVisbility);
        attrVisibilityControle.appendChild(switcher);
        attrVisibilityControle.appendChild(slider);
        attrVisbility.appendChild(attrName);
        attrVisbility.appendChild(attrVisibilityControle);

        //Example of the structure:
        /*
          <div class="attribute-visibility" style="display: flex;">
              <p class="attr-name">class</p>
              <label class="controller">
                  <input class="switcher" type="checkbox" checked data-attr="...">
                  <span class="slider round"></span>
              </label>
          </div>
        */
    }
}

createAttrCtrlStructure();


const search = document.getElementById("search-for-attr");

function attributesSearch() {
    let input = search.value.toLowerCase();
    let attributesNames = document.querySelectorAll(".attribute-visibility .attr-name");
    let attributesVisibility = document.querySelectorAll(".attribute-visibility");
    let filteredAttributes = [];

    for (let a = 0; a < attributesNames.length; a++) {
        let filter = attributesNames[a].innerHTML.includes(input);
        if (filter) {
            attributesVisibility[a].style.display = "flex";
        } else {
            attributesVisibility[a].style.display = "none";
            filteredAttributes.push(attributesVisibility[a]);
        }
    }
}

search.addEventListener("input", attributesSearch);

const allSwitchers = document.querySelectorAll('.attribute-visibility .controller .switcher');

function saveChanges(e) {
    //all attributes have the 'show' value true by default
    let changes = {
        name: e.target.dataset.attr,
        show: e.target.checked
    }

    //Store previous changes
    allChanges = JSON.parse(localStorage.getItem('attr-info')) || [];
    allChanges.push(changes);

    
    for (let i = 0; i < allChanges.length; i++) {
        for (let j = i + 1; j < allChanges.length; j++) {
            // Detecting the objects with the same class name and removing the one with smaller index in the array
            if (allChanges[i].name === allChanges[j].name) {
                allChanges.splice(i, 1);
            }
        }

        //? Removing objects with the 'changes.show' value true
        // if(allChanges[i].show) {
        //     allChanges.splice(i, 1);
        // }
    }

    localStorage.setItem('attr-info', JSON.stringify(allChanges));
    sendToContentScript();
}

for(let switcher of allSwitchers) {
    switcher.addEventListener('change', saveChanges);
}

//reput the modification in the filter
function loadChanges(attr, switcher) {
    let modifications = JSON.parse(localStorage.getItem('attr-info')) || 'no-data';
    
    
    //check if there is data in localStorage and reput modifications that the user did on the filter
    if(modifications != 'no-data') {
        for(let i = 0; i < modifications.length; i++) {
            //check if the attr names in the filter existes in the stored data
            if(modifications[i].name === attr) {
                switcher.checked = modifications[i].show;
            }
        }
    }
}

//sending the changes on the filter to 'content_scripts/content.js'
// Send a message from popup.js to content_script.js

function sendToContentScript() {
    if (allChanges !== undefined) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { changes: allChanges });
        });
        console.log(allChanges);
    }
}

//Hiding the container that shows attribute in 'content.js'
const hideButton = document.getElementById('hide');

//Sending data to content.js
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { hideContainer:  hideButton.checked});
});

function checkInputChecking() {
    if(hideButton.checked) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { hideContainer:  true});
        });
    }else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { hideContainer:  false});
        });
    }

    localStorage.setItem('containerHidden', hideButton.checked);
}

hideButton.addEventListener('input', checkInputChecking); 

function loadVisibilityChanges() {
    let containerHidden = localStorage.getItem('containerHidden') === 'true';
    hideButton.checked = containerHidden;;
}

loadVisibilityChanges();

let $containerPosition = document.getElementById('container-position');

//Sending the selected option to content.js
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { containerPosition :  $containerPosition.value});
});

function selectedOption() {
    let selectedOption = $containerPosition.options[$containerPosition.selectedIndex].value;
    console.log(selectedOption); //! For debugging
    localStorage.setItem("container-position", selectedOption);

    //Sending the selected option to content.js
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { containerPosition :  selectedOption});
    });
}

function loadPositionChanges() {
    $containerPosition.value = localStorage.getItem("container-position");
}

// Save changes on select change
$containerPosition.addEventListener('change', ()=>{
    selectedOption();
});

// Load position changes on page load
loadPositionChanges();