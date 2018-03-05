var $playArea = $("#play-area"),
    $wordList = $("#word-list"), 
    $clueArea = $("#clue-area"),
    $playAgainButton = $("#play-again-button"),
    $winMessageContainer = $("#win-message-container"),
    $startNewGameButton = $("#start-new-game-button"),
    $rowCountSelection =  $("#row-count-selection"),
    $colCountSelection =  $("#col-count-selection"),
    $inputList = $("#input-list"),
    rows = 10,
    columns = 10,
    boxes = [],
    words = [],
    selectedIds = [],
    selectionType = "",
    foundWordCount = 0;

// set options
$(document).on("click", "#start-new-game-button", function(e) {
  words = $inputList.val().split("\n").map(function(el) {
    return el.split(", ")
  })
  rows = $rowCountSelection.val()
  columns = $colCountSelection.val()
});


function addWordToList(wordAndClueArray) {
  words.push(wordAndClueArray)
  $wordList.append("<li id='" + wordAndClueArray[0] + "-list'>" + wordAndClueArray[0]  +"</li>")
  $clueArea.append("<li id='" + wordAndClueArray[0] + "-clue'>" + wordAndClueArray[1]  +"</li>")
}

addWordToList(["happy", "a good feeling"])
// addWordToList(["sad", "a bad feeling"])
// addWordToList(["dog", "animals that bark"])
// addWordToList(["cats", "animals that meow"])
// addWordToList(["coat", "clothing worn when cold"])


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
    selectedIds = [idToAdd];
    selectionType = "";
    console.log("hitting here")

  } else if (idToAdd === selectedIds[selectedIds.length - 1]) {
    console.log("selected last square")
    $this.toggleClass("selected-square");
    selectedIds.pop();
    selectionType = "";
  } else if (selectedIds.includes(idToAdd)) {
    console.log("already selected");
  } else if (squaresAreTouching(selectedIds, idToAdd)) {
    $this.toggleClass("selected-square");
    selectedIds.push(idToAdd)
  
  }
  if (checkAttempt()) {
    crossOutWordAndClue(highLightedLetters().join(""))

    $(".selected-square").each(function(el) {
      $(this).addClass("found-word");
      $(this).removeClass("selected-square");
    })

    selectedIds = [];
    selectionType = "";
    foundWordCount++
    if (foundWordCount === words.length) {

      console.log("You win")
      $winMessageContainer.fadeIn();
    }


  }
})

function squaresAreTouching(selectedIds, square2Id) {
  // are the squares touching
  var touching = false;
  var firstId = selectedIds[selectedIds.length - 1],
      row1 = parseInt(firstId.split("_")[0]),
      col1 = parseInt(firstId.split("_")[1]),
      row2 = parseInt(square2Id.split("_")[0]),
      col2 = parseInt(square2Id.split("_")[1]);

  if (row1 === row2 && col1 === col2 ) {
    // same square
    console.log("Its the same square")
    touching = true;
  } else if (row1 === row2 && (col1 - 1 === col2 || col1 + 1 === col2)) {
    // Horizontal selection
    console.log("on the same row")
    if (selectedIds.length === 1) {
      // set the type of match direction type for a new attempt
      selectionType = "hor";
      touching = true;
    } else if (selectedIds.length > 1 && selectionType === "hor") {
      // let user connect another square horizontally
      selectionType = "hor";
      touching = true;      
    } else {
      // don't let user change match direction
      touching = false;
    }

  } else if (col1 === col2 && (row1 - 1 === row2 || row1 + 1 === row2)) {
    // Vertical selection
    console.log("on the same column")
    if (selectedIds.length === 1) {
      // set the type of match direction type for a new attempt
      selectionType = "vert";
      touching = true;
    } else if (selectedIds.length > 1 && selectionType === "vert") {
      // let user connect another square verticially
      selectionType = "vert";
      touching = true;      
    } else {
      // don't let user change match direction
      touching = false;
    }


  } else if (row1 === row2 + 1 && col1 === col2 + 1 || row1 === row2 - 1 && col1 === col2 - 1 ||
             col1 === col2 + 1 && row1 === row2 - 1 || col1 === col2 - 1 && row1 === row2 + 1 ) {

    // Diagonal selection
    console.log("on the same diagonal")

    if (selectedIds.length === 1) {
      // set the type of match direction type for a new attempt
      selectionType = "diag";
      touching = true;
    } else if (selectedIds.length > 1 && selectionType === "diag") {
      // let user connect another square diagonally
      selectionType = "diag";
      touching = true;      
    } else {
      // don't let user change match direction
      touching = false;
    }


  }

  console.log(selectionType)
  return touching;

}


function highLightedLetters() {
  var selectedLetters = [];
  for(var i = 0; i - selectedIds.length; i ++ ) {
    selectedLetters.push(squareContents(selectedIds[i]))
  }
  return selectedLetters;
}

function checkAttempt() {
  var word = highLightedLetters().join(""),
      wordsArray = words.map(function(el) {
        return el[0]
      });
  
  var selectedValidWord = wordsArray.includes(word);

  var selectedValidSquares = selectedIds.every(function(id) {
    return $("#" + id).hasClass("contains-word")
  })

  return selectedValidSquares && selectedValidWord;
}

function crossOutWordAndClue(word) {
  $("#" + word + "-list").addClass("answered");
  $("#" + word + "-clue").addClass("answered");
}


$(document).on("click", "#play-again-button", function() {
  startGame();
});

function startGame() {
  selectedIds = [];
  selectionType = "";
  foundWordCount = 0;
  buildSquares(); 
  fillPuzzleWithWords(words)
  fillBlankSquares();
  $winMessageContainer.fadeOut();
}

startGame();

