pipeline {
    agent { docker { image 'node:20-alpine' } }

    stages {
        stage('Unit and Integration Tests') {
            steps {
                sh 'cd client'
                sh 'npm ci'
                sh 'npm test' 
                sh 'cd ../server'
                sh 'npm ci --only=production'
                sh 'npm test' 
            }
        }
    }
}