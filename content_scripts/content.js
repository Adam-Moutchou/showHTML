//! ALERT!: Poor Documentation


const host = document.createElement('div');
host.id = 'extension-hoster';
document.body.appendChild(host);

//the container that will show element's info
const container = document.createElement('div');
container.classList.add('extension-container--top');
container.id ='extension-element-checker';
host.appendChild(container);

//! shadow DOM
// const shadow = host.attachShadow({ mode: "open" });

// const style = document.createElement('style');
// style.textContent = `
//     #extension-element-checker{
//         width: 100% !important;
//         height: var(--box-height) !important;
//         background-color: #222831 !important;
//         box-shadow: 0 10px 20px rgb(0,0,0,0.8) !important;
//         position: fixed;
//         left: 0;
//         right: 0;
//         left: 50%;
//         transform: translateX(-50%);
//         z-index: 2147483648;
//         overflow-x: auto;
//         overflow-y: hidden;
//     }

//     .extension-container--top {
//         top: 0;
//     }

//     .extension-container--bottom {
//         bottom: 0;
//     }

//     #extension-element-checker > * {
//         pointer-events: none;
//     }

//     #extension-element-checker #extension-element-info {
//         display: flex;
//         align-items: center;
//         justify-content: space-between;
//         margin: 0 10px 0 10px;
//         height: 100% !important;
//         font-family: var(--font-Reddit) !important;
//     }

//     #extension-element-checker #extension-element-info > * {
//         font-size: 20px !important;
//         margin: 10px;
//     }

//     #extension-element-checker #extension-element-info #extension-element-tag {
//         color: orange;
//     }

//     #extension-element-checker #extension-element-info #extension-element-attr {
//         width: 80% !important;
//         /* background-color: var(--attributes-section-bg); */
//         border-radius: 7px;
//         overflow-y: hidden;
//         overflow-x: auto;
//         pointer-events: auto;
//         color: #fff;
//         white-space: nowrap;
//     }

//     .mouse-move {
//         transition: background .2s;
//         background-color: rgba(236, 247, 25, 0.2) !important;
//     }

//     .extension-hide {
//         display: none;
//     }`;

// shadow.appendChild(style);

//The parent(child of 'container')
const infoContainer = document.createElement('div');
container.appendChild(infoContainer);
infoContainer.id = 'extension-element-info';

//The element that will contain the tag
const elementTag = document.createElement('div');
//The element that will contain the attributes
const elementAttr = document.createElement('div');

//Insert element's info inside the container
function createElement(el, parent, className, content) {  
  el.setAttribute('id', className);
  el.innerHTML = content;
  parent.appendChild(el);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  chrome.storage.local.set({ changes: message });
});


//Injecting html element's info inside the container
function showHTML(e) {
  // let changes = JSON.parse(localStorage.getItem('changes-from-popup'));

  const attributes = {
    toString: function() {
      let result = '';
      for (let key in this) {
        if (typeof this[key] !== 'function') {
          result += `<span style="color: #15e890;">${key}</span>: ${this[key]}&nbsp;&nbsp;&nbsp;`;
        }
      }
      return result;
    }
  };

  //Getting element's tag name
  let tag = e.target.tagName;
  //Getting element's attributes
  let attrNames = e.target.getAttributeNames() || 0;

  let attrValue;
  //Storing element's attributes in 'attr'
  for(let i = 0; i < attrNames.length; i++) {
    attrValue = e.target.getAttribute(attrNames[i]) || 0;
    attributes[attrNames[i]] = attrValue;
  }

  // Extracting the true and false attributes from changes
  // let forbiddenAttr = [];
  // if (changes && Array.isArray(changes.changes)) {
  //   for (let a = 0; a < changes.changes.length; a++) {
  //     if (!changes.changes[a].show) {
  //       forbiddenAttr.push(changes.changes[a]);
  //     }
  //   }
  // }
  
  if(e.target !== container) {
    //The child that will hold the html element's tag name
    createElement(elementTag, infoContainer, 'extension-element-tag', tag);
        
    //The child that will hold the html attributes
    //Checking if the attributes of the clicked element match the filterd attributes in the popup
    let attributeName = Object.keys(attributes);

    // for(let x = 0; x < forbiddenAttr.length; x++) {
    //   if(attributeName.includes(forbiddenAttr[x].name)) {
    //     delete attributes[forbiddenAttr[x].name];
    //   }
    // }

    //Get the stored changes from the chrome storage API
  chrome.storage.local.get(["changes"], (data)=>{
    let filterModifications = data.changes.changes;
    
    // Extracting the true and false attributes from changes
    let forbiddenAttr = [];
    if (filterModifications && Array.isArray(filterModifications)) {
      for (let a = 0; a < filterModifications.length; a++) {
        if (!filterModifications[a].show) {
          forbiddenAttr.push(filterModifications[a]);
        }
      }
    }

    for(let x = 0; x < forbiddenAttr.length; x++) {
      if(attributeName.includes(forbiddenAttr[x].name)) {
        delete attributes[forbiddenAttr[x].name];
      }
    }

    createElement(elementAttr, infoContainer, 'extension-element-attr', attributes);
  });
  }
}

document.addEventListener('click', showHTML);

document.addEventListener('mousemove', (e) => {
  if(!container.classList.contains('extension-hide')) {
    if(e.target !== container) {
      e.target.classList.add('mouse-move');
      if(e.target.className === 'mouse-move') {
        e.target.removeAttribute('class');
      }
    }
  }


});

document.addEventListener('mousedown', (e) => {

  if(!container.classList.contains('extension-hide')) {
    if(e.target !== container) {
      e.target.classList.remove('mouse-move');
    }
  }
});

document.addEventListener('mouseout', (e) => {
  if(!container.classList.contains('extension-hide')) {
    if(e.target !== container) {
      e.target.classList.remove('mouse-move');   
    }
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  chrome.storage.local.set({ containerHidden : message.hideContainer});
  handleContainerVisibility();
});

// Define the function to hide or show the container
function handleContainerVisibility() {
  chrome.storage.local.get(["containerHidden"], (data) => {
    let containerHidden = data.containerHidden
    
    if(containerHidden) {
      container.classList.add('extension-hide');
    }else {
      container.classList.remove('extension-hide');
    }
  });
}

handleContainerVisibility();

//Receiving the container position from popup.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
  chrome.storage.local.set({ containerPosition :  message.containerPosition});

  handleContainerPosition();
});

// function onMouseDrag({ movementX, movementY }) {
//   let getContainerStyle = window.getComputedStyle(container);
//   let leftValue = parseInt(getContainerStyle.left);
//   let topValue = parseInt(getContainerStyle.top);
//   container.style.left = `${leftValue + movementX}px`;
//   container.style.top = `${topValue + movementY}px`;
// }

function handleContainerPosition() {
  chrome.storage.local.get(["containerPosition"], (data) => {
    let position = data.containerPosition;

    if(position == 'top') {
      container.classList.add('extension-container--top');
      container.classList.remove('extension-container--bottom');
    } 
    
    else if(position == 'bottom') {
      container.classList.add('extension-container--bottom');
      container.classList.remove('extension-container--top');
    } 
    
    // else if(position == 'Free') {
    //   container.addEventListener("mousedown", () => {
    //     container.addEventListener("mousemove", onMouseDrag);
    //   });
    //   document.addEventListener("mouseup", () => {
    //     container.removeEventListener("mousemove", onMouseDrag);
    //   });
    // }
  });
}

handleContainerPosition();