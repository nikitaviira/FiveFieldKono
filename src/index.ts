import FiveFieldKono from "./gameLogic";
import '../wwwroot/style.css';

let gameObject: FiveFieldKono;
const squareElement = document.getElementById("square") as HTMLElement;
const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get('gmd') as string | null;
const startingPlayerColor = urlParams.get('clr') as string | null;

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
            squareElement.addEventListener('click', function () { skipToNextColor() });

            Array.from(document.getElementsByClassName("card")).forEach(function (element) {
                element.addEventListener('click', function () { makeMove(element as HTMLElement) });
            });

            return;
        }
    }
    window.location.href = '/';
};

function skipToNextColor(): void {
    gameObject.currentPlayerColor = gameObject.currentPlayerColor === "blue" ? "red" : "blue";
    if (gameObject.gameMode === "pvc") {
        squareElement.style.display = "none";
        gameObject.computerMakesMove(gameObject.getAllNonBlocked(gameObject.currentPlayerColor));
    } else {
        squareElement.style.background = gameObject.currentPlayerColor;
        removeHighlighted();
    }
}

function highlightPossibleMoves(y: number, x: number, possibleMoves: [number, number][]): void {
    possibleMoves.forEach(function (move) {
        document.querySelector(`.y-${move[0]}.x-${move[1]}`)!.classList.add("highlight");
    });
}

function removeHighlighted(): void {
    Array.from(document.getElementsByClassName("highlight")).forEach(function (elem) {
        (elem as HTMLElement).classList.remove("highlight");
    });
}

function makeMove(domElement: HTMLElement): void {
    if (gameObject.currentPlayerColor !== gameObject.computerColor) {
        if (domElement.classList.contains(gameObject.currentPlayerColor) ||
            (gameObject.currentlySelectedTile !== undefined &&
                gameObject.currentlySelectedTile.classList.contains(gameObject.currentPlayerColor))) {

            const y: number = FiveFieldKono.getCoordinates(domElement , 0);
            const x: number = FiveFieldKono.getCoordinates(domElement, 1);

            if (gameObject.chooseTilePhase && !domElement.classList.contains("highlight")) {
                removeHighlighted();
                gameObject.chooseTilePhase = false;
                gameObject.currentlySelectedTile = undefined;
            }
            else if (gameObject.chooseTilePhase && domElement.classList.contains("highlight") && !!gameObject.currentlySelectedTile) {
                gameObject.moveCard(domElement, y, x,
                    FiveFieldKono.getCoordinates(gameObject.currentlySelectedTile, 0),
                    FiveFieldKono.getCoordinates(gameObject.currentlySelectedTile, 1)
                );

                skipToNextColor();
                removeHighlighted();
            }
            else if (domElement.classList.contains("blue") || domElement.classList.contains("red")) {
                const possibleMoves: [number, number][] = gameObject.findPossibleMovesDirection(y, x);

                if (possibleMoves.length !== 0) {
                    highlightPossibleMoves(y, x, possibleMoves);
                    gameObject.chooseTilePhase = true;
                    gameObject.currentlySelectedTile = domElement;
                }
            }

            const getWinner: string | null = gameObject.checkForWinningCondition();
            if (getWinner !== null) FiveFieldKono.displayWinMessage(getWinner + " won!");
        }
    }
}
