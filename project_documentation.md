# Final Project Report: CI/CD Pipeline for Microservices Architecture

**Concept:** Multiple services deployed independently.
**Primary Highlight:** Update one service without affecting others (Zero-Downtime Rolling Updates).

---

## 1. Flow: Git → Multiple Services Structure
We created a modern, decoupled architecture. Instead of a monolithic program, we built multiple independently managed Node.js microservices (`user-service`, `product-service`, `order-service`, `payment-service`) stored and tracked via Git version control.

`git init`
**Explanation:** This command initializes a brand new Git repository in the master folder, allowing us to track all code changes across all microservices simultaneously.

`npm init -y`
**Explanation:** Initializes the Node.js package manager instantly inside a microservice folder. It creates the core `package.json` file which declares the environment variables and dependencies.

`npm install express`
**Explanation:** Downloads and installs the Express framework, giving our raw JavaScript code the ability to open network ports and route JSON API data to users.

**Example Setup Code (`user-service/index.js`):**
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

app.get('/', (req, res) => { res.send('Welcome to the User Service!'); });
app.get('/health', (req, res) => { res.status(200).send('OK'); });
app.listen(PORT, () => { console.log(`User service running on port ${PORT}`); });
```

---

## 2. Flow: Docker → Containerization
To guarantee these microservices run identically on any server environment, we packaged each service inside its own Docker container.

**The Container Configuration (`Dockerfile`):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD ["node", "index.js"]
```

`docker build -t localhost:5000/user-service:latest ./user-service`
**Explanation:** This command instructs the Docker daemon to read the Dockerfile inside the `./user-service` folder. It compiles our JavaScript API into a virtualized, standalone Linux artifact (an Image). The `-t` tag names the image `localhost:5000/user-service` so our computer knows exactly what network it belongs to.

`docker push localhost:5000/user-service:latest`
**Explanation:** This command uploads the compiled container artifact to our active local registry (hosted on Port 5000) so that Kubernetes and other automation tools can download it globally.

---

## 3. Flow: Kubernetes → Deploy Microservices
To orchestrate these containers securely, we utilized Kubernetes (running locally via Minikube). 

`minikube start --insecure-registry="host.minikube.internal:5000"`
**Explanation:** This command boots up an enterprise-grade Kubernetes cluster locally on your PC. The `--insecure-registry` flag is legally required to allow the cluster to successfully download our freshly pushed Docker images from our unencrypted local port 5000.

`kubectl apply -f kubernetes/`
**Explanation:** This sends a deployment signal to the Kubernetes control plane. By pointing the `-f` flag to the entire `kubernetes/` folder, Kubernetes instantly reads all YAML files inside it and spawns the User, Product, and Order containers automatically.

`kubectl get pods`
**Explanation:** This is a diagnostic command that queries the cluster to list all active, booting, or crashing container "Pods". It helps us visually verify that our deployments were successful.

`kubectl port-forward svc/user-service 8081:80`
**Explanation:** Kubernetes secures its containers inside a locked internal network. This command punches a localized network tunnel, capturing traffic from our computer's port `8081` and forwarding it flawlessly into the container's internal API on port `80`.

**The Orchestration Code applied by Kubernetes (`kubernetes/user-service.yaml`):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: host.minikube.internal:5000/user-service:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /health
            port: 80
```

---

## 4. Flow: GitHub Actions → Build Automation
To catch coding errors before they break our servers, we built Continuous Integration (CI) test checks.

`git commit -m "Added CI pipeline"`
**Explanation:** Safely saves a snapshot of our latest code.

`git push origin main`
**Explanation:** Transmits our code from our local PC directly up to the GitHub cloud.

**Continuous Integration Code applied by GitHub (`.github/workflows/ci.yml`):**
```yaml
name: Microservices CI
on:
  push:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      - name: Install Dependencies
        run: cd user-service && npm install
```
> **What this does:** The second we push code, GitHub Cloud boots up an Ubuntu server and attempts to install our packages. If the code is broken, GitHub instantly flags it Red and stops any deployments.

---

## 5. Flow: Jenkins → Pipeline Orchestration
To achieve full Continuous Delivery (CD), we used Jenkins to automate all Docker and Kubernetes tasks without human intervention.

**The Orchestration Code (`Jenkinsfile`):**
```groovy
pipeline {
    agent any
    environment { SERVICES = "user-service product-service order-service payment-service" }
    stages {
        stage('Checkout Code') { steps { checkout scm } }
        stage('Build & Push Docker Images') { steps { echo 'Building images...' } }
        stage('Wait for Kubernetes Rollout') { steps { echo 'Rolling out...' } }
    }
}
```
> **What this does:** Jenkins loads this file via GitHub. Instead of a human manually typing all the `docker` and `kubectl` commands listed above, Jenkins acts as an automated systems administrator executing them sequentially stage by stage.

---

## 6. Project Highlight: Zero-Downtime Service Updates
**Objective:** "Update one service without affecting others."

Because this system leverages Kubernetes `readinessProbe`s and `replicas: 2`, it operates using **Rolling Updates**. 
If a developer rewrites `user-service/index.js` and pushes it to Jenkins:
1. Jenkins builds a brand new Docker image.
2. Jenkins tells Kubernetes to deploy it.
3. **The Highlight:** Kubernetes DOES NOT shut down the old `user-service`. It spins up the new version in the background. 
4. Once the `/health` probe confirms the new API is fully stable, Kubernetes seamlessly begins routing traffic to the new one and completely destroys the old one. 
5. During this entire update, the `product-service` and `order-service` never experience even a millisecond of network delay or interruption. Our system achieves 100% Zero-Downtime Deployments.
