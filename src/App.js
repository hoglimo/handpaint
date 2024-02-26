//import logo from './logo.svg';
import './App.css';
import React, {useRef} from 'react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import {drawHand, drawShape} from "./utilities";
import Navbar from './components/Navbar';
import { BrowserRouter } from 'react-router-dom';

//superclass to iterate through items
class Cycler {
  constructor(items=[]) {
    this._index = 0
    this._items = items;
  }
  current() {
    return this._items[this._index];
  }
  next() {
    if (this._index === this._items.length -1) {
      this._index = 0;
    } else {
      this._index++;
    }
    return this._items[this._index];
  }
}

//childclass to iterate through items and use Navigation
class ShapeCycler extends Cycler {
  constructor(items=[]) {
    super(items);
  }
  updateNavigation() {
    document.getElementById(super.current()).click();
  }
  next() {
    super.next();
    this.updateNavigation();
    return super.current();
  }
}

//object to manage the counting of fists
class FistCount {
  constructor(limit) {
    this._count = 0;
    this._limit = limit;
  }
  inc() {
    this._count++;
  }
  dec() {
    if (this._count > 0) {
      this._count--
    }
  }
  current() {
    return this._count;
  }
  sufficient() {
    if (this._count >= this._limit) {
      return true;
    }
    return false;
  }
  wipeOut() {
    this._count = 0;
  }
}

//Class to hold the data of one colored Point
class ColoredPoint {
  constructor(xvalue,yvalue,col,shape) {
    this._xvalue = xvalue;
    this._yvalue = yvalue;
    this._col = col;
    this._shape = shape;
  }
  getXvalue() {
    return this._xvalue;
  }
  getYvalue() {
    return this._yvalue;
  }
  getColor() {
    return this._col;
  }
  getShape() {
    return this._shape;
  }
}

class DistanceReaction {
  constructor(nDistances, threshHoldDistances) {
    this._nDistances = nDistances;
    this._threshHoldDistances = threshHoldDistances;
  }
  react(ctx,distanceHisto) {
    this._ctx = ctx;
    this._distanceHisto = distanceHisto;
    //if there is enough in the Histo (relevant on startup)
    if (this._distanceHisto.length >= this._nDistances) {
      this._distanceHisto.splice(0,this._distanceHisto.length - this._nDistances);    //throw away the old value(s)                
      // reduce sums up the val to the acc and returns the sum
      let sumDistances = this._distanceHisto.reduce((acc, val) => acc + val);
      if (sumDistances < this._threshHoldDistances) {
        fistCount.inc();
        console.log("Fists increased, count: " + fistCount.current());
        //If we have 10 fists in a row, the system is meant to react and change the color
        //if sufficient, we set fists-counter to 0
        if (fistCount.sufficient()) {
          fistCount.wipeOut();
          colorCycler.next();
          shapeCycler.next();
          console.log("set currentcolor:", colorCycler.current());
          ctx.fillRect(40, 40, 100, 100);
        }
      } else {
        //if the threshHold is not reached, we can decrease the count of fists, so it will finally end up to be 0 again
        fistCount.dec();
        console.log("Fists decreased, count: " + fistCount.current());
      }      
    }
  }
}

const colorCycler = new Cycler(["yellow","green","blue","purple","orange","cyan","red"]);
const shapeCycler = new ShapeCycler(["circleNav","triangleNav","squareNav","rectangleNav","pointNav"]);
const fistCount = new FistCount(10);
const distanceReaction = new DistanceReaction(5,200000);    

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);  

  const runHandpose = async () => {
    const net = await handpose.load()
    console.log('Handpose model loaded.');
    //Arrays used for reusing index finger position and indexpoint distance to base
    let coloredPointsHistory = [];
    let distanceHistory = [];
    shapeCycler.updateNavigation();
    //Loop and detect hands
    setInterval(() => {
      detect(net,distanceHistory,coloredPointsHistory)
    }, 100)
  };

  const detect = async (net,distanceHistory,coloredPointsHisto) => {
    //Check Data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4 
    ) {
      //Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      //Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      //Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      //Make predictions
      const hand = await net.estimateHands(video);

      //Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      //Parameter from drawHand is stored
      let [xValue,yValue,distance] = drawHand(hand, ctx);
      //if distance of first joint to base is filled, it is pushed to history
      if (typeof distance !== "undefined") {
        distanceHistory.push(distance);
      }

      // if x-value and y-value of first index-joint are filled
      if ((typeof xValue !== "undefined") && (typeof yValue !== "undefined")) {      
        distanceReaction.react(ctx,distanceHistory);
        let coloredPoint = new ColoredPoint(xValue,yValue,colorCycler.current(),shapeCycler.current());
        coloredPointsHisto.push(coloredPoint);
      }

      //Paint circle with coordinates and Color from Histo
      coloredPointsHisto.forEach((drawPoint) => {
        drawShape(ctx,drawPoint);        
      });
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
        <Webcam ref={webcamRef}
        />
        <canvas
          ref={canvasRef}
          style={{
            position:"absolute",
            marginLeft:"auto",
            marginRight:"auto",
            left:0,
            right:0,
            textAlign:"center",
            zindex:8,
            width:640,
            height:480
          }} 
          />                  
      </header>
    </div>
  );
}

export default App;
