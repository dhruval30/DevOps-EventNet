pipeline {
    agent any

    stages {
        // Stage 1: Unit tests (we already did this)
        stage('Unit & Integration Tests') {
            steps {
                script {
                    echo "--- Running Server Unit Tests ---"
                    dir('server') {
                        sh 'npm ci'
                        sh 'npm test'
                    }
                }
            }
        }

        // Stage 2: Build and Run the Application in the background
        stage('Build & Run App for E2E Testing') {
            steps {
                script {
                    echo "--- Installing client dependencies ---"
                    dir('client') {
                        sh 'npm ci'
                    }
                    
                    echo "--- Starting Server ---"
                    dir('server') {
                        // 'nohup' and '&' run the server in the background so the pipeline can continue
                        sh 'nohup npm start &'
                    }

                    echo "--- Starting Client Dev Server ---"
                    dir('client') {
                        sh 'nohup npm run dev &'
                    }
                    
                    echo "Waiting for servers to be ready..."
                    // Give the servers time to start up before proceeding to the next stage
                    sh 'sleep 20'
                }
            }
        }

        // Stage 3: Run Cypress End-to-End Tests
        stage('Run Cypress E2E Tests') {
            steps {
                // This 'xvfb' block creates the virtual screen for the browser
                xvfb {
                    dir('client') {
                        echo "--- Running Cypress Tests ---"
                        // 'cypress run' executes all tests in headless mode
                        sh 'npx cypress run --browser chrome'
                    }
                }
            }
        }
    }

    // This 'post' block runs after all stages are complete, regardless of success or failure
    post {
        always {
            script {
                echo "--- Tearing Down Application ---"
                // Clean up the background processes to free up resources
                // The '|| true' prevents the build from failing if the process is already gone
                sh 'kill $(lsof -t -i:3000) || true' // Kill the server process on port 3000
                sh 'kill $(lsof -t -i:5173) || true' // Kill the client process on port 5173
                echo "Pipeline finished."
            }
        }
    }
}