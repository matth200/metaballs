
import React, {useRef, useEffect, useState} from 'react';
import { ContextConsumer } from 'react-is';

let Canvas = (props) => {
    const canvasRef = useRef(null);

    const {draw, ...rest} = props;

    const setPixel = (ctx, x,y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x,y,1,1);
    };

    useEffect(()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        context.canvas.width = 1000;
        context.canvas.height = 800;

        draw(context);
    },[draw]);

    return <canvas ref={canvasRef} {...rest} />
};

export default Canvas;