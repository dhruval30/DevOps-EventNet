pipeline {
    agent any

    stages {
        stage('Unit and Integration Tests') {
            steps {
                script {
                    // Test client
                    dir('client') {
                        sh '/usr/local/bin/npm ci'
                        sh '/usr/local/bin/npm test'
                    }
                    
                    // Test server
                    dir('server') {
                        sh '/usr/local/bin/npm ci --only=production'
                        sh '/usr/local/bin/npm test'
                    }
                }
            }
        }
    }
}