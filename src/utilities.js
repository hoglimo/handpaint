// Points for fingers
const fingerJoints = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
};

// Infinity Gauntlet Style
const style = {
    0: {color: "yellow", size: 15},
    1: {color: "gold", size: 6},
    2: {color: "green", size: 10},    
    3: {color: "gold", size: 6},    
    4: {color: "gold", size: 6},    
    5: {color: "purple", size: 10},
    6: {color: "gold", size: 6},    
    7: {color: "gold", size: 6},    
    8: {color: "gold", size: 6},    
    9: {color: "blue", size: 10},            
    10: {color: "gold", size: 6},
    11: {color: "gold", size: 6},
    12: {color: "gold", size: 6},            
    13: {color: "red", size: 10},    
    14: {color: "gold", size: 6},
    15: {color: "gold", size: 6},
    16: {color: "gold", size: 6},            
    17: {color: "orange", size: 10},    
    18: {color: "gold", size: 6},
    19: {color: "gold", size: 6},
    20: {color: "gold", size: 6}
};


// Drawing function
export const drawHand = (predictions, ctx) => {
    let drawPointx;
    let drawPointy;
    //let drawPoint;
    let distFinger;
    // Check, if we have predictions
    if(predictions.length > 0 ) {
        // Loop through each prediction
        predictions.forEach((prediction) => {
            // Grab landmarks
            const landmarks = prediction.landmarks;

            // Compute distance
            //distance of thumb-joints to base-point (hand open between 40000 and 100000, fist between 5000 and 40000)
            distFinger = Math.pow(landmarks[8][0]-landmarks[0][0],2)+Math.pow(landmarks[8][1]-landmarks[0][1],2);
            // save point for paint-function
            drawPointx = landmarks[8][0];
            drawPointy = landmarks[8][1];
            
            // Loop through fingers
            for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
                let finger = Object.keys(fingerJoints)[j];
                // Loop through pairs of joints
                for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
                    // get pairs of joints
                    const firstJointIndex = fingerJoints[finger][k];
                    const secondJointIndex = fingerJoints[finger][k+1];

                    // Draw path
                    ctx.beginPath();
                    ctx.moveTo(
                        landmarks[firstJointIndex][0],
                        landmarks[firstJointIndex][1]
                    );
                    ctx.lineTo(
                        landmarks[secondJointIndex][0],
                        landmarks[secondJointIndex][1]
                    );
                    ctx.strokeStyle = "gold";
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }

            }

            // Loop through landmarks and draw them
            for (let i=0; i<landmarks.length; i++) {
                //get x point
                const x = landmarks[i][0];
                // get y point
                const y = landmarks[i][1];
                //Start drawing
                ctx.beginPath();
                ctx.arc(x, y, style[i]["size"], 0, 3*Math.PI);

                //Set the line color
                ctx.fillStyle = style[i]["color"];
                ctx.fill();                
            }

        });
    }
    return [drawPointx,drawPointy,distFinger];    

}

export function drawShape(drawCtx,drawPoint) {
    switch (drawPoint.getShape()) {
        case 'circleNav':
            drawCircle(drawCtx,drawPoint);
            break;        
        case 'triangleNav':
            drawTriangle(drawCtx,drawPoint);
            break;
        case 'squareNav':
            drawRectangle(drawCtx,drawPoint,15);
            break;
        case 'rectangleNav':
            drawRectangle(drawCtx,drawPoint);
            break;            
        case 'pointNav':
            drawCircle(drawCtx,drawPoint,5);
            break;   
        default:
            //              
    }
}

function drawCircle(drawCtx,drawPoint,diameter) {
    drawCtx.beginPath();
    if (typeof diameter === "undefined") {    
        // the third parameter is the width of the circle
        drawCtx.arc(drawPoint.getXvalue(), drawPoint.getYvalue(), 15, 0, 3*Math.PI);
    }
    // diameter is given
    drawCtx.arc(drawPoint.getXvalue(), drawPoint.getYvalue(), diameter, 0, 3*Math.PI);
    drawCtx.fillStyle = drawPoint.getColor();
    drawCtx.fill();                
}

function drawTriangle(drawCtx,drawPoint) {
    let dimension = 10;
    drawCtx.beginPath();
    drawCtx.moveTo(drawPoint.getXvalue()-dimension, drawPoint.getYvalue()-dimension); // Move to the first point
    drawCtx.lineTo(drawPoint.getXvalue()+dimension, drawPoint.getYvalue()-dimension); // Draw a line to the second point
    drawCtx.lineTo(drawPoint.getXvalue(), drawPoint.getYvalue()+dimension); // Draw a line to the third point
    drawCtx.closePath(); // Close the path to form a triangle
    drawCtx.fillStyle = drawPoint.getColor(); // Set the fill color
    drawCtx.fill(); // Fill the triangle with the color
    //drawCtx.strokeStyle = 'black'; // Set the stroke color
    //drawCtx.lineWidth = 2; // Set the line width
    //drawCtx.stroke(); // Draw the outline of the triangle
}

function drawRectangle(drawCtx,drawPoint,edgeLength) {
    drawCtx.fillStyle = drawPoint.getColor();
    if (typeof edgeLength === "undefined") {
        // Parameters: x-coordinate, y-coordinate, width, height
        drawCtx.fillRect(drawPoint.getXvalue(), drawPoint.getYvalue(), 30, 23);
    }
    // Parameters: x-coordinate, y-coordinate, width, height        
    drawCtx.fillRect(drawPoint.getXvalue(), drawPoint.getYvalue(), edgeLength, edgeLength);    
}