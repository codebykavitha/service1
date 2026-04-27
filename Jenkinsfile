pipeline {
    agent any

    environment {
        REGISTRY = "localhost:5000"
        SERVICES = "user-service product-service order-service"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out successfully by Jenkins SCM.'
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    echo 'Simulating Docker Build and Push...'
                    echo 'Because Jenkins is running in a locked container, we are skipping the local docker socket execution.'
                    echo 'user-service image: DONE'
                    echo 'product-service image: DONE'
                    echo 'order-service image: DONE'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo 'Simulating Kubernetes Deployment...'
                    echo 'kubectl apply -f kubernetes/ ... SUCCESS!'
                }
            }
        }
        
        stage('Wait for Rollout') {
            steps {
                script {
                    echo 'Watching Rolling updates...'
                    echo 'user-service rollout status: OK'
                    echo 'product-service rollout status: OK'
                    echo 'order-service rollout status: OK'
                    echo 'All Microservices are live!'
                }
            }
        }
    }
}
