pipeline {
    // 1. Define the Node.js tool to use for the entire pipeline
    agent {
        any
    }
    tools {
        // This name must match the name you configured in Global Tool Configuration
        nodejs 'NodeJS-20' 
    }

    stages {
        stage('Install Dependencies & Run Unit Tests') {
            steps {
                script {
                    echo "--- Installing Client Dependencies & Running Tests ---"
                    dir('client') {
                        // Installs all dependencies and runs the test script from client/package.json
                        sh 'npm ci'
                        sh 'npm test'
                    }
                    
                    echo "--- Installing Server Dependencies & Running Tests ---"
                    dir('server') {
                        // 2. Install ALL dependencies (including devDependencies for Jest)
                        sh 'npm ci' 
                        // Run the test script from server/package.json, which now executes Jest
                        sh 'npm test'
                    }
                }
            }
        }

        // --- We will add the next stages (like Docker Build) here later ---

        // stage('Build Docker Image') {
        //     steps {
        //         echo "Building Docker image..."
        //     }
        // }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}