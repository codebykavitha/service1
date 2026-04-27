# Microservices Local CI/CD Pipeline

This project demonstrates a complete local CI/CD pipeline for a Node.js microservices architecture, utilizing Docker, Jenkins, GitHub Actions, and Kubernetes (Minikube).

## Folder Structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── Jenkinsfile                # Jenkins CD pipeline
├── kubernetes/                # Kubernetes Manifests
│   ├── order-service.yaml
│   ├── product-service.yaml
│   └── user-service.yaml
├── order-service/             # Node.js Express Service
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── product-service/           # Node.js Express Service
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── user-service/              # Node.js Express Service
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
└── README.md                  # This file
```

---

## Prerequisites

1. **Docker Engine / Docker Desktop:** Installed and running.
2. **Minikube:** Installed and running.
3. **kubectl:** Installed and configured to use your Minikube cluster.
4. **Node.js:** Installed (optional, if you want to run services locally without Docker).

---

## Step 1: Start Minikube & Local Docker Registry

A local Docker Registry is essential so the Kubernetes cluster can pull the images you build locally.

1. **Start the local Docker Registry** exposing port `5000`:
   ```bash
   docker run -d -p 5000:5000 --restart=always --name registry registry:2
   ```

2. **Start Minikube.** If you are using Docker Desktop, tell Minikube to allow insecure registries (your local one):
   ```bash
   minikube start --insecure-registry="host.minikube.internal:5000"
   ```
   *(Note: `host.minikube.internal` resolves to your local host from within the Minikube node. If you map it differently, adjust accordingly.)*

---

## Step 2: Continuous Integration (GitHub Actions)

We have provided a `.github/workflows/ci.yml` file. When you push this folder to a new GitHub repository, GitHub Actions will automatically detect it.
On every push/PR to the `main` branch, it will checkout the code, install Node.js dependencies, and build the Docker images continuously to ensure the code compiles.

---

## Step 3: Run the Pipeline Manually (Mimicking Jenkins locally)

Normally, Jenkins executes the `Jenkinsfile`. You can set up Jenkins via Docker. However, the exact pipeline actions can be mimicked in the terminal to verify they work on your machine.

**Build and Push Docker Images locally:**

```bash
# User Service
cd user-service
docker build -t localhost:5000/user-service:latest .
docker push localhost:5000/user-service:latest
cd ..

# Product Service
cd product-service
docker build -t localhost:5000/product-service:latest .
docker push localhost:5000/product-service:latest
cd ..

# Order Service
cd order-service
docker build -t localhost:5000/order-service:latest .
docker push localhost:5000/order-service:latest
cd ..
```

---

## Step 4: Deploy to Kubernetes

Deploy the containers into the Minikube cluster using our manifest YAML files:

```bash
kubectl apply -f kubernetes/
```

Verify the pods and services are running:
```bash
kubectl get pods
kubectl get svc
```

### Accessing the Services
Minikube exposes NodePorts or allows proxying. The easiest way to view the services is port-forwarding:

```bash
# Port-forward User Service to localhost:8081
kubectl port-forward svc/user-service 8081:80

# Now visit: http://localhost:8081/users
```

---

## Step 5: Zero-Downtime Deployment (Rolling Update)

Let's simulate updating a single microservice (e.g., `user-service`) without downtime.

1. **Modify the source code:**
   Open `user-service/index.js`. Change the `users` route to return a new user, like:
   ```javascript
   { id: 3, name: 'Charlie' }
   ```

2. **Build and Tag the new version (v2):**
   ```bash
   cd user-service
   docker build -t localhost:5000/user-service:v2 .
   docker push localhost:5000/user-service:v2
   cd ..
   ```

3. **Update the Deployment configuration safely:**
   Instead of modifying the YAML directly, you can issue the `set image` command imperative which triggers a rolling update seamlessly:
   ```bash
   kubectl set image deployment/user-service user-service=localhost:5000/user-service:v2
   ```

4. **Watch the Rolling Update:**
   This command watches old pods being terminated slowly while new pods are spinning up:
   ```bash
   kubectl rollout status deployment/user-service
   ```
   During this time, the service remains available, handling continuous traffic without any drops!

---

## Setting up Jenkins Desktop (Extra)

If you want the full authentic Jenkins experience:

1. Run Jenkins locally in Docker attached to host networking:
   ```bash
   docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
   ```
2. Open `localhost:8080` in your browser. Get the initial password:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Install suggested plugins.
4. Create a new "Pipeline" job, point it to your local Git repository path (or push to GitHub and provide the remote URL).
5. Specify the script path as `Jenkinsfile`.
6. Run the build to watch Jenkins orchestrate everything we just manually did!
