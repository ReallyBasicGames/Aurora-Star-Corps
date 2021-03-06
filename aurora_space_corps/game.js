//const audio = require('@replit/audio');


// module aliases
var Engine = Matter.Engine,
    // Render = Matter.Render, // I am using P5's renderer system, so I commented this out
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var world;
var ships = [];
var teams = [0, 1, 2, 3];
var shipHandler;
var bulletHandler;

var debugging = true;

var bulletTime = 0;
var countBulletInc = 1000;

var player;

var ending = false;

var currentMission;

function preload() {
    console.log("loading images...");
    // load boss fighters
    for (var i = 0; i < 4; i++) {
        bossFighterImg.push(loadImage("images/boss_" + i.toString() + ".png"));
    }
    // load chaos fighters
    for (var i = 0; i < 4; i++) {
        chaosFighterImg = (loadImage("images/fighters/chaos/chaos.png"));
        chaosLightsImg.push(loadImage("images/fighters/chaos/chaos_lights_" + i.toString() + ".png"))
    }
    // load eclipse fighters
    for (var i = 0; i < 4; i++) {
        eclipseFighterImg = (loadImage("images/fighters/eclipse/eclipse.png"));
        eclipseLightsImg.push(loadImage("images/fighters/eclipse/eclipse_lights_" + i.toString() + ".png"));
    }

    // load nebula fighters
    for (var i = 0; i < 4; i++) {
        nebulaFighterImg = (loadImage("images/fighters/nebula/nebula.png"));
        nebulaLightsImg.push(loadImage("images/fighters/nebula/nebula_lights_" + i.toString() + ".png"));
    }

    // load bolide fast fighters
    for (var i = 0; i < 4; i++) {
        bolideFighterImg = (loadImage("images/fast/bolide/bolide.png"));
        bolideLightsImg.push(loadImage("images/fast/bolide/bolide_lights_" + i.toString() + ".png"));
    }

    console.log("loading music...");
    bgMusic = loadSound("sounds/Space_Ambient_Music.mp3");
    clickEffect = loadSound("sounds/click1.ogg");
    bulletEffect = loadSound("sounds/laser3.ogg");
    console.log("loading mission...");
    missions.push(new MissionOne());
    missions.push(new MissionTwo());
    missions.push(new MissionThree());
}

function loadOptions() {
    graphicsLevel = getItem('graphicsLevel');
    if (graphicsLevel == null) {
        graphicsLevel = 0;
        storeItem("graphicsLevel", graphicsLevel);
    }
    soundLevel = getItem('soundLevel');
    if (soundLevel == null) {
        soundLevel = 0;
        storeItem("soundLevel", soundLevel);
    }
    if (soundLevel == 1) bgMusic.play();
    
    currentMission = getItem("currentMission");
    if (currentMission == null) {
        currentMission = 0;
        storeItem("currentMission", currentMission);
    }

    missionsBeaten = getItem("missionsBeaten");
    if (missionsBeaten == null) {
        missionsBeaten = 0;
        storeItem("missionsBeaten", missionsBeaten);
    }
}

function setup() {
    createCanvas(windowWidth - 40, windowHeight - 40);
    gamesPlayed++;
    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = 0;
    Engine.run(engine);
    shipHandler = new ShipHandler();
    loadOptions();
    //startDebugGame();
    //startUnfair();
    //createFactoryShips();
    //testImages();
    if(debugging)
    {
        //testNewShip();
        missions[currentMission].startMission(shipHandler, width, height);
    }
    else
    {
        missions[currentMission].startMission(shipHandler, width, height);
    }
    
}

function gameEnd() {
    if (ending) return;
    if (currentFactories > 1) return;
    ending = true;
    timePlayed = getItem("timePlayed");
    timePlayed += millis();
    storeItem("timePlayed", timePlayed);
    gamesPlayed = getItem("gamesPlayed");
    gamesPlayed++;
    storeItem("gamesPlayed", gamesPlayed);
    wins = getItem("wins");
    ties = getItem("ties");
    shipsBuilt += getItem("shipsBuilt");
    shipsDestroyed += getItem("shipsDestroyed");
    storeItem("shipsBuilt", shipsBuilt);
    storeItem("shipsDestroyed", shipsDestroyed);
    if (player != null) {
        if (wins == null) storeItem("wins", 1);
        else {
            wins++;
            storeItem("wins", wins);
        }
    }
    if (currentFactories == 0) {
        ties++;
        storeItem("ties", ties);
    }
    else {
        if (ties == null) storeItem("ties", 0);
        else storeItem("ties", ties);
    }
    if(currentMission >= missionsBeaten) {
        missionsBeaten ++;
        storeItem("missionsBeaten", missionsBeaten);
    }
    window.location.href = "missionRoom.html";
}

function draw() {
    if(frameRate() <= 10 && millis() >= 1000) {
        console.log("aww, snap. the game crashed.");
        console.log("The game stopped because your fps was too low (it was " + frameRate().toString() + ")");
        console.log("Believe me, this IS in your best interest.");
        console.log("\nTry switching to a faster browser or disabling graphics / sound.");
        noLoop();
    }
    gameEnd();
    
    //if(graphicsLevel == 1) background(51,51,51,255); // draw the background slightly transparent to add motion effects
    background(51); 
    update();
    // draw ships
    shipHandler.draw();

    drawPrices();
    if(debugging)
    {
        textSize(16);
        fill(255, 255);
        textAlign(CENTER);
        text("FPS: " + round(frameRate()).toString(), 32, 32);
    }
}

function update() {
    if(!bgMusic.isPlaying() && soundLevel == 1) bgMusic.play();
    shipHandler.update();
}

function stopGame() {
    // breaks the game for debugging purposes
    world = null;
}

function startDebugGame() {
    var xPos = 20;
    var yPos = 20;
    var changeInPos = 25;
    var xArr = [changeInPos, width - changeInPos - (changeInPos * 5), changeInPos, width - changeInPos - (changeInPos * 5)];
    var yArr = [changeInPos, height - changeInPos - (changeInPos * 5), height - changeInPos - (changeInPos * 5), changeInPos];
    for (var c = 0; c < teams.length; c++) {
        xPos = xArr[c];
        yPos = yArr[c];
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                if (i == j) {
                    if (i == 1 || i == 3) {
                        shipHandler.makeShip("large", teams[c], xPos + i * changeInPos, yPos + j * changeInPos);
                    }
                    else if (i == 0 || i == 4) {
                        shipHandler.makeShip("medium", teams[c], xPos + i * changeInPos, yPos + j * changeInPos);
                    }
                    else {
                        shipHandler.makeShip("boss", teams[c], xPos + i * changeInPos, yPos + j * changeInPos);
                    }
                }
                else {
                    shipHandler.makeShip("small", teams[c], xPos + i * changeInPos, yPos + j * changeInPos);
                }
            }
        }
    }
}


function drawPrices() {
    // UI background
    fill(180);
    strokeWeight(0);
    rect(0, height - 60, width, 60);

    // power bar background
    fill(150);
    rect(10, height - 50, (width - 20), 40);
    // power bar
    fill(255);
    rect(10, height - 50, (width - 20) * (player.getPower() / player.getMaxPower()), 40);

    // display ship costs
    for (var i = 0; i < player.getPricesShips().length; i++) {
        if (player.getMaxPower() >= player.getPricesShips()[i]) {
            fill(playerColor.r, playerColor.g, playerColor.b, 150);
            rect(10, height - 50, (width - 20) * (player.getPricesShips()[i] / player.getMaxPower()), 20);
        }
    }

    // display time to purchase next ship
    for (var i = 0; i < player.getPricesShips().length; i++) {
        if (player.getPower() < player.getPricesShips()[i]) {
            textSize(16);
            fill(0, 0, 0, 255);
            textAlign(CENTER);
            if (player.getMaxPower() < player.getPricesShips()[i]) {
                text("UPGRADE POWER TO PURCHASE NEXT SHIP", width / 2, height - 34);
            }
            else {
                var timeToShip = round((player.getPricesShips()[i] - player.getPower()) / player.getPowerRegen() / 10) / 10;
                text("NEXT SHIP IN " + timeToShip.toString() + " SECONDS", width / 2, height - 34);
            }
            break;
        }
        else if (i == player.getPricesShips().length - 1) {
            textSize(16);
            fill(0, 0, 0, 255);
            textAlign(CENTER);
            if (player.getMaxPower() == player.getPower()) {
                text("MAX POWER", width / 2, height - 34);
            }
            else {
                textSize(16);
                fill(0, 0, 0, 255);
                textAlign(CENTER);
                var timeToMax = round((player.getMaxPower() - player.getPower()) / player.getPowerRegen() / 10) / 10;
                text("MAX POWER IN " + timeToMax.toString() + " SECONDS", width / 2, height - 34);
                break;
            }
            break;
        }
    }
}

let playerColor = {
    r: 0,
    g: 0,
    b: 0
}

function setPlayerColor() {
    switch (player.getTeam()) {
        case "red":
            playerColor = {
                r: 255,
                g: 105,
                b: 97
            }
            break;
        case "green":
            playerColor = {
                r: 119,
                g: 221,
                b: 119
            }
            break;
        case "yellow":
            playerColor = {
                r: 253,
                g: 253,
                b: 150
            }
            break;
        case "blue":
            playerColor = {
                r: 128,
                g: 206,
                b: 255
            }
            break;
        default:
            fill(255, 0, 0);
            stroke(0, 0, 0);
    }
}


function testNewShip()
{
    var testTeam = 2;
    var playerTeam = 0;
    for(var i = 0; i < 10; i++)
    {
        for(var j = 0; j < 10; j ++)
        {
            shipHandler.makeShip('chaos', teams[testTeam], 0 + i*20, 0 + j*20, false, 0, 1, chaosFighterImg, chaosLightsImg[testTeam]);
        }
    }
    for(var i = 0; i < 10; i++)
    {
        for(var j = 0; j < 10; j ++)
        {
            shipHandler.makeShip('chaos', teams[playerTeam], 500 + i*20, 0 + j*20, false, 0, 1, chaosFighterImg, chaosLightsImg[playerTeam]);
        }
    }
    currentFactories = 10;
    shipHandler.makeShip("factory", teams[playerTeam], 600, height / 2, true, 0, 1, bossFighterImg[playerTeam]);
}