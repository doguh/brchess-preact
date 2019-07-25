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

const white = 0;

class Game extends Component {
  componentWillMount() {
    this.board = new Chess.Board(Chess.getDefaultBoardState());
  }

  componentWillUnmount() {
    this.board.destroy();
    this.board = null;
  }

  render() {
    return (
      <table>
        {times(9)(i => {
          return (
            <tr>
              {times(9)(j => {
                const x = j - 1;
                const y = 8 - i - 1;
                if (x === -1) {
                  return y === -1 ? <th /> : <th>{y + 1}</th>;
                } else if (y === -1) {
                  return (
                    <th>{String.fromCharCode(x + 1 + 96).toUpperCase()}</th>
                  );
                } else {
                  const square = this.board.getSquare(x, y);
                  const piece = square.piece;
                  return (
                    <td class={`${square.color === white ? 'w' : 'b'}`}>
                      {piece ? renderPiece(piece) : null}
                    </td>
                  );
                }
              })}
            </tr>
          );
        })}{' '}
      </table>
    );
  }
}

export default Game;
