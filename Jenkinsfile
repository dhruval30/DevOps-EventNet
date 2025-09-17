pipeline {
    agent {
        docker {
            image 'node:20-alpine'
        }
    }

    stages {
        stage('Unit and Integration Tests') {
            steps {
                script {
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