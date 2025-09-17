pipeline {
    agent any

    stages {
        stage('Unit and Integration Tests') {
            steps {
                script {
                    // Set PATH to include nvm Node.js location
                    env.PATH = "/Users/dhruval/.nvm/versions/node/v20.19.5/bin:${env.PATH}"
                    
                    // Test client
                    dir('client') {
                        sh 'npm ci'
                        sh 'npm test'
                    }
                    
                    // Test server
                    dir('server') {
                        sh 'npm ci --only=production'
                        sh 'npm test'
                    }
                }
            }
        }
    }
}