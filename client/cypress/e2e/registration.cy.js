describe('Multi-Step Registration Flow', () => {

    // This block runs before each test in this file.
    // We use it to set up our "mock" API responses.
    beforeEach(() => {
      // Intercept the GET request for events and provide our own mock data.
      // This makes the test fast and predictable, without needing the backend to be perfect.
      cy.intercept('GET', '**/api/auth/events', {
        statusCode: 200,
        body: [
          { _id: 'event123', name: 'The Main Tech Conference 2025' },
          { _id: 'event456', name: 'Local Developer Meetup' }
        ]
      }).as('getEvents');
  
      // Intercept the final POST request to the register endpoint.
      // We'll simulate a successful response from the server.
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: { message: 'Registration successful. OTP sent to your email.' }
      }).as('registerUser');
  
      // Start each test by visiting the home page.
      cy.visit('/');
    });
  
    it('should allow a user to successfully complete the registration form', () => {
      // Step 1: Find the "Join Event" button in the navbar and click it.
      cy.contains('Join Event').click();
  
      // Wait for the API call to fetch events to complete before proceeding.
      cy.wait('@getEvents');
  
      // Step 2: Fill out the first page of the form.
      cy.get('select[name="eventId"]').select('Local Developer Meetup');
      cy.get('input[name="uniqueCode"]').type('SUPER_SECRET_CODE');
      cy.get('input[name="name"]').type('Cypress Test User');
      cy.get('input[name="email"]').type(`testuser_${Date.now()}@example.com`);
      cy.get('input[name="password"]').type('Password123');
      cy.get('input[name="confirmPassword"]').type('Password123');
  
      // Step 3: Navigate to the second page.
      cy.contains('button', 'Next').click();
  
      // Step 4: Fill out the second page of the form.
      cy.get('input[type="tel"]').type('2025550149');
      cy.get('input[name="linkedin"]').type('https://www.linkedin.com/in/cypress-test');
      cy.get('input[name="github"]').type('https://github.com/cypress-test');
  
      // Step 5: Submit the form and verify the successful result.
      cy.get('button[type="submit"]').click();
      cy.wait('@registerUser');
      cy.contains('Registration successful. OTP sent to your email.').should('be.visible');
    });
  
    it('should show an error if passwords do not match', () => {
      // Step 1: Find the "Join Event" button in the navbar and click it.
      cy.contains('Join Event').click();
      
      cy.wait('@getEvents');
  
      // Step 2: Enter mismatched passwords.
      cy.get('input[name="password"]').type('Password123');
      cy.get('input[name="confirmPassword"]').type('DIFFERENT_PASSWORD');
      
      // Step 3: Click Next.
      cy.contains('button', 'Next').click();
  
      // Step 4: Assert that the error message is visible.
      cy.contains('Passwords do not match.').should('be.visible');
      cy.get('input[name="phone"]').should('not.exist'); // Verify we are still on step 1
    });
  });