// Returns the HTML version of a paragraph in bionics reading version with the help of an API
// Should NOT be used outside processTextNode, because this itself doesn't give it the wrapping span class it should have
async function applyBionicswithAPI(text) {
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
      return response;
    })
    .catch(err => {
      console.error(err);
    });
  const responseText = await response.text();
  console.log(responseText);
  return responseText;
}

// My attempt to reverse engineer the bionics reading algorithm
async function applyBionics(text) {
  // ratios of splitting the word
  const RATIO = 0.5;

  // Split the paragraph into words using spaces
  const words = text.split(' ');

  // Iterate over each word and wrap the front half in <b> tags
  const transformedWords = words.map(word => {
    const regex = /[\w']+/g;
    const matches = word.matchAll(regex);
    let result = '';
    let i = 0;
    for(const match of matches) {
      const startIndex = match.index;
      const matchLength = match[0].length;
      const halfLength = Math.floor(matchLength * RATIO);
      const frontHalf = word.slice(startIndex, startIndex + halfLength);
      const backHalf = word.slice(startIndex + halfLength, startIndex + matchLength);
      result += `${word.slice(i, startIndex)}<b>${frontHalf}</b>${backHalf}`
      i = startIndex + matchLength;
    }
    result += word.slice(i, word.length);
    return result;
  });

  // Join the transformed words back into a paragraph
  const result = transformedWords.join(' ');
  console.log("RESULTS: ", result);
  return result;
}

// Update a whole textnode to be bionics reading compatable
async function processTextNode(textNode) {
  if (textNode.textContent.trim() !== '') {
    console.log('here in processTextNode');
    console.log('the text content is: ', textNode.textContent);
    const bionicHTML = await applyBionics(textNode.textContent);
    const tempElement = document.createElement('span');
    tempElement.innerHTML = bionicHTML;
    tempElement.className = "bionicsReadable";
    textNode.parentNode.insertBefore(tempElement, textNode);
    textNode.parentNode.removeChild(textNode);
  }
}

// Update a node and all it's children to be bionics reading compatable
async function processNode(node) {
  console.log(node);
  if(node.className === "bionicsReadable"){
    return;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    await processTextNode(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const childNode of node.childNodes) {
      await processNode(childNode);
    }
  }
}

// processNode(document.body);
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


async function main() {
  // await testBionics("If you are reading this, then ReadFaster is active!");

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
  await processNode(testNodeContainer);

  // Process the entire page within the body tag
  await processNode(document.body);

  // Set up mutator to watch for updates in the DOM tree then run again(for React Apps)
  // console.log("selecting the body element...");
  // const targetNode = document.querySelector('body'); // The root element where React renders the app)
  // console.log("the body element is: ", targetNode);
  // console.log("setting up mutation observer");
  // const observerConfig = { childList: true, subtree: true };

  // const observer = new MutationObserver(async (mutationsList) => {
  //   observer.disconnect();
  //   console.log("HERE mutation observer calllback!");
  //   for (const mutation of mutationsList) {
  //     if (mutation.type === 'childList') {
  //       processNode(mutation);
  //     }
  //   }
  //   observer.observe(targetNode, observerConfig);
  // });

  // observer.observe(targetNode, observerConfig);
}

main();