const GAME_STATUS_INIT = 0;
const GAME_STATUS_MOVING = 1;
const GAME_STATUS_CHECK_WIN = 2;
const ACTUAL_NUMBERS_OF_ICON = 5;
const THREE_KIND = 3;
const FOUR_KIND = 4;
const FIVE_KIND = 5;
const BET_AMOUNT = [1, 2, 5, 10];
const AXE = '1_axe';
const HOOK = '2_hook';
const FIRE = '3_fire';
const ICEMAN = '4_iceman';
const MAN = '5_man';
const KING = '6_K';
const QUEEN = '7_Q';
const JACK = '8_J';
const iconMap = {
  1:AXE,
  2:HOOK,
  3:FIRE,
  4:ICEMAN,
  5:MAN,
  6:KING,
  7:QUEEN,
  8:JACK
};
const reels = [
    [1,5,2,1,6,5,8,5,1,2,3,7,4,5,8,1,4,3,2,5,6],
    [5,1,6,3,7,8,1,3,2,4,6,8,5,4,5,3,8,7,5,4,1,7,4,8,4],
    [8,4,1,3,2,6,7,2,3,4,1,5,6,7,8,2,5,4,3,1,2,7,6,7,1,4,3,2,4],
    [1,7,4,2,3,8,4,3,2,5,6,7,2,3,4,5,8,1,2,6,2,4,2,6,3,7,8,4,6,2,3,1,2,5,6,3,4],
    [8,5,1]
];

const winPattern = [
  [1,1,1,1,1],
  [0,0,0,0,0],
  [2,2,2,2,2],
  [0,1,2,1,2],
  [2,1,0,1,2]
]

const odds = {
  1:{
    3:250,
    4:500,
    5:1000
  },
  2:{
    3:200,
    4:450,
    5:800
  },
  3:{
    3:150,
    4:400,
    5:700
  },
  4:{
    3:100,
    4:350,
    5:600
  },
  5:{
    3:90,
    4:300,
    5:700
  },
  5:{
    3:90,
    4:300,
    5:700
  },
  6:{
    3:80,
    4:250,
    5:600
  },
  7:{
    3:70,
    4:200,
    5:500
  },
  8:{
    3:60,
    4:100,
    5:400
  }
};

const slotSprite = [];


let betAmountIndex = 0;
let gameStatus = GAME_STATUS_INIT;
let bet,spin,balance,win;
let balanceAmount = 500;
let winAmount = 0;
const spinSpeed = 100;
let randomResult;
let reelsPointer = [0,0,0,0,0];
let adjustPositionStatus;
let result = [];

const stage = new PIXI.Container();

const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
  transparent: true,
  resolution: 1
});
document.getElementById('main').appendChild(renderer.view);

const texture = new PIXI.RenderTexture(
        new PIXI.BaseRenderTexture(128, 384, PIXI.SCALE_MODES.LINEAR, 1)
);

PIXI.loader.load(setup);


function setup(){
  spin = createSpinComponent();
  bet = createBetComponent();
  balance = createBalanceComponent();
  win = createWinComponent();
  createReelsComponent();

  stage.addChild(spin);
  stage.addChild(bet);
  stage.addChild(balance);
  stage.addChild(win);
  draw();
}


function draw(){
  if (gameStatus == GAME_STATUS_MOVING){
    for(let i=0; i<slotSprite.length; i++) {
      if (randomResult[i] > 0) {
        for(let j=0; j<ACTUAL_NUMBERS_OF_ICON; j++){
          slotSprite[i].children[j].y -= spinSpeed;
        }
        randomResult[i] -= spinSpeed;
      } else {
        adjustPosition(i);
        if(adjustPositionStatus.every((res)=>{ return res==true })){
          reelsPointer = modifyPointerPostion(reelsPointer);
          gameStatus = GAME_STATUS_CHECK_WIN;
        }
      }
    }
    for(let i=0; i<slotSprite.length; i++) {
      if (slotSprite[i].children[0].y < -128) {
        slotSprite[i].children[0].destroy();
        reelsPointer[i] += 1;
        const newTile = makeTile(i, reelsPointer[i]+4);
        newTile.y = slotSprite[i].children[0].y + 128*4;
        slotSprite[i].addChild(newTile);
      }
    }
  } else if (gameStatus == GAME_STATUS_CHECK_WIN){
    const pointerResult = [
      modifyPointerPostion(reelsPointer.map((i)=>{ return i+1 })),
      modifyPointerPostion(reelsPointer.map((i)=>{ return i+2 })),
      modifyPointerPostion(reelsPointer.map((i)=>{ return i+3 }))
    ]
    result = pointerResult.map((row)=>{
      return row.map((icon,j)=>{
        return reels[j][icon]
      })
    })
    const patternResult = payoutProcess();
    console.log(patternResult)
    gameStatus = GAME_STATUS_INIT
  }
  renderer.render(stage);
  requestAnimationFrame(draw);
}

//reels
function createReelsComponent(){
  for(let i=0; i<reels.length; i++){
    slotSprite[i] = makeReel(i);
    const topCover = new PIXI.Graphics();
    topCover.beginFill(0xFFFFFF);
    topCover.drawRect(window.innerWidth*0.17*(i+1)-64,window.innerHeight*0.5-448,128,256);
    topCover.endFill();
    const bottomCover = new PIXI.Graphics();
    bottomCover.beginFill(0xFFFFFF);
    bottomCover.drawRect(window.innerWidth*0.17*(i+1)-64,window.innerHeight*0.5+192,128,256);
    bottomCover.endFill();
    stage.addChild( slotSprite[i] );
    stage.addChild( topCover );
    stage.addChild( bottomCover );
    renderer.render(slotSprite[i], texture);
  }
}

//make individuel reel
function makeReel(reelNumber){
  const pointer = reelsPointer[reelNumber];
  const reel = new PIXI.Container();
  const tile1 = makeTile(reelNumber, pointer);
  const tile2 = makeTile(reelNumber, pointer+1);
  const tile3 = makeTile(reelNumber, pointer+2);
  const tile4 = makeTile(reelNumber, pointer+3);
  const tile5 = makeTile(reelNumber, pointer+4);
  tile1.y = -128
  tile3.y = 128;
  tile4.y = 256;
  tile5.y = 384;
  reel.addChild(tile1);
  reel.addChild(tile2);
  reel.addChild(tile3);
  reel.addChild(tile4);
  reel.addChild(tile5);
  reel.x = window.innerWidth*0.17*(reelNumber+1)-64;
  reel.y = window.innerHeight*0.5-320;
  return reel;
}

//make individuel tile
function makeTile(reelNumber, position){
  let icon;
  if (position >  reels[reelNumber].length - 1){
    icon = reels[reelNumber][position%reels[reelNumber].length]
  } else {
    icon = reels[reelNumber][position]
  }
  const tile = getIcon(iconMap[icon])
  if (icon > 5){
    tile.x = 22.5;
  }
  return tile
}

//fetch icon
function getIcon(name){
  return PIXI.Sprite.fromImage(`assets/${name}.png`);
}

//Spin button
function createSpinComponent(){
    const spinText = new PIXI.Text("Spin",{fontSize: 24, fill : "white"});
    spinText.anchor.set(0.5, 0.5);
    spinText.position.set(75,50);

    const buttonSpin = new PIXI.Graphics();
    buttonSpin.beginFill(0xFF2342);
    buttonSpin.drawRect(0,0,150,100);
    buttonSpin.endFill();
    buttonSpin.interactive = true;
    buttonSpin.on('pointertap', spinEvent);
    buttonSpin.addChild(spinText);
    buttonSpin.position.set(window.innerWidth - 200, window.innerHeight - 100);
    return buttonSpin;
}

//Bet amount area
function createBetComponent(){
    const betText = new PIXI.Text("Bet",{fontSize: 24, fill : "white"});
    betText.anchor.set(0.5, 0.5);
    betText.position.set(100,25);

    const amountText = new PIXI.Text(`$${formatMoney(BET_AMOUNT[betAmountIndex])}`,{fontSize: 24, fill : "white"});
    amountText.anchor.set(0.5, 0.5);
    amountText.position.set(100,70);

    const bet = new PIXI.Graphics();
    bet.drawRect(0,0,200,100);
    bet.interactive = true;

    const addButton = new PIXI.Graphics();
    addButton.beginFill(0xFF2342);
    addButton.drawRect(200,0,50,50);
    addButton.endFill();
    addButton.interactive = true;
    addButton.on('pointertap', changeBetEvent);
    const addText = new PIXI.Text("+",{fontSize: 30, fill : "white"});
    addText.anchor.set(0.5, 0.5);
    addText.position.set(225,25);
    addButton.addChild(addText)

    const minusButton = new PIXI.Graphics();
    minusButton.beginFill(0xFF2342);
    minusButton.drawRect(200,50,50,50);
    minusButton.endFill();
    minusButton.interactive = true;
    minusButton.on('pointertap', changeBetEvent);
    const minusText = new PIXI.Text("-",{fontSize: 30, fill : "white"});
    minusText.anchor.set(0.5, 0.5);
    minusText.position.set(225,75);
    minusButton.addChild(minusText)

    bet.addChild(betText);
    bet.addChild(amountText);
    bet.addChild(addButton);
    bet.addChild(minusButton);
    bet.position.set(50 , window.innerHeight - 100);
    return bet;
};

//Balance part
function createBalanceComponent(){
    const balanceText = new PIXI.Text("Balance",{fontSize: 24, fill : "white"});
    balanceText.anchor.set(0.5, 0.5);
    balanceText.position.set(125,25);

    const amountText = new PIXI.Text(`$${formatMoney(balanceAmount)}`,{fontSize: 24, fill : "white"});
    amountText.anchor.set(0.5, 0.5);
    amountText.position.set(125,70);

    const balance = new PIXI.Graphics();
    balance.drawRect(0,0,250,100);
    balance.interactive = true;

    balance.addChild(balanceText);
    balance.addChild(amountText);
    balance.position.set(window.innerWidth/2 - 125 , window.innerHeight - 100);
    return balance;
}

//Win part
function createWinComponent(){
    const wineText = new PIXI.Text("Win",{fontSize: 24, fill : "white"});
    wineText.anchor.set(0.5, 0.5);
    wineText.position.set(125,25);

    const amountText = new PIXI.Text(`$${formatMoney(winAmount)}`,{fontSize: 24, fill : "white"});
    amountText.anchor.set(0.5, 0.5);
    amountText.position.set(125,70);

    const win = new PIXI.Graphics();
    win.drawRect(0,0,250,100);
    win.interactive = true;

    win.addChild(wineText);
    win.addChild(amountText);
    win.position.set(window.innerWidth/2 - 125 , 50);
    return win;
}

//TODO spin click event
function spinEvent(eventData){
    if (gameStatus == GAME_STATUS_INIT || gameStatus == GAME_STATUS_CHECK_WIN){
      console.log('game start')
      balanceAmount -= BET_AMOUNT[betAmountIndex];
      balance.children[1].text = `$${formatMoney(balanceAmount)}`;
      winAmount = 0;
      win.children[1].text = `$${formatMoney(winAmount)}`;
      randomResult = getRandomFinishPosition();
      adjustPositionStatus = [false,false,false,false,false];
      gameStatus = GAME_STATUS_MOVING;
    }
}

//change bet amount event
function changeBetEvent(eventData){
  if(gameStatus != GAME_STATUS_MOVING){
    if (eventData.target.children[0]._text == '+'){
      if(betAmountIndex<BET_AMOUNT.length-1){
        betAmountIndex+=1
      }
    } else {
      if(betAmountIndex>0){
        betAmountIndex-=1;
      }
    }
    bet.children[1].text = `$${formatMoney(BET_AMOUNT[betAmountIndex])}`;
  }
}

function adjustPosition(reel){
  if (randomResult[reel]<=0 && adjustPositionStatus[reel]==false){
    for(let i=0; i<slotSprite[reel].children.length; i++){
      slotSprite[reel].children[i].y -= 1;
    }
    if (slotSprite[reel].children[2].y <= 128){
      adjustPositionStatus[reel] = true;
    }
  }
}

function payoutProcess(){
  return winPattern.map((pattern, patternType)=>{
    const counts = {}
    pattern.map((i,j)=>{return result[i][j]}).forEach((x)=>{ counts[x] = (counts[x] || 0)+1 });
    const mostIcon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    if (counts[mostIcon] > 2){
      winAmount = odds[mostIcon][counts[mostIcon]] * BET_AMOUNT[betAmountIndex];
      balanceAmount += winAmount;
      balance.children[1].text = `$${formatMoney(balanceAmount)}`;
      win.children[1].text = `$${formatMoney(winAmount)}`;
      return true
    }
    return false;
  })
}

//convert a number to a readable money format (from StackOverFlow)
function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e)
  }
};

function modifyPointerPostion(reelsPointer){
  return reelsPointer.map((pointer,reel)=>{
    return pointer%reels[reel].length;
  })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFinishPosition(){
  return [getRandomInt(10000,20000), getRandomInt(20000,30000), getRandomInt(30000,40000), getRandomInt(40000,50000), getRandomInt(50000,60000)]
}
