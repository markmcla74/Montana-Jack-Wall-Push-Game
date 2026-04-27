 //console.log("INDEX.JS IS ALIVE!");
 //alert("If you see this, the script is loading!");
    let audioCtx; // Just declare it here
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let isProcessing = false;
    // New State Variables
    let isTwoPlayer = false;

    // Button Selectors
    const btn1P = document.getElementById("btn1P");
    const btn2P = document.getElementById("btn2P");
    const showBtn = document.getElementById("showEnergyBtn");
    const hideBtn = document.getElementById("hideEnergyBtn");
    const startBtn = document.getElementById("startGameBtn");

    // Game State
    let player1Energy = 2;
    let player2Energy = 2;
    
  
    const leftSide = "left";
    const rightSide = "right";
   
    let leftChoice = null;
    let rightChoice = null;
    let winner = null;
    let loser = null;
    let gameOver = false;
    let victoryLossScene1 = null;
    let victoryLossScene2 = null;
    let scale = null;
    let wallWidth = null;
    let wallOffset = null;
    let wallPushDistance = null;
    let crushDistance = null;
    let wallPos = null;
    let thinkingInterval; // store so we can stop it
    let showEnergy = true; // default
   // let audioCtx = null;   // global AudioContext
    
    function resizeCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const parent = canvas.parentElement;

  // Match canvas internal size to displayed size
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientWidth * 0.2667; // keep aspect ratio (2:1 here)
  //console.log(canvas.height);
  scale = 0.01*canvas.height;
  wallPos = canvas.width /2; // Middle starting point
  wallWidth = 0.01*canvas.width;
  wallOffset = 5.5*wallWidth; //distance stick figures from wall
  wallPushDistance = 14*wallWidth;
  crushDistance = 40*scale; //width of legs of collapsed stick figure (loser)

 // drawDefault(); 
  initGame(); // restart game after resize
}

    
    function drawDefault(x, y) {
     ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw wall
      ctx.fillStyle = "white";
      ctx.fillRect(wallPos - wallWidth/2, 0, wallWidth, canvas.height);
      
       // Energy display
       if (showEnergy === true){
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("P1 Energy: " + player1Energy, 40, 20);
        ctx.fillText("P2 Energy: " + player2Energy, canvas.width - 180, 20);
       }
      
      
      ctx.lineWidth = 3;
      //draw player 1 in default pose
       ctx.strokeStyle = "red";
      // Head
      ctx.beginPath();
      ctx.arc(x - wallOffset, y - 30*scale, 10*scale, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(x - wallOffset, y - 20*scale);
      ctx.lineTo(x - wallOffset, y + 20*scale);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(x - wallOffset, y - 10*scale);
      ctx.lineTo(x - wallOffset - 15*scale, y + 5*scale);
      ctx.moveTo(x - wallOffset, y - 10*scale);
      ctx.lineTo(x - wallOffset + 15*scale, y + 5*scale);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(x-wallOffset, y + 20*scale);
      ctx.lineTo((x-wallOffset) - 10*scale, y + 40*scale);
      ctx.moveTo(x-wallOffset, y + 20*scale);
      ctx.lineTo((x-wallOffset) + 10*scale, y + 40*scale);
      ctx.stroke();
      
      //draw player 2 in default pose
      ctx.strokeStyle = "blue";
      // Head
      ctx.beginPath();
      ctx.arc(x+wallOffset, y - 30*scale, 10*scale, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(x+wallOffset, y - 20*scale);
      ctx.lineTo(x+wallOffset, y + 20*scale);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(x+wallOffset, y - 10*scale);
      ctx.lineTo((x+wallOffset) - 15*scale, y + 5*scale);
      ctx.moveTo(x+wallOffset, y - 10*scale);
      ctx.lineTo((x+wallOffset) + 15*scale, y + 5*scale);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(x+wallOffset, y + 20*scale);
      ctx.lineTo((x+wallOffset) - 10*scale, y + 40*scale);
      ctx.moveTo(x+wallOffset, y + 20*scale);
      ctx.lineTo((x+wallOffset) + 10*scale, y + 40*scale);
      ctx.stroke();
    }

    function drawAction(x, y, playerID, action) {
      //dir is necessary so the arms always point towards the wall
      let dir;
      
      if (playerID === "left"){
        ctx.strokeStyle = "red";
        dir = 1;
      }
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
        dir = -1;
      }
      
      ctx.lineWidth = 3;

    // Head
      ctx.beginPath();
      ctx.arc(x, y - 30*scale, 10*scale, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(x, y - 20*scale);
      ctx.lineTo(x, y + 20*scale);
      ctx.stroke();
      console.log(action);
      if (action === "rest") {
        // Arms up in the air
        ctx.beginPath();
        ctx.moveTo(x, y - 20*scale);
        ctx.lineTo(x - 15*scale, y - 40*scale);
        ctx.moveTo(x, y - 20*scale);
        ctx.lineTo(x + 15*scale, y - 40*scale);
        ctx.stroke();
      }
      
      if (action === "push") {
        // Arms pushing forward
        ctx.beginPath();
        ctx.moveTo(x, y - 10*scale);
        ctx.lineTo(x + 20*dir*scale, y - 10*scale);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20*dir*scale, y);
        ctx.stroke();
      }
      
      if (action === "super") {
        // Arms pushing strongly forward
        ctx.lineWidth = 6;
        //redraw head with thick line
        ctx.beginPath();
        ctx.arc(x, y - 30*scale, 10*scale, 0, Math.PI * 2);
        ctx.stroke();
        //redraw body with thick line
        ctx.beginPath();
        ctx.moveTo(x, y - 20*scale);
        ctx.lineTo(x, y + 20*scale);
        ctx.stroke();
        //draw arms
        ctx.beginPath();
        ctx.moveTo(x, y - 10*scale);
        ctx.lineTo(x + 20*dir*scale, y - 10*scale);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20*dir*scale, y);
        ctx.stroke();
      }
      
      if (action ==="doNothing"){
              // Body
                ctx.beginPath();
                ctx.moveTo(x, y - 20*scale);
                ctx.lineTo(x, y + 20*scale);
                ctx.stroke();

            // Arms (relaxed, pointing downward)
                ctx.beginPath();
                ctx.moveTo(x, y - 10*scale);
                ctx.lineTo(x - 15*scale, y + 10*scale);
                ctx.moveTo(x, y - 10*scale);
                ctx.lineTo(x + 15*scale, y + 10*scale);
                ctx.stroke();

            // Legs
                ctx.beginPath();
                ctx.moveTo(x, y + 20*scale);
                ctx.lineTo(x - 10*scale, y + 35*scale);
                ctx.moveTo(x, y + 20*scale);
                ctx.lineTo(x + 10*scale, y + 35*scale);
                ctx.stroke();
    }
     
    if (action === "push" || action === "super") {
        // Lean forward legs
        ctx.beginPath();
        ctx.moveTo(x, y + 20*scale);
        ctx.lineTo(x - 10*dir*scale, y + 40*scale);
        ctx.moveTo(x, y + 20*scale);
        ctx.lineTo(x + 20*dir*scale, y + 40*scale); // forward leg extends toward wall
        ctx.stroke();
    }
    
    if (action === "rest") {
        // Legs relaxed
        ctx.beginPath();
        ctx.moveTo(x, y + 20*scale);
        ctx.lineTo(x - 15*scale, y + 40*scale);
        ctx.moveTo(x, y + 20*scale);
        ctx.lineTo(x + 15*scale, y + 40*scale);
        ctx.stroke();
    } 
      
    }
    
     function drawLoser(x, y, playerID) {
     //console.log(playerID);
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
      }
      if (playerID === "left"){
        ctx.strokeStyle = "red";
      }

      ctx.lineWidth = 3;
      
      // Tilted head
         ctx.beginPath();
         ctx.ellipse(x, y - 25*scale, 12*scale, 8*scale, Math.PI / 4, 0, Math.PI * 2);
         ctx.stroke();
       // Body
      ctx.beginPath();
      ctx.moveTo(x, y - 20*scale);
      ctx.lineTo(x, y + 20*scale);
      ctx.stroke();
      // Flailing arms downward
        ctx.beginPath();
        ctx.moveTo(x, y - 20*scale);
        ctx.lineTo(x - 20*scale, y);
        ctx.moveTo(x, y - 20*scale);
        ctx.lineTo(x + 20*scale, y);
        ctx.stroke();

        // Collapsed legs
        ctx.beginPath();
        ctx.moveTo(x, y + 20*scale);
        ctx.lineTo(x - 20*scale, y + 30*scale);
        ctx.moveTo(x, y + 20*scale);
        ctx.lineTo(x + 20*scale, y + 30*scale);
        ctx.stroke();
     
    }
    
    function drawWinnerPose1(x, y, playerID) {
      if (playerID === "left"){
        ctx.strokeStyle = "red";
      }
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
      }

      ctx.lineWidth = 3;
      
    // Head
    ctx.beginPath();
    ctx.arc(x, y - 25*scale, 12*scale, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - 13*scale);
    ctx.lineTo(x, y + 15*scale);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x, y + 15*scale);
    ctx.lineTo(x - 10*scale, y + 35*scale);
    ctx.moveTo(x, y + 15*scale);
    ctx.lineTo(x + 10*scale, y + 35*scale);
    ctx.stroke();

    // Arms alternate positions
    ctx.beginPath();
      // Arms raised up
      ctx.moveTo(x, y - 10*scale);
      ctx.lineTo(x - 20*scale, y - 30*scale);
      ctx.moveTo(x, y - 10*scale);
      ctx.lineTo(x + 20*scale, y - 30*scale);
     ctx.stroke();
    
}
     
  function drawWinnerPose2(x, y, playerID) {
      if (playerID === "left"){
        ctx.strokeStyle = "red";
      }
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
      }

      ctx.lineWidth = 3;
      // Head
      ctx.beginPath();
      ctx.arc(x, y - 25*scale, 12*scale, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(x, y - 13*scale);
      ctx.lineTo(x, y + 15*scale);
      ctx.stroke();
  
      // Legs: wide stance
      ctx.beginPath();
      ctx.moveTo(x, y + 15*scale);
      ctx.lineTo(x - 20*scale, y + 40*scale);
      ctx.moveTo(x, y + 15*scale);
      ctx.lineTo(x + 20*scale, y + 40*scale);
      ctx.stroke();

      // Arms out sideways
      ctx.beginPath();
      ctx.moveTo(x, y - 10*scale);
      ctx.lineTo(x - 20*scale, y);
      ctx.moveTo(x, y - 10*scale);
      ctx.lineTo(x + 20*scale, y);
      ctx.stroke();
   }

function drawWinnerPose3(x, y, playerID) {
      if (playerID === "left"){
        ctx.strokeStyle = "red";
      }
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
      }

      ctx.lineWidth = 3;
     // Head
  ctx.beginPath();
  ctx.arc(x, y - 25*scale, 12*scale, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 13*scale);
  ctx.lineTo(x, y + 15*scale);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + 15*scale);
  ctx.lineTo(x - 10*scale, y + 35*scale);
  ctx.moveTo(x, y + 15*scale);
  ctx.lineTo(x + 10*scale, y + 35*scale);
  ctx.stroke();

  // Arms down (celebration / resting pose)
  ctx.beginPath();
  ctx.moveTo(x, y - 10*scale);
  ctx.lineTo(x - 10*scale, y + 20*scale);
  ctx.moveTo(x, y - 10*scale);
  ctx.lineTo(x + 10*scale, y + 20*scale);
  ctx.stroke();
}

function drawWinnerPose4(x, y, playerID) {
      if (playerID === "left"){
        ctx.strokeStyle = "red";
        
      }
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
       
      }

      ctx.lineWidth = 3;
       // Head
  ctx.beginPath();
  ctx.arc(x, y - 25*scale, 12*scale, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 13*scale);
  ctx.lineTo(x, y + 15*scale);
  ctx.stroke();

 
  // Legs: wide stance
  ctx.beginPath();
  ctx.moveTo(x, y + 15*scale);
  ctx.lineTo(x - 20*scale, y + 40*scale);
  ctx.moveTo(x, y + 15*scale);
  ctx.lineTo(x + 20*scale, y + 40*scale);
  ctx.stroke();

  // One arm up, one arm sideways
  ctx.beginPath();
  ctx.moveTo(x, y - 10*scale);
  ctx.lineTo(x - 20*scale, y - 30*scale); // left arm up
  ctx.moveTo(x, y - 10*scale);
  ctx.lineTo(x + 20*scale, y);      // right arm sideways
  ctx.stroke();
}

function drawWinnerPose5(x, y, playerID) {
      if (playerID === "left"){
        ctx.strokeStyle = "red";
      }
      if (playerID === "right"){
        ctx.strokeStyle = "blue";
      }

      ctx.lineWidth = 3;
     // Head
  ctx.beginPath();
  ctx.arc(x, y - 25*scale, 12*scale, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 13*scale);
  ctx.lineTo(x, y + 15*scale);
  ctx.stroke();

  // Legs: wide stance
  ctx.beginPath();
  ctx.moveTo(x, y + 15*scale);
  ctx.lineTo(x - 20*scale, y + 40*scale);
  ctx.moveTo(x, y + 15*scale);
  ctx.lineTo(x + 20*scale, y + 40*scale);
  ctx.stroke();

  // Arms both straight up
  ctx.beginPath();
  ctx.moveTo(x, y - 10*scale);
  ctx.lineTo(x - 5*scale, y - 40*scale); // left arm
  ctx.moveTo(x, y - 10*scale);
  ctx.lineTo(x + 5*scale, y - 40*scale); // right arm
  ctx.stroke();
}

    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

     

      // Draw wall
      ctx.fillStyle = "white";
      ctx.fillRect(wallPos - wallWidth/2, 0, wallWidth, canvas.height);
      
       // Draw players as stick figures
      drawAction(wallPos + wallOffset, canvas.height/2, rightSide, rightChoice);
      drawAction(wallPos - wallOffset, canvas.height/2, leftSide, leftChoice);

       // Energy display
       if (showEnergy === true){
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("P1 Energy: " + player1Energy, 40, 20);
        ctx.fillText("P2 Energy: " + player2Energy, canvas.width - 180, 20);
       }
    }
    
     function drawLoserAndWinner(loser) {
     
      
       // Draw players as stick figures
       if (loser === "left"){
         let frame = 0;
         victoryLossScene1 = setInterval(() => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw wall
        ctx.fillStyle = "white";
        ctx.fillRect(wallPos - wallWidth/2, 0, wallWidth, canvas.height);
      
      
        // Energy display
       if (showEnergy === true){
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("P1 Energy: " + player1Energy, 40, 20);
        ctx.fillText("P2 Energy: " + player2Energy, canvas.width - 180, 20);
       }
        
       
        if (frame % 5 === 0){
           drawLoser(wallPos - wallOffset, canvas.height/2, "left");
           drawWinnerPose1(wallPos + 2*wallOffset, canvas.height/2, "right");
        }
        
        if (frame % 5 === 1){
            drawLoser(wallPos - wallOffset, canvas.height/2, "left");
            drawWinnerPose2(wallPos + 2*wallOffset, canvas.height/2, "right");
        }
         if (frame % 5 === 2){
           drawLoser(wallPos - wallOffset, canvas.height/2, "left");
           drawWinnerPose3(wallPos + 2*wallOffset, canvas.height/2, "right");
        }
        
        if (frame % 5 === 3){
            drawLoser(wallPos - wallOffset, canvas.height/2, "left");
            drawWinnerPose4(wallPos + 2*wallOffset, canvas.height/2, "right");
        }
        if (frame % 5 === 4){
            drawLoser(wallPos - wallOffset, canvas.height/2, "left");
            drawWinnerPose5(wallPos + 2*wallOffset, canvas.height/2, "right");
        }
        frame++;
        },400);
       }
      
       if (loser === "right"){
         let frame = 0;
         victoryLossScene2 = setInterval(() => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw wall
        ctx.fillStyle = "white";
        ctx.fillRect(wallPos - wallWidth/2, 0, wallWidth, canvas.height);
      
      
         // Energy display
       if (showEnergy === true){
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.fillText("P1 Energy: " + player1Energy, 40, 20);
        ctx.fillText("P2 Energy: " + player2Energy, canvas.width - 180, 20);
       }
        
       
        if (frame % 5 === 0){
           drawLoser(wallPos + wallOffset, canvas.height/2, "right");
           drawWinnerPose1(wallPos - 2*wallOffset, canvas.height/2, "left");
        }
        
        if (frame % 5 === 1){
            drawLoser(wallPos + wallOffset, canvas.height/2, "right");
            drawWinnerPose2(wallPos - 2*wallOffset, canvas.height/2, "left");
        }
         if (frame % 5 === 2){
           drawLoser(wallPos + wallOffset, canvas.height/2, "right");
           drawWinnerPose3(wallPos - 2*wallOffset, canvas.height/2, "left");
        }
        
        if (frame % 5 === 3){
            drawLoser(wallPos + wallOffset, canvas.height/2, "right");
            drawWinnerPose4(wallPos - 2*wallOffset, canvas.height/2, "left");
        }
        if (frame % 5 === 4){
            drawLoser(wallPos + wallOffset, canvas.height/2, "right");
            drawWinnerPose5(wallPos - 2*wallOffset, canvas.height/2, "left");
        }
        frame++;
        },400);
        }

    }
    
     function initGame() {
      //console.log("here");
      player1Energy = 2;
      player2Energy = 2;
      wallPos = canvas.width / 2;
      gameOver = false;
      leftChoice = null;
      rightChoice = null;
      winner = null;
      loser = null;
      clearInterval(victoryLossScene1);
      clearInterval(victoryLossScene2);
      document.getElementById("status").innerText = "";
      victoryLossScene1 = null;
      victoryLossScene2 = null;
      drawDefault(wallPos, canvas.height/2);
      document.querySelectorAll('.game-btn').forEach(btn => {
        btn.classList.remove('is-pressed');
      });
    }
    
    function checkWinCondition(wallPos) {
      // 1. Check win condition
      if (wallPos <= crushDistance) {
        document.getElementById("status").innerText = "Player 1 is crushed! Player 2 wins!";
         draw(); //draw final push
        gameOver = true;
        winner = "right";
      } else if (wallPos >= canvas.width - crushDistance) {
        document.getElementById("status").innerText = "Player 2 is crushed! Player 1 wins!";
         draw(); //draw final push
        gameOver = true;
        winner = "left";
      }

      // 2. Handle Game Still Running
      if (gameOver === false) {
        draw();
        setTimeout(() => { drawDefault(wallPos, canvas.height / 2); }, 400);
        leftChoice = null;
        rightChoice = null;
      }

      // 3. Handle Game Over (The Victory Sequence)
      if (gameOver === true) {
        // Immediate Visuals: Draw the winner/loser state
        if (winner === "right") drawLoserAndWinner("left");
        if (winner === "left") drawLoserAndWinner("right");

        // Start the victory sounds immediately
        stopThinkingSound();
        playCrushedAndVictory();

        // DELAYED ACTIONS: Wait 3 seconds before resetting the UI
        setTimeout(() => {
          // Bring back the start menu
          document.getElementById("startOverlay").style.display = "flex";

          // Clear the status text so it's fresh for the next game
          document.getElementById("status").innerText = "";

          // Optional: If you have a specific reset function for the wall/energy,
          // you could call it here.
        }, 3000);
      }
    }

    function resolveTurn() {
      if (gameOver) return;

      let p1Power = 0;
      let p2Power = 0;

      // 1. Resolve Player 1 Intent & Energy
      if (leftChoice === "rest") {
        player1Energy += 2;
        p1Power = 0;
        playRestSound();
      } else if (leftChoice === "push" && player1Energy >= 1) {
        player1Energy -= 1;
        p1Power = 1.5;
        playPushSound();
      } else if (leftChoice === "super" && player1Energy >= 4) {
        player1Energy -= 4;
        p1Power = 3;
        playHadouken();
      } else {
        // PENALTY: Tried to Move without enough Energy
        // We set it to zero to punish the "bad guess" or "bad bluff"
        player1Energy = 0;
        p1Power = 0;
        playDoNothingSound();
      }

      // 2. Resolve Player 2 Intent & Energy
      if (rightChoice === "rest") {
        player2Energy += 2;
        p2Power = 0;
        playRestSound();
      } else if (rightChoice === "push" && player2Energy >= 1) {
        player2Energy -= 1;
        p2Power = 1.5;
        playPushSound();
      } else if (rightChoice === "super" && player2Energy >= 4) {
        player2Energy -= 4;
        p2Power = 3;
        playHadouken();
      } else {
        // PENALTY: Same for Player 2
        player2Energy = 0;
        p2Power = 0;
        playDoNothingSound();
      }

      // 3. Move the Wall
      let netMove = (p1Power - p2Power) * wallPushDistance;

      if (netMove !== 0) {
        let targetPos = wallPos + netMove;
        if (targetPos < crushDistance) wallPos = 0.9 * crushDistance;
        else if (targetPos > (canvas.width - crushDistance)) wallPos = canvas.width - 0.9 * crushDistance;
        else wallPos = targetPos;
      }

      checkWinCondition(wallPos);
    }
    
    function playHadouken() {
  //const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Oscillator for the "energy charge"
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);       // start low
  osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5); // rise

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0); // fade out

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.0); // total duration ~1 second
}

function playPushSound() {
  // We use the global audioCtx instead of creating a local ctx
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";

  // Update 'ctx' to 'audioCtx' for time and destination
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

  // Connect to the global destination
  osc.connect(gain).connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.25);
}

function playRestSound() {
  // 1. We removed the local ctx. Use the global audioCtx instead.

  // First "ding"
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = "sine";

  // Use audioCtx for timing and frequency
  osc1.frequency.setValueAtTime(600, audioCtx.currentTime);
  gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

  // Connect to the global audioCtx destination
  osc1.connect(gain1).connect(audioCtx.destination);
  osc1.start();
  osc1.stop(audioCtx.currentTime + 0.25);

  // Second "ding"
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "sine";

  // Notice all timing is relative to audioCtx.currentTime
  osc2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.15);
  gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

  osc2.connect(gain2).connect(audioCtx.destination);
  osc2.start(audioCtx.currentTime + 0.15);
  osc2.stop(audioCtx.currentTime + 0.4);
}

function playDoNothingSound() {
  // Use the global audioCtx established in your startGame function

  // First low tone
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = "sawtooth";
  osc1.frequency.setValueAtTime(200, audioCtx.currentTime);
  gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  // Connect to the shared destination
  osc1.connect(gain1).connect(audioCtx.destination);
  osc1.start();
  osc1.stop(audioCtx.currentTime + 0.3);

  // Slightly lower tone right after
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(150, audioCtx.currentTime + 0.25);
  gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.25);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.55);

  osc2.connect(gain2).connect(audioCtx.destination);
  osc2.start(audioCtx.currentTime + 0.25);
  osc2.stop(audioCtx.currentTime + 0.55);
}

function playCrushedAndVictory() {
  // We use the global audioCtx established in startGame

  // --- 1. CRUSHED SOUND ---
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);

  // --- 2. NOISE BURST (RUBBLE) ---
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  noise.connect(noiseGain).connect(audioCtx.destination);
  noise.start();

  // --- 3. VICTORY JINGLE LOOP ---
  // Notice we updated 'ctx' to 'audioCtx' inside this helper too!
  function playNote(freq, startTime, duration) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(0.4, startTime);
    g.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    o.connect(g).connect(audioCtx.destination);
    o.start(startTime);
    o.stop(startTime + duration);
  }

  const startDelay = 0.7;
  const loopDuration = 0.8;
  const totalTime = 5;
  let t = startDelay;
  while (t < totalTime) {
    // Schedule notes relative to audioCtx.currentTime
    playNote(261.63, audioCtx.currentTime + t, 0.25);
    playNote(329.63, audioCtx.currentTime + t + 0.25, 0.25);
    playNote(392.00, audioCtx.currentTime + t + 0.5, 0.3);
    t += loopDuration;
  }
}

function startThinkingSound() {
  // 1. We no longer create a 'new' context here.
  // We use the 'audioCtx' created in startGame.

  if (thinkingInterval) clearInterval(thinkingInterval);

  thinkingInterval = setInterval(() => {
    // 2. Change 'ctx' to 'audioCtx' here:
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    const freq = 300 + Math.random() * 200;

    // 3. And here:
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // 4. And everywhere else inside this loop:
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }, 300);
}

function stopThinkingSound() {
  if (thinkingInterval) {
    clearInterval(thinkingInterval);
    thinkingInterval = null;
  }
}
// Start game function
async function startGame(withEnergy) {
  showEnergy = withEnergy;

  // 1. FORCED LANDSCAPE & FULLSCREEN
  try {
    const docElm = document.documentElement;

    // Request Fullscreen first (Required by many browsers to lock orientation)
    if (docElm.requestFullscreen) {
      await docElm.requestFullscreen();
    } else if (docElm.webkitRequestFullscreen) {
      await docElm.webkitRequestFullscreen();
    }

    // Lock orientation to landscape
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (err) {
    console.log("Orientation lock or Fullscreen failed. This is normal on desktop or if the user hasn't interacted enough yet.", err);
  }

  // 2. HIDE OVERLAY
  document.getElementById("startOverlay").style.display = "none";

  // Create the context once and resume it
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  // 4. START GAME LOGIC
  startThinkingSound();
  initGame();
}

 
    document.addEventListener("DOMContentLoaded", () => {
            drawDefault(wallPos, canvas.height/2);
    });
    

    document.addEventListener("keydown", (e) => {
      
      if (gameOver) return;
     
      // Player 1 controls
      if (e.key === "a") leftChoice = "rest";
      if (e.key === "s") leftChoice = "push";
      if (e.key === "d") leftChoice = "super";

      // Player 2 controls
      if (e.key === "j") rightChoice = "rest";
      if (e.key === "k") rightChoice = "push";
      if (e.key === "l") rightChoice = "super";
      // If both players have chosen, resolve
      if (leftChoice && rightChoice) {
        resolveTurn();
      }
    });

    // 1. SET THE DIALS (Variable Toggles ONLY)
    btn1P.onclick = (e) => {
      e.stopPropagation(); // Stop the click from "bubbling" up
      isTwoPlayer = false;
      //console.log("1 player button pushed");
      btn1P.classList.add("active");
      btn2P.classList.remove("active");

    };

    btn2P.onclick = (e) => {
      e.stopPropagation();
      isTwoPlayer = true;
      console.log("isTwoPlayer",isTwoPlayer);
      btn2P.classList.add("active");
      btn1P.classList.remove("active");

    };

    showBtn.onclick = (e) => {

      e.stopPropagation();
      showEnergy = true;

      showBtn.classList.add("active");
      hideBtn.classList.remove("active");

    };

    hideBtn.onclick = (e) => {
      e.stopPropagation();
      showEnergy = false;
      hideBtn.classList.add("active");
      showBtn.classList.remove("active");

    };

    // 2. THE ONLY TRIGGER (Start Button)
    startBtn.onclick = (e) => {
      e.stopPropagation();
      startGame(showEnergy);

    };
    
    // Update when window resizes
     window.addEventListener("resize", resizeCanvas);
     // Run once on load
     resizeCanvas();
     
     // Register the Service Worker for PWA functionality
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', () => {
         navigator.serviceWorker.register('./sw.js')
         .then(reg => console.log('Service Worker registered successfully!', reg))
         .catch(err => console.log('Service Worker registration failed:', err));
       });
     }
     window.addEventListener('load', () => {
       console.log("Wiring all game buttons...");

       // Helper to wire up a side (left or right)
       function wireSide(containerId, side) {
         const buttons = document.querySelectorAll(`${containerId} .game-btn`);

         buttons.forEach(btn => {
           let action = "";
           const text = btn.innerText.toLowerCase();

           if (text.includes("super")) action = "super";
           else if (text.includes("push")) action = "push";
           else if (text.includes("rest")) action = "rest";

           btn.addEventListener('click', () => {
             // --- THE ANTI-CHEAT GATE ---
             // If it's a 1P game and the side is Right, ignore the click
             if (isTwoPlayer === false && side === 'right') {
               console.log("Player 1, no cheating! This is the computer's side.");
               return;
             }

             // Existing safety: Don't allow clicks during turn resolution
             if (isProcessing) return;

             // 1. Remove 'is-pressed' from all buttons in this specific container
             for (let j = 0; j < buttons.length; j++) {
               buttons[j].classList.remove('is-pressed');
             }

             // 2. Add 'is-pressed' back to the clicked button
             // (Simplified your if/else chain by just adding it to the current 'btn')
             btn.classList.add('is-pressed');

             // 3. Send to logic
             handleInput(side, action);
           });
         });
       }

       // Wire up Player 1 (Left) and Player 2 (Right)
         wireSide('#controlsP1', 'left');
         wireSide('#controlsP2', 'right');



       console.log("All buttons active!");
     });

     function handleInput(player, choice) {
       if (gameOver || isProcessing) return;

       // --- ONE PLAYER LOGIC ---
       if (isTwoPlayer === false) {
         if (player === 'left') {
           leftChoice = choice;

           // TRIGGER THE CPU: wait 400ms so the player can see their own button light up first
           // mutual recursion (or a circular dependency) part of the code. makeCPUMove calls handleInput
           // handleInput will then have a completed left and right choice and resolveTurn.
           // isProcessing is set to false so handleInput will properly "unwind" out of its recursion.
           setTimeout(makeCPUMove, 400);
         }

         if (player === 'right') {
           rightChoice = choice;
         }
       }

       // --- TWO PLAYER LOGIC ---
       if (isTwoPlayer === true) {
         if (player === 'left') leftChoice = choice;
         if (player === 'right') rightChoice = choice;
       }

       // --- THE FAILSAFE: Check for the "Clash" ---
       const p1Ready = !!document.querySelector('#controlsP1 .is-pressed');
       const p2Ready = !!document.querySelector('#controlsP2 .is-pressed');

       if (p1Ready && p2Ready) {
         isProcessing = true;

         setTimeout(() => {
           resolveTurn();

           setTimeout(() => {
             document.querySelectorAll('.game-btn').forEach(btn => btn.classList.remove('is-pressed'));
             leftChoice = null;
             rightChoice = null;
             isProcessing = false;
           }, 700);
         }, 50);
       }
     }
     function makeCPUMove() {
       if (gameOver || isProcessing) return;

       let action = "";
       const e = player2Energy;
       const rand = Math.random();

       // 1. ENERGY-BASED BRAIN
       if (e === 0) {
         action = "rest";
       }
       else if (e >= 1 && e <= 3) {
         // Saving phase
         action = rand < 0.75 ? "rest" : "push";
       }
       else if (e >= 4 && e <= 7) {
         // Tier 2: Increased Aggression
         // 70% Super Push, 20% Push, 10% Rest
         if (rand < 0.7) action = "super";
         else if (rand < 0.9) action = "push";
         else action = "rest";
       }
       else if (e >= 8) {
         // Tier 3: Pure Panic Mode for the player
         // 90% chance to Super Push if they have 2+ in the bank
         action = rand < 0.9 ? "super" : "push";
       }

       // 2. VISUAL FEEDBACK
       const cpuButtons = document.querySelectorAll('#controlsP2 .game-btn');
       cpuButtons.forEach(btn => btn.classList.remove('is-pressed'));

       if (action === "push") cpuButtons[0].classList.add('is-pressed');
       if (action === "super") cpuButtons[1].classList.add('is-pressed');
       if (action === "rest") cpuButtons[2].classList.add('is-pressed');

       // 3. EXECUTE
       console.log(`CPU Energy: ${e} | Action: ${action}`);
       handleInput('right', action);
     }
