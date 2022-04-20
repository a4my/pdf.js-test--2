const url = '../docs/pdf-1.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;
  scale = 0.8;

  const canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

  // Comment out for 2 pages rendering
  const secondCanvas = document.querySelector('#pdf-render-2')
  const ctx2 = secondCanvas.getContext('2d')
  
// Render the page
const renderPage = num => {
    if(num === 1) {
        pageIsRendering = true;
      
        // Get page
        pdfDoc.getPage(num).then(page => {
          // Set scale
          const viewport = page.getViewport({ scale });
          secondCanvas.height = viewport.height;
          secondCanvas.width = viewport.width;
          secondCanvas.style.border = '1px solid #000'
      
          const renderCtx = {
            canvasContext: ctx2,
            viewport
          };
      
          page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
      
            if (pageNumIsPending !== null) {
              renderPage(pageNumIsPending);
              pageNumIsPending = null;
            }
          });
      
          // Output current page
          document.querySelector('#page-num').textContent = num;
          document.querySelector('#second-page-num').textContent = null

          // Remove the first empty canvas
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.border = 'hidden'

          // Remove the dash in the page info box
          document.querySelector('.dash').style.display = 'none'
          document.querySelector('.dash').style.marginRight = '0px'
          document.querySelector('#page').textContent = 'Page'

        });
    }

    
    if(num % 2 === 0) {
        canvas.style.display = 'block'
        canvas.style.border = '1px solid #000'

        pageIsRendering = true;
        // Get page
        pdfDoc.getPage(num).then(page => {
          // Set scale
          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
      
          const renderCtx = {
            canvasContext: ctx,
            viewport
          };
      
          page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
      
            if (pageNumIsPending !== null) {
              renderPage(pageNumIsPending);
              pageNumIsPending = null;
            }
          });
      
          // Output current page
          document.querySelector('#page-num').textContent = num;
          document.querySelector('#page').textContent = 'Pages'
        });
    
      
        // Comment out for 2 pages rendering
        let secondPage = num + 1
        

            pdfDoc.getPage(secondPage).then(page => {
            // Set Scale
            const viewport = page.getViewport({ scale })
            secondCanvas.height = viewport.height
            secondCanvas.width = viewport.width
        
            const renderCtx = {
                canvasContext: ctx2,
                viewport
            }
        
            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false
        
                if(pageNumIsPending !== null) {
                    renderPage(pageNumIsPending)
                    pageNumIsPending = null
                }
            })
    
            document.querySelector('.dash').style.display = 'block'
            
            // Output current page 
            document.querySelector('#second-page-num').textContent = secondPage
            })  
        

        
    }
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }

  if(pageNum === 1 || pageNum === 2) {
      pageNum--
  } else {
      pageNum -= 2
  }
  console.log(pageNum)

  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum + 2 > pdfDoc.numPages) {
    return
  }
  
  if(pageNum === 1) {
    pageNum++
} else {
    pageNum += 2
}
console.log(pageNum)


  queueRenderPage(pageNum);
};

// Get Document
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    console.log(pdfDoc._pdfInfo.numPages) 
    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
  })
  .catch(err => {
    // Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    // Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
  });

  
// Zoom out
function zoomOut() {
    scale -= 0.1
    renderPage(pageNum)
    }

// Zoom in
function zoomIn() {
    scale += 0.1
    renderPage(pageNum)
    }

// Move to page 1
function skipToFirstPage() {
    console.log(pageNum)

    pageNum = 1
    renderPage(1)
}

//Move to last page
function skipToLastPage() {
    console.log(pageNum)
    pageNum = pdfDoc._pdfInfo.numPages -1
    renderPage(pdfDoc._pdfInfo.numPages - 1)
}

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);

document.querySelector('#zoom-in').addEventListener('click', zoomIn)
document.querySelector('#zoom-out').addEventListener('click', zoomOut)

document.querySelector('#chevron-left').addEventListener('click', skipToFirstPage)
document.querySelector('#chevron-right').addEventListener('click', skipToLastPage)