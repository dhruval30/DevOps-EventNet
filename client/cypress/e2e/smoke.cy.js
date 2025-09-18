describe('Smoke Test', () => {
    it('should load the landing page on a desktop screen', () => {
      // Set the screen size to a common desktop width before visiting
      cy.viewport(1280, 720);
  
      cy.visit('/');
      cy.contains('EventNet').should('be.visible');
    });
  });