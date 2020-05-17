import '../wwwroot/style.css';

document.getElementById("startBtn")!.addEventListener("click", sendDataGamePage);

function sendDataGamePage(): void {
    const gamemodeValue = (<HTMLSelectElement> document.getElementById("gamemode")!).value;
    const startingColorValue = (<HTMLSelectElement> document.getElementById("startingcolor")!).value;

    window.location.href = `fiveFieldKono.html?gmd=${gamemodeValue}&clr=${startingColorValue}`;
}
