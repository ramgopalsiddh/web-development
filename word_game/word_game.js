const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar'); 
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init(){
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;
    let done = false;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    // rendom=1 is use for genrate random word
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    setLoading(false);
    isLoading = false;


    function addLetter (letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            //add letter at end 
          currentGuess += letter;
        } else {
            //replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        } 

       letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return;
        }

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word" , {
            method: "POST",
            body: JSON.stringify({ word:currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const  { validWord } = resObj;

        isLoading = false;
        setLoading(false);

        if(!validWord) {
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);
        let allRight = true;
        console.log(map);

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            //  mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing we already did it
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
                allRight = false;
                // mark as close 
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
            } else {
                allRight = false;
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;
        if (allRight) {
            // alert for win condition 
            alert('you win!');
            document.querySelector('.brand').classList.add("winner");
            done = true;
            return;
        } else if(currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
        }
        currentGuess = '';
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord () {
       // alert(' not a valid word');

       for(let i = 0; i < ANSWER_LENGTH; i++) {
        letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

        setTimeout(function () {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
        }, 10);
       }
    }


    document.addEventListener('keydown', function (event) {
        if (done || isLoading) {
            // do nothing 
            return;
        }

        const action = event.key;

        console.log(action);

        if (action === 'Enter') {
            commit();
        } else if ( action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            // do nothing 
        }
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }

  function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', isLoading);
  }

  function makeMap(array) {
    const obj = {};
    for(let i = 0; i < array.length; i++) {
        const letter = array[i]
        if(obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
  }

  
init();