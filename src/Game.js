import { h, Component } from 'preact';
import * as Chess from 'brchess-core';
import renderPiece from './renderPiece';
import './game.css';

const times = num => fn => {
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(fn(i));
  }
  return arr;
};

const getKey = (x, y) => `${x}${y}`;

const white = 0;

class Game extends Component {
  state = {
    selected: null,
  };

  componentWillMount() {
    this.board = new Chess.Board(Chess.getDefaultBoardState());
  }

  componentWillUnmount() {
    this.board.destroy();
    this.board = null;
  }

  render() {
    const { selected } = this.state;
    console.log({ selected });

    const { isCheck, isCheckMate, isPat } = this.board;
    console.log({ isCheck, isCheckMate, isPat });

    const allowedMoves = this.board.getLegalMoves();

    let currentSelectedIsMovable = false;
    const highlight = allowedMoves.reduce((acc, move) => {
      acc[getKey(move.from.x, move.from.y)] = 'movable';
      if (
        selected &&
        selected.x === move.from.x &&
        selected.y === move.from.y
      ) {
        currentSelectedIsMovable = true;
        move.to.forEach(dest => {
          acc[getKey(dest.x, dest.y)] = 'dest';
        });
      }
      return acc;
    }, {});

    return (
      <div>
        <table>
          {times(9)(i => {
            return (
              <tr>
                {times(9)(j => {
                  const x = j - 1;
                  const y = 8 - i - 1;
                  const key = getKey(x, y);
                  if (x === -1) {
                    return y === -1 ? (
                      <th key={key} />
                    ) : (
                      <th key={key}>{y + 1}</th>
                    );
                  } else if (y === -1) {
                    return (
                      <th key={key}>
                        {String.fromCharCode(x + 1 + 96).toUpperCase()}
                      </th>
                    );
                  } else {
                    const square = this.board.getSquare(x, y);
                    const piece = square.piece;
                    return (
                      <td
                        key={key}
                        class={`${
                          square.color === white ? 'white' : 'black'
                        } ${highlight[key] || ''}`}
                        onClick={() => {
                          if (
                            currentSelectedIsMovable &&
                            highlight[key] === 'dest'
                          ) {
                            this.board.move(selected.x, selected.y, x, y);
                          }
                          this.setState({
                            selected: piece,
                            canMove: highlight[key],
                          });
                        }}
                      >
                        {piece ? renderPiece(piece) : null}
                      </td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </table>
        <div>
          <button
            disabled={this.board.history.numPrev === 0}
            onClick={() => {
              this.board.history.goPrev();
              this.setState({ selected: null });
            }}
          >
            PREV
          </button>
          <button
            disabled={this.board.history.numNext === 0}
            onClick={() => {
              this.board.history.goNext();
              this.setState({ selected: null });
            }}
          >
            NEXT
          </button>
        </div>
      </div>
    );
  }
}

export default Game;
