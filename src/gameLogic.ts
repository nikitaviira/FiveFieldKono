import IMoveEvaluated from './IMoveEvaluated';

export default class FiveFieldKono {

    private readonly initialBoard: string[][];
    chooseTilePhase: boolean;
    gameMode: string;
    currentPlayerColor: string;
    currentlySelectedTile: HTMLElement | undefined;
    computerColor: string | undefined;

    constructor(gameMode: string, startingPlayerColor: string) {
        this.initialBoard = [
            ["r", "r", "r", "r", "r"],
            ["r", "-", "-", "-", "r"],
            ["-", "-", "-", "-", "-"],
            ["b", "-", "-", "-", "b"],
            ["b", "b", "b", "b", "b"]
        ];
        this.chooseTilePhase = false;
        this.gameMode = gameMode;
        this.currentPlayerColor = startingPlayerColor;
        this.currentlySelectedTile = undefined;
        this.computerColor = undefined;
    }

    private static getRandomElement(array: any[]): any {
        return array[Math.floor((Math.random()*array.length))];
    }

    static getCoordinates(element: HTMLElement, index: number): number {
        return Number.parseInt(element.classList[index].charAt(2));
    }

    static displayWinMessage(message: string): void {
        document.getElementsByTagName("body")[0].innerHTML = `
                 <p class='win'>${message}</p>
                 <button class="endbtn" onClick='window.location.href="/"'>Go back to menu</button>`;

        document.getElementById("board")!.remove();
    }

    getAllNonBlocked(computerColor: string): [number, number][] {
        let nonBlocked: [number, number][] = [];
        const possibleMoves = (y: number, x: number) => { return this.findPossibleMovesDirection(y, x) };

        Array.from(document.getElementsByClassName(computerColor)).forEach(function (elem) {
            const y: number = FiveFieldKono.getCoordinates(elem as HTMLElement, 0);
            const x: number = FiveFieldKono.getCoordinates(elem as HTMLElement, 1);

            if (possibleMoves(y, x).length > 0)
                nonBlocked.push([y, x]);
        });
        return nonBlocked;
    }

    findPossibleMovesDirection(y: number, x: number, direction?: string): [number, number][] {
        let possibleMoves: [number, number][] = [];
        let moves = [[-1, 1], [1, 1], [-1, -1], [1, -1]];

        if (!!direction) {
            moves = direction === "f"
                ? [moves[1], moves[3]]
                : [moves[0], moves[2]];
        }

        for (const [d1, d2] of moves) {
            try {
                if (this.initialBoard[y + d1][x + d2] === "-") {
                    possibleMoves.push([y + d1, x + d2])
                }
            } catch (e) {}
        }
        return possibleMoves;
    }

    moveCard(domElement: Element, y: number, x: number, y_old: number, x_old: number): void {
        if (!!this.currentlySelectedTile) {
            const color: string = this.currentlySelectedTile.classList[3];

            domElement.classList.add(color);
            this.currentlySelectedTile.classList.remove(color);
            this.setBoardValue(color.charAt(0), y, x);
            this.setBoardValue("-", y_old, x_old);

            this.chooseTilePhase = false;
            this.currentlySelectedTile = undefined;
        }
    }

    checkForWinningCondition(): string | null {
        if (this.initialBoard[0].every(x => x === "b")
            && this.initialBoard[1][0] === "b" && this.initialBoard[1][4] === "b") {
            return "Blue";
        }
        else if (this.initialBoard[4].every(x => x === "r")
            && this.initialBoard[3][0] === "r" && this.initialBoard[3][4] === "r") {
            return "Red";
        }
        return null;
    }

    computerMakesMove(nonBlocked: number[][]): void {
        let nonBlockedCoords = nonBlocked;
        let evaluateDepth: IMoveEvaluated[] = [];
        const depthEvaluated = (y: number, x: number) => { return this.findDepth(y, x) };

        if (this.computerColor === undefined) {
            this.computerColor = this.currentPlayerColor;
        }

        setTimeout(() => {
            if (nonBlockedCoords.length === 0) {
                if (this.gameMode === "cvc")
                    this.computerVersusComputerRecursive();
                return;
            }

            this.currentPlayerColor = this.currentPlayerColor === "blue" ? "red" : "blue";

            nonBlockedCoords.forEach(function (coord) {
                const value: IMoveEvaluated = depthEvaluated(coord[0], coord[1])!;
                evaluateDepth.push({
                    coordinates: [coord[0], coord[1]],
                    depth: value.depth,
                    side: value.side,
                    goBack: value.goBack
                });
            });

            let chosenCard: IMoveEvaluated;

            if (evaluateDepth.length === 1) {
                chosenCard = evaluateDepth[0];
            }
            else {
                let maxValuedCards: IMoveEvaluated[] = [];
                const maxDepth: number = Math.max.apply(
                    Math, evaluateDepth.map(function (o) {return o.depth;}));

                evaluateDepth.forEach(function (card) {
                    if (card.depth === maxDepth)
                        maxValuedCards.push(card);
                });

                chosenCard = maxValuedCards.length === 1
                    ? maxValuedCards[0]
                    : FiveFieldKono.getRandomElement(maxValuedCards);
            }

            const m = this.computerColor === "blue"
                ? chosenCard.goBack ? 1 : -1
                : chosenCard.goBack ? -1 : 1;

            if (!!this.computerColor && !!chosenCard.coordinates) {
                document.querySelector(`.y-${chosenCard.coordinates[0] + m}.x-${chosenCard.coordinates[1] + chosenCard.side}`)!.classList.add(this.computerColor);
                document.querySelector(`.y-${chosenCard.coordinates[0]}.x-${chosenCard.coordinates[1]}`)!.classList.remove(this.computerColor);
                this.setBoardValue("-", chosenCard.coordinates[0], chosenCard.coordinates[1]);
                this.setBoardValue(this.computerColor.charAt(0), chosenCard.coordinates[0] + m, chosenCard.coordinates[1] + chosenCard.side);
            }

            const getWinner: string | null = this.checkForWinningCondition();
            if (getWinner !== null) {
                FiveFieldKono.displayWinMessage(getWinner + " won!");
                return;
            }

            if (this.gameMode === "cvc")
                this.computerVersusComputerRecursive();
            else
                document.getElementById("square")!.style.display = "flex";

        }, 2000);

    }

    private setBoardValue(value: string, y: number, x: number) {
        this.initialBoard[y][x] = value;
    }

    private computerVersusComputerRecursive() {
        this.computerColor = this.computerColor === "blue" ? "red" : "blue";
        this.computerMakesMove(this.getAllNonBlocked(this.computerColor));
    }

    private getDepth(depthValue: number, movesForward: [number, number][], direction: string, side: number) {
        const possibleCoords = this.findPossibleMovesDirection(movesForward[0][0], movesForward[0][1], direction);
        if (possibleCoords.length > 0) {
            if (possibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)) {
                return {
                    goBack: false,
                    depth: depthValue + 2,
                    side
                };
            }
        }
        return {
            goBack: false,
            depth: depthValue + 1,
            side
        };
    }

    private findDepth(y: number, x: number): IMoveEvaluated | null {
        const direction = this.computerColor === "blue" ? "b" : "f";
        const directionBack = this.computerColor === "blue" ? "f" : "b";
        const m = this.computerColor === "blue" ? -1 : 1;
        const depthValue = this.computerColor === "blue" ? Math.abs(y - 4) : y;
        const movesForward = this.findPossibleMovesDirection(y, x, direction);
        const winningPositions = this.computerColor === "blue"
            ? [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 4]]
            : [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [3, 0], [3, 4]];

        if (movesForward.length === 1 && movesForward[0][0] === y + m && movesForward[0][1] === x + 1)
            return this.getDepth(depthValue, movesForward, direction, 1);

        else if (movesForward.length === 1 && movesForward[0][0] === y + m && movesForward[0][1] === x - 1)
            return this.getDepth(depthValue, movesForward, direction, -1);

        else if (movesForward.length === 2) {
            const leftSidePossibleCoords = this.findPossibleMovesDirection(movesForward[1][0], movesForward[1][1], direction);
            const rightSidePossibleCoords = this.findPossibleMovesDirection(movesForward[0][0], movesForward[0][1], direction);

            if (leftSidePossibleCoords.length > 0 && rightSidePossibleCoords.length > 0) {
                if (rightSidePossibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)
                    && leftSidePossibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)) {
                    if (winningPositions.includes([y + m, x + 1])) {
                        return {
                            goBack: false,
                            depth: depthValue + 2,
                            side: 1
                        };
                    }
                    else if (winningPositions.includes([y + m, x - 1])) {
                        return {
                            goBack: false,
                            depth: depthValue + 2,
                            side: -1
                        };
                    }
                    return {
                        goBack: false,
                        depth: depthValue + 2,
                        side: FiveFieldKono.getRandomElement([-1, 1])
                    };
                }
                else if (rightSidePossibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)) {
                    return {
                        goBack: false,
                        depth: depthValue + 2,
                        side: 1
                    };
                }
                else if (leftSidePossibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)) {
                    return {
                        goBack: false,
                        depth: depthValue + 2,
                        side: -1
                    }
                }
            }
            else if (rightSidePossibleCoords.length > 0) {
                if (rightSidePossibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)) {
                    return {
                        goBack: false,
                        depth: depthValue + 2,
                        side: 1
                    };
                }
            }
            else if (leftSidePossibleCoords.length > 0) {
                if (leftSidePossibleCoords.some(x => this.findPossibleMovesDirection(x[0], x[1], direction).length > 0)) {
                    return {
                        goBack: false,
                        depth: depthValue + 2,
                        side: -1
                    };
                }
            }

            if (winningPositions.includes([y + m, x + 1])) {
                return {
                    goBack: false,
                    depth: depthValue + 1,
                    side: 1
                };
            }
            else if (winningPositions.includes([y + m, x - 1])) {
                return {
                    goBack: false,
                    depth: depthValue + 1,
                    side: -1
                };
            }
            return {
                depth: depthValue + 1,
                goBack: false,
                side: FiveFieldKono.getRandomElement([-1, 1])
            };

        }
        else {
            let movesBackwards = this.findPossibleMovesDirection(y, x, directionBack);
            if (movesBackwards.length === 1 && movesBackwards[0][0] === y - m && movesBackwards[0][1] === x - 1) {
                return {
                    depth: -1,
                    goBack: true,
                    side: -1
                };
            }
            else if (movesBackwards.length === 1 && movesBackwards[0][0] === y - m && movesBackwards[0][1] === x + 1) {
                return {
                    depth: -1,
                    goBack: true,
                    side: 1
                };
            }
            else if (movesBackwards.length === 2) {
                return {
                    depth: -1,
                    goBack: true,
                    side: FiveFieldKono.getRandomElement([-1, 1])
                };
            }
        }

        return null;
    }
}
