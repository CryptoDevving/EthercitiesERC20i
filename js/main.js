let startTimer = performance.now();
let counter = 0
let n = 10000
//avg 0.005 ms
for (let i = 1; i < n; i*=2) {
  counter = +i
}
console.log("begin")

// Initialize an empty object to store text content
const svgData = [];

fetch('http://localhost:3000/svg-files')
    .then(response => response.json())
    .then(svgFiles => {
        // Clear the array
        svgData.length = 0;

        // Store SVG contents in the array
        svgFiles.forEach(svg => {
            svgData.push(svg.content);
        });

        // Now svgData contains all SVG contents as strings
	

const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

let canvas, bg, fg, bbg, terrain, cf, ntiles, tileWidth, tileHeight, map, map2, map3, map4, index1, index2, index3, index4, tools, tool, activeTool, isPlacing, gridLength2, selectedSprite
selectedSprite = -1

var keypressed = ' '
var rotate = 0

// init svg array

allSVGdata = []

for (let i = 0; i < svgData.length; i++) {
	allSVGdata.push([svgData[i],null,null,null,null,null])	
}

// init canvas array
const canvasArray = []

// groom svg data on array, prepare preimages
for (let i = 0; i < allSVGdata.length; i++) {
	allSVGdata[i][0] = allSVGdata[i][0].replace(/\\/g, '')
	allSVGdata[i][0] = allSVGdata[i][0].replace(/#/g,'%23')
  
  const viewBoxMatch = allSVGdata[i][0].match(/viewBox="(\d+) (\d+) (\d+) (\d+)"/);
	const viewBoxValues = {
        width: parseInt(viewBoxMatch[3]),
        height: parseInt(viewBoxMatch[4])
    };
  
  
  allSVGdata[i][0] = allSVGdata[i][0].replace(/viewBox="\d+ \d+ \d+ \d+"/,'')
  allSVGdata[i][0] = "data:image/svg+xml;utf8," + allSVGdata[i][0]
      // Create a new canvas element
    const innerCanvas = document.createElement("canvas");
    
    // Set the width and height of the canvas
    innerCanvas.width = viewBoxValues.width
    innerCanvas.height = viewBoxValues.height
    
    // Isometric Offset
    var objSizeOffset = 0
    var objSize = 0
	//var tileAdjustX = 0
    if (viewBoxValues.width == 32) {objSizeOffset = 0;objSize = 1;tileAdjustX = 0} //single tile
    if (viewBoxValues.width == 64) {objSizeOffset = 24;objSize = 2;tileAdjustX = 16} //2x2 tile
    if (viewBoxValues.width == 96) {objSizeOffset = 32;objSize = 3;tileAdjustX = 32} //3x3 tile
    if (viewBoxValues.width == 128) {objSizeOffset = 48;objSize = 4;tileAdjustX = 48} //4x4 tile
    if (viewBoxValues.width == 160) {objSizeOffset = 60;objSize = 5;tileAdjustX = 64} //5x5 tile
    if (viewBoxValues.width == 192) {objSizeOffset = 80;objSize = 6;tileAdjustX = 80} //6x6 tile
    
    // Sprite offset
    const offset = {
        x: -1*(viewBoxValues.width/2),
        y: -1*(viewBoxValues.height - viewBoxValues.width/2)
    };
    allSVGdata[i][2] = offset.x
    allSVGdata[i][3] = offset.y-objSizeOffset
    allSVGdata[i][4] = objSize
	allSVGdata[i][5] = viewBoxValues.height
    //console.log(allSVGdata[i][2])
    //console.log(allSVGdata[i][3])

    // Get the 2D context of the canvas
    const innerContext = innerCanvas.getContext("2d");

    // Store the canvas and context in the array as a new object
    canvasArray.push({ innerCanvas, innerContext });
    const image = new Image()
    image.src = allSVGdata[i][0]
		allSVGdata[i][1] = image
    
    //load last image
    if (i==(allSVGdata.length-1)) {
    	image.onload = _ => init()
    }
}

const init = () => {
	//load preimages
  for (let i = 0; i < canvasArray.length; i++) {
		canvasArray[i].innerContext.drawImage(allSVGdata[i][1], 0, 0 )
    }


	//tool = [0,0]

	const gridLength = 64 //above 256 i need a sprite only map for terrain i think to save computation... 128+256 is 9 times the area of simcity 2k
  	map = [];

	//map[i][j] = [0,0,0,0,0] [sprite, height, slope, tilecropX, tilecropY]     land/resource type
  	//later: add tile owner, property owner, connection on/off, power==yes etc
  	//two height raise/lower modes: 9 tile slope or 1 tile cliff raise
  	//add water = 9 tile shore
	for (let i = 0; i < gridLength; i++) {
  		map[i] = [];
  		for (let j = 0; j < gridLength; j++) {
    			map[i][j] = [0,0,0,0,0]
  		}
	}
 
  map2 = map2DArray(map)
  rotateNinetyDeg(map2)
  
  map3 = map2DArray(map2)
  rotateNinetyDeg(map3)

  map4 = map2DArray(map3)
  rotateNinetyDeg(map4)
  
  
  	//resource/land types: lumber(different forest tiles), desert, swamp, plains, wood, permafrost, dirt, stone, oil, coal, gas, copper, iron, gold, silver, gems, water, ice(frozen river), shore, lava, islet and waterhole(type of shores?)  water+slope = rapids  water+cliff = waterfall

	terrain = $("#bbg")
	terrain.width = 32*gridLength
	terrain.height = 32*gridLength
	w = 32*gridLength
	h = 32*gridLength

	ntiles = gridLength
	tileWidth = 32
	tileHeight = 16

	bbg = terrain.getContext("2d")
	bbg.translate(w/2,tileHeight*2)

	canvas = $("#bg")
  	canvas.width = terrain.width
	canvas.height = terrain.height
	//w = 32*gridLength
	//h = 32*gridLength
	texWidth = 12
	texHeight = 6
	bg = canvas.getContext("2d")
	
	
	bg.translate(w/2,tileHeight*2)
	
  	gridLength2 = gridLength

	drawTerrain()

	fg = $('#fg')
	fg.width = terrain.width
	fg.height = terrain.height
	cf = fg.getContext('2d')
	cf.translate(w/2,tileHeight*2)
  document.addEventListener('keydown', e => {keypressed = e.key})
  document.addEventListener('keyup', e => {keypressed = null})
	fg.addEventListener('mousemove', viz)
	fg.addEventListener('contextmenu', e => e.preventDefault())
	fg.addEventListener('mouseup', unclick)
	fg.addEventListener('mousedown', click)
	//fg.addEventListener('touchend', click)
	//fg.addEventListener('pointerup', click)





// makes main start button work
document.getElementById("startButton").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("startMenu");
    
    if (element.style.display === "none") {
        element.style.display = "block"; // Show the element
    } else {
        element.style.display = "none";  // Hide the element
    }
});

// Add an event listener to the document for clicks anywhere else but the start menu
document.addEventListener("mousedown", function(event) {
    var element = document.getElementById("startMenu");

    // Check if the click is outside the startMenu
    if (!element.contains(event.target) && event.target.id !== "startButton") {
        element.style.display = "none"; // Hide the element
    }

    // Check if the click is outside the closebox
	const closeButtons = document.querySelectorAll(".toolClose");

	// Loop through each button and add an event listener
	closeButtons.forEach(button => {
		if (!button.contains(event.target)) {
			button.style.display = "none";
		}
	});

});




let index = 0;

// allows windows to be draggable:
const draggables = document.querySelectorAll(".draggable");
//const draggable = document.getElementById("draggable");


let previousSelectedWindow = $c('div');

draggables.forEach(draggable => {
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

draggable.addEventListener("mousedown", (e) => {
    // Set dragging flag to true
    isDragging = true;

    // Calculate the offset of the mouse click within the element
    offsetX = e.clientX - draggable.getBoundingClientRect().left;
    offsetY = e.clientY - draggable.getBoundingClientRect().top;
    //index = draggable.style.zIndex;
	index++;
	console.log(index);
	draggable.style.zIndex = `${index}`;

    draggable.style.top = `${e.clientY - offsetY}px`;

    // Change the cursor style
    draggable.style.cursor = "grabbing";

	// adjust z-index of menu and toolbar
	var foregroundUI = document.getElementById("menu and toolbar");
	foregroundUI.style.zIndex = `${index + 1}`;

	// select toolbar and highlight
	console.log(draggable.id);
	var bottombar = document.getElementById(`${draggable.id} Toolbar`);

	if (!((previousSelectedWindow)==(bottombar))){
		bottombar.className = "sc-jSFkmK QhbSF toolbar-item";
		previousSelectedWindow.className = "sc-jSFkmK gmqifL toolbar-item";
		previousSelectedWindow = bottombar;
	}
});

document.addEventListener("mousemove", (e) => {
    // Only move the element if the mouse is down
    if (isDragging) {
        // Calculate the new position of the draggable div
        draggable.style.left = `${e.clientX - offsetX}px`;
        draggable.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener("mouseup", () => {
    // Stop dragging when the mouse is released
    isDragging = false;

    // Restore the cursor style
    draggable.style.cursor = "grab";
});

// Change the cursor to indicate the div is draggable
draggable.style.cursor = "grab";
});




// MENU 2 TOOLBAR CODE:
const toolbar = document.getElementById("toolbar");
const toolbarMenu = document.getElementById("headerWide"); //headerWide

// Select all elements with the class 'addWindowButton'
const buttons = document.querySelectorAll(".menuItem");

// Loop through each button and add an event listener
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const windowId = button.getAttribute('data-id');

        // Check if a window with this ID already exists
        if (document.querySelector(`.toolbar-item[data-id="${windowId}"]`)) {
            //alert(`Window with ID ${windowId} already exists!`);
            return;
        }

    	var element = document.getElementById(windowId);
	console.log(windowId)
	//var element2 = document.getElementById(`${windowId} draggable`);
	index++;
	element.style.zIndex = `${index}`;
    
    	if (element.style.display === "none") {
        	element.style.display = "block"; // Show the element
    	} else {
        	element.style.display = "none";  // Hide the element
    	}

        // Create the new button element
        const newWindow = document.createElement('button');
        newWindow.type = 'button';
        newWindow.className = 'sc-jSFkmK gmqifL toolbar-item';
        newWindow.style = 'margin-top:1px;margin-bottom:1px;margin-left:2px;width:15rem;';
        newWindow.setAttribute('data-id', windowId);
	newWindow.setAttribute('id', `${windowId} Toolbar`);

	//highlight on creation
	newWindow.className = "sc-jSFkmK QhbSF toolbar-item";

	if (!((previousSelectedWindow)==(newWindow))){
		previousSelectedWindow.className = "sc-jSFkmK gmqifL toolbar-item";
		previousSelectedWindow = newWindow;
	}

        // Create the inner div for the button content
        const innerDiv = document.createElement('div');
        innerDiv.style = 'display:flex;justify-content:flex-start;width:100%;overflow:hidden;white-space: nowrap;';

        // Create the img element
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAJ1BMVEUAAACAgIDAwMAAAAD///8AgIAA//8AAP+AAIAAAID//wCAgAD/AADTdjT5AAAAAXRSTlMAQObYZgAAAAFiS0dEBI9o2VEAAAAHdElNRQfiBBMBJTN2lZVeAAABBklEQVQoz1XQsWrDMBAGYBlBabcKefJmp1O8uFKbwdkSlUB2v4K9hlK4vkKeoHSsm0nZoq1Z82A9KYokH9igD37dnQixxWyRWFmFVTYJzKSUU3jrugAuf4W+72/5Vwt3ALDz+QCfPv/MWNkMCBsPwrZF+LDQIWBM8qECBR5elFJ8eFcbhBK7YkQKPsATgG+LlzK+uHaRLo9fc/8F8E1yZYu7oR/2e0JyTGDeAQ2rsASouyNZPanwaNS/itZsAgUvvNygXWr9mADX3BQ/EbLx9De2vxGKup7XSxMgO2xP49nICO1B1x6InTRft6uzEbMwprisj0ZUcQcqLhLfLdmEitXk7PbG/z/0JkoyIM7uGAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wNC0xOVQwMTozNzo1MS0wNDowMGGLZNcAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDQtMTlUMDE6Mzc6NTEtMDQ6MDAQ1txrAAAAAElFTkSuQmCC';
        img.alt = 'router img';
        img.style = 'height:20px;margin-right:4px';

        // Create the text node for the data-id text
        const textNode = document.createTextNode(`${windowId}`);

        // Append img and text to the innerDiv
        innerDiv.appendChild(img);
        innerDiv.appendChild(textNode);

        // Append the innerDiv to the newWindow button
        newWindow.appendChild(innerDiv);

        // Append the new window button to the toolbar
        toolbar.appendChild(newWindow);




	const newAboveButton = document.createElement('button');
        newAboveButton.type = 'button';
        newAboveButton.className = 'sc-jSFkmK gmqifL toolbar-item toolClose';
        newAboveButton.style = `
            margin-top:1px;
            margin-bottom:1px;
            width:15rem;
            background-color:lightgrey;
            position:absolute;
            bottom:100%;  /* Position it directly above the newWindow */
            left:0;
            display:none; /* Hide by default */
		overflow:hidden;
		white-space: nowrap;
        `;
        newAboveButton.textContent = `Close ${windowId}`;

        // Append the above button as a child of the new window
        newWindow.appendChild(newAboveButton);




	// Add event listener to the new button to do stuff to it when clicked
        newWindow.addEventListener('click', () => {
            //toolbar.removeChild(newWindow);
		index++;
		console.log(index);
		element.style.zIndex = `${index}`;
		
		
		// adjust z-index of menu and toolbar
		var foregroundUI = document.getElementById("menu and toolbar");
		foregroundUI.style.zIndex = `${index + 1}`;

	//highlight on click
	if (!((previousSelectedWindow)==(newWindow))){
		newWindow.className = "sc-jSFkmK QhbSF toolbar-item";
		previousSelectedWindow.className = "sc-jSFkmK gmqifL toolbar-item";
		previousSelectedWindow = newWindow;
	}


	});




	// Add right-click (contextmenu) event listener to show the above close button
        newWindow.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent default right-click menu
            newAboveButton.style.display = 'block'; // Show the above button
        });

        // Add event listener to the above close button for any action
        newAboveButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent's event listener
            //alert(`Above button for ${windowId} clicked!`);
    		element.style.display = "none";  // Hide the element
    		toolbar.removeChild(newWindow);
		adjustToolbarItems(newWindow);
        });



	// adjust z-index of menu and toolbar
	var foregroundUI = document.getElementById("menu and toolbar");
	foregroundUI.style.zIndex = `${index + 1}`;

	adjustToolbarItems(newWindow)
    });
});

function adjustToolbarItems(window) {
    const toolbarItems = document.querySelectorAll('.toolbar-item');
	const toolbarCloseItems = document.querySelectorAll('.toolClose');
    const toolbarWidth = toolbarMenu.getBoundingClientRect();
    var boxWidth = toolbarWidth.width;
	console.log(boxWidth)
	console.log(toolbarItems.length)
	
	
 
    // Calculate the width per toolbar item
    const itemWidth = Math.min(boxWidth/((toolbarItems.length/2)*1.3),200); // Minimum width of 50px
	console.log(itemWidth)

    toolbarItems.forEach(item => {
        item.style.width = `${itemWidth}px`;
    });

	toolbarCloseItems.forEach(item => {
        item.style.width = `${itemWidth}px`;
    });

}

// opens Agricultural Sprites
document.getElementById("agricultural").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("tools2");
    
if (element.style.display == "none") {
        element.style.display = "flex"; // Show the element
    } else {
        element.style.display = "none";  // Hide the element
    }
	
});

// closes Tool Menu
document.getElementById("close Tool Menu").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Tool Menu");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Tool Menu Toolbar"); 
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});

// closes Summary
document.getElementById("close Summary").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Summary");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Summary Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Chat
document.getElementById("close Chat").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Chat");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Chat Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Connections
document.getElementById("close Connections").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Connections");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Connections Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Properties
document.getElementById("close Properties").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Properties");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Properties Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Land
document.getElementById("close Land").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Land");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Land Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Assets
document.getElementById("close Assets").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Assets");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Assets Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Links
document.getElementById("close Links").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Links");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Links Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes MasterMap
document.getElementById("close MasterMap").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("MasterMap");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("MasterMap Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes MiniMap
document.getElementById("close MiniMap").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("MiniMap");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("MiniMap Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Map Loader
document.getElementById("close Map Loader").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Map Loader");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Map Loader Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Game Type
document.getElementById("close Game Type").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Game Type");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Game Type Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});


// closes Welcome
document.getElementById("close Welcome").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Welcome");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Welcome Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});

// closes My Wallet
document.getElementById("close My Wallet").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("My Wallet");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("My Wallet Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});

// closes About
document.getElementById("close About").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("About");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("About Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});

// closes Router
document.getElementById("close Router").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Router");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Router Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});

// closes Liquidity Event 1
document.getElementById("close Liquidity Event #1").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Liquidity Event #1");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Liquidity Event #1 Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});

// closes Liquidity Event 2
document.getElementById("close Liquidity Event #2").addEventListener("click", function() {
	console.log("click registered")
    var element = document.getElementById("Liquidity Event #2");
    
    element.style.display = "none";  // Hide the element

    var element2 = document.getElementById("Liquidity Event #2 Toolbar");
    toolbar.removeChild(element2);
	adjustToolbarItems(element2);
	
});
	
  
  //tool = [0,0]
  tools = $('#tools')
  tools2 = $('#tools2')

	let toolCount = 0
	for(let i = 0; i < svgData.length; i++){
		//for(let j = 0; j < texWidth; j++){
			const div = $c('div');
			div.id = `tool_${toolCount++}`
			div.style.display = "block"
			/* width of 132 instead of 130  = 130 image + 2 border = 132 */
			const encodedSVG = encodeSVG(svgData[i]);
      div.style.backgroundImage = `url('${encodedSVG}')`;
			//div.style.backgroundPosition = `-${j*130+2}px -${i*230}px`
			div.addEventListener('click', e => {
				//tool = [i,j]
				if (activeTool)
					$(`#${activeTool}`).classList.remove('selected')
          
				activeTool = e.target.id
        //console.log(activeTool)
        const parts = activeTool.split('_')
    		// Convert the last part to an integer
        selectedSprite = parseInt(parts[parts.length - 1], 10) + 1
        console.log(selectedSprite)
				$(`#${activeTool}`).classList.add('selected')
			})
			tools.appendChild( div )
		//}
	}


	toolCount = 0
	for(let i = 0; i < svgData.length; i++){
		//for(let j = 0; j < texWidth; j++){
			const div = $c('div');
			div.id = `tool_${toolCount++}`
			div.style.display = "block"
			/* width of 132 instead of 130  = 130 image + 2 border = 132 */
			const encodedSVG = encodeSVG(svgData[i]);
      div.style.backgroundImage = `url('${encodedSVG}')`;
			//div.style.backgroundPosition = `-${j*130+2}px -${i*230}px`
			div.addEventListener('click', e => {
				//tool = [i,j]
				if (activeTool)
					$(`#${activeTool}`).classList.remove('selected')
          
				activeTool = e.target.id
        //console.log(activeTool)
        const parts = activeTool.split('_')
    		// Convert the last part to an integer
        selectedSprite = parseInt(parts[parts.length - 1], 10) + 1
        console.log(selectedSprite)
				$(`#${activeTool}`).classList.add('selected')
			})
			tools2.appendChild( div )
		//}
	}
  

	
	let endTimer = performance.now();
	let time = Math.round((endTimer - startTimer) * 1000) / 1000
	console.log(`Loading took ${time} milliseconds.`)
}

function encodeSVG(svgString) {
    // Escape characters that need to be encoded
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}


const click = e => {
	console.log("click")
	const pos = getPosition(e)
	if (pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles) {
  	if (map[pos.x][pos.y][2] == 0) { // if slope is 0(cant modify sloped surface)
      if (e.ctrlKey) { // DELETE SPRITE FUNCTION
	
	
	let run3 = 0
	let transferX = 0
 	let transferY = 0
	let Xcoord = 0
	let Ycoord = 0



	if (((rotate%4)+4)%4 == 0) {						// delete sprite in all 4 maps if you are in view1
	if(map[pos.x][pos.y][0] != 0) { // avoid the no sprite error (remove for use as diagnostic)
		run3 = allSVGdata[map[pos.x][pos.y][0]-1][4]
		Xcoord = map[pos.x][pos.y][3]
		Ycoord = map[pos.x][pos.y][4]
	}
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map[pos.x+Xcoord-i][pos.y+Ycoord-j][0] = 0	
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map4[run3-1+pos.x-Ycoord-i][pos.y+Xcoord-j][0] = 0	
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map3[run3-1+pos.x-Xcoord-i][run3-1+pos.y-Ycoord-j][0] = 0
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map2[pos.x+Ycoord-i][run3-1+pos.y-Xcoord-j][0] = 0	
		}
	}
	}

	

	if (((rotate%4)+4)%4 == 1) {						// delete sprite in all 4 maps if you are in view2
	if(map2[pos.x][pos.y][0] != 0) { // avoid the no sprite error (remove for use as diagnostic)
		run3 = allSVGdata[map2[pos.x][pos.y][0]-1][4]
		Xcoord = map2[pos.x][pos.y][3]
		Ycoord = map2[pos.x][pos.y][4]
	}
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map2[pos.x+Xcoord-i][pos.y+Ycoord-j][0] = 0		
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map[run3-1+pos.x-Ycoord-i][pos.y+Xcoord-j][0] = 0	
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map4[run3-1+pos.x-Xcoord-i][run3-1+pos.y-Ycoord-j][0] = 0
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map3[pos.x+Ycoord-i][run3-1+pos.y-Xcoord-j][0] = 0	
		}
	}
	}





	if (((rotate%4)+4)%4 == 2) {						// delete sprite in all 4 maps if you are in view3
	if(map3[pos.x][pos.y][0] != 0) { // avoid the no sprite error (remove for use as diagnostic)
		run3 = allSVGdata[map3[pos.x][pos.y][0]-1][4]
		Xcoord = map3[pos.x][pos.y][3]
		Ycoord = map3[pos.x][pos.y][4]
	}
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map3[pos.x+Xcoord-i][pos.y+Ycoord-j][0] = 0		
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map2[run3-1+pos.x-Ycoord-i][pos.y+Xcoord-j][0] = 0	
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map[run3-1+pos.x-Xcoord-i][run3-1+pos.y-Ycoord-j][0] = 0
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map4[pos.x+Ycoord-i][run3-1+pos.y-Xcoord-j][0] = 0	
		}
	}
	}




	if (((rotate%4)+4)%4 == 3) {						// delete sprite in all 4 maps if you are in view4
	if(map4[pos.x][pos.y][0] != 0) { // avoid the no sprite error (remove for use as diagnostic)
		run3 = allSVGdata[map4[pos.x][pos.y][0]-1][4]
		Xcoord = map4[pos.x][pos.y][3]
		Ycoord = map4[pos.x][pos.y][4]
	}
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map4[pos.x+Xcoord-i][pos.y+Ycoord-j][0] = 0		
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map3[run3-1+pos.x-Ycoord-i][pos.y+Xcoord-j][0] = 0	
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map2[run3-1+pos.x-Xcoord-i][run3-1+pos.y-Ycoord-j][0] = 0
		}
	}
	// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	for (let i = 0; i < run3; i++) {
			for (let j = 0; j < run3; j++) {
				map[pos.x+Ycoord-i][run3-1+pos.y-Xcoord-j][0] = 0	
		}
	}
	}	

	
        //map[pos.x][pos.y][0] = 0  //delete on ctrl
      } else if (e.altKey) {
        //map[pos.x][pos.y][0] = 3  // put something here
      } else if (keypressed === "z") {  // rotate map
       rotate++
      } else if (keypressed === "x") {  // rotate map
       rotate--
      } else if (keypressed === "q") {  // draw cliff up
        map[pos.x][pos.y][1] += 1
      } else if (keypressed === "a") {   // draw hole down
        map[pos.x][pos.y][1] -= 1
      }  else if (keypressed === "w") {   // draw mound up
        
        // slopes:w
        if((map[pos.x][pos.y][1] == map[pos.x+1][pos.y+1][1]) && map[pos.x+1][pos.y+1][2] == 0) {
        	map[pos.x+1][pos.y+1][2] += 1}
        else if ((map[pos.x][pos.y][1] != map[pos.x+1][pos.y+1][1]) && (map[pos.x+1][pos.y+1][2] == 0)){ console.log('test')}
        	// if heights are not the same & no adjacent slope, do nothing
        else {
          map[pos.x+1][pos.y+1][1] +=1
          map[pos.x+1][pos.y+1][2] =0
          }
          
          
          
        if((map[pos.x][pos.y][1] == map[pos.x][pos.y+1][1]) && map[pos.x][pos.y+1][2] == 0) {
        	map[pos.x][pos.y+1][2] += 2}
        else if ((map[pos.x][pos.y][1] != map[pos.x][pos.y+1][1]) && (map[pos.x][pos.y+1][2] == 0)){ console.log('test')}
                else {
          map[pos.x][pos.y+1][1] +=1
          map[pos.x][pos.y+1][2] =0
          }
          
          
          
          
        if((map[pos.x][pos.y][1] == map[pos.x-1][pos.y+1][1]) && map[pos.x-1][pos.y+1][2] == 0) {
        	map[pos.x-1][pos.y+1][2] += 3}
        else if ((map[pos.x][pos.y][1] != map[pos.x-1][pos.y+1][1]) && (map[pos.x-1][pos.y+1][2] == 0)){ console.log('test')}
                else {
          map[pos.x-1][pos.y+1][1] +=1
          map[pos.x-1][pos.y+1][2] =0
          }
          
          
          
          
        if((map[pos.x][pos.y][1] == map[pos.x-1][pos.y][1]) && map[pos.x-1][pos.y][2] == 0) {
        	map[pos.x-1][pos.y][2] += 4}
          else if ((map[pos.x][pos.y][1] != map[pos.x-1][pos.y][1]) && (map[pos.x-1][pos.y][2] == 0)){ console.log('test')}
                else {
          map[pos.x-1][pos.y][1] +=1
          map[pos.x-1][pos.y][2] =0
          }
          
          
          
        if((map[pos.x][pos.y][1] == map[pos.x-1][pos.y-1][1]) && map[pos.x-1][pos.y-1][2] == 0) {
        	map[pos.x-1][pos.y-1][2] += 5}
          else if ((map[pos.x][pos.y][1] != map[pos.x-1][pos.y-1][1]) && (map[pos.x-1][pos.y-1][2] == 0)){ console.log('test')}
                else {
          map[pos.x-1][pos.y-1][1] +=1
          map[pos.x-1][pos.y-1][2] =0
          }
          
          
          
        if((map[pos.x][pos.y][1] == map[pos.x][pos.y-1][1]) && map[pos.x][pos.y-1][2] == 0) { //if heights are the same & no slopes, raise adjacent
        	map[pos.x][pos.y-1][2] += 6}
          else if ((map[pos.x][pos.y][1] != map[pos.x][pos.y-1][1]) && (map[pos.x][pos.y-1][2] == 0)){ console.log('test')
        	// if heights are not the same & no adjacent slope, do nothing
        }
        //else if ((map[pos.x][pos.y][1] != map[pos.x][pos.y-1][1]) && (map[pos.x][pos.y-1][2] != 0)){ console.log('test')
        	// if heights are not the same &  adjacent slope, raise height+slope (use on cornersa)
         // map[pos.x][pos.y-1][1] +=1
         // map[pos.x][pos.y-1][2] += 6
        //}
                else { //if there is adjacent slope, change to cliff
          map[pos.x][pos.y-1][1] +=1
          map[pos.x][pos.y-1][2] =0
          }
          
          
        if((map[pos.x][pos.y][1] == map[pos.x+1][pos.y-1][1]) && map[pos.x+1][pos.y-1][2] == 0) {
        	map[pos.x+1][pos.y-1][2] += 7}
          else if ((map[pos.x][pos.y][1] != map[pos.x+1][pos.y-1][1]) && (map[pos.x+1][pos.y-1][2] == 0)){ console.log('test')}

                else {
          map[pos.x+1][pos.y-1][1] +=1
          map[pos.x+1][pos.y-1][2] =0
          }
          
          
          
        if((map[pos.x][pos.y][1] == map[pos.x+1][pos.y][1]) && map[pos.x+1][pos.y][2] == 0) {
        	map[pos.x+1][pos.y][2] += 8}
          else if ((map[pos.x][pos.y][1] != map[pos.x+1][pos.y][1]) && (map[pos.x+1][pos.y][2] == 0)){ console.log('test')}
        else {
          map[pos.x+1][pos.y][1] +=1
          map[pos.x+1][pos.y][2] =0
          }
          
          
          
          
         map[pos.x][pos.y][1] += 1 // update height last

      } else if (keypressed === "s") {  /// draw mound down
        map[pos.x][pos.y][1] -= 1

        //slopes: (should be mixed between to save?)
        map[pos.x+1][pos.y+1][2] += 1
        map[pos.x][pos.y+1][2] += 2
        map[pos.x-1][pos.y+1][2] += 3
        map[pos.x-1][pos.y][2] += 4
        map[pos.x-1][pos.y-1][2] += 5
        map[pos.x][pos.y-1][2] += 6
        map[pos.x+1][pos.y-1][2] += 7
        map[pos.x+1][pos.y][2] += 8
        
      } else { 				// set all sprites on all 4 maps per click
	let transferX = 0
 	let transferY = 0
	let run = allSVGdata[selectedSprite-1][4]
	let collisions1 = false
	let collisions2 = false
	let collisions3 = false
	let collisions4 = false
	for (let i = 0; i < run; i++) { 			// check collisions on map1
			for (let j = 0; j < run; j++) {
				if (((pos.x-i) >= 0) && ((pos.x-i) < ntiles) && ((pos.y-j) >= 0) && ((pos.y-j) < ntiles)) // check if placement in bounds
					{if (((rotate%4)+4)%4 == 0) {
					 if(map[pos.x-i][pos.y-j][0] != 0) {collisions1 = true}}
					}
				else {collisions1 = true}
			}
		}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX

	for (let i = 0; i < run; i++) { 			// check collisions on map2
			for (let j = 0; j < run; j++) {
				if (((pos.x-i+run-1) >= 0) && ((pos.x-i+run-1) < ntiles) && ((pos.y-j) >= 0) && ((pos.y-j) < ntiles)) // check if placement in bounds
					{if (((rotate%4)+4)%4 == 1){
						if(map[pos.x-i+run-1][pos.y-j][0] != 0) {collisions2 = true}
					}}
				else {collisions2 = true;}
			}
		}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX

	for (let i = 0; i < run; i++) { 			// check collisions on map3
			for (let j = 0; j < run; j++) {
				if (((pos.x-i+run-1) >= 0) && ((pos.x-i+run-1) < ntiles) && ((pos.y-j+run-1) >= 0) && ((pos.y-j+run-1) < ntiles)) // check if placement in bounds
					{if (((rotate%4)+4)%4 == 2) {
						if(map[pos.x-i+run-1][pos.y-j+run-1][0] != 0) {collisions3 = true}
					}}
				else {collisions3 = true}
			}
		}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX

	for (let i = 0; i < run; i++) { 			// check collisions on map4
			for (let j = 0; j < run; j++) {
				if (((pos.x-i) >= 0) && ((pos.x-i) < ntiles) && ((pos.y-j+run-1) >= 0) && ((pos.y-j+run-1) < ntiles)) // check if placement in bounds
					{if (((rotate%4)+4)%4 == 3) {
						if(map[pos.x-i][pos.y-j+run-1][0] != 0) {collisions4 = true}
					}}
				else {collisions4 = true}
			}
		}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	if (!collisions1) {
	for (let i = 0; i < run; i++) {
			for (let j = 0; j < run; j++) {
				if (((rotate%4)+4)%4 == 0) {
				map[pos.x-i][pos.y-j][0] = selectedSprite  //save selected sprite on click in map1 if view is map1
				map[pos.x-i][pos.y-j][3] = i //set tilecropX
				map[pos.x-i][pos.y-j][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 1 && !collisions2) {
				map2[pos.x-i][pos.y-j][0] = selectedSprite  //save selected sprite on click in map2 if view is map2
				map2[pos.x-i][pos.y-j][3] = i //set tilecropX
				map2[pos.x-i][pos.y-j][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 2 && !collisions3) {
				map3[pos.x-i][pos.y-j][0] = selectedSprite  //save selected sprite on click in map3 if view is map3
				map3[pos.x-i][pos.y-j][3] = i //set tilecropX
				map3[pos.x-i][pos.y-j][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 3 && !collisions4) {
				map4[pos.x-i][pos.y-j][0] = selectedSprite  //save selected sprite on click in map4 if view is map4
				map4[pos.x-i][pos.y-j][3] = i //set tilecropX
				map4[pos.x-i][pos.y-j][4] = j //set tilecropY
				}
			} 
	}
	}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX

	if (!collisions2) {
		
		for (let i = 0; i < run; i++) {
			for (let j = 0; j < run; j++) {
				if (((rotate%4)+4)%4 == 0 && !collisions1) {
				map4[pos.x-i+run-1][pos.y-j][0] = selectedSprite  //save selected sprite on click in map4 if view is map1
				map4[pos.x-i+run-1][pos.y-j][3] = i //set tilecropX
				map4[pos.x-i+run-1][pos.y-j][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 1) {
				map[pos.x-i+run-1][pos.y-j][0] = selectedSprite  //save selected sprite on click in map1 if view is map2
				map[pos.x-i+run-1][pos.y-j][3] = i //set tilecropX
				map[pos.x-i+run-1][pos.y-j][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 2 && !collisions3) {
				map2[pos.x-i+run-1][pos.y-j][0] = selectedSprite  //save selected sprite on click in map2 if view is map3
				map2[pos.x-i+run-1][pos.y-j][3] = i //set tilecropX
				map2[pos.x-i+run-1][pos.y-j][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 3 && !collisions4) {
				map3[pos.x-i+run-1][pos.y-j][0] = selectedSprite  //save selected sprite on click in map3 if view is map4
				map3[pos.x-i+run-1][pos.y-j][3] = i //set tilecropX
				map3[pos.x-i+run-1][pos.y-j][4] = j //set tilecropY
				}
			}	
		}
		}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX
	if (!collisions3) {
		for (let i = 0; i < run; i++) {
			for (let j = 0; j < run; j++) {
				if (((rotate%4)+4)%4 == 0 && !collisions1) {
				map3[pos.x-i+run-1][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map3 if view is map1
				map3[pos.x-i+run-1][pos.y-j+run-1][3] = i //set tilecropX
				map3[pos.x-i+run-1][pos.y-j+run-1][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 1 && !collisions2) {
				map4[pos.x-i+run-1][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map4 if view is map2
				map4[pos.x-i+run-1][pos.y-j+run-1][3] = i //set tilecropX
				map4[pos.x-i+run-1][pos.y-j+run-1][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 2) {
				map[pos.x-i+run-1][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map1 if view is map3
				map[pos.x-i+run-1][pos.y-j+run-1][3] = i //set tilecropX
				map[pos.x-i+run-1][pos.y-j+run-1][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 3 && !collisions4) {
				map2[pos.x-i+run-1][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map2 if view is map4
				map2[pos.x-i+run-1][pos.y-j+run-1][3] = i //set tilecropX
				map2[pos.x-i+run-1][pos.y-j+run-1][4] = j //set tilecropY
				}
			}	
		}
		}
				// rotate coordinates:
				transferX = pos.x
          			transferY = pos.y
     				pos.x = gridLength2-1-transferY
          			pos.y = transferX

	if (!collisions4) {
		for (let i = 0; i < run; i++) {
			for (let j = 0; j < run; j++) {
				if (((rotate%4)+4)%4 == 0 && !collisions1) {
				map2[pos.x-i][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map2 if view is map1
				map2[pos.x-i][pos.y-j+run-1][3] = i //set tilecropX
				map2[pos.x-i][pos.y-j+run-1][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 1 && !collisions2) {
				map3[pos.x-i][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map3 if view is map2
				map3[pos.x-i][pos.y-j+run-1][3] = i //set tilecropX
				map3[pos.x-i][pos.y-j+run-1][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 2 && !collisions3) {
				map4[pos.x-i][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map4 if view is map3
				map4[pos.x-i][pos.y-j+run-1][3] = i //set tilecropX
				map4[pos.x-i][pos.y-j+run-1][4] = j //set tilecropY
				}
				if (((rotate%4)+4)%4 == 3) {
				map[pos.x-i][pos.y-j+run-1][0] = selectedSprite  //save selected sprite on click in map1 if view is map4
				map[pos.x-i][pos.y-j+run-1][3] = i //set tilecropX
				map[pos.x-i][pos.y-j+run-1][4] = j //set tilecropY
				}
			}	
		}
		}console.log(collisions1,collisions2,collisions3,collisions4)
      }
    }
		isPlacing = true

		drawMap() //update changes
		cf.clearRect(-w, -h, w * 2, h * 2)
	}
}

const unclick = () => {
console.log("unclick")
	if (isPlacing)
		isPlacing = false
}

const drawTerrain = () =>{
	//bg.clearRect(-w,-h,w*2,h*2)
	bbg.clearRect(-w,-h,w*2,h*2)
  console.log('draw')
  switch (((rotate%4)+4)%4) {
  	case 0:
    	console.log("case0")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		drawTile(bbg,i,j, "green",map[i][j][1],map[i][j][2])
        	}
	}
    	break;
    case 1:
    	console.log("case1")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		drawTile(bbg,i,j, "green",map2[i][j][1],map2[i][j][2])
        	}
	}
    	break;
    case 2:
	console.log("case2")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		drawTile(bbg,i,j, "green",map3[i][j][1],map3[i][j][2])
        	}
	}
    	break;
    case 3:
    	console.log("case3")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		drawTile(bbg,i,j, "green",map4[i][j][1],map4[i][j][2])
        	}
	}
    	break;
  }
	
}

const drawMap = () =>{
	bg.clearRect(-w,-h,w*2,h*2)
	//bbg.clearRect(-w,-h,w*2,h*2)
  console.log('draw')
  switch (((rotate%4)+4)%4) {
  	case 0:
    	console.log("case0")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		//drawTile(bbg,i,j, "green",map[i][j][1],map[i][j][2])
          		for (let k = 0; k < canvasArray.length; k++){
          			if (map[i][j][0] == k + 1)
    					drawImageTile(bg,i,j,k,map[i][j][1],map[i][j][3],map[i][j][4])
				}
        	}
	}
    	break;
    case 1:
    	console.log("case1")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		//drawTile(bbg,i,j, "green",map2[i][j][1],map2[i][j][2])
          		for (let k = 0; k < canvasArray.length; k++){
          			if (map2[i][j][0] == k + 1) 
    					drawImageTile(bg,i,j,k,map2[i][j][1],map2[i][j][3],map2[i][j][4])
				}
        	}
	}
    	break;
    case 2:
	console.log("case2")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		//drawTile(bbg,i,j, "green",map3[i][j][1],map3[i][j][2])
			for (let k = 0; k < canvasArray.length; k++){
          			if (map3[i][j][0] == k + 1)
    					drawImageTile(bg,i,j,k,map3[i][j][1],map3[i][j][3],map3[i][j][4])
				}
        	}
	}
    	break;
    case 3:
    	console.log("case3")
    	for(let i = 0; i < ntiles; i++){
        	for(let j = 0; j < ntiles; j++){
          		//drawTile(bbg,i,j, "green",map4[i][j][1],map4[i][j][2])
          		for (let k = 0; k < canvasArray.length; k++){
          			if (map4[i][j][0] == k + 1)
    					drawImageTile(bg,i,j,k,map4[i][j][1],map4[i][j][3],map4[i][j][4])
				}
        	}
	}
    	break;
  }
	
}

const drawTile = (c,x,y,color,height,slopetype) => {
	var A = 0
  var B = 0
  var C = 0
  var D = 0


	switch(slopetype) {
  	case 1:
    	A = -8;
      break;
    case 2:
    	A = -8;
    	D = -8;
      break;
    case 3:
			D = -8;
      break;
    case 4:
			D = -8;
      C = -8;
      break;
    case 5:
			C = -8;
      break;
    case 6:
			C = -8;
      B = -8;
      break;
    case 7:
			B = -8
      break;
    case 8:
			A = -8
      B = -8
      break;
    }

	height = height*-8
	c.save()
	c.translate((y-x) * tileWidth/2,(x+y)*tileHeight/2)
	c.beginPath()
	c.moveTo(0,height+A)
	c.lineTo(tileWidth/2,tileHeight/2+height+B)
	c.lineTo(0,tileHeight+height+C)
	c.lineTo(-tileWidth/2,tileHeight/2+height+D)
	c.closePath()
	c.fillStyle = color
	c.fill()
  //c.stroke()  // make tiles clearer (optional)
  

  c.beginPath()
  c.moveTo(-tileWidth/2,tileHeight/2+height)
  c.lineTo(0,tileHeight+height)
  c.lineTo(0,tileHeight)
	c.lineTo(-tileWidth/2,tileHeight/2)
	c.closePath()
  if (height<0) {
  c.fillStyle = 'blue'
	c.fill()
  }
  
  c.beginPath()
  c.moveTo(0,tileHeight)
  c.lineTo(0,tileHeight+height)
  c.lineTo(tileWidth/2,tileHeight/2+height)
	c.lineTo(tileWidth/2,tileHeight/2)
	c.closePath()
  if (height<0) {
  c.fillStyle = 'red'
	c.fill()
  }
  
	c.restore()
}

const drawSelection = (c,x,y,color,height) => {
 let b = 0
 let d = 0
 let f = 0
 let g = 0
 switch (((rotate%4)+4)%4) {
 case 0:
    	break;
     case 1:
      		b = x
          d = y
          x = d
          y = gridLength2-1-b
    	break;
     case 2: 
     			b = x
          d = y
          f = gridLength2-1-d
          g = b
     			x = gridLength2-1-g
          y = f
    	break;
     case 3: 
     			b = x
          d = y
     			x = gridLength2-1-d
          y = b
    	break;
      
  }

	height = height*-8
	c.save()
	c.translate((y-x) * tileWidth/2,(x+y)*tileHeight/2)
	c.beginPath()
	c.moveTo(0,height)
	c.lineTo(tileWidth/2,tileHeight/2+height)
	c.lineTo(0,tileHeight+height)
	c.lineTo(-tileWidth/2,tileHeight/2+height)
	c.closePath()
	c.fillStyle = color
	c.fill()
  

  c.beginPath()
  c.moveTo(-tileWidth/2,tileHeight/2+height)
  c.lineTo(0,tileHeight+height)
  c.lineTo(0,tileHeight)
	c.lineTo(-tileWidth/2,tileHeight/2)
	c.closePath()
  if (height<0) {
  c.fillStyle = 'yellow'
	c.fill()
  } else if (height>0) {
  c.strokeStyle = 'black'
  c.stroke()
  }
  
  c.beginPath()
  c.moveTo(0,tileHeight)
  c.lineTo(0,tileHeight+height)
  c.lineTo(tileWidth/2,tileHeight/2+height)
	c.lineTo(tileWidth/2,tileHeight/2)
	c.closePath()
  if (height<0) {
  c.fillStyle = 'purple'
	c.fill()
  } else if (height>0) {
  c.strokeStyle = 'black'
  c.stroke()
  }
  
	c.restore()
}

const drawImageTile = (c,x,y,k,height,i,j) => { //image, x-index, y-index, sprite index, height, x-offset, y-offset
	height = height*-8
	c.save()
	c.translate((y-x) * tileWidth/2,(x+y)*tileHeight/2+height)	
	c.drawImage(canvasArray[k].innerCanvas,(allSVGdata[k][4]-1)*16+i*16-j*16,0,32,allSVGdata[k][5]-(j*8+i*8),allSVGdata[k][2]+16*(allSVGdata[k][4]-1),-1*allSVGdata[k][5]+16+(j*8+i*8),32,allSVGdata[k][5]-(j*8+i*8))
	c.restore()
}

const getPosition = e => {
	const _y =  (e.offsetY - tileHeight * 2) / tileHeight,
				_x =  e.offsetX / tileWidth - ntiles / 2
	x = Math.floor(_y-_x)
	y = Math.floor(_x+_y)
	return {x,y}
}

const getPosition2 = e => {
	
  //raw mouse values
	const _y =  (e.offsetY - tileHeight * 2) / tileHeight,
				_x =  e.offsetX / tileWidth - ntiles / 2
        
  //quadrant index sensitivity
  a = Math.floor(_y*2-_x*2)
  a = a/2
  b = Math.floor(_x*2+_y*2)
  b=b/2
  
  //return index position
	x = Math.floor(_y-_x)
	y = Math.floor(_x+_y)
  
  //check all shifted tiles for current  mouseover (by quadrant index)
  for(let i = 0; i < ntiles; i++){
        for(let j = 0; j < ntiles; j++){
          if (map[i][j][1] > 0) {
            for(let k = map[i][j][1];k > 0; k--) { //this covers all levels for the shifted tile
            	if ((a == i-k*0.5)&&(b == j-k*0.5)) {x = i;y = j;}
            	if ((a-0.5 == i-k*0.5)&&(b-0.5 == j-k*0.5)) {x = i;y = j}
            	if ((a == i-k*0.5)&&(b-0.5 == j-k*0.5)) {x = i;y = j}
            	if ((a-0.5 == i-k*0.5)&&(b == j-k*0.5)) {x = i;y = j}
            }
          }
        }
      }
 let c = 0
 let d = 0
 let f = 0
 let g = 0
 switch (((rotate%4)+4)%4) {
 case 0:
    	break;
     case 1:
      		c = x
          d = y
     			x = gridLength2-1-d
          y = c
    	break;
     case 2: 
     			c = x
          d = y
          f = gridLength2-1-d
          g = c
     			x = gridLength2-1-g
          y = f
    	break;
     case 3: 
     			c = x
          d = y
     			x = d
          y = gridLength2-1-c
    	break;
      
  }
	return {x,y}
}

//viz only detects map1!
const viz = (e) =>{
	//if (isPlacing)
		//click(e)
	const pos = getPosition2(e)
  console.log(pos.x,pos.y)
	cf.clearRect(-w,-h,w*2,h*2)
	if( pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles)
    		drawSelection(cf,pos.x,pos.y,'black',map[pos.x][pos.y][1]) 
if (selectedSprite == -1) {} else {                                         //optimize this
	if( pos.x >= 0 && pos.x < ntiles && pos.y >= 0 && pos.y < ntiles){
		let run2 = allSVGdata[selectedSprite-1][4]
			
				//if there is height this bugs out:

				if ((((rotate%4)+4)%4) == 0) {
				if (!(((pos.x) >= (run2-1)) && ((pos.x) < ntiles) && ((pos.y) >= (run2-1)) && ((pos.y) < ntiles))) {      //check if any tiles are outside boundary first
					for (let a = 0; a < run2; a++) {
						for (let b = 0; b < run2; b++) {
							drawSelection(cf,pos.x-a,pos.y-b,'red',map[pos.x][pos.y][1])    //the trick here is how to turn all the tiles red once one tile goes red
						}
					}
				}
				else {
				for (let i = 0; i < run2; i++) {
					for (let j = 0; j < run2; j++) {
						let tempX = pos.x - i
						let tempY = pos.y - j
					if (map[tempX][tempY][0] == 0) {drawSelection(cf,tempX,tempY,'lime',map[pos.x][pos.y][1])}
					else {
						drawSelection(cf,tempX,tempY,'red',map[pos.x][pos.y][1])  //detect collision with sprites, update viz
					}
				}}}}

				if ((((rotate%4)+4)%4) == 1) {
				if (!(((pos.x+(run2-1)) >= 0) && ((pos.x+(run2-1)) < ntiles) && ((pos.y) >= (run2-1)) && ((pos.y) < ntiles))) {
					for (let a = 0; a < run2; a++) {
						for (let b = 0; b < run2; b++) {
							drawSelection(cf,pos.x-a+run2-1,pos.y-b,'red',map[pos.x][pos.y][1])
						}
					}
				}
				else {
				for (let i = 0; i < run2; i++) {
					for (let j = 0; j < run2; j++) {
						let tempX = pos.x - i
						let tempY = pos.y - j
				if (((tempX+(run2-1)) >= 0) && ((tempX+(run2-1)) < ntiles) && ((tempY) >= 0) && ((tempY) < ntiles)) {

						if (map[tempX+run2-1][tempY][0] == 0) {drawSelection(cf,tempX+run2-1,tempY,'lime',0)}
						else {
							drawSelection(cf,tempX+run2-1,tempY,'red',0)}
						}
				else {
					drawSelection(cf,tempX+run2-1,tempY,'red',map[pos.x][pos.y][1])
				}
				}}}}

				if ((((rotate%4)+4)%4) == 2) {
				if (!(((pos.x+(run2-1)) >= 0) && ((pos.x+(run2-1)) < ntiles) && ((pos.y+(run2-1)) >= 0) && ((pos.y+(run2-1)) < ntiles))) {
					for (let a = 0; a < run2; a++) {
						for (let b = 0; b < run2; b++) {
							drawSelection(cf,pos.x-a+run2-1,pos.y-b+run2-1,'red',map[pos.x][pos.y][1])
						}
					}
				}
				else {
				for (let i = 0; i < run2; i++) {
					for (let j = 0; j < run2; j++) {
						let tempX = pos.x - i
						let tempY = pos.y - j
				if (((tempX+(run2-1)) >= 0) && ((tempX+(run2-1)) < ntiles) && ((tempY+(run2-1)) >= 0) && ((tempY+(run2-1)) < ntiles)) {

						if (map[tempX+run2-1][tempY+run2-1][0] == 0) {drawSelection(cf,tempX+run2-1,tempY+run2-1,'lime',0)}
						else {
							drawSelection(cf,tempX+run2-1,tempY+run2-1,'red',0)}
					}				
				else {
					drawSelection(cf,tempX+run2-1,tempY+run2-1,'red',map[pos.x][pos.y][1])
				}
				}
				}}}

				if ((((rotate%4)+4)%4) == 3) {
				if (!(((pos.x) >= (run2-1)) && ((pos.x) < ntiles) && ((pos.y+(run2-1)) >= 0) && ((pos.y+(run2-1)) < ntiles))) {
					for (let a = 0; a < run2; a++) {
						for (let b = 0; b < run2; b++) {
							drawSelection(cf,pos.x-a,pos.y-b+run2-1,'red',map[pos.x][pos.y][1])
						}
					}
				}
				else {
				for (let i = 0; i < run2; i++) {
					for (let j = 0; j < run2; j++) {
						let tempX = pos.x - i
						let tempY = pos.y - j
				if (((tempX) >= 0) && ((tempX) < ntiles) && ((tempY+(run2-1)) >= 0) && ((tempY+(run2-1)) < ntiles)) {

						if (map[tempX][tempY+(run2-1)][0] == 0) {drawSelection(cf,tempX,tempY+run2-1,'lime',0)}
						else {
							drawSelection(cf,tempX,tempY+run2-1,'red',0)}
					}
				else {
					drawSelection(cf,tempX,tempY+run2-1,'red',map[pos.x][pos.y][1])
				}
				}
				}}}
				
			} 
}}


function rotateNinetyDeg(squareMatrix) {
    let left = 0, right = squareMatrix.length - 1;
    while (left < right) {
        for (let i = 0; i < right - left; i++) {
            let top = left, bottom = right;

            // save top left
            let topLeft = squareMatrix[top][left + i];         
            
            // swap top left and bottom left
            squareMatrix[top][left + i] = squareMatrix[bottom - i][left];
           
            // swap bottom left and bottom right
            squareMatrix[bottom - i][left] = squareMatrix[bottom][right - i];
          
            // swap bottom right and top right
            squareMatrix[bottom][right - i] = squareMatrix[top + i][right];

            // swap top right and top left
            squareMatrix[top + i][right] = topLeft;

        }
        left++;
        right--;
    }
}

/*
function map2DArray(array) {
    return array.map(row => {
        return row.map(element => {
            return element;
        });
    });
}
*/
function map2DArray(array) {
return array.map(twoDArray => {
        return twoDArray.map(row => {
            return row.slice();  // Creates a shallow copy of each sub-array (sufficient for primitive elements)
        });
    });
}

    })
    .catch(error => console.error('Error loading SVG files:', error));
