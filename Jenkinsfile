pipeline {
    agent any

    stages {
        stage('Unit and Integration Tests') {
            steps {
                script {
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
                        env.PATH = "/Users/dhruval/.nvm/versions/node/v20.19.5/bin:${env.PATH}"
                        
                        dir('client') {
                            echo "--- Running Cypress Tests ---"
                            sh 'npx cypress run --browser chrome'
                        }
                    }
                }
            }
        }

        // --- NEW STAGE: OWASP ZAP SECURITY SCAN ---
        stage('Run ZAP Security Scan') {
            steps {
                script {
                    env.PATH = "/Applications/Docker.app/Contents/Resources/bin:${env.PATH}"
                    echo "--- Running ZAP Baseline Scan ---"
                    // This command runs the official ZAP Docker container
                    sh '''
                        docker run --rm \\
                            -v $(pwd):/zap/wrk/:rw \\
                            owasp/zap2docker-stable zap-baseline.py \\
                            -t http://host.docker.internal:3000 \\
                            -r zap-report.html
                    '''
                }
            }
            // This post-stage action saves the ZAP report as a build artifact
            post {
                always {
                    archiveArtifacts artifacts: '**/zap-report.html', allowEmptyArchive: true
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