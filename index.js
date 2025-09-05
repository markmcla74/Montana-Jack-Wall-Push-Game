    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
   

    // Game State
    let player1Energy = 3;
    let player2Energy = 3;
    
  
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
    let audioCtx = null;   // global AudioContext
    
    function resizeCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const parent = canvas.parentElement;

  // Match canvas internal size to displayed size
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientWidth * 0.2667; // keep aspect ratio (2:1 here)
  console.log(canvas.height);
  scale = 0.01*canvas.height;
  wallPos = canvas.width /2; // Middle starting point
  wallWidth = 0.01*canvas.width;
  wallOffset = 5.5*wallWidth; //distance stick figures from wall
  wallPushDistance = 7*wallWidth;
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
      console.log("here");
      player1Energy = 3;
      player2Energy = 3;
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
    }
    
    function checkWinCondition(wallPos) {
        // Check win condition
      
      if (wallPos <= crushDistance) {
        document.getElementById("status").innerText = "Player 1 is crushed! Player 2 wins!";
        gameOver = true;
        winner = "right";
        loser = "left";
        
      } else if (wallPos >= canvas.width - crushDistance) {
        document.getElementById("status").innerText = "Player 2 is crushed! Player 1 wins!";
        gameOver = true;
        winner = "left";
        loser = "right";
      }

      
       
      if (gameOver === false) {
       draw();
      // Code runs after 400 ms
      // Reset choices
      setTimeout(()=>{drawDefault(wallPos, canvas.height/2);},400);
      leftChoice = null;
      rightChoice = null;
      //startThinkingSound();
      }
      
     
      
      if ((gameOver === true) && (winner === "right")){
       drawLoserAndWinner("left");
      
      }
      
      if ((gameOver === true) && (winner === "left")){
       drawLoserAndWinner("right");
      }
      
       if (gameOver === true){
        document.getElementById("startOverlay").style.display = "flex";
        stopThinkingSound();
        playCrushedAndVictory();
        
      } 
    
    }

    function resolveTurn() {
      if (gameOver) return;
      //There are 5 different inputs for each player. This gives 25 different outputs
      //The 5 inputs are: rest, push & E >=1, push & E=0, super push and E>=3, super push and E<3
      //Imagine a 2D grid with a column representing P1, and a row representing P2
      //And the inside of the grid is filled with the appropriate actions to take
      //Here is the brute force way of listing all 25 possibilites and outcomes.
      
      //Player1 is leftChoice = "column", Player2 is rightChoice = "row"
      //We'll fix Player2 and loop through Player1 choices. 
      //Then increment Player2 choice and loop through Player1 choices again.
      //Repeat until all 25 choices described.
      
      //"column 1 choices"
      if (leftChoice === "rest" && rightChoice === "rest"){
        playRestSound();
        playRestSound();
        player1Energy += 4;
        player2Energy += 4;
        checkWinCondition(wallPos);
        return;
      } 
      
      if ((leftChoice === "push" && player1Energy >=1) && (rightChoice === "rest")){
        playPushSound();
        playRestSound();
        player1Energy -= 1;
        player2Energy += 4;
        if ((wallPos + wallPushDistance) < (canvas.width - crushDistance)){
          wallPos += wallPushDistance;
        } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "push" && player1Energy == 0) && (rightChoice === "rest")){
        playDoNothingSound();
        playRestSound();
        leftChoice = "doNothing";
        player2Energy += 4;
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "super" && player1Energy >= 3) && (rightChoice === "rest")){
        playHadouken();
        playRestSound();
        player1Energy -= 3;
        player2Energy += 4;
        if ((wallPos + 2*wallPushDistance)< (canvas.width - crushDistance)){
          wallPos += 2*wallPushDistance;
         } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "super" && player1Energy < 3) && (rightChoice === "rest")){
        playDoNothingSound();
        playRestSound();
        player1Energy = 0;
        player2Energy += 4;
        leftChoice = "doNothing";
        checkWinCondition(wallPos);
        return;
      }
      
      //"column 2 choices"
       if ((leftChoice === "rest") && (rightChoice === "push" && player2Energy >= 1)){
        playRestSound();
        playPushSound();
        player1Energy += 4;
        player2Energy -= 1;
        if ((wallPos - wallPushDistance) > crushDistance){
          wallPos -= wallPushDistance;
        } else wallPos = 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "push" && player1Energy >= 1) && (rightChoice === "push" && player2Energy >= 1)){
        playPushSound();
        playPushSound();
        player1Energy -= 1;
        player2Energy -= 1;
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "push" && player1Energy == 0) && (rightChoice === "push" && player2Energy >= 1)){
        playDoNothingSound();
        playPushSound();
        player2Energy -= 1;
        leftChoice = "doNothing";
        if ((wallPos - wallPushDistance) > crushDistance){
          wallPos -= wallPushDistance;
        } else wallPos = 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "super" && player1Energy >= 3) && (rightChoice === "push" && player2Energy >= 1)){
        playHadouken();
        playPushSound();
        player1Energy -=3;
        player2Energy -= 1;
        if ((wallPos + wallPushDistance) < (canvas.width - crushDistance)){
          wallPos += wallPushDistance;
        } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "super" && player1Energy < 3) && (rightChoice === "push" && player2Energy >= 1)){
        playDoNothingSound();
        playPushSound();
        player1Energy = 0;
        player2Energy -= 1;
        leftChoice = "doNothing";
        if ((wallPos - wallPushDistance) > crushDistance){
          wallPos -= wallPushDistance;
        } else wallPos = 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
      //"column 3 choices"
       if ((leftChoice === "rest") && (rightChoice === "push" && player2Energy == 0)){
        playRestSound();
        playDoNothingSound();
        rightChoice = "doNothing";
        player1Energy += 4;
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "push" && player1Energy >= 1) && (rightChoice === "push" && player2Energy == 0)){
        playPushSound();
        playDoNothingSound();
        player1Energy -= 1;
        rightChoice = "doNothing";
         if ((wallPos + wallPushDistance) < (canvas.width - crushDistance)){
          wallPos += wallPushDistance;
        } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "push" && player1Energy == 0) && (rightChoice === "push" && player2Energy == 0)){
        playDoNothingSound();
        playDoNothingSound();
        rightChoice = "doNothing";
        leftChoice = "doNothing";
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "super" && player1Energy >= 3) && (rightChoice === "push" && player2Energy == 0)){
        playHadouken();
        playDoNothingSound();
        rightChoice = "doNothing";
        player1Energy -= 3;
        if ((wallPos + 2*wallPushDistance)< (canvas.width - crushDistance)){
          wallPos += 2*wallPushDistance;
         } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser 
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "super" && player1Energy < 3) && (rightChoice === "push" && player2Energy == 0)){
        playDoNothingSound();
        playDoNothingSound();
        rightChoice = "doNothing";
        leftChoice = "doNothing";
        player1Energy = 0;
        checkWinCondition(wallPos);
        return;
      }
      
      //"column 4 choices"
       if ((leftChoice === "rest") && (rightChoice === "super" && player2Energy >= 3)){
        playRestSound();
        playHadouken();
        player1Energy += 4;
        player2Energy -= 3;
         if ((wallPos - 2*wallPushDistance) > crushDistance){
           wallPos -= 2*wallPushDistance;
         } else wallPos = 0.9*crushDistance;
        checkWinCondition(wallPos);
        return;
      }
      
      if ((leftChoice === "push" && player1Energy >= 1) && (rightChoice === "super" && player2Energy >= 3)){
        playPushSound();
        playHadouken();
        player1Energy += 4;
        player2Energy -= 3;
        if ((wallPos - wallPushDistance) > crushDistance){
          wallPos -= wallPushDistance;
        } else wallPos = 0.9*crushDistance;
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "push" && player1Energy == 0) && (rightChoice === "super" && player2Energy >= 3)){
        playDoNothingSound();
        playHadouken();
        leftChoice = "doNothing";
        player2Energy -= 3;
        if ((wallPos - 2*wallPushDistance) > crushDistance){
           wallPos -= 2*wallPushDistance;
         } else wallPos = 0.9*crushDistance;
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "super" && player1Energy >= 3) && (rightChoice === "super" && player2Energy >= 3)){
        playHadouken();
        playHadouken();
        player1Energy -= 3;
        player2Energy -= 3;
        checkWinCondition(wallPos);
        return;
      }
      
        if ((leftChoice === "super" && player1Energy < 3) && (rightChoice === "super" && player2Energy >= 3)){
        playDoNothingSound();
        playHadouken();
        leftChoice = "doNothing";
        player1Energy = 0;
        player2Energy -= 3;
        if ((wallPos - 2*wallPushDistance) > crushDistance){
           wallPos -= 2*wallPushDistance;
         } else wallPos = 0.9*crushDistance;
        checkWinCondition(wallPos);
        return;
      }
      
      //"column 5 choices"
       if ((leftChoice === "rest") && (rightChoice === "super" && player2Energy < 3)){
        playRestSound();
        playDoNothingSound();
        rightChoice = "doNothing";
        player1Energy += 4;
        player2Energy = 0;
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "push" && player1Energy >= 1) && (rightChoice === "super" && player2Energy < 3)){
        playPushSound();
        playDoNothingSound();
        rightChoice = "doNothing";
        player1Energy -= 1;
        player2Energy = 0;
        if ((wallPos + wallPushDistance) < (canvas.width - crushDistance)){
          wallPos += wallPushDistance;
        } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "push" && player1Energy == 0) && (rightChoice === "super" && player2Energy < 3)){
        playDoNothingSound();
        playDoNothingSound();
        leftChoice = "doNothing";
        rightChoice = "doNothing";
        player2Energy = 0;
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "super" && player1Energy >= 3) && (rightChoice === "super" && player2Energy < 3)){
        playHadouken();
        playDoNothingSound();
        rightChoice = "doNothing";
        player1Energy -= 3;
        player2Energy = 0;
         if ((wallPos + 2*wallPushDistance)< (canvas.width - crushDistance)){
          wallPos += 2*wallPushDistance;
         } else wallPos = canvas.width - 0.9*crushDistance; //wall crushes loser
        checkWinCondition(wallPos);
        return;
      }
      
       if ((leftChoice === "super" && player1Energy < 3) && (rightChoice === "super" && player2Energy < 3)){
        playDoNothingSound();
        playDoNothingSound();
        leftChoice = "doNothing";
        rightChoice = "doNothing";
        player1Energy = 0;
        player2Energy = 0;
        checkWinCondition(wallPos);
        return;
      }
      
    }
    
    function playHadouken() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // A little "pew" sound, shorter and higher-pitched
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";          // square gives it a bit of "toy" quality
  osc.frequency.setValueAtTime(300, ctx.currentTime);   // start higher
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2); // quick drop

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25); // much shorter than super push
}

    function playRestSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // First "ding"
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(600, ctx.currentTime);
  gain1.gain.setValueAtTime(0.2, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start();
  osc1.stop(ctx.currentTime + 0.25);

  // Second "ding" slightly higher, shortly after
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.15);
  gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.4);
}

function playDoNothingSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // First low tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sawtooth";
  osc1.frequency.setValueAtTime(200, ctx.currentTime);
  gain1.gain.setValueAtTime(0.15, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start();
  osc1.stop(ctx.currentTime + 0.3);

  // Slightly lower tone right after (makes it sound "falling")
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(150, ctx.currentTime + 0.25);
  gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.25);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.25);
  osc2.stop(ctx.currentTime + 0.55);
}

function playCrushedAndVictory() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  // --- CRUSHED SOUND ---
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);

  // Noise burst (rubble)
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  noise.connect(noiseGain).connect(ctx.destination);
  noise.start();

  // --- VICTORY JINGLE LOOP ---
  function playNote(freq, startTime, duration) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(0.4, startTime);
    g.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    o.connect(g).connect(ctx.destination);
    o.start(startTime);
    o.stop(startTime + duration);
  }

  // Loop jingle sequence (C → E → G) every 0.8s for 10s
  const startDelay = 0.7; // after crush
  const loopDuration = 0.8;
  const totalTime = 5;
  let t = startDelay;
  while (t < totalTime) {
    playNote(261.63, ctx.currentTime + t, 0.25); // C4
    playNote(329.63, ctx.currentTime + t + 0.25, 0.25); // E4
    playNote(392.00, ctx.currentTime + t + 0.5, 0.3); // G4
    t += loopDuration;
  }
}

function startThinkingSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Keep a reference so multiple intervals don’t overlap
  if (thinkingInterval) clearInterval(thinkingInterval);

  thinkingInterval = setInterval(() => {
    // small random blip, short duration
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const freq = 300 + Math.random() * 200; // random gentle tone
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.05, ctx.currentTime); // very soft
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, 300); // every 300ms
}

function stopThinkingSound() {
  if (thinkingInterval) {
    clearInterval(thinkingInterval);
    thinkingInterval = null;
  }
}

// Start game function
function startGame(withEnergy) {
  showEnergy = withEnergy;

  // Hide overlay
  document.getElementById("startOverlay").style.display = "none";

  // Create/resume AudioContext
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // Start thinking music
  startThinkingSound();

  // Initialize game
  initGame();
}

 
    document.addEventListener("DOMContentLoaded", () => {
            drawDefault(wallPos, canvas.height/2);
    });
    
    document.getElementById("showEnergyBtn").addEventListener("click", () => startGame(true));
    document.getElementById("hideEnergyBtn").addEventListener("click", () => startGame(false));
    
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
    
    // Update when window resizes
    window.addEventListener("resize", resizeCanvas);
     // Run once on load
     resizeCanvas();
     
