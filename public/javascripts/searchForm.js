var hiddenField = document.getElementById('hiddenField');
var aibutton = document.getElementById('aiButton');
var playerbutton = document.getElementById('playerButton');



function chooseOpponent(val, target) {
    hiddenField.value = val;
    target.classList.add("activeButton");
    if(val === "player") {
        aibutton.classList.remove('activeButton');
    }
    else {
        playerbutton.classList.remove('activeButton');
    }
}
