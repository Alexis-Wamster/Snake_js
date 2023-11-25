//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                          Global                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const TOUCHE ={
    32:"ESPACE",
    37:"GAUCHE",
    38:"HAUT",
    39:"DROITE",
    40:"BAS"
};

var startX, startY, distX, distY;
const threshold = 150;
const restraint = 100;

const TAILLE = {'x':100, 'y':100}; // taille d'une case
const MARGE = {'x':10, 'y':10};
const FENETRE = {'x':window.innerWidth, 'y':window.innerHeight};
const GRILLE = {'x':Math.floor(FENETRE.x/TAILLE.x),'y':Math.floor(FENETRE.y/TAILLE.y)};
const TOUR_FENETRE = {'x':(FENETRE.x-GRILLE.x*TAILLE.x)/2, 'y':(FENETRE.y-GRILLE.y*TAILLE.y)/2}
const COLOR = {'serpent':'green', 'pomme':'red', 'plateau':'burlywood'};


let listeSerpent = [];
let listePomme = [];
let listeDirection;

let derniereDirection;

let directionTete;
let directionQueue;

let gameOver = true;
let pause;
let snakeAFaim;



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                          Input                                                               //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('keydown', function(event) {
    if (gameOver === true){
        initialisation();
        boucle();
    }
    var codeTouche = event.keyCode || event.which;
    if (pause === false){
        if (TOUCHE[codeTouche] === "GAUCHE" || TOUCHE[codeTouche] === "DROITE" || TOUCHE[codeTouche] === "HAUT" || TOUCHE[codeTouche] === "BAS"){
            goToDirection(TOUCHE[codeTouche]);
        }
    }
    if (TOUCHE[codeTouche] === "ESPACE"){
        pause = !pause;
    }
});

document.addEventListener('touchstart', function(event) {
    var touch = event.changedTouches[0];
    startX = touch.pageX;
    startY = touch.pageY;
    if (gameOver === true){
        initialisation();
        boucle();
    }
});

document.addEventListener('touchmove', function(event) {
    event. preventDefault();
    var touch = event.changedTouches[0];
    distX = touch.pageX - startX;
    distY = touch.pageY - startY;
    if (distX > threshold){
        goToDirection("DROITE");
        setStart(touch.pageX, touch.pageY);
    }
    if (-distX > threshold){
        goToDirection("GAUCHE");
        setStart(touch.pageX, touch.pageY);
    }
    if (distY > threshold){
        goToDirection("BAS");
        setStart(touch.pageX, touch.pageY);
    }
    if (-distY > threshold){
        goToDirection("HAUT");
        setStart(touch.pageX, touch.pageY);
    }
}, { passive: false });

function setStart(abs, ord){
    startX = abs;
    startY = ord;
}

function goToDirection(direction){
    if (derniereDirection !== direction && derniereDirection !== getDirectionOposee(direction)){
        listeDirection.push(direction);
        derniereDirection = direction;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                             Objets                                                           //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dessinePlateau(){
    var plateau = document.createElement('div');
    plateau.style.position = 'absolute';
    plateau.style.zIndex = "-1";
    plateau.style.backgroundColor = COLOR.plateau;
    plateau.style.width = (GRILLE.x*TAILLE.x) + 'px';
    plateau.style.height = (GRILLE.y*TAILLE.y) + 'px';
    plateau.style.left = TOUR_FENETRE.x + 'px';
    plateau.style.top = TOUR_FENETRE.y + 'px';
    document.body.appendChild(plateau);
    return plateau;
}

function createBody(pointCase,direction=null,pointAfficher=null){
    body = {
        "case":pointCase,
        "articulation":null,
        "os":null
    }
    if (direction !== null){
        body["os"] = newOs(pointCase,direction);
    }
    if (pointAfficher === null){
        body["articulation"] = newArticulation(pointCase);
    }
    else{
        body["articulation"] = newArticulation(pointAfficher);
    }
    return body;
}

function createApple(point){
    return {
        "case":point,
        "objet":newPomme(point)
    }
}

function newOs(point,direction){
    var body = document.createElement('div');
    body.style.position = 'absolute';
    body.style.backgroundColor = COLOR.serpent;
    if (direction === "BAS" || direction === "HAUT"){
        body.style.width =  (TAILLE.x - 2*MARGE.x) + 'px';
        body.style.height = '0px';
        body.style.left = (point.x*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
        body.style.top = ((point.y+0.5)*TAILLE.y+TOUR_FENETRE.y) + 'px';
    }
    if (direction === "DROITE" || direction === "GAUCHE"){
        body.style.width =  '0px';
        body.style.height = (TAILLE.y - 2*MARGE.y) + 'px';
        body.style.left = ((point.x+0.5)*TAILLE.x+TOUR_FENETRE.x) + 'px';
        body.style.top = (point.y*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
    }
    document.getElementById('os').appendChild(body);
    return body;
}

function newArticulation(point){
    var body = document.createElement('div');
    body.style.position = 'absolute';
    body.style.width =  (TAILLE.x - 2*MARGE.x) + 'px';
    body.style.height = (TAILLE.y - 2*MARGE.y) + 'px';
    body.style.backgroundColor = COLOR.serpent;
    body.style.left = (point.x*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
    body.style.top = (point.y*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
    body.style.borderRadius = '50%';
    document.getElementById('articulation').appendChild(body);
    return body;
}

function newPomme(point){
    var body = document.createElement('div');
    body.style.position = 'absolute';
    body.style.width =  (TAILLE.x - 2*MARGE.x) + 'px';
    body.style.height = (TAILLE.y - 2*MARGE.y) + 'px';
    body.style.backgroundColor = COLOR.pomme;
    body.style.left = (point.x*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
    body.style.top = (point.y*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
    body.style.borderRadius = '50%';
    document.getElementById('pomme').appendChild(body);
    return body;
}

function avancerFluide(){
    queue = listeSerpent[0];
    tete = listeSerpent[listeSerpent.length-1];
    cou = listeSerpent[listeSerpent.length-2];
    if (snakeAFaim === true){
        if (directionQueue === "HAUT"){
            queue.articulation.style.top = ((queue.case.y - parseFloat(frame/frameMax))*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
            queue.os.style.height = ((1-(parseFloat(frame/frameMax)))*TAILLE.y) + 'px';
        }
        if (directionQueue === "BAS"){
            queue.articulation.style.top = ((queue.case.y + parseFloat(frame/frameMax))*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
            queue.os.style.height = ((1-(parseFloat(frame/frameMax)))*TAILLE.y) + 'px';
            queue.os.style.top = ((queue.case.y + 0.5 + parseFloat(frame/frameMax))*TAILLE.y+TOUR_FENETRE.y) + 'px';
        }
        if (directionQueue === "GAUCHE"){
            queue.articulation.style.left = ((queue.case.x - parseFloat(frame/frameMax))*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
            queue.os.style.width = ((1-(parseFloat(frame/frameMax)))*TAILLE.x) + 'px';
        }
        if (directionQueue === "DROITE"){
            queue.articulation.style.left = ((queue.case.x + parseFloat(frame/frameMax))*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
            queue.os.style.width = ((1-(parseFloat(frame/frameMax)))*TAILLE.x) + 'px';
            queue.os.style.left = ((queue.case.x + 0.5 + parseFloat(frame/frameMax))*TAILLE.x+TOUR_FENETRE.x) + 'px';
        }
    }
    if (directionTete === "HAUT"){
        tete.articulation.style.top = ((cou.case.y - parseFloat(frame/frameMax))*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
        cou.os.style.height = ((parseFloat(frame/frameMax))*TAILLE.y) + 'px';
        cou.os.style.top = ((cou.case.y + 0.5 - parseFloat(frame/frameMax))*TAILLE.y+TOUR_FENETRE.y) + 'px';
    }
    if (directionTete === "BAS"){
        tete.articulation.style.top = ((cou.case.y + parseFloat(frame/frameMax))*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
        cou.os.style.height = ((parseFloat(frame/frameMax))*TAILLE.y) + 'px';
    }
    if (directionTete === "GAUCHE"){
        tete.articulation.style.left = ((cou.case.x - parseFloat(frame/frameMax))*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
        cou.os.style.width = ((parseFloat(frame/frameMax))*TAILLE.y) + 'px';
        cou.os.style.left = ((cou.case.x + 0.5 - parseFloat(frame/frameMax))*TAILLE.x+TOUR_FENETRE.x) + 'px';
    }
    if (directionTete === "DROITE"){
        tete.articulation.style.left = ((cou.case.x + parseFloat(frame/frameMax))*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
        cou.os.style.width = ((parseFloat(frame/frameMax))*TAILLE.x) + 'px';
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                             Jeux                                                             //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getPommeMangee(point){
    for (const pomme of listePomme){
        if (point.x === pomme["case"]['x'] && point.y === pomme["case"]['y']){
            return pomme;
        }
    }
    return null;
}

function deplaceSurCaseLibre(pomme){
    var emplacement = caseRandom();
    while (isInSnake(emplacement) || isInApple(emplacement)){
        emplacement = caseRandom();
    }
    pomme["case"] = emplacement;
    pomme["objet"].style.left = (pomme["case"]['x']*TAILLE.x + MARGE.x+TOUR_FENETRE.x) + 'px';
    pomme["objet"].style.top = (pomme["case"]['y']*TAILLE.y + MARGE.y+TOUR_FENETRE.y) + 'px';
}

function isInSnake(point){
    for (const body of listeSerpent){
        if (body["case"]['x'] === point.x && body["case"]['y'] === point['y']){
            return true;
        }
    }
    return false;
}

function headInBody(){
    const taille = listeSerpent.length-1;
    const tete = listeSerpent[taille]["case"];
    var i;
    for (i=0; i<taille; i++){
        if (listeSerpent[i]["case"]['x'] === tete.x && listeSerpent[i]["case"]['y'] === tete['y']){
            return true;
        }
    }
    return false;
}

function isInApple(point){
    for (const pomme of listePomme){
        if (pomme["case"]['x'] === point.x && pomme["case"]['y'] === point['y']){
            return true;
        }
    }
    return false;
}

function isInMap(point){
    if (point.x>=0 && point.x<GRILLE.x && point.y>=0 && point.y<GRILLE.y){
        return true;
    }
    return false;
}


function avancer(){
    var tete = listeSerpent[listeSerpent.length-1]["case"];

    pommeMangee = getPommeMangee(tete);
    if (pommeMangee !== null){
        deplaceSurCaseLibre(pommeMangee);
        snakeAFaim = false;
    }
    else{
        snakeAFaim = true;
        const queue = listeSerpent.shift();
        queue.articulation.remove();
        queue.os.remove();
    }

    if (!isInMap(tete) || headInBody()){
        console.log("game over");
        gameOver = true;
    }
    
    if (listeDirection.length === 0){
        directionTete = derniereDirection;
    }
    else{
        directionTete = listeDirection.shift();
    }
    dernierBody = listeSerpent[listeSerpent.length-1];
    newTete = createBody(additionDirection(tete,directionTete),null,dernierBody["case"]);
    dernierBody["os"] = newOs(dernierBody["case"],directionTete);
    listeSerpent.push(newTete);

    directionQueue = getDirection(soustractionPoint(listeSerpent[1]["case"], listeSerpent[0]["case"]));
}

function caseRandom(){
    position = {
        'x': Math.floor(Math.random()*(GRILLE.x)),
        'y': Math.floor(Math.random()*(GRILLE.y))
    };
    return position;
}

function randomColor(){
    var rouge = Math.floor(Math.random() * 256);
    var vert = Math.floor(Math.random() * 256);
    var bleu = Math.floor(Math.random() * 256);
    var couleur = "rgb(" + rouge + ", " + vert + ", " + bleu + ")";
    return couleur;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                      Point / direction                                                       //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function additionPoint(point1, point2){
    return {'x':(point1.x+point2.x) ,'y':(point1.y+point2.y)};
}

function soustractionPoint(point1, point2){
    return {'x':(point1.x-point2.x) ,'y':(point1.y-point2.y)};
}

function additionDirection(point, direction){
    return additionPoint(point, getPoint(direction));
}

function getPoint(direction){
    if (direction=="HAUT"){
        return {'x':0, 'y':-1};
    }
    if (direction=="BAS"){
        return {'x':0, 'y':1};
    }
    if (direction=="GAUCHE"){
        return {'x':-1, 'y':0};
    }
    if (direction=="DROITE"){
        return {'x':1, 'y':0};
    }
}

function getDirection(point){
    if (point.x === 0 && point.y === -1){
        return "HAUT";
    }
    if (point.x === 0 && point.y === 1){
        return "BAS";
    }
    if (point.x === -1 && point.y === 0){
        return "GAUCHE";
    }
    if (point.x === 1 && point.y === 0){
        return "DROITE";
    }
}

function getDirectionOposee(direction){
    if (direction === "BAS"){
        return "HAUT";
    }
    if (direction === "HAUT"){
        return "BAS";
    }
    if (direction === "DROITE"){
        return "GAUCHE";
    }
    if (direction === "GAUCHE"){
        return "DROITE";
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                         Intitialisation                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function toutSupprimer(){
    while (listeSerpent.length > 0){
        const queue = listeSerpent.shift();
        queue.articulation.remove();
        if (queue.os !== null){
            queue.os.remove();
        }
    }
    while (listePomme.length > 0){
        const pomme = listePomme.shift();
        pomme.objet.remove();
    }
}

function initialisation(){
    toutSupprimer();

    listeDirection = [];
    derniereDirection = "DROITE";

    directionTete = "DROITE";
    directionQueue = "DROITE";

    listeSerpent = [
        createBody({'x':-3, 'y':2}, "DROITE"),
        createBody({'x':-2, 'y':2}, "DROITE"),
        createBody({'x':-1, 'y':2}, "DROITE"),
        createBody({'x':0, 'y':2}, "DROITE"),
    ];

    listePomme = [
        createApple(caseRandom())
    ];

    gameOver = false;
    pause = false;
    snakeAFaim = true;
    frame = 29;
    frameMax = 29;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                             Boucle                                                           //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function boucle(){
    if (gameOver === false && pause===false){
        if (frame >= frameMax){
            frame = 0;
            avancer();
        }
        else{
            frame ++;
            avancerFluide();
        }
    }
    if (gameOver === false){
        setTimeout(boucle, 10);
    }
}

dessinePlateau();