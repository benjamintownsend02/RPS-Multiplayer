//Setup firebase
var firebaseConfig = {
  apiKey: "AIzaSyAThMrs6smTb1Yp5dRbswV_7Bsse8dnAt8",
  authDomain: "rps-multiplayer-a9748.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-a9748.firebaseio.com",
  projectId: "rps-multiplayer-a9748",
  storageBucket: "rps-multiplayer-a9748.appspot.com",
  messagingSenderId: "475386995501",
  appId: "1:475386995501:web:20004d5102e8830860a9a4"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

//Globals
var localID=0;
var localGameStatus;
var localPlayer1;
var localPlayer2;
var localData;

var guess="";

//Sign-in button, sets up players
$('#btn-sign-in').on("click", function () {
  event.preventDefault();
  if(localID===0)
  {
      database.ref().once("value",function(snapshot) {
      p1Data=snapshot.val().player1;
      p2Data=snapshot.val().player2;
      if(p1Data.inUse==false)
      {
          localID=1;
          $("#info").text("You are logged in as Player " + localID);
          $("#player-status").text("Other player not ready");
          $("#instructions").text("Waiting for other player");

          var updates={};
          updates['/player1/inUse/']=true;
          database.ref().update(updates);
      }
      else if(p2Data.inUse==false)
      {
          localID=2;
          $("#info").text("You are logged in as Player " + localID);
          $("#player-status").text("Other player not ready");
          $("#instructions").text("Waiting for other player");
          var updates={};
          updates['/player2/inUse/']=true;
          database.ref().update(updates);
      }
      else
      {
          $("#info").text("All player slots in use. Please try again later!");
      }
      }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
      });
  }
});

//Chat button, sends message to opponent
$('#btn-chat').on("click", function () {
  event.preventDefault();
  if($("#chat-input").val().trim()!=undefined && localID!=0)
  {
      var myMessage=$("#chat-input").val().trim();
      var updates={};
      updates['/player' + localID +'/message/']=myMessage;
      database.ref().update(updates);
  }

});

//Resets game & database
function reset()
{
  localID=0;
  localPlayer1=undefined;
  localPlayer2=undefined;
  localGameStatus=undefined;

  $("#info").text("Player left! You are not logged in.");
  $("#player-status").text("Players not ready.");
  $("#instructions").text('Press the "Sign In" button to start!');
  $('#wins').text("Wins: " + 0);
  $('#losses').text("Losses: " + 0);
  $('#ties').text("Ties: " + 0);
  $("#choice-1").text("Player 1: no throw selected.");
  $("#choice-2").text("Player 2: no throw selected.");


var myPlayer1= {
   inUse:false,
   playerID:1,
   message:""
}

var myPlayer2= {
  inUse:false,
  playerID:2,
  message:""
}

var myGameStatus={
  gameOn:false,
  throwReady:false,
  guess1: "",
  guess2: "",
  ties: 0,
  winsP1:0,
  winsP2:0,
  playerLeft:false
}

  database.ref().set({
      player1: myPlayer1,
      player2: myPlayer2,
      gameStatus: myGameStatus
  });
}

//Displays game results
function updateResults(id)
{
  if(id===1)
  {
      $('#wins').text("Wins: " + localGameStatus.winsP1);
      $('#losses').text("Losses: " + localGameStatus.winsP2);
      $('#ties').text("Ties: " + localGameStatus.ties);
  }
  else if(id===2)
  {
      $('#wins').text("Wins: " + localGameStatus.winsP2);
      $('#losses').text("Losses: " + localGameStatus.winsP1);
      $('#ties').text("Ties: " + localGameStatus.ties);
  }
}

//Reset button, currently unused
// $('#btn-reset').on("click", function () {
//   event.preventDefault();
//   reset();
// });

//Handles game events resulting from database updates
database.ref().on("value", function(snapshot) {
  localPlayer1=snapshot.val().player1;
  localPlayer2=snapshot.val().player2;
  localGameStatus=snapshot.val().gameStatus;
  $("#chat-1").text(localPlayer1.message);
  $("#chat-2").text(localPlayer2.message);
  if(localGameStatus.playerLeft)
  {
      reset();
  }
  else if(localPlayer2.inUse && localPlayer1.inUse && !localGameStatus.gameOn)
  {
      var updates={};
      updates['/gameStatus/gameOn/']=true;
      database.ref().update(updates);
      $("#player-status").text("Players Ready!");
      $("#instructions").text("Press the R, P or S key to throw!");
  }
  else if(localGameStatus.gameOn && localGameStatus.throwReady && localGameStatus.guess2.length>0 && localGameStatus.guess1.length>0)
  {
      $("#choice-1").text("Player 1 throws: " + localGameStatus.guess1);
      $("#choice-2").text("Player 2 throws: " + localGameStatus.guess2);
      if(localGameStatus.guess1===localGameStatus.guess2)
      {
          var ties=localGameStatus.ties+1;
          var updates={};
          updates['/gameStatus/ties/']=ties;
          updates['/gameStatus/throwReady/']=false;
          updates['/gameStatus/guess1/']="";
          updates['/gameStatus/guess2/']="";
          database.ref().update(updates);
          $("#instructions").text("Game over. Press the R, P or S key to throw again.");
          updateResults(localID);
      }
      else if(localGameStatus.guess2==="r" && localGameStatus.guess1==="p" 
              || localGameStatus.guess2==="s" && localGameStatus.guess1==="r" 
              || localGameStatus.guess2==="p" && localGameStatus.guess1==="s")
      {
          wins=localGameStatus.winsP1+1;
          var updates={};
          updates['/gameStatus/winsP1/']=wins;
          updates['/gameStatus/throwReady/']=false;
          updates['/gameStatus/guess1/']="";
          updates['/gameStatus/guess2/']="";
          database.ref().update(updates);
          $("#instructions").text("Game over. Press the R, P or S key to throw again.");
          updateResults(localID);
      }
      else if(localGameStatus.guess2==="p" && localGameStatus.guess1==="r" 
              || localGameStatus.guess2==="r" && localGameStatus.guess1==="s" 
              || localGameStatus.guess2==="s" && localGameStatus.guess1==="p")
      {
          losses=localGameStatus.winsP2+1;
          var updates={};
          updates['/gameStatus/winsP2/']=losses;
          updates['/gameStatus/throwReady/']=false;
          updates['/gameStatus/guess1/']="";
          updates['/gameStatus/guess2/']="";
          database.ref().update(updates);
          $("#instructions").text("Game over. Press the R, P or S key to throw again.");
          updateResults(localID);
      }
  }
});

//Sets flag for game reset on player disconnect
database.ref().onDisconnect().update(
{
  ['/gameStatus/playerLeft/']:true
});

//Handles events based on player move choice
document.onkeyup = function(event)
{

  guess = event.key;
  if(localGameStatus.gameOn && (guess==="r" || guess==="p" || guess==="s"))
  {
      $("#choice-" + localID).text("Player " + localID + " throws: " + guess);
      var updates={};
      updates['/gameStatus/guess' + localID + '/']=guess;
      updates['/gameStatus/throwReady/']=true;
      database.ref().update(updates);
      //$("#instructions").text("Waiting for other guess!");
  }
}