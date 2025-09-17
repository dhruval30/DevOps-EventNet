pipeline {
    agent any

    stages {
        // --- Your original stage, kept exactly as requested ---
        stage('Unit and Integration Tests') {
            steps {
                script {
                    // Set PATH to include nvm Node.js location for this stage
                    env.PATH = "/Users/dhruval/.nvm/versions/node/v20.19.5/bin:${env.PATH}"
                    
                    // Test client
                    dir('client') {
                        sh 'npm ci'
                        sh 'npm test'
                    }
                    
                    // Test server
                    dir('server') {
                        // Using 'npm ci' to install devDependencies like Jest
                        sh 'npm ci'
                        sh 'npm test'
                    }
                }
            }
        }

        // --- NEW STAGE: Build & Run App for E2E Testing ---
        stage('Build & Run App for E2E Testing') {
            steps {
                script {
                    // We must also set the PATH here so this stage can find npm
                    env.PATH = "/Users/dhruval/.nvm/versions/node/v20.19.5/bin:${env.PATH}"

                    echo "--- Installing client dependencies ---"
                    dir('client') {
                        sh 'npm ci'
                    }
                    
                    echo "--- Starting Server ---"
                    dir('server') {
                        // 'nohup' and '&' run the server in the background
                        sh 'nohup npm start &'
                    }

                    echo "--- Starting Client Dev Server ---"
                    dir('client') {
                        sh 'nohup npm run dev &'
                    }
                    
                    echo "Waiting for servers to be ready..."
                    sh 'sleep 20'
                }
            }
        }

        // --- NEW STAGE: Run Cypress End-to-End Tests ---
        stage('Run Cypress E2E Tests') {
            steps {
                // This 'xvfb' block creates a virtual screen for the browser
                xvfb {
                    script {
                        // And we set the PATH one more time for this stage to find npx
                        env.PATH = "/Users/dhruval/.nvm/versions/node/v20.19.5/bin:${env.PATH}"
                        
                        dir('client') {
                            echo "--- Running Cypress Tests ---"
                            sh 'npx cypress run --browser chrome'
                        }
                    }
                }
            }
        }
    }

    // This 'post' block runs after all stages are complete
    post {
        always {
            script {
                echo "--- Tearing Down Application ---"
                // Clean up the background processes to free up resources
                sh 'kill $(lsof -t -i:3000) || true'
                sh 'kill $(lsof -t -i:5173) || true'
                echo "Pipeline finished."
            }
        }
    }
}