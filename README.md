# DSTI---DevOps-project---SU-David---OLEKSIAK-Adrien---SI04

This is the repository for our DevOps project.

## Authors

- David Su <br>
[https://github.com/dvdbx](https://github.com/dvdbx)

- Adrien Oleksiak <br>
[https://github.com/adrienoleksiak](https://github.com/adrienoleksiak)

## Project

### 1. Create a web application

- We used the lab 4 of DevOps to create the app, the front end show a "Hello world" page.

### 2. Apply CI/CD pipeline

We want to implement Continuous Integration and Continuous Delivery.

- For the Continuous Integration, we implemented a main.yaml file which allows us to configure github actions. Github action will perform tests at each push or pull request on the main branch. 

<img src = "images/CI-CD2.JPG" width = 500 alt ="CI-CD2">

- For the Continuous Delivery, we used [Microsoft Azure](https://portal.azure.com) instead of Heroku which isn't free anymore.

We configurated our workflows to deploy our application in Azure after the Continuous Testing.

<img src = "images/CI-CD.JPG" width = 500 alt ="CI-CD">

<img src = "images/azure.JPG" width = 500 alt ="azure">

### 3. Configure and provision a virtual environment and run your application using the IaC approach

- Vagrant is a tool for building and managing virtual machine environments in a single workflow. We use Vagrant with the Centos7 distribution of Linux. To configure the environment we use the following command :

```
vagrant box add centos/7
```
- We choose the option 3 : virtual box.

- Now we can run our vagrant configuration file using : 
```
vagrant up
```
<img src = "images/vagrant-up.JPG" width = 500 alt ="vagrant up">

- Now we can acces to our virtual machine using ssh : 
```
vagrant ssh devops_server
```
<img src = "images/vagrant-ssh.JPG" width = 500 alt ="vagrant ssh">

- Ansible is an open-source automation tool that automates provisioning, configuration management, application deployment, orchestration.

- In our Vagrantfile, we made the provision with Ansible as follows :

```
# Use Vagrant Ansible provisioner
config.vm.provision "ansible_local" do |ansible|
  # The path to the playbooks entry point
  ansible.playbook = "playbooks/run.yml"
  # Only run the roles with these tags
  ansible.tags = "install"
end
```

### 4. Build Docker image of your application

- Docker is an open source platform that enables developers to build, deploy, run, update and manage containers???standardized.

- We create an image of our application using docker :
```
docker build -t devopsece .
```
<img src = "images/docker-build.JPG" width = 600 alt ="docker build">

- We can run our image using : 
```
docker run -dp 3000:3000 devopsece
```
- We get acces to it at the address `127.0.0.1:3000` : 

<img src = "images/docker-run.JPG" width = 600 alt ="run docker">

- We pushed the image of our application in the dockerhub https://hub.docker.com/, and we configured a .dockerignore file to avoid pushing unnecessary files 

```
docker tag devopsece dvdsu/devopsece
docker push dvdsu/devopsece
```
- We can see it in the dockerhub

<img src = "images/docker-push.JPG" width = 600 alt ="docker push">

### 5. Make container orchestration using Docker Compose

- Docker Compose is an orchestration tool that makes spinning up multi-container distributed applications.

- We add a file docker-compose.yaml for the container orchestration and we use the following command to run it : 
```
docker-compose up
```
<img src = "images/docker-compose-up.JPG" width = 600 alt ="run docker">

And like before, we can acces our application on `127.0.0.1:3000` :

<img src = "images/docker-run.JPG" width = 600 alt ="run docker">


### 6. Make docker orchestration using Kubernetes

- Kubernetes is an open-source software for automating operational tasks of container management and including built-in commands for deploying applications, scaling and management. 

- We implement a new folder call k8s where we set our Manifest yaml files
(deployment.yaml and our services.yaml). Then we use the following command to start minikube and apply our manifest files to our cluster : 

```
minikube start
kubectl apply -f deployment.yaml
kubectl apply -f services.yaml
kubectl get pods
```

- We see the following pods running thanks to the commande kubectl get pods : 

<img src = "images/k8s-get-pods.JPG" width = 600 alt ="k8s get pods">

- With the following commands, we expose our Kubernetes service to the outside : 
```
minikube service userapi
minikube ip
```

<img src = "images/k8s-service.jpg" width = 600 alt ="k8s service">

<img src = "images/k8s-service2.JPG" width = 600 alt ="k8s service">

We also setup persistent volumes using :

- PersistentVolume (PV), a piece of storage in the cluster that has been provisioned by an administrator. It has a life cycle independent of any individual Pod that uses the PV.

- PersistentVolumeClaim (PVC), a request for storage by a user.

### 7. Make a service mesh using Istio

- Istio is an open source service mesh that layers transparently onto existing distributed applications.

- We first install Kiali for visualization using :

```
kubectl apply -f samples/addons
kubectl rollout status deployment/kiali -n istio-system
```
- It will also load the manifest files of others services such as Grafana and Prometheus that we will use in the next steps.

- Here is our deployment using Istio :

<img src = "images/istio.png" width = 600 alt ="istio1">

<img src = "images/userapi_service_istio.png" width = 600 alt ="istio2">

- We used the lab 9 to configure our files for request routing and traffic shifting.

### 8. Implement Monitoring to your containerized application

- Prometheus is an open-source systems monitoring and alerting toolkit. It is designed to collect metrics from various sources and store them in a time-series database.

- Grafana is an open-source platform for creating and sharing dashboards and graphs. It can connect to various data sources, including Prometheus, and provide a user-friendly interface for creating and viewing graphs and charts. 

Together, Prometheus and Grafana provide a powerful toolkit for monitoring and visualizing the performance of systems and applications. They are often deployed alongside containerized applications that are running on Kubernetes.

- We implemented the `prom-client` library to expose some metric endpoints of our user API application.

<img src = "images/prom-client.png" width = 600 alt ="prom-client">

- Then can use both services Prometheus and Grafana in the localhost using these commands :

```
kubectl port-forward svc/prometheus -n istio-system 9090
kubectl port-forward svc/grafana -n istio-system 3000

```
<img src = "images/prometheus.png" width = 600 alt ="prometheus">

<img src = "images/grafana.png" width = 600 alt ="grafana">

- We can see on the last screenshot some stats on the Grafana interface analyzing Istio behavior.