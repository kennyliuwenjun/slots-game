const BET_AMOUNT = [1, 2, 5, 10];

let betAmountIndex = 0;
let j,man,bet,spin,balance,win;
let balanceAmount = 500;
let winAmount = 0;

const stage = new PIXI.Container();

const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
  transparent: true,
  resolution: 1
});
document.getElementById('main').appendChild(renderer.view);

PIXI.loader
  .add("J", 'assets/8_J.png')
  .add("man", 'assets/5_man.png')
  .load(setup);

function animationLoop(){
  requestAnimationFrame(animationLoop);
  man.x = 500
  man.y = 500
  man.anchor.set(0.5, 0.5);
  man.rotation += 0.01;
  renderer.render(stage);
}
function setup(){
  j = new PIXI.Sprite(
    PIXI.loader.resources["J"].texture
  );
  man = new PIXI.Sprite(
    PIXI.loader.resources["man"].texture
  );

  man.x = 500
  man.y = 500

  spin = createSpinComponent();
  bet = createBetComponent();
  balance = createBalanceComponent();
  win = createWinComponent();
  stage.addChild(j);
  stage.addChild(man);
  stage.addChild(spin);
  stage.addChild(bet);
  stage.addChild(balance);
  stage.addChild(win);
  animationLoop();
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
    buttonSpin.on('mousedown', spinEvent);
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
    addButton.on('mousedown', changeBetEvent);
    const addText = new PIXI.Text("+",{fontSize: 30, fill : "white"});
    addText.anchor.set(0.5, 0.5);
    addText.position.set(225,25);
    addButton.addChild(addText)

    const minusButton = new PIXI.Graphics();
    minusButton.beginFill(0xFF2342);
    minusButton.drawRect(200,50,50,50);
    minusButton.endFill();
    minusButton.interactive = true;
    minusButton.on('mousedown', changeBetEvent);
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
}

//Balance
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

//Win
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
    // eventData.target.children[0].setText("aaaa");
    console.log("aaa");
}

//change bet amount event
function changeBetEvent(eventData){
  if (eventData.target.children[0]._text == '+'){
    if(betAmountIndex<BET_AMOUNT.length-1){
      betAmountIndex+=1
    }
  } else {
    if(betAmountIndex>0){
      betAmountIndex-=1;
    }
  }
  bet.children[1].setText(`$${formatMoney(BET_AMOUNT[betAmountIndex])}`);
}

//convert a number to a readable money format
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
