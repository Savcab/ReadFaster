// Returns the HTML version of a paragraph in bionics reading version
async function applyBionics(text) {
  const encodedParams = new URLSearchParams();
  encodedParams.append("content", text);
  encodedParams.append("response_type", "html");
  encodedParams.append("request_type", "html");
  encodedParams.append("fixation", "1");
  encodedParams.append("saccade", "10");
  
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': '0df50c3d5emsh073463b4e17db80p1f07cejsn441e3be40759',
      'X-RapidAPI-Host': 'bionic-reading1.p.rapidapi.com'
    },
    body: encodedParams
  };
  
  const response = await fetch('https://bionic-reading1.p.rapidapi.com/convert', options)
    .then(response => {
      if(!response.ok){
        throw new Error("API request for bionic translation response was invalid");
      }
      console.log(response);
      return response;
    })
    .catch(err => {
      console.error(err);
    });
  console.log(response)

  const responseText = await response.text();
  return responseText;

}

// Update a whole textnode to be bionics reading compatable
async function processTextNode(textNode) {
  if (textNode.textContent.trim() !== '') {
    console.log('here in processTextNode');
    console.log('the text content is: ', textNode.textContent);
    const bionicHTML = await applyBionics(textNode.textContent);
    const tempElement = document.createElement('span');
    tempElement.innerHTML = bionicHTML;

    // while (tempElement.firstChild) {
    //   textNode.parentNode.insertBefore(tempElement.firstChild, textNode);
    //   tempElement.removeChild(tempElement.firstChild);
    // }
    textNode.parentNode.insertBefore(tempElement, textNode);
    textNode.parentNode.removeChild(textNode);
  }
}

// Update a node and all it's children to be bionics reading compatable
async function processNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    await processTextNode(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const childNode of node.childNodes) {
      await processNode(childNode);
    }
  }
}

// processNode(document.body);
console.log("WE HERE__________");
async function testBionics(text){
  const responseText = await applyBionics(text);
  const newDiv = document.createElement('div');
  newDiv.innerHTML = responseText;
    // Apply some styles to make the div more noticeable
  newDiv.style.backgroundColor = 'yellow';
  newDiv.style.border = '2px solid black';
  newDiv.style.padding = '10px';
  newDiv.style.margin = '10px';
  newDiv.style.position = 'fixed';
  newDiv.style.top = '10px';
  newDiv.style.left = '10px';
  newDiv.style.zIndex = '1000';
  document.body.insertBefore(newDiv, document.body.firstChild);
}
testBionics("If you are reading this, then ReadFaster is active!");

// Test processTextNode
const testNodeContainer = document.createElement('div');
const testTextNode = document.createElement('p');
testTextNode.textContent = "This is a long long long long text, blahblahblahbalh. This is to test to see if processTextNode is working. The first few chracters of every word in this paragraph should be bolded if it is active.";
testNodeContainer.style.backgroundColor = 'green';
testNodeContainer.style.border = '2px solid black';
testNodeContainer.style.padding = '10px';
testNodeContainer.style.margin = '10px';
testNodeContainer.style.position = 'fixed';
testNodeContainer.style.top = '10px';
testNodeContainer.style.left = '10px';
testNodeContainer.style.zIndex = '1000';
testNodeContainer.appendChild(testTextNode);
document.body.insertBefore(testNodeContainer, document.body.firstChild);
processNode(testNodeContainer);

// Set up mutator to watch for updates in the DOM tree then run again(for React Apps)
console.log("selecting the body element...");
const targetNode = document.querySelector('body'); // The root element where React renders the app)
console.log("the body element is: ", targetNode);
console.log(targetNode);
const observerConfig = { childList: true, subtree: true };

const observer = new MutationObserver(async (mutationsList) => {
  console.log("HERE in the cbserver callback functino!");
  for (const mutation of mutationsList) {
    await processNode(mutation);
    // if (mutation.type === 'childList') {
    //   processNode(mutation);
    // }
  }
});

observer.observe(targetNode, observerConfig);