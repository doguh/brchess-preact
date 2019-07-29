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
    p2bot: false,
  };

  componentWillMount() {
    this.board = new Chess.Board(Chess.getRandomBoardState());
    this.board.history.subscribe(() => this.setState());
  }

  componentWillUnmount() {
    this.board.destroy();
    this.board = null;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.p2bot && !this.state.p2bot) {
      this.ai = new Chess.AI(this.board, Chess.Black, 500);
    } else if (!nextState.p2bot && this.state.p2bot) {
      this.ai.destroy();
      this.ai = null;
    }
  }

  render() {
    const { selected, p2bot } = this.state;
    const boardState = this.board.getState();
    console.log({ selected });

    const { isCheck, isCheckMate, isPat, isWin, winner } = this.board;
    console.log({ isCheck, isCheckMate, isPat, isWin, winner });

    const allowedMoves = this.board.getLegalMoves();

    console.log('BOARD STATE', boardState);

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

    const toPromote = this.board.mustBePromoted;

    return (
      <div>
        <p>
          <label>
            <input
              type="checkbox"
              checked={p2bot}
              onChange={e => this.setState({ p2bot: e.target.checked })}
            />{' '}
            Joueur 2 auto play
          </label>
        </p>
        <p>
          Joueur 1 :{' '}
          {boardState.pieces
            .filter(piece => piece.color === Chess.White)
            .map(piece => renderPiece(piece))}
        </p>
        <p>
          Joueur 2 :{' '}
          {boardState.pieces
            .filter(piece => piece.color === Chess.Black)
            .map(piece => renderPiece(piece))}
        </p>
        {toPromote ? (
          <div>
            <p>
              Le pion du joueur
              {toPromote.color === Chess.White ? 'Blanc' : 'Noir'} doit être
              promu :{' '}
              {[Chess.Queen, Chess.Bishop, Chess.Knight, Chess.Rook].map(
                pieceType => (
                  <button
                    onClick={() => {
                      this.board.promote(pieceType);
                      this.setState({});
                    }}
                  >
                    {renderPiece({ ...toPromote, type: pieceType.key })}
                  </button>
                )
              )}
            </p>
          </div>
        ) : null}
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
                            highlight[key] === 'dest' &&
                            (selected.color === Chess.White || !p2bot)
                          ) {
                            return this.board.move(
                              selected.x,
                              selected.y,
                              x,
                              y
                            );
                          }
                          this.setState({
                            selected: piece,
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
        <p>
          Au tour du joueur{' '}
          {boardState.whoseTurn === Chess.White ? 'Blanc' : 'Noir'}
        </p>
        {isCheck || isPat || isWin ? (
          <p>
            {isCheckMate
              ? 'Échec et mat'
              : isCheck
              ? 'Échec au roi'
              : isPat
              ? 'Pat'
              : isWin
              ? `Gagnant : joueur ${winner === Chess.White ? 'Blanc' : 'Noir'}`
              : ''}
          </p>
        ) : null}
        <div>
          <button
            disabled={this.board.history.numPrev === 0}
            onClick={() => {
              this.board.history.goPrev();
              this.setState({ selected: null, p2bot: false });
            }}
          >
            PREV
          </button>
          <button
            disabled={this.board.history.numNext === 0}
            onClick={() => {
              this.board.history.goNext();
              this.setState({ selected: null, p2bot: false });
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
