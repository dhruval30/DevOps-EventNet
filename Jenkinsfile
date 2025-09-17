pipeline {
    agent any

    stages {
        stage('Unit and Integration Tests') {
            steps {
                script {
                    dir('client') {
                        // This step will automatically find and use Node v20
                        nvm('20') {
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                    
                    dir('server') {
                        // This step will automatically find and use Node v20
                        nvm('20') {
                            sh 'npm ci --only=production'
                            sh 'npm test'
                        }
                    }
                }
            }
        }
    }
}