import './css/App.css';
import Canvas from './assets/Canvas';
import React, {useState} from 'react';

class Ball{
  constructor(x,y,max_r = 100, min_r = 10){
    const max_speed = 10;

    this.x = x;
    this.y = y;
    this.r = Math.floor(Math.random()*(max_r-min_r+1))+min_r;

    this.angle = Math.random()*Math.PI*2.0;
    this.speed = Math.random()*max_speed;

  }

  get_size(){
    return this.r;
  }

  get_pos(){
    return [this.x,this.y];
  }

  set_pos(x,y){
    this.x = x;
    this.y = y;
  }

  get_ball(){
    return [this.x,this.y,this.r];
  }

  add_reflection(){
    this.angle+=Math.PI/2.0
  }

  backward(){
    const x = this.x - Math.cos(this.angle);
    const y = this.y + Math.sin(this.angle);

    this.x = x;
    this.y = y;
  }
  forward(){
    const x = this.x + Math.cos(this.angle);
    const y = this.y - Math.sin(this.angle);

    this.x = x;
    this.y = y;
  }

}


class Universe{
  constructor(nbr_ball,width,height){
    this.balls = [];
    this.limits_h = [];
    this.limits_v = [];

    this.width = width;
    this.height = height;


    //on fixe les limites de notre univers
    this.add_limit(0,null);
    this.add_limit(width, null);
    this.add_limit(null,0);
    this.add_limit(null,height);


    //on ajoute quelques boules pour jouer
    for(let i=0;i<nbr_ball;i++){

      //on fait apparaître une nouvelle boule
      let ball = new Ball(0,0);
      const r = ball.get_size();
      const x = Math.floor(Math.random()*((this.width-r)-r))+r;
      const y = Math.floor(Math.random()*((this.height-r)-r))+r;
      ball.set_pos(x,y);

      //on l'ajoute
      this.add_ball(ball);
    }
  }

  forward(){
    this.balls.forEach(ball=>{
      ball.forward();
      if(!this.check_ball(ball)){
        ball.backward();
        ball.add_reflection();
      }
    });
  }

  add_limit(x,y){
    if(x==null && y!=null){
      this.limits_h.push(y);
    }else if(y==null){
      this.limits_v.push(x);
    }else{
      console.error("Erreur dans la fonction add_limit, limite impossible");
    }
  }

  check_ball(ball){
    const [x,y,r] = ball.get_ball();
    const result = (0<x-r)&&(x+r<this.width)&&(0<y-r)&&(y+r<this.height);
    if(!result){
      console.log("colision",x,y,r);
    }
    return result;
  }

  get_balls(){
    let balls = [];
    this.balls.forEach(ball=>(balls.push(ball.get_ball())));
    return balls;
  }

  add_ball(ball){
    this.balls.push(ball);
  }
}


function App() {
  const [universe, setuniverse] = useState(new Universe(15,1000,800));
  const [liste, setListe] = useState(universe.get_balls());

  // const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  // const setPixel = (ctx, x,y, color) => {
  //     ctx.fillStyle = color;
  //     ctx.fillRect(x,y,1,1);
  // };

  const sumBalls = (x,y) => {
    let sum = 0;
    for(let i=0;i<liste.length;i++){
      let elt = liste[i];
      const [x0,y0,R] = elt;
      sum+=Math.pow(R,2)/(Math.pow(x-x0,2)+Math.pow(y-y0,2));
    }
    return sum;
  }

  const draw = async (ctx) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    const nbrPoint = 70;
    const ratioX = ctx.canvas.width/nbrPoint;
    const ratioY = ctx.canvas.height/nbrPoint;
    let listePoints = [];
    //on crée un tableau
    for(let j=0;j<nbrPoint;j++){
      for(let i=0;i<nbrPoint;i++){
        let [x,y] = [ratioX/2+i*ratioX,ratioY/2+j*ratioY];
        const value = sumBalls(x,y);
        let state = 0;
        if(value>1){
          state = 1;
          ctx.fillStyle = "red";
        }else{
          state = 0;
          ctx.fillStyle = "blue";
        }
        ctx.fillRect(x,y,2,2);
        listePoints.push(state);
      }
    }

    //on analyse les points
    const precision = 1;
    for(let i=0;i<nbrPoint-1;i++){
      for(let j=0;j<nbrPoint-1;j++){
        const indexes = [i + j*nbrPoint, i+1 + j*nbrPoint, i+1 + (j+1)*nbrPoint, i + (j+1)*nbrPoint];
        const values = [listePoints[indexes[0]],listePoints[indexes[1]],listePoints[indexes[2]],listePoints[indexes[3]]];

        //cas interessant
        let newCoordinate = [];
        if(values[0]!=values[1] || values[1]!=values[2] || values[2]!=values[3] || values[3]!=values[0]){
          //a gauche en haut en bas
          if((values[0]&&!values[3])||(values[3]&&!values[0])){
            //dichotomie sur y
            const x = ratioX/2+i*ratioX;
            let [a,b] = [ratioY/2+(j)*ratioY,ratioY/2+(j+1)*ratioY];
            while(b-a > precision){
              const y = (b+a)/2;
              const state = (sumBalls(x,y)>1)?1:0;  
              
              //on change les bornes
              if(state){
                if(values[0]){
                  a = y;
                }else{
                  b = y;
                }
              }else{
                if(values[0]){
                  b = y;
                }else{
                  a = y;
                }
              }
            }
            const [newX,newY] = [x,a];
            newCoordinate.push([newX,newY]);
          }
          //à droite en haut en bas
          if((values[1]&&!values[2])||(values[2]&&!values[1])){
            //dichotomie sur y
            const x = ratioX/2+(i+1)*ratioX;
            let [a,b] = [ratioY/2+(j)*ratioY,ratioY/2+(j+1)*ratioY];
            while(b-a > precision){
              const y = (b+a)/2;
              let state = (sumBalls(x,y)>1)?1:0;
              
              //on change les bornes
              if(state){
                if(values[1]){
                  a = y;
                }else{
                  b = y;
                }
              }else{
                if(values[1]){
                  b = y;
                }else{
                  a = y;
                }
              }
            }
            const [newX,newY] = [x,a];
            newCoordinate.push([newX,newY]);
          }
          //barre haute
          if((values[0]&&!values[1])||(values[1]&&!values[0])){
            //dichotomie sur x
            const y = ratioY/2+(j)*ratioY;
            let [a,b] = [ratioX/2+(i)*ratioX,ratioX/2+(i+1)*ratioX];
            while(b-a > precision){
              const x = (b+a)/2;
              let state = (sumBalls(x,y)>1)?1:0;
              
              //on change les bornes
              if(state){
                if(values[0]){
                  a = x;
                }else{
                  b = x;
                }
              }else{
                if(values[0]){
                  b = x;
                }else{
                  a = x;
                }
              }
            }
            const [newX,newY] = [a,y];
            newCoordinate.push([newX,newY]);
          }
          //barre basse
          if((values[3]&&!values[2])||(values[2]&&!values[3])){
            //dichotomie sur x
            const y = ratioY/2+(j+1)*ratioY;
            let [a,b] = [ratioX/2+(i)*ratioX,ratioX/2+(i+1)*ratioX];
            while(b-a > precision){
              const x = (b+a)/2;
              let state = (sumBalls(x,y)>1)?1:0;
              
              //on change les bornes
              if(state){
                if(values[3]){
                  a = x;
                }else{
                  b = x;
                }
              }else{
                if(values[3]){
                  b = x;
                }else{
                  a = x;
                }
              }
            }
            const [newX,newY] = [a,y];
            newCoordinate.push([newX,newY]);
          }
        }
        //une fois les coordonnées récupéré on les relie
        if(newCoordinate.length==2){
          ctx.beginPath();
          ctx.moveTo(...newCoordinate[0]);
          ctx.lineTo(...newCoordinate[1]);
          ctx.stroke();
        }
        
        //ctx.fillStyle = 'rgba(100,100,100,0.2)';
        //ctx.fillRect(ratioX/2+i*ratioX,ratioY/2+j*ratioY,ratioX,ratioY)
        //await delay(1);
      }
    }
  };

  setTimeout(()=>{
    //on les fait avancer un bail du genre
    universe.forward();

    //on update les balls
    setListe(universe.get_balls());
  },50);

  return (
    <div className="App">
      <h1>Mes Metaballs</h1>
      {<p>x:{parseInt(liste[0][0])},y:{parseInt(liste[0][1])}</p>}
      <Canvas draw={draw}/>
    </div>
  );
}

export default App;
