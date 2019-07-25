const map = {
  k: ['♔', '♚'],
  q: ['♕', '♛'],
  r: ['♖', '♜'],
  b: ['♗', '♝'],
  n: ['♘', '♞'],
  '': ['♙', '♟'],
};

export default function renderPiece(piece) {
  return map[piece.type][piece.color];
}
