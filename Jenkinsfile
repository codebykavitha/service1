pipeline {
    agent any

    environment {
        REGISTRY = "localhost:5000"
        SERVICES = "user-service product-service order-service"
    }

    stages {
        stage('Checkout') {
            steps {
                // In a real scenario, this would be cloning the Git repo
                echo 'Checking out source code...'
                // git url: 'https://github.com/yourusername/microservices-cicd.git', branch: 'main'
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    def services = env.SERVICES.split(' ')
                    for (int i = 0; i < services.length; i++) {
                        def svc = services[i]
                        echo "Building image for ${svc}..."
                        
                        dir(svc) {
                            // Build the docker image
                            def dockerImage = docker.build("${env.REGISTRY}/${svc}:latest")
                            
                            // Push the image to the local registry
                            dockerImage.push('latest')
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo 'Deploying all services to Kubernetes...'
                    
                    // In a real scenario you would interact with your k8s cluster via credentials
                    // For local minikube/kind testing when Jenkins runs locally:
                    sh 'kubectl apply -f kubernetes/'
                }
            }
        }
        
        stage('Wait for Rollout') {
            steps {
                script {
                    def services = env.SERVICES.split(' ')
                    for (int i = 0; i < services.length; i++) {
                        def svc = services[i]
                        sh "kubectl rollout status deployment/${svc}"
                    }
                }
            }
        }
    }
}
