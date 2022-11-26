import './board.css';
import React, {useRef, useState} from 'react'

function Piece(props) {
    let pieces = [];
    let style = {};
    let top = 0, left = 0;

    const dragStart = (e) => {
        props.dragItem.current = e.target;
        console.log('dragStart', e.target, props.dragItem);
    };

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if((i+j)%2 == 0){
                top = i * 80 + 15;
                left = j * 80 + 15;
                style = {top: top+'px', left: left+'px'}
                if(i<3){
                    style.cursor = (!props.isWhiteTurn) ? 'grab' : 'no-drop';
                    pieces.push(<div
                        className="piece blackPiece"
                        style={style}
                        key={i + '-' + j}
                        data-current-position={i + '-' + j}
                        draggable
                        onDragStart={dragStart}
                        ></div>);
                } else if (i >= 5) {
                    style.cursor = (props.isWhiteTurn) ? 'grab' : 'no-drop';
                    pieces.push(<div
                        className="piece whitePiece"
                        style={style}
                        key={i + '-' + j}
                        data-current-position={i + '-' + j}
                        draggable
                        onDragStart={dragStart}
                       ></div>);
                }
            }
        }
    }

    return (
        <>
            {
                pieces.map((val)=>{return val;})
            }
        </>
    )
}



function Board() {

    const isAllowed = (squarePosition, piecePosition, direction) => {
        let currentDraggedPiece =  document.querySelectorAll('[data-current-position="' + piecePosition.join('-') + '"]');
        let hasPieceOnTarget =  document.querySelectorAll('[data-current-position="' + squarePosition.join('-') + '"]');

        let rightOfTarget = [piecePosition[0] - direction, piecePosition[1] + direction];
        let leftOfTarget = [piecePosition[0] - direction, piecePosition[1] - direction];

        console.log({rightOfTarget, leftOfTarget})

        let isRightTarget = ((squarePosition[0] === (piecePosition[0] - direction) && squarePosition[1] === (piecePosition[1] + direction)) ||
        (squarePosition[0] === (piecePosition[0] - direction) && squarePosition[1] === (piecePosition[1] - direction)));

        let isNextRightTarget = ((squarePosition[0] === (piecePosition[0] - direction*2) && squarePosition[1] === (piecePosition[1] + direction*2)) ||
            (squarePosition[0] === (piecePosition[0] - direction*2) && squarePosition[1] === (piecePosition[1] - direction*2)))
       
        let hasPieceOnPreviousRightSquare =  document.querySelectorAll('[data-current-position="' + rightOfTarget.join('-') + '"]');
        let hasPieceOnPreviousLeftSquare =  document.querySelectorAll('[data-current-position="' + leftOfTarget.join('-') + '"]');

        let pieceAttaked = null;
        if(direction === 1) {
            pieceAttaked = (piecePosition[1] > squarePosition[1] && hasPieceOnPreviousLeftSquare.length) ?
                leftOfTarget : 
                (piecePosition[1] < squarePosition[1]  && hasPieceOnPreviousRightSquare.length) ? rightOfTarget : null;
        } else {
            pieceAttaked = (piecePosition[1] < squarePosition[1] && hasPieceOnPreviousLeftSquare.length) ?
                leftOfTarget :
                (piecePosition[1] > squarePosition[1]  && hasPieceOnPreviousRightSquare.length) ? rightOfTarget : null;
        }

        let hasPieceInPreviousSquare = (direction === 1) ? 
            ((piecePosition[1] > squarePosition[1]  && hasPieceOnPreviousLeftSquare.length && hasPieceOnPreviousLeftSquare[0].classList[1] !== currentDraggedPiece[0].classList[1]) || (piecePosition[1] < squarePosition[1]  && hasPieceOnPreviousRightSquare.length && hasPieceOnPreviousRightSquare[0].classList[1] !== currentDraggedPiece[0].classList[1])) :
            ((piecePosition[1] < squarePosition[1]  && hasPieceOnPreviousLeftSquare.length && hasPieceOnPreviousLeftSquare[0].classList[1] !== currentDraggedPiece[0].classList[1]) || (piecePosition[1] > squarePosition[1]  && hasPieceOnPreviousRightSquare.length && hasPieceOnPreviousRightSquare[0].classList[1] !== currentDraggedPiece[0].classList[1]));
        console.log('drop',{squarePosition, piecePosition, direction, isRightTarget, hasPieceOnTarget, isNextRightTarget, hasPieceOnPreviousRightSquare, hasPieceOnPreviousLeftSquare, hasPieceInPreviousSquare, pieceAttaked});
        return {
            isAllowed: (isRightTarget && !hasPieceOnTarget.length) || (isNextRightTarget && !hasPieceOnTarget.length && hasPieceInPreviousSquare),
            pieceAttaked
        }
    }

    const dragItem = useRef();
    const [isWhiteTurn, setIsWhiteTurn] = useState(true);
    
    const drop = (e) => {
        
        const squarePosition = e.target.id.split("-").map(Number);;
        const piecePosition = dragItem.current.dataset.currentPosition.split("-").map(Number);;
        
        const direction = dragItem.current.classList.contains('blackPiece') ? -1: 1;

        const result = isAllowed(squarePosition, piecePosition, direction)
        if (result.isAllowed) {
            let top = squarePosition[0] * 80 + 15;
            let left = squarePosition[1] * 80 + 15;
            dragItem.current.style.top = top + 'px';
            dragItem.current.style.left = left + 'px';
            dragItem.current.dataset.currentPosition = squarePosition.join('-')
            setIsWhiteTurn(!isWhiteTurn);
            if (result.pieceAttaked) {
                const pieceToRemoved = document.querySelectorAll('[data-current-position="' + result.pieceAttaked.join('-') + '"]');
                console.log(pieceToRemoved, dragItem.current.classList[1], pieceToRemoved[0].classList[1]);
                if(dragItem.current.classList[1] !== pieceToRemoved[0].classList[1]){
                    pieceToRemoved[0].remove();
                }
            }
        }
    };

    const allowDrop = (e) => {
        console.log('allowDrop');
        e.preventDefault();
    };

    let squares = [];
    let classeNames = "";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            classeNames = ((i+j)%2 == 0) ? "square active-square" : "square";
            
            squares.push(<div className={classeNames} id={i + '-' + j} key={i + '-' + j}  onDrop={drop} onDragOver={allowDrop}></div>)
        }
    }

    return (
        <div className="container">
            <div className="square-container">
                {
                    squares.map((val)=>{return val;})
                }
               <Piece dragItem={dragItem} isWhiteTurn={isWhiteTurn}/>
            </div>
        </div>

    )
}

export default Board