/// <reference types="cypress" />

const getCardByTestId = (testId) => cy.get(`[data-testid="${testId}"]`);

describe('Interface de Wishlist de Jogos', () => {
  beforeEach(() => {
    // Intercepta a chamada à API externa de jogos
    cy.intercept('GET', '**/search-games*').as('loadGames');

    // Intercepta a chamada à API da wishlist (caso use)
    cy.intercept('GET', '**/wishlist').as('loadWishlist');

    cy.visit('http://localhost:5173');

    // Aguarda os jogos carregarem antes de continuar
    cy.wait('@loadGames', { timeout: 15000 });
  });

  it('exibe os cards de jogos corretamente', () => {
    getCardByTestId('game-card')
      .should('exist')
      .and('have.length.greaterThan', 0);
  });

  it('adiciona um jogo à wishlist pela interface', () => {
    getCardByTestId('game-card').first().within(() => {
      cy.contains('Adicionar à Wishlist').click();
    });

    cy.contains('Jogo adicionado à wishlist!').should('exist');
  });

  it('remove um jogo da wishlist pela interface', () => {
    cy.visit('http://localhost:5173/wishlist');
    cy.wait('@loadWishlist', { timeout: 10000 });

    getCardByTestId('wishlist-card').first().within(() => {
      cy.contains('Remover da Wishlist').click();
    });

    cy.contains('Jogo removido da wishlist!').should('exist');
  });


  it('mostra imagem de fallback quando thumbnail falha ao carregar', () => {
    getCardByTestId('game-card').first().find('img').then(($img) => {
      $img.attr('src', 'https://url-invalida.com/erro.jpg');
      $img.trigger('error');
    });

    getCardByTestId('game-card').first().find('img')
      .should('have.attr', 'src')
      .and('include', 'Imagem+Nao+Disponivel');
  });

  it('mostra erro ao tentar adicionar um jogo sem ID (negativo visual)', () => {
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('game:add-invalid'));
    });

    cy.contains('Erro: ID do jogo não encontrado').should('exist');
  });
});