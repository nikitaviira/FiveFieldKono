import FiveFieldKono from "./gameLogic";
let gameObject;
const squareElement = document.getElementById("square");
const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get('gmd');
const startingPlayerColor = urlParams.get('clr');
window.onload = function () {
    if (gameMode !== null && 0 !== gameMode.length && ["cvc", "pvc", "pvp"].includes(gameMode)) {
        if (startingPlayerColor !== null && 0 !== startingPlayerColor.length && ["blue", "red"].includes(startingPlayerColor)) {
            gameObject = new FiveFieldKono(gameMode, startingPlayerColor);
            if (gameObject.gameMode === "cvc") {
                gameObject.computerColor = startingPlayerColor;
                squareElement.style.display = "none";
                gameObject.computerMakesMove(gameObject.getAllNonBlocked(gameObject.computerColor));
                return;
            }
            squareElement.style.background = gameObject.currentPlayerColor;
            squareElement.addEventListener('click', function () { skipToNextColor(); });
            Array.from(document.getElementsByClassName("card")).forEach(function (element) {
                element.addEventListener('click', function () { makeMove(element); });
            });
            return;
        }
    }
    window.location.href = 'http://localhost:8090/';
};
function skipToNextColor() {
    gameObject.currentPlayerColor = gameObject.currentPlayerColor === "blue" ? "red" : "blue";
    if (gameObject.gameMode === "pvc") {
        squareElement.style.display = "none";
        gameObject.computerMakesMove(gameObject.getAllNonBlocked(gameObject.currentPlayerColor));
    }
    else {
        squareElement.style.background = gameObject.currentPlayerColor;
        removeHighlighted();
    }
}
function highlightPossibleMoves(y, x, possibleMoves) {
    possibleMoves.forEach(function (move) {
        document.querySelector(`.y-${move[0]}.x-${move[1]}`).classList.add("highlight");
    });
}
function removeHighlighted() {
    Array.from(document.getElementsByClassName("highlight")).forEach(function (elem) {
        elem.classList.remove("highlight");
    });
}
function makeMove(domElement) {
    if (gameObject.currentPlayerColor !== gameObject.computerColor) {
        if (domElement.classList.contains(gameObject.currentPlayerColor) ||
            (gameObject.currentlySelectedTile !== undefined &&
                gameObject.currentlySelectedTile.classList.contains(gameObject.currentPlayerColor))) {
            const y = FiveFieldKono.getCoordinates(domElement, 0);
            const x = FiveFieldKono.getCoordinates(domElement, 1);
            if (gameObject.chooseTilePhase && !domElement.classList.contains("highlight")) {
                removeHighlighted();
                gameObject.chooseTilePhase = false;
                gameObject.currentlySelectedTile = undefined;
            }
            else if (gameObject.chooseTilePhase && domElement.classList.contains("highlight") && !!gameObject.currentlySelectedTile) {
                gameObject.moveCard(domElement, y, x, FiveFieldKono.getCoordinates(gameObject.currentlySelectedTile, 0), FiveFieldKono.getCoordinates(gameObject.currentlySelectedTile, 1));
                skipToNextColor();
                removeHighlighted();
            }
            else if (domElement.classList.contains("blue") || domElement.classList.contains("red")) {
                const possibleMoves = gameObject.findPossibleMovesDirection(y, x);
                if (possibleMoves.length !== 0) {
                    highlightPossibleMoves(y, x, possibleMoves);
                    gameObject.chooseTilePhase = true;
                    gameObject.currentlySelectedTile = domElement;
                }
            }
            const getWinner = gameObject.checkForWinningCondition();
            if (getWinner !== null)
                FiveFieldKono.displayWinMessage(getWinner + " won!");
        }
    }
}
//# sourceMappingURL=index.js.map