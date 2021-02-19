# A-Fake-Artist-Goes-To-New-York
a fan-made online version of the card game by Oink Games  
Live Version Can Be Found At:
  http://kshar.hopto.org
  
## Local Development
1) Clone Repo
2) `npm install` in root of project
3) `npm run dev`

## How To Play
A Fake Artist Goes To New York is a social deception game intended for 5 - 10 players.  
There are 2 roles: Artists and one Fake Artist.  
Before beginning the game, the roles are assigned randomly and secretly to each player.  
The game is started by each player receiving the same prompt excluding the Fake Artist.  
The objective of the game for the Artists is to guess who amongst them is the Fake Artist.  
The objective of the game for the Fake Artist is to guess the word given to the Artists.  
Each Player will take turns drawing on a collective canvas by adding a single stroke.  
The goal here is for everyone to add a single stroke that'll assist in drawing the prompt.  
The Fake Artist will have to attempt to evade suspicion whilst the game is played.  

### End-Game Logic
In this version, the game's end is determined when players decide via word-of-mouth it's end.  
They'll then vote on who they think they think the Fake Artist is.  
If incorrect, the Fake Artist wins.  
If correct, the Fake Artist then has a chance to guess the prompt.  
If they are reasonably correct with their guess, then the Fake Artist wins.  
If incorrect, then the Artists win.  

Clients start by landing on the homepage at the URL above where they can create their own.  
- screenshot of landing page

Once either has been selected, they'll be navigated to the game page where a socket connection  
is established between the client and server.  
From here, they can share their room code with friends to have them join the room.  

If they created the room, once their friends have all joined, they can start the game by pressing the 'Start Game'  
button.  
- screenshot of start game button

From here, the game will start and each client will receive their roles and the room's prompt.  
- screenshots of each role

Each player will have the opportunity to draw and undo/redo their drawing before submission.  

From here, players will have turns in sequence until they decide to vote via word-of-mouth.  
Refer to End-Game Logic above for rules on ending the game.  

## Design and Description
This project uses:  
-  Express.js - to handle web requests  
-  Socket.io - to handle socket connection instances for each room  
-  Responsive-Sketchpad - to handle client drawing capabilities  
-  CookieParser.js - to handle ensuring client room

On request from landing page, server will redirect them to the game page. with a cookie
based on whether they requested to join or create a game.  
On request to create a game, an instance of the Room class is created that'll track  
game state logic
  
Upon arriving on the game page, the client will have an instance of the Player class created.  
It handles:  
- socket connection event emitting/listening
- game state on client-side
- creating/updating UI elements
The server will then track the






















