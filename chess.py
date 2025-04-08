import pygame
import random

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 800, 800
ROWS, COLS = 8, 8
SQUARE_SIZE = WIDTH // COLS

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# Create the screen
WIN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Chess with AI')

# Load images for pieces (optional)
# PAWN_WHITE_IMG = pygame.image.load('path_to_image').convert_alpha()
# PAWN_BLACK_IMG = pygame.image.load('path_to_image').convert_alpha()
# ROOK_WHITE_IMG = pygame.image.load('path_to_image').convert_alpha()
# ... load images for other pieces ...

def draw_board(win):
    win.fill(WHITE)
    for row in range(ROWS):
        for col in range(row % 2, COLS, 2):
            pygame.draw.rect(win, BLACK, (col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))

class Piece:
    def __init__(self, color, row, col):
        self.color = color
        self.row = row
        self.col = col
        self.selected = False

    def move(self, row, col):
        self.row = row
        self.col = col

    def draw(self, win):
        pass  # To be implemented by subclasses

class Pawn(Piece):
    def draw(self, win):
        color = BLACK if self.color == 'black' else WHITE
        pygame.draw.circle(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE // 2, self.row * SQUARE_SIZE + SQUARE_SIZE // 2), SQUARE_SIZE // 2 - 10)

class Rook(Piece):
    def draw(self, win):
        color = BLACK if self.color == 'black' else WHITE
        pygame.draw.rect(win, color, (self.col * SQUARE_SIZE, self.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))

class Knight(Piece):
    def draw(self, win):
        color = BLACK if self.color == 'black' else WHITE
        pygame.draw.circle(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE // 2, self.row * SQUARE_SIZE + SQUARE_SIZE // 2), SQUARE_SIZE // 3)

class Bishop(Piece):
    def draw(self, win):
        color = BLACK if self.color == 'black' else WHITE
        pygame.draw.circle(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE // 2, self.row * SQUARE_SIZE + SQUARE_SIZE // 2), SQUARE_SIZE // 2)
        pygame.draw.line(win, color, (self.col * SQUARE_SIZE, self.row * SQUARE_SIZE), (self.col * SQUARE_SIZE + SQUARE_SIZE, self.row * SQUARE_SIZE + SQUARE_SIZE), 3)
        pygame.draw.line(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE, self.row * SQUARE_SIZE), (self.col * SQUARE_SIZE, self.row * SQUARE_SIZE + SQUARE_SIZE), 3)

class Queen(Piece):
    def draw(self, win):
        color = BLACK if self.color == 'black' else WHITE
        pygame.draw.circle(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE // 2, self.row * SQUARE_SIZE + SQUARE_SIZE // 2), SQUARE_SIZE // 2)
        pygame.draw.rect(win, color, (self.col * SQUARE_SIZE, self.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))

class King(Piece):
    def draw(self, win):
        color = BLACK if self.color == 'black' else WHITE
        pygame.draw.circle(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE // 2, self.row * SQUARE_SIZE + SQUARE_SIZE // 2), SQUARE_SIZE // 2)
        pygame.draw.line(win, color, (self.col * SQUARE_SIZE + 10, self.row * SQUARE_SIZE + 10), (self.col * SQUARE_SIZE + SQUARE_SIZE - 10, self.row * SQUARE_SIZE + SQUARE_SIZE - 10), 5)
        pygame.draw.line(win, color, (self.col * SQUARE_SIZE + SQUARE_SIZE - 10, self.row * SQUARE_SIZE + 10), (self.col * SQUARE_SIZE + 10, self.row * SQUARE_SIZE + SQUARE_SIZE - 10), 5)

class Game:
    def __init__(self):
        self.board = [[None for _ in range(COLS)] for _ in range(ROWS)]
        self.turn = 'white'
        self.selected_piece = None
        self.place_initial_pieces()

    def place_initial_pieces(self):
        # Place pawns for simplicity
        for col in range(COLS):
            self.board[1][col] = Pawn('white', 1, col)
            self.board[6][col] = Pawn('black', 6, col)

        # Place other pieces
        self.board[0][0] = Rook('white', 0, 0)
        self.board[0][7] = Rook('white', 0, 7)
        self.board[7][0] = Rook('black', 7, 0)
        self.board[7][7] = Rook('black', 7, 7)

        self.board[0][1] = Knight('white', 0, 1)
        self.board[0][6] = Knight('white', 0, 6)
        self.board[7][1] = Knight('black', 7, 1)
        self.board[7][6] = Knight('black', 7, 6)

        self.board[0][2] = Bishop('white', 0, 2)
        self.board[0][5] = Bishop('white', 0, 5)
        self.board[7][2] = Bishop('black', 7, 2)
        self.board[7][5] = Bishop('black', 7, 5)

        self.board[0][3] = Queen('white', 0, 3)
        self.board[7][3] = Queen('black', 7, 3)

        self.board[0][4] = King('white', 0, 4)
        self.board[7][4] = King('black', 7, 4)

    def place_piece(self, piece, row, col):
        self.board[row][col] = piece

    def select_piece(self, row, col):
        if self.board[row][col] and self.board[row][col].color == self.turn:
            self.selected_piece = self.board[row][col]
        else:
            self.selected_piece = None

    def move_piece(self, row, col):
        if self.selected_piece and self.valid_move(self.selected_piece, row, col):
            # Check for castling
            if isinstance(self.selected_piece, King) and abs(col - self.selected_piece.col) == 2:
                # Perform castling
                rook_col = 0 if col == 2 else 7
                rook = self.board[row][rook_col]
                self.board[self.selected_piece.row][self.selected_piece.col] = None
                self.selected_piece.move(row, col)
                self.board[row][col] = self.selected_piece
                self.board[row][rook_col] = None
                self.board[row][col - 1] = rook
            else:
                self.board[self.selected_piece.row][self.selected_piece.col] = None
                self.selected_piece.move(row, col)
                self.board[row][col] = self.selected_piece
            # Handle pawn promotion
            if isinstance(self.selected_piece, Pawn) and (row == 0 or row == 7):
                self.board[row][col] = Queen(self.selected_piece.color, row, col)  # For simplicity, always promote to Queen
            self.turn = 'black' if self.turn == 'white' else 'white'
            self.selected_piece = None

    def valid_move(self, piece, row, col):
        # Simplified for now
        if isinstance(piece, Pawn):
            # Implement pawn movement and captures, including en passant
            if piece.color == 'white':
                return row == piece.row - 1 and col == piece.col and self.board[row][col] is None
            elif piece.color == 'black':
                return row == piece.row + 1 and col == piece.col and self.board[row][col] is None
        elif isinstance(piece, Rook):
            # Implement rook movement
            return (row == piece.row or col == piece.col) and self.check_path_clear(piece.row, piece.col, row, col)
        elif isinstance(piece, Knight):
            # Implement knight movement
            return (abs(row - piece.row) == 2 and abs(col - piece.col) == 1) or \
                   (abs(row - piece.row) == 1 and abs(col - piece.col) == 2)
        elif isinstance(piece, Bishop):
            # Implement bishop movement
            return abs(row - piece.row) == abs(col - piece.col) and self.check_diagonal_clear(piece.row, piece.col, row, col)
        elif isinstance(piece, Queen):
            # Implement queen movement
            return (row == piece.row or col == piece.col or
                    abs(row - piece.row) == abs(col - piece.col)) and self.check_path_clear(piece.row, piece.col, row, col)
        elif isinstance(piece, King):
            # Implement king movement
            return abs(row - piece.row) <= 1 and abs(col - piece.col) <= 1
        return False

    def check_path_clear(self, start_row, start_col, end_row, end_col):
        # Check if the path from (start_row, start_col) to (end_row, end_col) is clear
        if start_row == end_row:
            # Horizontal move
            step = 1 if end_col > start_col else -1
            for col in range(start_col + step, end_col, step):
                if self.board[start_row][col] is not None:
                    return False
        elif start_col == end_col:
            # Vertical move
            step = 1 if end_row > start_row else -1
            for row in range(start_row + step, end_row, step):
                if self.board[row][start_col] is not None:
                    return False
        return True

    def check_diagonal_clear(self, start_row, start_col, end_row, end_col):
        # Check if the diagonal path from (start_row, start_col) to (end_row, end_col) is clear
        step_row = 1 if end_row > start_row else -1
        step_col = 1 if end_col > start_col else -1
        row, col = start_row + step_row, start_col + step_col
        while row != end_row and col != end_col:
            if self.board[row][col] is not None:
                return False
            row += step_row
            col += step_col
        return True

    def is_check(self, color):
        # Check if the king of the specified color is in check
        king_row, king_col = None, None
        for row in range(ROWS):
            for col in range(COLS):
                if isinstance(self.board[row][col], King) and self.board[row][col].color == color:
                    king_row, king_col = row, col
                    break
        if king_row is None or king_col is None:
            return False
        # Check if any opponent piece can attack the king
        opponent_color = 'black' if color == 'white' else 'white'
        for row in range(ROWS):
            for col in range(COLS):
                if self.board[row][col] and self.board[row][col].color == opponent_color:
                    if self.valid_move(self.board[row][col], king_row, king_col):
                        return True
        return False

    def is_checkmate(self, color):
        # Check if the specified color is in checkmate
        if not self.is_check(color):
            return False
        # Check if the king can move to safety or if any piece can block or capture the attacking piece
        for row in range(ROWS):
            for col in range(COLS):
                if self.board[row][col] and self.board[row][col].color == color:
                    for r in range(ROWS):
                        for c in range(COLS):
                            if self.valid_move(self.board[row][col], r, c):
                                original_piece = self.board[r][c]
                                self.board[r][c] = self.board[row][col]
                                self.board[row][col] = None
                                in_check = self.is_check(color)
                                self.board[row][col] = self.board[r][c]
                                self.board[r][c] = original_piece
                                if not in_check:
                                    return False
        return True

    def get_all_valid_moves(self, color):
        moves = []
        for row in range(ROWS):
            for col in range(COLS):
                if self.board[row][col] and self.board[row][col].color == color:
                    piece = self.board[row][col]
                    for r in range(ROWS):
                        for c in range(COLS):
                            if self.valid_move(piece, r, c):
                                moves.append((piece, r, c))
        return moves

    def evaluate_board(self):
        # Simple evaluation: +1 for each white piece, -1 for each black piece
        score = 0
        for row in range(ROWS):
            for col in range(COLS):
                if self.board[row][col]:
                    score += 1 if self.board[row][col].color == 'white' else -1
        return score

    def minimax(self, depth, is_maximizing):
        if depth == 0:
            return self.evaluate_board(), None

        best_move = None
        if is_maximizing:
            max_eval = float('-inf')
            for move in self.get_all_valid_moves('black'):
                piece, row, col = move
                original_pos = (piece.row, piece.col)
                self.board[piece.row][piece.col] = None
                piece.move(row, col)
                self.board[row][col] = piece
                eval = self.minimax(depth - 1, False)[0]
                self.board[row][col] = None
                piece.move(*original_pos)
                self.board[original_pos[0]][original_pos[1]] = piece
                if eval > max_eval:
                    max_eval = eval
                    best_move = move
            return max_eval, best_move
        else:
            min_eval = float('inf')
            for move in self.get_all_valid_moves('white'):
                piece, row, col = move
                original_pos = (piece.row, piece.col)
                self.board[piece.row][piece.col] = None
                piece.move(row, col)
                self.board[row][col] = piece
                eval = self.minimax(depth - 1, True)[0]
                self.board[row][col] = None
                piece.move(*original_pos)
                self.board[original_pos[0]][original_pos[1]] = piece
                if eval < min_eval:
                    min_eval = eval
                    best_move = move
            return min_eval, best_move

    def ai_move(self):
        if self.is_checkmate('black'):
            return
        _, best_move = self.minimax(3, True)
        if best_move:
            piece, row, col = best_move
            self.move_piece(row, col)

def main():
    run = True
    clock = pygame.time.Clock()
    game = Game()

    while run:
        clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
            elif event.type == pygame.MOUSEBUTTONDOWN and game.turn == 'white':
                x, y = pygame.mouse.get_pos()
                row, col = y // SQUARE_SIZE, x // SQUARE_SIZE
                if game.selected_piece:
                    game.move_piece(row, col)
                else:
                    game.select_piece(row, col)

        if game.turn == 'black':
            game.ai_move()

        draw_board(WIN)
        for row in game.board:
            for piece in row:
                if piece:
                    piece.draw(WIN)
        pygame.display.flip()

    pygame.quit()

if __name__ == "__main__":
    main()
