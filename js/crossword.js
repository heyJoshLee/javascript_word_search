var $playArea = $("#play-area"),
    $wordList = $("#word-list"), 
    $clueArea = $("#clue-area"),
    rows = 10,
    columns = 10,
    boxes = [],
    selectedIds = [];

var words = [];



function addWordToList(wordAndClueArray) {
  words.push(wordAndClueArray)
  $wordList.append("<li id='" + wordAndClueArray[0] + "-list'>" + wordAndClueArray[0]  +"</li>")
  $clueArea.append("<li id='" + wordAndClueArray[0] + "-clue'>" + wordAndClueArray[1]  +"</li>")
}

addWordToList(["happy", "a good feeling"])
addWordToList(["sad", "a bad feeling"])
addWordToList(["dog", "animals that bark"])
addWordToList(["cats", "animals that meow"])
addWordToList(["coat", "clothing worn when cold"])


// build puzzle functions

function buildSquares() {
  for (var j = 0; j <= columns; j ++) {
    $("<br/>").appendTo($playArea);
    for (var i = 0; i <= rows; i++) {
      var box = $("<div class='square'></div>");
      box.attr("id", j + "_" + i);
      box.appendTo($playArea);
      boxes.push({x:j, y:i, content: ""});
    }
  }
}


function insertWordIntoGrid(word) {
  var attempsToPlaceWord = 0,
      attemptLimit = 3,
      wordHasBeenPlaced = false; 

  while(attempsToPlaceWord <= attemptLimit) {
    // tries to place the word if there is space on the board
    // will give up after the limit
    var letters = word.split("");
   
    // chance to reverse word
    if (Math.random() < 0.5) { letters.reverse() }

    var placementMethods = ["vert", "hor", "diag"];
    var placementType = placementMethods[Math.floor(Math.random() * placementMethods.length)]

    var spacesToFill = [],
    maxColumn = columns,
    maxRow = rows,
    yAdjust = 0,
    xAdjust = 0;

    // calculate where a word can start so it doesn't
    // run off the puzzle area
    if (placementType === "vert") {
      maxColumn = columns - letters.length
     } else if (placementType === "hor") {
      maxRow = rows - letters.length
     } else if (placementType === "diag") {
      maxColumn = columns - letters.length
      maxRow = rows - letters.length    
     }

    // build cords for first square
    x = Math.floor(Math.random()*maxColumn),
    y = Math.floor(Math.random()*maxRow);
        

    // build cords for other squares depending on
    // how the word will be placed
    switch(placementType) {
      case "vert":
        // build list of squares to check
        for(; xAdjust < letters.length; xAdjust++) {
          var rowCord = x + xAdjust,
              colCord = y + yAdjust;
          spacesToFill.push([rowCord + "_" + colCord]);
        }
        break;
      case "hor":
        // build list of squares to check
        for(; yAdjust < letters.length; yAdjust++) {
          var rowCord = x + xAdjust,
              colCord = y + yAdjust;
          spacesToFill.push([rowCord + "_" + colCord]);
        }
        break;
      case "diag":
        // build list of squares to check
        for(; yAdjust < letters.length; yAdjust++, xAdjust++) {
          var rowCord = x + xAdjust,
              colCord = y + yAdjust;
          spacesToFill.push([rowCord + "_" + colCord]);
        }
        break;
    } // switch
    
    var canFillAllSquares = spacesToFill.every(function(el, index) {
      return squareCanBeFilled(el, letters[index])
    })
    
    if (canFillAllSquares) {
      placeWord(letters, spacesToFill)
      break; // break from while loop

    } else {
      attempsToPlaceWord++
      var attempsRemaining = attemptLimit - attempsToPlaceWord;
      console.log("Could not place: " + word + ".")
      console.log("Will try " + attempsRemaining + " more time(s)." )
      if (attempsRemaining <= 0 ) {
        console.log("Could not place "  + word + "and ran out of tries")
      }
    }
  } // while
}

function placeWord(letters, spacesToFill) {
  // place word in squares and add class
  for(var i = 0; i < letters.length; i++) {
    fillSquare(spacesToFill[i], letters[i]).addClass("contains-word")
  }
}

function squareCanBeFilled(id, letter) {
  // is the square empty or does it contain a 
  // usable letter?
  var contents = squareContents(id);
  return (contents === "" || contents === letter )
}

function squareContents(id) {
  return $("#" +  id).html();
}

function fillSquare(id, content) {
  var $element = $("#" + id); 
  $element.html(content); 
  return $element;
}

function randomLetter() {
  var alphabet = "abcdefghijklmnopqrstuvwxyz",
      alphArray = alphabet.split("");
  return alphArray[Math.floor(Math.random() * alphArray.length)]
}

function fillBlankSquares() {
  $(".square").each(function() {
    var id = $(this).attr("id")
    if (squareContents(id) === "") {
      fillSquare(id, randomLetter())
    } 
  })
}
 
function fillPuzzleWithWords(wordsArray) {
  for(var i = 0; i < wordsArray.length; i++) {
    insertWordIntoGrid(wordsArray[i][0]);
  }
} 



// ******************************
/// Playing functions
// ******************************

$(document).on("click", ".square", function(e) {
  var $this = $(this),
      idToAdd = $this.attr("id");

  if (selectedIds.length === 0 || 
      selectedIds.length === 1 && !squaresAreTouching(selectedIds, idToAdd) ) {
    // Player selects new square
    $(".square").removeClass("selected-square")
    $this.toggleClass("selected-square");
    selectedIds = [idToAdd]
  } else if (idToAdd === selectedIds[selectedIds.length - 1]) {
    console.log("selected last square")
    $this.toggleClass("selected-square");
    selectedIds.pop();
  } else if (squaresAreTouching(selectedIds, idToAdd)) {
    $this.toggleClass("selected-square");
    selectedIds.push(idToAdd)
  }
  console.log("selectedIds")
  console.log(selectedIds)
})

function squaresAreTouching(selectedIds, square2Id) {
  // are the squares touching
  var touching = false;
  var firstId = selectedIds[selectedIds.length - 1],
      row1 = parseInt(firstId.split("_")[0]),
      col1 = parseInt(firstId.split("_")[1]),
      row2 = parseInt(square2Id.split("_")[0]),
      col2 = parseInt(square2Id.split("_")[1]);

  // console.log("last square")
  // console.log(selectedIds[selectedIds.length - 1])
  // console.log("square to check")
  // console.log(square2Id)

  // console.log("row1: " + row1)
  // console.log("col1: " + col1)
  // console.log("row2: " + row2)
  // console.log("col2: " + col2)

  if (row1 === row2 && col1 === col2 ) {
    // same square
    console.log("Its the same square")
    touching = true;
  } else if (row1 === row2 && (col1 - 1 === col2 || col1 + 1 === col2)) {
    console.log("on the same row")
    touching = true;
  } else if (col1 === col2 && (row1 - 1 === row2 || row1 + 1 === row2)) {
    console.log("on the same column")
    touching = true;    
  } else if (row1 === row2 + 1 && col1 === col2 + 1 || row1 === row2 - 1 && col1 === col2 - 1 ||
             col1 === col2 + 1 && row1 === row2 - 1 || col1 === col2 - 1 && row1 === row2 + 1 ) {
    console.log("on the same diagonal")
    touching = true;
  }

  return touching;

}


buildSquares(); 
fillPuzzleWithWords(words)
fillBlankSquares()
