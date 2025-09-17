// Jenkinsfile (Recommended Solution)
pipeline {
    // This runs the entire pipeline inside a clean, pre-configured Node.js environment
    agent {
        docker {
            image 'node:20-alpine'
            args '-u root' // This ensures you have permissions for npm installs
        }
    }

    stages {
        stage('Unit and Integration Tests') {
            steps {
                // The 'sh' commands will now run inside the Node.js Docker container
                sh 'cd client'
                sh 'npm ci'
                sh 'npm test' 
                
                sh 'cd ../server'
                sh 'npm ci --only=production'
                sh 'npm test'
            }
        }
        
        // ... (add other stages here, e.g., Docker Build and Push) ...
    }
}